import type { NewProduct, Product } from "../models/product";

const API_BASE = "http://127.0.0.1:5174";

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const productService = {
  async list(): Promise<Product[]> {
    return parse<Product[]>(await fetch(`${API_BASE}/api/products`));
  },

  async create(product: NewProduct): Promise<Product> {
    return parse<Product>(
      await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }),
    );
  },
};
