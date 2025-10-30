// src/features/productsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api'; // 1. Import API ที่เรามีอยู่แล้ว
import type { Product } from '../types';

// 2. กำหนดหน้าตาของ State
interface ProductsState {
  items: Product[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// 3. กำหนด State เริ่มต้น
const initialState: ProductsState = {
  items: [],
  loading: 'idle',
  error: null,
};

// 4. สร้าง "Thunks" (สำหรับคุยกับ API แบบ Asynchronous)
// Thunk สำหรับดึงข้อมูลทั้งหมด
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await api.listProducts(); // <-- ใช้ API เดิม
  return response;
});

// Thunk สำหรับสร้างสินค้าใหม่
export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (newProduct: Product) => {
    const response = await api.createProduct(newProduct); // <-- ใช้ API เดิม
    return response;
  }
);

// Thunk สำหรับอัปเดต
export const updateExistingProduct = createAsyncThunk(
  'products/updateExistingProduct',
  async (productToUpdate: Product) => {
    const response = await api.updateProduct(productToUpdate); // <-- ใช้ API เดิม
    return response;
  }
);

// Thunk สำหรับลบ
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    await api.deleteProduct(id); // <-- ใช้ API เดิม
    return id; // ส่ง ID กลับไป
  }
);

// 5. สร้าง Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // (เราจะใช้ extraReducers สำหรับ Thunks)
  },
  // 6. extraReducers (จัดการ State หลังจาก Thunks ทำงานเสร็จ)
  extraReducers: (builder) => {
    builder
      // [Fetch Products]
      .addCase(fetchProducts.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload; // ได้ข้อมูลมา, เก็บเข้า State
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch products';
      })
      
      // [Add New Product]
      .addCase(addNewProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.items.push(action.payload); // เพิ่มสินค้าใหม่เข้า Array
      })
      
      // [Update Product]
      .addCase(updateExistingProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const updatedProduct = action.payload;
        const index = state.items.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.items[index] = updatedProduct; // อัปเดตตัวเดิม
        }
      })
      
      // [Delete Product]
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        state.items = state.items.filter(item => item._id !== id); // ลบออกจาก Array
      });
  },
});

export default productsSlice.reducer;