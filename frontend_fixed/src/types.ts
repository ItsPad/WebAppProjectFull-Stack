export type Product = {
  _id?: string;          // Mongo style id
  id?: string | number;  // fallback id
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  _file?: File | null; // transient local file (for upload)
  createdAt?: string;
  updatedAt?: string;
  amount: number; // เพิ่มฟิลด์ amount
}
