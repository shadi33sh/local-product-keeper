import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateSeedData } from "./seedData.mjs";

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
  db.exec("BEGIN TRANSACTION;");
  try {
    const insert = db.prepare(
      "INSERT INTO products (name, price, description, createdAt) VALUES (?, ?, ?, ?)",
    );

    const seedData = generateSeedData(2000);

    for (const [name, price, description, now] of seedData) {
      insert.run(name, price, description, now);
    }

    db.exec("COMMIT;");
    console.log("Database successfully seeded with 2,000 products.");
  } catch (error) {
    db.exec("ROLLBACK;");
    console.error("Failed to seed database:", error);
    throw error;
  }
}
