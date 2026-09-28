import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { clinicAPI } from '../services/api'
import { MapPin, Phone, Clock, Star, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="#2563eb"/>
      <text x="16" y="20" text-anchor="middle" font-size="16" fill="white">🏥</text>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

// Component: fly to location
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, 14) }, [center])
  return null
}

export default function MapView() {
  const [clinics, setClinics] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<[number, number]>([10.7730, 106.6985])
  const [selectedClinic, setSelectedClinic] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [radius, setRadius] = useState(5000)

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log('Geolocation denied, using default HCMC location')
    )
  }, [])

  useEffect(() => {
    searchNearby()
  }, [userLocation, radius])

  const searchNearby = async () => {
    setLoading(true)
    try {
      const res = await clinicAPI.nearby(userLocation[0], userLocation[1], radius)
      setClinics(res.data.data.results || [])
    } catch {
      // Fallback: load all clinics
      try {
        const res = await clinicAPI.list()
        setClinics(res.data.results || [])
      } catch { }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-2xl)' }}>
        🗺️ Tìm Phòng khám
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--space-lg)' }}>
        {/* Sidebar */}
        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Bán kính tìm kiếm</label>
            <select className="form-select" value={radius} onChange={e => setRadius(Number(e.target.value))}>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
            <p style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {loading ? 'Đang tìm...' : `Tìm thấy ${clinics.length} phòng khám`}
            </p>
          </div>

          {clinics.map((clinic, i) => (
            <div key={i} className="card" style={{
              marginBottom: 'var(--space-sm)', cursor: 'pointer',
              borderColor: selectedClinic?.id === clinic.id ? 'var(--color-primary)' : 'var(--color-border)',
            }}
              onClick={() => setSelectedClinic(clinic)}
            >
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                {clinic.name}
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>
                <MapPin size={12} style={{ display: 'inline' }} /> {clinic.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ color: 'var(--color-warning)' }}>
                  <Star size={12} style={{ display: 'inline' }} /> {clinic.rating}
                </span>
                {clinic.distance_km && (
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    <Navigation size={12} style={{ display: 'inline' }} /> {clinic.distance_km} km
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            <Marker position={userLocation}>
              <Popup>📍 Vị trí của bạn</Popup>
            </Marker>

            {/* Search radius */}
            <Circle center={userLocation} radius={radius}
              pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.05 }}
            />

            {/* Clinics */}
            {clinics.map((clinic, i) => (
              clinic.latitude && clinic.longitude && (
                <Marker key={i} position={[clinic.latitude, clinic.longitude]} icon={hospitalIcon}>
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{clinic.name}</h3>
                      <p style={{ fontSize: 12, color: '#666' }}>{clinic.address}</p>
                      {clinic.phone && <p style={{ fontSize: 12 }}>📞 {clinic.phone}</p>}
                      <p style={{ fontSize: 12 }}>⭐ {clinic.rating}</p>
                      {clinic.distance_km && <p style={{ fontSize: 12 }}>📏 {clinic.distance_km} km</p>}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {selectedClinic?.latitude && (
              <FlyTo center={[selectedClinic.latitude, selectedClinic.longitude]} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
