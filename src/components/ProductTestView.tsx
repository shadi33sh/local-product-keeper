import { useEffect, useState } from "react";
import { productController } from "../controllers/productController";
import type { Product, ProductDraft } from "../models/product";

const emptyDraft: ProductDraft = { name: "", price: "", description: "" };

export default function ProductTestView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    productController
      .loadProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const updated = await productController.addProduct(draft);
      setProducts(updated);
      setDraft(emptyDraft);
      setSuccess("Product saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.25rem" }}>Product Storage Test</h1>

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={5}>No products.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.description ?? ""}</td>
                <td>{p.createdAt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 style={{ fontSize: "1rem", marginTop: "1.5rem" }}>Add Product</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <label>
          Name
          <br />
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label>
          Price
          <br />
          <input
            type="number"
            step="0.01"
            min="0"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />
        </label>
        <label>
          Description (optional)
          <br />
          <input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save Product"}
        </button>
      </form>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {success ? <p style={{ color: "green" }}>{success}</p> : null}
    </main>
  );
}
