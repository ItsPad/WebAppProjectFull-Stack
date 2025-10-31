import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProducts, deleteProduct, addNewProduct} from '../features/productSlice';
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

  // --- Bulk select state ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
  const clearSelected = () => setSelectedIds([]);


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

  // helper: เช็คว่า match กับคำค้นหรือไม่
  const matchesQuery = (p: Product, q: string) => {
    const idStr = String(getId(p) ?? '');
    const name = (p.name ?? '').toLowerCase();
    const desc = (p.description ?? '').toLowerCase();
    const _q = q.trim().toLowerCase();
    return (
      _q === '' ||
      name.includes(_q) ||
      desc.includes(_q) ||
      idStr.toLowerCase().includes(_q)
    );
  };

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

  // --- FEATURED: 1 ชิ้นที่ราคาแพงที่สุด (ไม่ผูกกับ query) ---
  const featuredItem = useMemo(() => {
    if (!items || items.length === 0) return null;
    const priced = items.filter((p) => Number((p as any).price) > 0);
    if (priced.length === 0) return null;
    return priced.sort((a: any, b: any) => Number(b.price) - Number(a.price))[0];
  }, [items]);

  // --- NEW: เงื่อนไขซ่อน/แสดงสินค้าแนะนำ (ซ่อนเมื่อค้นหา หรือมีการกดเรียง)
  const showFeatured = useMemo(() => {
    const hasQuery = query.trim() !== '';
    const hasSort = !!sortKey;
    return !hasQuery && !hasSort; // โชว์เฉพาะตอน “ไม่ค้นหา” และ “ไม่กดเรียง”
  }, [query, sortKey]);

  // คัดกรอง + เรียงลำดับด้วย useMemo เพื่อประสิทธิภาพ
  
  // --- Export CSV of current visible items ---
  const exportCSV = () => {
    const rows = [
      ['ID','Name','Price','Amount','Active','Description','ImageUrl'],
      ...visibleItems.map(p => [
        String(getId(p)),
        p.name ?? '',
        String((p as any).price ?? ''),
        String((p as any).amount ?? ''),
        String((p as any).isActive ?? ''),
        (p.description ?? '').replace(/\n/g, ' '),
        p.imageUrl ?? ''
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Bulk delete selected ---
  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`ลบ ${selectedIds.length} รายการ?`)) return;
    for (const id of selectedIds) {
      try { await dispatch(deleteProduct(String(id))).unwrap(); } catch {}
    }
    clearSelected();
  };

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.filter((p) => matchesQuery(p, q));

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

  // UI ชิ้นส่วนย่อยของการ์ด (ใช้ซ้ำสำหรับรายการหลัก)
  const ProductCard = ({ p }: { p: Product }) => {
    const id = getId(p);
    const isRec = (p as any)?.isRecommended === true;
    return (
      <div key={String(id)} className="card overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-[1.02]">
        <div className="aspect-[4/3] bg-white overflow-hidden relative">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูป</div>
          )}
          {isRec && (
            <span className="absolute top-2 left-2 rounded-full bg-black/80 text-white text-xs px-2 py-1">
              แนะนำ
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          {/* Select checkbox */}
          <input
            type="checkbox"
            className="absolute top-2 right-2 scale-110"
            checked={selectedIds.includes(String(id))}
            onChange={() => toggleSelect(String(id))}
          />
          <div className="text-xs text-gray-500 break-all">ID: {String(id)}</div>
          <div className="text-lg font-medium">{p.name}</div>
          <div className="text-gray-900 font-semibold">฿ {Number((p as any).price || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">คงเหลือ: {Number((p as any).amount ?? 0)} ชิ้น</div>
          {p.description && <div className="text-sm text-gray-600 line-clamp-3">คำอธิบาย: {p.description}</div>}
          <div className="pt-2 flex items-center gap-2">
            <Link to={`/products/${id}/edit`} className="btn btn-secondary">แก้ไข</Link>
            <button
              onClick={async () => {
                const clone: any = { ...p, name: `${p.name} (copy)` };
                delete clone._id; delete clone.id; delete clone.createdAt; delete clone.updatedAt;
                try { await dispatch(addNewProduct(clone) as any).unwrap(); alert("ทำสำเนาสำเร็จ"); } catch (e) { alert("ทำสำเนาไม่สำเร็จ"); }
              }}
              className="btn btn-ghost"
              title="ทำสำเนาสินค้า"
            >ทำสำเนา</button>
            {/* <button onClick={() => onDelete(id)} className="btn btn-danger">ลบ</button> */}
          </div>
        </div>

        {/* Toolbar: Export & Bulk Delete */}
        <div className="flex items-right gap-2">
          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-gray-500">เลือก {selectedIds.length} ชิ้น</span>
              <button className="btn btn-danger" onClick={bulkDelete}>ลบที่เลือก</button>
              <button className="btn btn-ghost" onClick={clearSelected}>ยกเลิกเลือก</button>
            </>
          )}
        </div>
      </div>
    );
  };

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

        {/* Toolbar: Export & Bulk Delete */}
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={exportCSV}>ส่งออก CSV</button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-gray-500">เลือก {selectedIds.length} ชิ้น</span>
              <button className="btn btn-danger" onClick={bulkDelete}>ลบที่เลือก</button>
              <button className="btn btn-ghost" onClick={clearSelected}>ยกเลิกเลือก</button>
            </>
          )}
        </div>
      </div>

      {/* --- FEATURED: สินค้าราคาแพงที่สุด 1 ชิ้นใหญ่ตรงกลาง (ซ่อนเมื่อค้นหา/เรียง) --- */}
      {showFeatured && featuredItem && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-4"> สินค้าแนะนำประจำร้าน !!!</h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all bg-white">
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                {featuredItem.imageUrl ? (
                  <img
                    src={featuredItem.imageUrl}
                    alt={featuredItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    ไม่มีรูป
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                  ราคาสูงสุด
                </span>
              </div>

              <div className="p-6 text-center space-y-3">
                <div className="text-sm text-gray-500">
                  ID: {String((featuredItem as any)._id ?? (featuredItem as any).id)}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">{featuredItem.name}</h3>
                <div className="text-3xl font-bold text-red-600">
                  ฿ {Number((featuredItem as any).price || 0).toLocaleString()}
                </div>
                <p className="text-gray-700 text-sm">
                  คงเหลือ: {Number((featuredItem as any).amount ?? 0)} ชิ้น
                </p>
                {featuredItem.description && (
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                    {featuredItem.description}
                  </p>
                )}
                <div className="pt-3">
                  <Link
                    to={`/products/${(featuredItem as any)._id ?? (featuredItem as any).id}/edit`}
                    className="btn btn-primary px-6 py-2 text-lg"
                  >
                    แก้ไขข้อมูลสินค้า
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
        {visibleItems.map((p) => (
          <ProductCard key={String(getId(p))} p={p} />
        ))}
      </div>

      {visibleItems.length === 0 && (
        <div className="text-center text-gray-500 py-20">ไม่พบสินค้า</div>
      )}
    </main>
  );
}
