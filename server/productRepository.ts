import { db } from "./db.ts";

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  description: string | null;
  createdAt: string;
}

export function listProducts(): ProductRow[] {
  return db
    .prepare("SELECT id, name, price, description, createdAt FROM products ORDER BY id ASC")
    .all() as unknown as ProductRow[];
}

export function createProduct(input: {
  name: string;
  price: number;
  description?: string | null;
}): ProductRow {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO products (name, price, description, createdAt) VALUES (?, ?, ?, ?)")
    .run(input.name, input.price, input.description ?? null, createdAt);

  return db
    .prepare("SELECT id, name, price, description, createdAt FROM products WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as unknown as ProductRow;
}
