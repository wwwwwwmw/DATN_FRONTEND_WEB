import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  MessageCircle, Image, MapPin, Calendar, Activity,
  Users, FileText, TrendingUp
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const features = [
    {
      icon: <MessageCircle size={28} />,
      title: 'Tư vấn AI',
      desc: 'Chat sơ vấn triệu chứng với hệ thống RAG',
      link: '/chat',
      color: 'blue',
    },
    {
      icon: <Image size={28} />,
      title: 'Phân tích X-quang',
      desc: 'DenseNet121 + Grad-CAM heatmap',
      link: '/xray',
      color: 'purple',
    },
    {
      icon: <MapPin size={28} />,
      title: 'Tìm phòng khám',
      desc: 'PostGIS bản đồ GIS tìm phòng khám gần nhất',
      link: '/map',
      color: 'green',
    },
    {
      icon: <Calendar size={28} />,
      title: 'Đặt lịch hẹn',
      desc: 'Simulated Annealing tối ưu khung giờ',
      link: '/appointments',
      color: 'cyan',
    },
  ]

  const stats = [
    { icon: <Users size={24} />, value: '1,247', label: 'Bệnh nhân', color: 'blue' },
    { icon: <Activity size={24} />, value: '89', label: 'Bác sĩ', color: 'green' },
    { icon: <FileText size={24} />, value: '3,456', label: 'Lượt khám', color: 'yellow' },
    { icon: <TrendingUp size={24} />, value: '97.2%', label: 'AI Accuracy', color: 'purple' },
  ]

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
          Xin chào, {user?.first_name} {user?.last_name} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
          Chào mừng bạn đến với MedTech AI — Hệ thống y tế thông minh
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card slide-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <h2 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-xl)' }}>
        Chức năng chính
      </h2>
      <div className="grid grid-2">
        {features.map((feat, i) => (
          <Link key={i} to={feat.link} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-lg)',
              cursor: 'pointer', animation: `fadeInUp 0.4s ease ${i * 100}ms both`,
            }}>
              <div className={`stat-icon ${feat.color}`} style={{ width: 56, height: 56, fontSize: 28, flexShrink: 0 }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xs)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
