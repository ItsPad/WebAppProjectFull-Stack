import axios from "axios";
import type { Product } from "./types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/";

const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

const pid = (p: Product | string) =>
  typeof p === "string" ? p : String(p._id ?? p.id);

function buildFormData(data: Product) {
  const fd = new FormData();
  if ((data as any)._file) fd.append("image", (data as any)._file);
  if (data.name !== undefined) fd.append("name", String(data.name));
  if (data.price !== undefined) fd.append("price", String(data.price));
  if (data.amount !== undefined) fd.append("amount", String(data.amount));
  if (data.description !== undefined)
    fd.append("description", String(data.description ?? ""));
  if (data.id !== undefined) fd.append("id", String(data.id));
  if ((data as any)._id !== undefined)
    fd.append("_id", String((data as any)._id));
  if (!(data as any)._file && data.imageUrl)
    fd.append("imageUrl", String(data.imageUrl));
  return fd;
}

// --- Mock API Fallback (localStorage) ---
type P = Product;
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const LS_KEY = "products";
async function seedIfNeeded(): Promise<P[]> {
  let raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = await fetch("/products.seed.json").then((r) => r.json());
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}
const mock = {
  async listProducts(): Promise<P[]> {
    return seedIfNeeded();
  },
  async getProduct(id: string): Promise<P> {
    const data = await seedIfNeeded();
    const found = data.find((p) => String(p._id ?? p.id) === String(id));
    if (!found) throw new Error("ไม่พบสินค้า");
    return found;
  },
  async createProduct(data: P): Promise<P> {
    const items = await seedIfNeeded();
    const nextId =
      (items.reduce((m, p) => Math.max(m, Number(p._id ?? p.id ?? 0)), 0) ||
        0) + 1;
    let imageUrl = data.imageUrl;
    if ((data as any)._file)
      imageUrl = await fileToDataURL((data as any)._file);
    const created = { ...data, id: nextId, _id: undefined, imageUrl };
    items.push(created);
    localStorage.setItem(LS_KEY, JSON.stringify(items));
    return created;
  },
  async updateProduct(data: Product): Promise<Product> {
    const id = pid(data);
    try {
      if ((data as any)._file) {
        const r = await http.patch(`/products/${id}`, buildFormData(data)); // <-- แก้ไขแล้ว
        return r.data;
      } else {
        const r = await http.patch(`/products/${id}`, data); // <-- แก้ไขแล้ว
        return r.data;
      }
    } catch {
      return mock.updateProduct(data);
    }
  },
  async deleteProduct(id: string): Promise<{ deleted: boolean }> {
    const items = await seedIfNeeded();
    const filtered = items.filter((p) => String(p._id ?? p.id) !== String(id));
    localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    return { deleted: filtered.length < items.length };
  },
};

export const api = {
  async listProducts(): Promise<Product[]> {
    try {
      const r = await http.get("/products");
      return r.data;
    } catch {
      return mock.listProducts();
    }
  },
  async getProduct(id: string): Promise<Product> {
    try {
      const r = await http.get(`/products/${id}`);
      return r.data;
    } catch {
      return mock.getProduct(id);
    }
  },
  async createProduct(data: Product): Promise<Product> {
    try {
      if ((data as any)._file) {
        const r = await http.post("/products", buildFormData(data));
        return r.data;
      } else {
        const r = await http.post("/products", data);
        return r.data;
      }
    } catch {
      return mock.createProduct(data);
    }
  },
  async updateProduct(data: Product): Promise<Product> {
    const id = pid(data);
    try {
      if ((data as any)._file) {
        const r = await http.put(`/products/${id}`, buildFormData(data));
        return r.data;
      } else {
        const r = await http.put(`/products/${id}`, data);
        return r.data;
      }
    } catch {
      return mock.updateProduct(data);
    }
  },
  async deleteProduct(id: string): Promise<{ deleted: boolean }> {
    try {
      const r = await http.delete(`/products/${id}`);
      return r.data;
    } catch {
      return mock.deleteProduct(id);
    }
  },
};
