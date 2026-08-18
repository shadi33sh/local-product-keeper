import http from "node:http";
import { listProducts, createProduct } from "./productRepository.ts";
import { dbPath } from "./db.ts";

const PORT = 5174;
const HOST = "127.0.0.1";

function send(res: http.ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, null);
    return;
  }

  if (req.method === "GET" && req.url === "/api/products") {
    send(res, 200, listProducts());
    return;
  }

  if (req.method === "POST" && req.url === "/api/products") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(raw || "{}");
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const price = Number(body.price);
        const description =
          typeof body.description === "string" && body.description.trim() !== ""
            ? body.description.trim()
            : null;

        if (!name) {
          send(res, 400, { error: "Product name is required." });
          return;
        }
        if (!Number.isFinite(price) || price < 0) {
          send(res, 400, { error: "Price must be a non-negative number." });
          return;
        }

        send(res, 201, createProduct({ name, price, description }));
      } catch {
        send(res, 400, { error: "Invalid JSON body." });
      }
    });
    return;
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`Local API on http://${HOST}:${PORT} (db: ${dbPath})`);
});
