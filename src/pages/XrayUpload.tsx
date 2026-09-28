import { useState, useCallback } from 'react'
import { xrayAPI } from '../services/api'
import { Upload, FileImage, AlertCircle, CheckCircle } from 'lucide-react'

export default function XrayUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }, [])

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await xrayAPI.analyze(formData)
      setResult(res.data.data)
    } catch (err: any) {
      setResult({ error: err.response?.data?.message || 'Phân tích thất bại' })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'var(--color-danger)'
    if (severity === 'moderate') return 'var(--color-warning)'
    return 'var(--color-success)'
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-2xl)' }}>
        🫁 Phân tích X-quang AI
      </h1>

      <div className="grid grid-2">
        {/* Upload */}
        <div>
          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('xray-input')?.click()}
          >
            {preview ? (
              <img src={preview} alt="X-ray preview"
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 'var(--radius-md)' }}
              />
            ) : (
              <>
                <Upload size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }} />
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                  Kéo thả ảnh X-quang vào đây
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-sm)' }}>
                  hoặc click để chọn file (JPEG, PNG)
                </p>
              </>
            )}
            <input id="xray-input" type="file" accept="image/*" hidden
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {file && (
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-md)' }}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" /> Đang phân tích...
                </>
              ) : (
                <>
                  <FileImage size={18} /> Phân tích X-quang
                </>
              )}
            </button>
          )}
        </div>

        {/* Results */}
        <div>
          {result && !result.error && (
            <div className="card fade-in">
              <div className="card-header">
                <h3 className="card-title">📊 Kết quả phân tích</h3>
              </div>

              {result.top_findings?.map((finding: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {finding.severity === 'high' ? (
                      <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
                    ) : (
                      <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{finding.name_vi || finding.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {finding.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 700,
                      color: getSeverityColor(finding.severity),
                    }}>
                      {(finding.probability * 100).toFixed(1)}%
                    </div>
                    <div style={{
                      width: 100, height: 6, background: 'var(--color-bg)',
                      borderRadius: 3, marginTop: 4,
                    }}>
                      <div style={{
                        width: `${finding.probability * 100}%`,
                        height: '100%',
                        background: getSeverityColor(finding.severity),
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                </div>
              ))}

              {result.heatmap_image && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--space-sm)' }}>🔥 Grad-CAM Heatmap</h4>
                  <img
                    src={result.heatmap_image}
                    alt="Grad-CAM heatmap"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              )}

              <div style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-warning)',
              }}>
                {result.disclaimer}
              </div>
            </div>
          )}

          {result?.error && (
            <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
              <p style={{ color: 'var(--color-danger)' }}>❌ {result.error}</p>
            </div>
          )}

          {!result && (
            <div className="card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: 400, opacity: 0.5,
            }}>
              <FileImage size={64} />
              <p style={{ marginTop: 'var(--space-md)' }}>Upload ảnh X-quang để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
