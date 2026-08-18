"use strict";
/**
 * electron/main.cjs  —  Electron main process
 *
 * CommonJS (.cjs) so Electron can require() it without a build step.
 *
 * Boot sequence:
 *   1. Fork server/index.mjs (sets APP_DATA_DIR → Electron userData).
 *   2. Wait for the child to signal "ready".
 *   3. Open a BrowserWindow that loads http://127.0.0.1:5174.
 *
 * Security: contextIsolation:true, nodeIntegration:false, sandbox:true.
 */

const { app, BrowserWindow, shell } = require("electron");
const { fork } = require("node:child_process");
const path = require("node:path");

// Project root is one level above this file (electron/main.cjs → project root)
const ROOT = path.resolve(__dirname, "..");
const SERVER_ENTRY = path.join(ROOT, "server", "index.mjs");

const PORT = 5174;
const HOST = "127.0.0.1";
const SERVER_URL = `http://${HOST}:${PORT}`;

/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null;
/** @type {import('child_process').ChildProcess | null} */
let serverProcess = null;

// ── Server lifecycle ─────────────────────────────────────────────────────────

/**
 * Fork the HTTP server and return a Promise that resolves once the server
 * sends the "ready" message (or rejects after a 10-second timeout).
 */
function startServer() {
  return new Promise((resolve, reject) => {
    const userData = app.getPath("userData");

    serverProcess = fork(SERVER_ENTRY, [], {
      execArgv: [],          // no --inspect etc. leaking from parent
      env: {
        ...process.env,
        APP_DATA_DIR: userData,
        NODE_ENV: process.env.NODE_ENV ?? "production",
      },
      // Keep IPC channel open so the child can send us "ready"
      silent: false,
    });

    const timeout = setTimeout(() => {
      reject(new Error("Server did not signal ready within 10 seconds"));
    }, 10_000);

    serverProcess.on("message", (msg) => {
      if (msg === "ready") {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Server exited with code ${code}`);
      }
    });
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// ── Window lifecycle ─────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Local Product Keeper",
    webPreferences: {
      contextIsolation: true,      // renderer cannot access Node APIs
      nodeIntegration: false,      // no require() in renderer
      sandbox: true,               // extra OS-level isolation
      // No preload needed — the app communicates over HTTP only
    },
  });

  // Open external links in the OS browser, not in the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(SERVER_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── App events ───────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error("Failed to start server:", err);
    app.quit();
  }
});

// Quit when all windows are closed on Windows / Linux
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopServer();
    app.quit();
  }
});

// macOS: re-open the window when the dock icon is clicked
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up the server process before Electron exits
app.on("before-quit", () => {
  stopServer();
});
