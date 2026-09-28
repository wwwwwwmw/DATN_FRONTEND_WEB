import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home, MessageCircle, Image, MapPin, Calendar,
  Bell, LogOut, Menu
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', icon: <Home size={18} />, label: 'Trang chủ' },
    { to: '/chat', icon: <MessageCircle size={18} />, label: 'Tư vấn' },
    { to: '/xray', icon: <Image size={18} />, label: 'X-quang' },
    { to: '/map', icon: <MapPin size={18} />, label: 'Bản đồ' },
    { to: '/appointments', icon: <Calendar size={18} />, label: 'Lịch hẹn' },
  ]

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🏥</span>
        <span>MedTech AI</span>
      </Link>

      <ul className="navbar-links">
        {links.map(link => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={location.pathname === link.to ? 'active' : ''}
            >
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button className="btn btn-icon btn-secondary" title="Thông báo">
          <Bell size={18} />
        </button>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {user?.first_name} {user?.last_name}
        </span>
        <button className="btn btn-icon btn-secondary" onClick={logout} title="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
