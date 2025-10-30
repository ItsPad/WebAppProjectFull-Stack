import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProductList from './pages/ProductList'
import ProductEdit from './pages/ProductEdit'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/new" element={<ProductEdit />} />
        <Route path="/products/:id/edit" element={<ProductEdit />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <footer className="mt-auto py-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Product Shop
      </footer>
    </div>
  )
}
