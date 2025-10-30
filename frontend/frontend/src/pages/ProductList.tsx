import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProducts, deleteProduct } from '../features/productSlice';
import type { Product } from '../types';

type SortKey = 'price' | 'amount' | null;
type SortOrder = 'asc' | 'desc';

export default function ProductList() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.products.items);
  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  // --- UI state: ค้นหา + เรียงลำดับ ---
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (loading === 'idle') {
      dispatch(fetchProducts());
    }
  }, [loading, dispatch]);

  const onDelete = async (id?: string | number) => {
    if (!id) return;
    if (!confirm('ลบสินค้านี้หรือไม่?')) return;
    try {
      await dispatch(deleteProduct(String(id))).unwrap();
    } catch (e: any) {
      alert('ลบไม่สำเร็จ: ' + e.message);
    }
  };

  // helper: ดึง id ทั้งจาก _id หรือ id
  const getId = (p: Product) => (p as any)._id ?? (p as any).id;

  // toggle ฟังก์ชันสำหรับปุ่มเรียง
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('asc'); // เริ่มจากน้อย->มาก เมื่อเปลี่ยนคีย์
    } else {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc')); // สลับขึ้น/ลง
    }
  }, [sortKey]);

  const clearSort = () => {
    setSortKey(null);
    setSortOrder('asc');
  };

  const clearQuery = () => setQuery('');

  // คัดกรอง + เรียงลำดับด้วย useMemo เพื่อประสิทธิภาพ
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.filter((p) => {
      const idStr = String(getId(p) ?? '');
      const name = (p.name ?? '').toLowerCase();
      const desc = (p.description ?? '').toLowerCase();
      return (
        q === '' ||
        name.includes(q) ||
        desc.includes(q) ||
        idStr.toLowerCase().includes(q)
      );
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = Number((a as any)[sortKey] ?? 0);
        const bv = Number((b as any)[sortKey] ?? 0);
        if (av === bv) return 0;
        const base = av < bv ? -1 : 1;
        return sortOrder === 'asc' ? base : -base;
      });
    }

    return list;
  }, [items, query, sortKey, sortOrder]);

  if (loading === 'pending') {
    return <div className="container-narrow py-10">กำลังโหลด...</div>;
  }
  if (loading === 'failed') {
    return <div className="container-narrow py-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>;
  }

  // UI helper: ลูกศรขึ้น/ลงตามสถานะ sort
  const Arrow = ({ active }: { active: boolean }) => (
    <span className="ml-1 inline-block align-middle">
      {active ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <main className="container-narrow py-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">รายการสินค้า</h1>

        {/* แถบค้นหา */}
        <div className="flex-1 md:max-w-lg">
          <label className="block text-sm text-gray-600 mb-1">ค้นหา (ชื่อ, คำอธิบาย, ID)</label>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์คำค้นหา..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {query && (
              <button
                onClick={clearQuery}
                className="btn btn-secondary whitespace-nowrap"
                title="ล้างคำค้น"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* ปุ่มเรียงลำดับ */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort('price')}
            className={`btn ${sortKey === 'price' ? 'btn-primary' : 'btn-secondary'}`}
            title="เรียงตามราคา"
          >
            ราคา <Arrow active={sortKey === 'price'} />
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`btn ${sortKey === 'amount' ? 'btn-primary' : 'btn-secondary'}`}
            title="เรียงตามจำนวนคงเหลือ"
          >
            จำนวนคงเหลือ <Arrow active={sortKey === 'amount'} />
          </button>
          {(sortKey || query) && (
            <button onClick={clearSort} className="btn btn-ghost" title="ล้างการเรียง">
              รีเซ็ตเรียง
            </button>
          )}
        </div>
      </div>

      {/* แถบสถานะเล็ก ๆ */}
      <div className="text-sm text-gray-500 mb-3">
        แสดง {visibleItems.length} รายการ
        {sortKey && (
          <>
            {' '}• เรียงตาม <span className="font-medium">{sortKey === 'price' ? 'ราคา' : 'จำนวนคงเหลือ'}</span> ({sortOrder === 'asc' ? 'น้อย→มาก' : 'มาก→น้อย'})
          </>
        )}
        {query && (
          <>
            {' '}• ค้นหา: <span className="font-medium">{query}</span>
          </>
        )}
      </div>

      <div className="grid-cards">
        {visibleItems.map((p) => {
          const id = getId(p);
          return (
            <div key={String(id)} className="card overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
              <div className="aspect-[4/3] bg-white overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูป</div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs text-gray-500 break-all">ID: {String(id)}</div>
                <div className="text-lg font-medium">{p.name}</div>
                <div className="text-gray-900 font-semibold">฿ {Number(p.price || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-600">คงเหลือ: {Number((p as any).amount ?? 0)} ชิ้น</div>
                {p.description && <div className="text-sm text-gray-600 line-clamp-3">คำอธิบาย: {p.description}</div>}
                <div className="pt-2 flex items-center gap-2">
                  <Link to={`/products/${id}/edit`} className="btn btn-secondary">แก้ไข</Link>
                  {/* ถ้าต้องการปุ่มลบ ให้เปิดคอมเมนต์ด้านล่าง */}
                  {/* <button onClick={() => onDelete(id)} className="btn btn-danger">ลบ</button> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleItems.length === 0 && (
        <div className="text-center text-gray-500 py-20">ไม่พบสินค้า</div>
      )}
    </main>
  );
}
