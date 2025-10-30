import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container-narrow flex items-center justify-between h-16">
        <Link to="/" className="text-lg font-semibold">🛍️ Product Shop</Link>
        <nav className="flex items-center gap-3">
          <NavLink to="/" className={({isActive}) => 'btn btn-secondary ' + (isActive ? 'bg-gray-200' : '')}>หน้าสินค้า</NavLink>
          <NavLink to="/products/new" className={({isActive}) => 'btn btn-primary ' + (isActive ? 'opacity-90' : '')}>+ เพิ่มสินค้า</NavLink>
        </nav>
      </div>
    </header>
  )
}
