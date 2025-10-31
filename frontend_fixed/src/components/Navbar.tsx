import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container-narrow flex items-center justify-between h-16">
        <div className="flex items-center">
          <img 
            src="https://media.discordapp.net/attachments/1263709022872277094/1433379353319706634/Elowen-removebg-preview.png?ex=69047a0c&is=6903288c&hm=13df3e2ad245beade58b7715150f13d2ffd8601df87b4a643ec365c07ab9904d&=&format=webp&quality=lossless" 
            alt="FPQ Shop" 
            className="h-[70px] w-[70px] object-contain hover:scale-105 transition-transform hover:bg-black rounded-full"
          />
          <Link to="/" className="text-lg font-semibold ml-2">FPQ Shop</Link>
        </div>
        <nav className="flex items-center gap-3">
          <NavLink 
            to="/" 
            className={({isActive}) => 'btn btn-secondary ' + (isActive ? 'bg-gray-200' : '')}
          >
            หน้าสินค้า
          </NavLink>
          <NavLink 
            to="/products/new" 
            className={({isActive}) => 'btn btn-primary ' + (isActive ? 'opacity-90' : '')}
          >
            + เพิ่มสินค้า
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
