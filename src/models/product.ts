export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  createdAt: string;
}

export interface NewProduct {
  name: string;
  price: number;
  description?: string | null;
}

export interface ProductDraft {
  name: string;
  price: string;
  description: string;
}

export function validateProductDraft(draft: ProductDraft): string | null {
  if (!draft.name.trim()) return "Product name is required.";
  const price = Number(draft.price);
  if (draft.price.trim() === "" || !Number.isFinite(price) || price < 0) {
    return "Price must be a valid non-negative number.";
  }
  return null;
}

export function draftToNewProduct(draft: ProductDraft): NewProduct {
  return {
    name: draft.name.trim(),
    price: Number(draft.price),
    description: draft.description.trim() || null,
  };
}
