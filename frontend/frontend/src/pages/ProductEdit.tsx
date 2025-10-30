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
  const [preview, setPreview] = useState<string | undefined>(undefined)
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

  
  const onFile = (f: File | null) => {
    if (!f) {
      setModel(m => ({ ...m, _file: null }));
      setPreview(undefined);
      return;
    }
    setModel(m => ({ ...m, _file: f }));
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  const removeImage = () => {
    setModel(m => ({ ...m, imageUrl: '', _file: null }));
    setPreview(undefined);
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
          <div>
            <label className="label">ชื่อสินค้า</label>
            <input className="input" value={model.name} onChange={e => setModel({...model, name: e.target.value})} placeholder="เช่น หุ่นกันดั้ม RX-78" />
          </div>
          <div>
            <label className="label">ราคา (บาท)</label>
            <input type="number" className="input" value={model.price ?? 0} onChange={e => setModel({...model, price: Number(e.target.value)})} />
          </div>
            <div>
              <label className="label">จำนวน (ชิ้น)</label>
              <input 
                type="number" 
                className="input" 
                value={model.amount ?? 0} 
                onChange={e => setModel({...model, amount: Number(e.target.value)})} 
              />
          </div>
          <div>
            <label className="label">คำอธิบาย</label>
            <input className="input" value={model.description ?? ''} onChange={e => setModel({...model, description: e.target.value})} placeholder="เช่น ของแถม, รุ่นพิเศษ" />
          </div>
          <div>
            <label className="label">รูปภาพ (URL)</label>
            <input className="input" value={model.imageUrl ?? ''} onChange={e => setModel({...model, imageUrl: e.target.value})} placeholder="ลิงก์รูปภาพ (ถ้ามี API upload ให้ใช้ภายหลัง)" />
          </div>
        </div>
          <div>
            <label className="label">รูปภาพ (อัปโหลด)</label>
            <input type="file" accept="image/*" className="input" onChange={e => onFile(e.target.files ? e.target.files[0] : null)} />
            <div className="mt-3 flex items-center gap-3">
              {(preview || model.imageUrl) && (
                <img src={preview || model.imageUrl} alt="preview" className="h-28 rounded-lg border" />
              )}
              {(preview || model.imageUrl) && (
                <button type="button" onClick={removeImage} className="btn btn-secondary">เอารูปออก</button>
              )}
            </div>
          </div>

        <div className="mt-5 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">ยกเลิก</button>
          {!isNew && <button onClick={onDelete} className="btn btn-danger">ลบสินค้า</button>}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500">* หาก backend รองรับอัปโหลดรูป (multipart/form-data) สามารถต่อปุ่มอัปโหลดได้ภายหลัง</p>
      </div>
    </main>
  )
}
