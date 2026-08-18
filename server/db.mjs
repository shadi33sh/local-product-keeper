import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// When running inside Electron, main.cjs sets APP_DATA_DIR to
// app.getPath('userData') so the database lives in the OS user-data folder.
// In plain dev-mode (npm run server) it falls back to ~/Documents.
const dataDir = process.env.APP_DATA_DIR
  ? process.env.APP_DATA_DIR
  : path.join(os.homedir(), "Documents");

export const dbPath = path.join(dataDir, "app-data.db");

fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL
  );
`);

const row = db.prepare("SELECT COUNT(*) AS count FROM products").get();
const count = row.count;

if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO products (name, price, description, createdAt) VALUES (?, ?, ?, ?)",
  );
  const now = new Date().toISOString();
  const seed = [
    ["Notebook", 4.5, "A5 lined paper notebook"],
    ["Pen", 1.25, "Black ballpoint pen"],
    ["Backpack", 39.99, null],
    ["Water Bottle", 12.0, "500ml stainless steel"],
    ["Desk Lamp", 24.75, "LED, adjustable arm"],
  ];
  for (const [name, price, description] of seed) {
    insert.run(name, price, description, now);
  }
}
