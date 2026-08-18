import axios from "axios";
import type { NewProduct, Product } from "../models/product";

const API_BASE = "http://127.0.0.1:5174";

export const productService = {
  async list(): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(`${API_BASE}/api/products`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || `Request failed (${error.response?.status || 'Network Error'})`;
      throw new Error(message);
    }
  },

  async create(product: NewProduct): Promise<Product> {
    try {
      const response = await axios.post<Product>(`${API_BASE}/api/products`, product);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || `Request failed (${error.response?.status || 'Network Error'})`;
      throw new Error(message);
    }
  },
};
