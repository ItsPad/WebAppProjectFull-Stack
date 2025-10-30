import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import type { Product } from '../types'

const emptyProduct: Product = { name: '', price: 0, description: '', imageUrl: '', amount: 0 } // 👈 เพิ่ม amount: 0

export default function ProductEdit() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const navigate = useNavigate()

  const [model, setModel] = useState<Product>(emptyProduct)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (isNew) return
      try {
        setLoading(true)
        const data = await api.getProduct(String(id))
        setModel(data)
      } catch (e:any) {
        setError(e.message || 'ไม่สามารถโหลดสินค้า')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])


  const removeImage = () => {
    // 👇 เปลี่ยนให้มันลบแค่ imageUrl
    setModel(m => ({ ...m, imageUrl: '' })); 
    // setPreview(undefined); // ลบบรรทัดนี้
  }


  const onDelete = async () => {
    if (!id) return;
    if (!confirm('ลบสินค้านี้หรือไม่?')) return;
    try {
      await api.deleteProduct(String(id));
      navigate('/');
    } catch (e:any) {
      alert('ลบไม่สำเร็จ: ' + e.message);
    }
  }
const save = async () => {
    try {
      setSaving(true)
      if (isNew) {
        const created = await api.createProduct(model)
        navigate(`/`)
      } else {
        await api.updateProduct({ ...model, _id: (model._id ?? String(id)) })
        navigate(`/`)
      }
    } catch (e:any) {
      alert('บันทึกไม่สำเร็จ: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container-narrow py-10">กำลังโหลด...</div>
  if (error) return <div className="container-narrow py-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>

  return (
    <main className="container-narrow py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{isNew ? 'เพิ่มสินค้า' : 'แก้ไขสินค้า'}</h1>
      </div>

      <div className="card p-5">
        <div className="form-grid">
          
          {/* 1. เพิ่ม Input 'ชื่อสินค้า' กลับเข้ามา */}
          <div>
            <label className="label">ชื่อสินค้า</label>
            <input 
              className="input" 
              value={model.name} 
              onChange={e => setModel({...model, name: e.target.value})} 
              placeholder="เช่น หุ่นกันดั้ม RX-78" 
            />
          </div>

          {/* 2. เพิ่ม Input 'ราคา' กลับเข้ามา */}
          <div>
            <label className="label">ราคา (บาท)</label>
            <input 
              type="number" 
              className="input" 
              value={model.price ?? 0} 
              onChange={e => setModel({...model, price: Number(e.target.value)})} 
            />
          </div>

          {/* 3. เพิ่ม Input 'จำนวน' กลับเข้ามา */}
          <div>
            <label className="label">จำนวน (ชิ้น)</label>
            <input 
              type="number" 
              className="input" 
              value={model.amount ?? 0} 
              onChange={e => setModel({...model, amount: Number(e.target.value)})} 
            />
          </div>

          {/* 4. เพิ่ม Input 'คำอธิบาย' กลับเข้ามา */}
          <div>
            <label className="label">คำอธิบาย</label>
            <input 
              className="input" 
              value={model.description ?? ''} 
              onChange={e => setModel({...model, description: e.target.value})} 
              placeholder="เช่น ของแถม, รุ่นพิเศษ" 
            />
          </div>
          
          {/* 5. นี่คือ Input 'รูปภาพ' ที่คุณมีอยู่แล้ว */}
          <div>
            <label className="label">รูปภาพ (URL)</label>
            <input 
                className="input" 
                value={model.imageUrl ?? ''} 
                onChange={e => setModel({...model, imageUrl: e.target.value})} 
                placeholder="ลิงก์รูปภาพ (เช่น https://example.com/image.jpg)" 
            />
            
            <div className="mt-3 flex items-center gap-3">
              {model.imageUrl && (
                <img src={model.imageUrl} alt="preview" className="h-28 rounded-lg border" />
              )}
              {model.imageUrl && (
                <button type="button" onClick={removeImage} className="btn btn-secondary">เอารูปออก</button>
              )}
            </div>
          </div>
        </div> {/* 👈 สิ้นสุด form-grid */}

        <div className="mt-6 flex items-center gap-2">
          <button 
            type="button" 
            onClick={save} 
            disabled={saving} 
            className="btn btn-primary"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>

          {!isNew && (
            <button 
              type="button" 
              onClick={onDelete} 
              disabled={saving} 
              className="btn btn-secondary"
            >
              ลบ
            </button>
          )}
        </div>
      </div> {/* 👈 ปิด card */}
    </main>
  )
}