/**
 * server/index.mjs — combined API + SSR server for Electron.
 *
 * Listens on 127.0.0.1:5174.  Route priority:
 *   1. OPTIONS pre-flight       → 204
 *   2. /api/products (GET/POST) → SQLite via productRepository
 *   3. Everything else          → forwarded to the nitro SSR handler
 *      (.output/server/) which serves static assets and SSR-rendered HTML.
 *
 * The nitro "node-server" build is also self-contained and could be started
 * separately, but running it inline via its fetch() handler lets us share a
 * single port and process — simpler for Electron packaging.
 */

import http from "node:http";
import { listProducts, createProduct } from "./productRepository.mjs";
import { dbPath } from "./db.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The nitro node-server build lives one level up in .output/server/index.mjs.
// We import it purely for its side-effect-free useNitroApp() export.
// NOTE: importing it starts nitro's own listen() internally — we suppress that
// by pre-setting PORT to an unused value, then use only the fetch handler.
// Better: import the nitro app factory without triggering the listen() side
// effect by loading the internal module.  The nitro bundle exports the app
// via globalThis.__nitro__, so we can read it after the import.
const NITRO_OUTPUT = path.resolve(__dirname, "..", ".output", "server", "index.mjs");

const PORT = Number(process.env.PORT ?? 5174);
const HOST = "127.0.0.1";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

/**
 * Convert a Node.js IncomingMessage to a Fetch API Request so the nitro
 * fetch handler can process it.
 */
async function nodeReqToFetchReq(req) {
  const url = `http://${HOST}:${PORT}${req.url ?? "/"}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body = undefined;
  if (hasBody) {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
  return new Request(url, {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([, v]) => v !== undefined).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v]),
    ),
    body: hasBody && body?.length ? body : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

/**
 * Write a Fetch API Response back onto a Node.js ServerResponse.
 */
async function fetchResToNodeRes(fetchRes, res) {
  const headers = {};
  fetchRes.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(fetchRes.status, headers);
  if (fetchRes.body) {
    const reader = fetchRes.body.getReader();
    for (; ;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

// ── Boot ─────────────────────────────────────────────────────────────────────

async function main() {
  // Import the nitro bundle.  It self-starts its own listener on $PORT, so we
  // set a throwaway port first.  We'll call its fetch handler directly.
  process.env.NITRO_PORT = "0";   // bind on :0 so nitro doesn't conflict
  process.env.NITRO_HOST = "127.0.0.1";

  await import(pathToFileURL(NITRO_OUTPUT).href);

  // After import, nitro has registered itself on globalThis.__nitro__
  const nitroApp = globalThis.__nitro__?.["default"];
  if (!nitroApp) {
    throw new Error("Nitro app not found on globalThis after import. Build may be stale — run `npm run build:client`.");
  }

  const server = http.createServer(async (req, res) => {
    try {
      // 1. CORS pre-flight
      if (req.method === "OPTIONS") {
        sendJson(res, 204, null);
        return;
      }

      // 2. API routes
      if (req.method === "GET" && req.url === "/api/products") {
        sendJson(res, 200, listProducts());
        return;
      }

      if (req.method === "POST" && req.url === "/api/products") {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        try {
          const body = JSON.parse(raw || "{}");
          const name = typeof body.name === "string" ? body.name.trim() : "";
          const price = Number(body.price);
          const description =
            typeof body.description === "string" && body.description.trim() !== ""
              ? body.description.trim()
              : null;
          if (!name) { sendJson(res, 400, { error: "Product name is required." }); return; }
          if (!Number.isFinite(price) || price < 0) { sendJson(res, 400, { error: "Price must be a non-negative number." }); return; }
          sendJson(res, 201, createProduct({ name, price, description }));
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body." });
        }
        return;
      }

      // 3. Everything else → nitro SSR / static handler
      const fetchReq = await nodeReqToFetchReq(req);
      const fetchRes = await nitroApp.fetch(fetchReq);
      await fetchResToNodeRes(fetchRes, res);
    } catch (err) {
      console.error("Server error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal server error");
      }
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`Server on http://${HOST}:${PORT} (db: ${dbPath})`);
    if (typeof process.send === "function") {
      process.send("ready");
    }
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
