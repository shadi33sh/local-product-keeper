import { db } from "./db.mjs";

export function listProducts() {
  return db
    .prepare("SELECT id, name, price, description, createdAt FROM products ORDER BY id ASC")
    .all();
}

export function createProduct(input) {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO products (name, price, description, createdAt) VALUES (?, ?, ?, ?)")
    .run(input.name, input.price, input.description ?? null, createdAt);

  return db
    .prepare("SELECT id, name, price, description, createdAt FROM products WHERE id = ?")
    .get(Number(result.lastInsertRowid));
}
