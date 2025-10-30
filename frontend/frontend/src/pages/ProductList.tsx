import { useEffect } from 'react'; // (ลบ useState ออก)
import { Link } from 'react-router-dom';
// 1. Import Hooks ของ Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProducts, deleteProduct } from '../features/productSlice';
import type { Product } from '../types';

export default function ProductList() {
  // 3. ลบ useState ของ items, loading, error ทิ้ง

  // 4. ดึง State จาก Redux Store
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.products.items);
  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  // 5. เปลี่ยน load() ให้ 'dispatch' action
  useEffect(() => {
    // เราจะ dispatch 'fetchProducts' แค่ครั้งแรกที่โหลด
    if (loading === 'idle') {
      dispatch(fetchProducts());
    }
  }, [loading, dispatch]);

  const onDelete = async (id?: string | number) => {
    if (!id) return;
    if (!confirm('ลบสินค้านี้หรือไม่?')) return;
    try {
      // 6. เปลี่ยน api.deleteProduct เป็น dispatch(deleteProduct(...))
      await dispatch(deleteProduct(String(id))).unwrap(); 
      // .unwrap() จะช่วยให้เรา catch error ได้ (ถ้าต้องการ)
    } catch (e: any) {
      alert('ลบไม่สำเร็จ: ' + e.message);
    }
    // (ไม่ต้อง setItems(...) แล้ว เพราะ Slice จะอัปเดต State ให้อัตโนมัติ!)
  };

  // (ส่วนที่เหลือของ JSX เหมือนเดิมได้เลย)
  if (loading === 'pending') return <div className="container-narrow py-10">กำลังโหลด...</div>
  if (loading === 'failed') return <div className="container-narrow py-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>

  return (
    <main className="container-narrow py-6">
      <h1 className="text-2xl font-semibold mb-4">รายการสินค้า</h1>
      <div className="grid-cards">
        {items.map(p => {
          const id = p._id ?? p.id
          return (
            <div key={String(id)} className="card overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูป</div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs text-gray-500">ID: {String(id)}</div>
                <div className="text-lg font-medium">{p.name}</div>
                <div className="text-gray-900 font-semibold">฿ {Number(p.price || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-600">คงเหลือ: {p.amount ?? 0} ชิ้น</div>
                {p.description && <div className="text-sm text-gray-600">คำอธิบาย: {p.description}</div>}
                <div className="pt-2 flex items-center gap-2">
                  <Link to={`/products/${id}/edit`} className="btn btn-secondary">แก้ไข</Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {items.length === 0 && (
        <div className="text-center text-gray-500 py-20">ยังไม่มีสินค้า</div>
      )}
    </main>
  )
}
