import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Product } from '../types'

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.listProducts()
      setItems(data)
    } catch (e:any) {
      setError(e.message || 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onDelete = async (id?: string | number) => {
    if (!id) return
    if (!confirm('ลบสินค้านี้หรือไม่?')) return
    try {
      await api.deleteProduct(String(id))
      setItems(prev => prev.filter(p => (p._id ?? p.id) !== id))
    } catch (e:any) {
      alert('ลบไม่สำเร็จ: ' + e.message)
    }
  }

  if (loading) return <div className="container-narrow py-10">กำลังโหลด...</div>
  if (error) return <div className="container-narrow py-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>

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
