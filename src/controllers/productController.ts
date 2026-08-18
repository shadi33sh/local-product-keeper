import {
  draftToNewProduct,
  validateProductDraft,
  type Product,
  type ProductDraft,
} from "../models/product";
import { productService } from "../services/productService";

export const productController = {
  async loadProducts(): Promise<Product[]> {
    return productService.list();
  },

  async addProduct(draft: ProductDraft): Promise<Product[]> {
    const validationError = validateProductDraft(draft);
    if (validationError) throw new Error(validationError);

    await productService.create(draftToNewProduct(draft));
    return productService.list();
  },
};
