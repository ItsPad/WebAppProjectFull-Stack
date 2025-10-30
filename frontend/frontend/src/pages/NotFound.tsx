import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="container-narrow py-20 text-center space-y-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-gray-600">ไม่พบหน้าที่ต้องการ</p>
      <Link to="/" className="btn btn-primary">กลับหน้าแรก</Link>
    </main>
  )
}
