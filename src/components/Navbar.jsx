import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Navbar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 text-xs transition-colors
     ${isActive ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`

  // Desktop: also use horizontal layout with labels beside icons
  const desktopLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
     ${isActive ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <span className="text-lg font-bold text-gray-900">
          Class<span className="text-red-500">Strike</span>
        </span>

        <div className="flex items-center gap-1">
          <NavLink to="/" className={desktopLinkClass} end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/classes" className={desktopLinkClass}>
            <BookOpen size={18} />
            Classes
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors ml-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-6 py-2 flex justify-around">
        <NavLink to="/" className={linkClass} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/classes" className={linkClass}>
          <BookOpen size={20} />
          <span>Classes</span>
        </NavLink>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  )
}
