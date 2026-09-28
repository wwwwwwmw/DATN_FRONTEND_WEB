import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Heart, Shield, Activity, Stethoscope } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '', password: '', password_confirm: '',
    username: '', first_name: '', last_name: '',
    role: 'PATIENT', phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(formData)
      } else {
        await login(formData.email, formData.password)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-hero)',
      padding: 'var(--space-lg)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1000px',
        width: '100%',
        minHeight: '600px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Left — Branding */}
        <div style={{
          background: 'var(--gradient-primary)',
          padding: 'var(--space-3xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-xl)',
        }}>
          <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, lineHeight: 1.2 }}>
            🏥 MedTech AI
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
            Hệ thống y tế thông minh — Tư vấn sức khỏe AI, phân tích X-quang, đặt lịch khám.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              { icon: '💬', text: 'Chat sơ vấn với AI (RAG)' },
              { icon: '🫁', text: 'Phân tích X-quang bằng DenseNet121' },
              { icon: '🗺️', text: 'Tìm phòng khám gần nhất (GIS)' },
              { icon: '📅', text: 'Đặt lịch tối ưu (Simulated Annealing)' },
              { icon: '📹', text: 'Video Call với bác sĩ (WebRTC)' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                opacity: 0.9, fontSize: 'var(--font-size-sm)',
              }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{
          background: 'var(--color-bg-card)',
          padding: 'var(--space-3xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{ marginBottom: 'var(--space-xl)', fontSize: 'var(--font-size-2xl)' }}>
            {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-md)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-sm)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Họ</label>
                    <input className="form-input" value={formData.first_name}
                      onChange={e => update('first_name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên</label>
                    <input className="form-input" value={formData.last_name}
                      onChange={e => update('last_name', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tên người dùng</label>
                  <input className="form-input" value={formData.username}
                    onChange={e => update('username', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select className="form-select" value={formData.role}
                    onChange={e => update('role', e.target.value)}>
                    <option value="PATIENT">Bệnh nhân</option>
                    <option value="DOCTOR">Bác sĩ</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={formData.email}
                onChange={e => update('email', e.target.value)} required placeholder="name@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input type="password" className="form-input" value={formData.password}
                onChange={e => update('password', e.target.value)} required placeholder="••••••••" />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input type="password" className="form-input" value={formData.password_confirm}
                  onChange={e => update('password_confirm', e.target.value)} required />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-md)' }}
              disabled={loading}>
              {loading ? <span className="loading-spinner" /> : (isRegister ? 'Đăng ký' : 'Đăng nhập')}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 'var(--space-lg)',
            color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)',
          }}>
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              style={{
                background: 'none', border: 'none', color: 'var(--color-primary-light)',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
