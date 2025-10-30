// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/productSlice'; // Import reducer จาก Slice

export const store = configureStore({
  reducer: {
    // 1. บอก Store ว่ามี Reducer ชื่อ 'products'
    products: productsReducer,
    // (ถ้ามี Slice อื่นๆ ก็มาเพิ่มตรงนี้)
  },
});

// 2. Export Types สำหรับ TypeScript (สำคัญมาก)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;