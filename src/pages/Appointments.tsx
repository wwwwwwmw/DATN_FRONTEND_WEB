import { useState, useEffect } from 'react'
import { appointmentAPI, clinicAPI } from '../services/api'
import { Calendar, Clock, MapPin, Zap, CheckCircle, XCircle } from 'lucide-react'

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [optimalSlots, setOptimalSlots] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [selectedClinic, setSelectedClinic] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [saInfo, setSaInfo] = useState<any>(null)
  const [tab, setTab] = useState<'book' | 'list'>('book')

  useEffect(() => {
    loadAppointments()
    loadClinics()
  }, [])

  const loadAppointments = async () => {
    try {
      const res = await appointmentAPI.list()
      setAppointments(res.data.results || [])
    } catch { }
  }

  const loadClinics = async () => {
    try {
      const res = await clinicAPI.list()
      setClinics(res.data.results || [])
    } catch { }
  }

  const findOptimalSlots = async () => {
    if (!selectedClinic || !selectedDate) return
    setLoading(true)
    try {
      const res = await appointmentAPI.optimalSlots(Number(selectedClinic), selectedDate)
      const data = res.data.data
      setOptimalSlots(data.slots || [])
      setSaInfo({
        algorithm: data.algorithm,
        iterations: data.iterations,
        computation_time_ms: data.computation_time_ms,
      })
    } catch {
      setOptimalSlots([])
    } finally {
      setLoading(false)
    }
  }

  const bookAppointment = async (slotId: number) => {
    try {
      await appointmentAPI.create({ time_slot_id: slotId, reason: 'Khám tổng quát' })
      alert('Đặt lịch thành công!')
      loadAppointments()
      findOptimalSlots()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đặt lịch thất bại')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { class: string; label: string }> = {
      PENDING: { class: 'badge-warning', label: 'Chờ xác nhận' },
      CONFIRMED: { class: 'badge-success', label: 'Đã xác nhận' },
      CANCELLED: { class: 'badge-danger', label: 'Đã hủy' },
      COMPLETED: { class: 'badge-primary', label: 'Hoàn thành' },
      NO_SHOW: { class: 'badge-secondary', label: 'Vắng mặt' },
    }
    const info = map[status] || { class: 'badge-secondary', label: status }
    return <span className={`badge ${info.class}`}>{info.label}</span>
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-2xl)' }}>
        📅 Lịch hẹn khám bệnh
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button className={`btn ${tab === 'book' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('book')}>
          <Calendar size={16} /> Đặt lịch mới
        </button>
        <button className={`btn ${tab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('list')}>
          <Clock size={16} /> Lịch hẹn của tôi ({appointments.length})
        </button>
      </div>

      {tab === 'book' && (
        <div>
          {/* Search form */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>🔍 Tìm khung giờ tối ưu (SA)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--space-md)', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phòng khám</label>
                <select className="form-select" value={selectedClinic}
                  onChange={e => setSelectedClinic(e.target.value)}>
                  <option value="">Chọn phòng khám</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ngày khám</label>
                <input type="date" className="form-input" value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button className="btn btn-primary" onClick={findOptimalSlots} disabled={loading}>
                {loading ? <span className="loading-spinner" /> : <><Zap size={16} /> Tìm</>}
              </button>
            </div>
          </div>

          {/* SA info */}
          {saInfo && (
            <div style={{
              marginBottom: 'var(--space-md)', display: 'flex', gap: 'var(--space-lg)',
              fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
            }}>
              <span>⚡ Algorithm: {saInfo.algorithm}</span>
              <span>🔄 Iterations: {saInfo.iterations}</span>
              <span>⏱️ Time: {saInfo.computation_time_ms}ms</span>
            </div>
          )}

          {/* Optimal slots */}
          {optimalSlots.length > 0 && (
            <div className="grid grid-3">
              {optimalSlots.map((slot, i) => (
                <div key={i} className="card" style={{
                  borderColor: slot.is_recommended ? 'var(--color-success)' : 'var(--color-border)',
                  position: 'relative',
                }}>
                  {slot.is_recommended && (
                    <div style={{
                      position: 'absolute', top: -8, left: 16,
                      background: 'var(--color-success)', color: 'white',
                      padding: '2px 12px', borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)', fontWeight: 700,
                    }}>
                      ⭐ Khuyến nghị
                    </div>
                  )}

                  <div style={{ marginTop: slot.is_recommended ? 'var(--space-sm)' : 0 }}>
                    <div style={{ fontWeight: 600 }}>{slot.doctor.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {slot.doctor.specialization}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                      margin: 'var(--space-md) 0', fontSize: 'var(--font-size-lg)', fontWeight: 700,
                    }}>
                      <Clock size={18} /> {slot.start_time} - {slot.end_time}
                    </div>

                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                      Còn {slot.remaining_slots} chỗ | SA Score: {slot.sa_score}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                      {slot.reasons.map((r: string, j: number) => (
                        <span key={j} className="badge badge-primary">{r}</span>
                      ))}
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }}
                      onClick={() => bookAppointment(slot.id)}>
                      Đặt lịch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Bác sĩ</th>
                  <th>Phòng khám</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-2xl)' }}>
                      Chưa có lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt, i) => (
                    <tr key={i}>
                      <td>{appt.date}</td>
                      <td>{appt.start_time} - {appt.end_time}</td>
                      <td>{appt.doctor_name}</td>
                      <td>{appt.clinic_name}</td>
                      <td>{getStatusBadge(appt.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
