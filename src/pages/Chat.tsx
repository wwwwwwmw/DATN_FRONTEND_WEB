import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { Send, Bot, User, AlertTriangle, BookOpen } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
  urgency?: string
  specialties?: string[]
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý tư vấn y tế AI. Hãy mô tả triệu chứng của bạn, tôi sẽ giúp bạn tìm hiểu thêm. ⚠️ Lưu ý: Kết quả chỉ mang tính tham khảo.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await chatAPI.send(userMsg, sessionId)
      const data = res.data.data

      setSessionId(data.session_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        urgency: data.urgency_level,
        specialties: data.suggested_specialties,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, hệ thống tạm thời không thể trả lời. Vui lòng thử lại sau.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency || urgency === 'low') return null
    if (urgency === 'critical') return <span className="badge badge-danger">⚠️ Cấp cứu</span>
    if (urgency === 'moderate') return <span className="badge badge-warning">⚡ Cần khám sớm</span>
    return null
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-2xl)' }}>
        💬 Tư vấn Y tế AI
      </h1>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`chat-message ${msg.role}`}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                  marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-xs)',
                  opacity: 0.7,
                }}>
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  {msg.role === 'assistant' ? 'Trợ lý AI' : 'Bạn'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {msg.urgency && getUrgencyBadge(msg.urgency) && (
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    {getUrgencyBadge(msg.urgency)}
                  </div>
                )}

                {msg.specialties && msg.specialties.length > 0 && (
                  <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Chuyên khoa đề xuất:
                    </span>
                    {msg.specialties.map((s, j) => (
                      <span key={j} className="badge badge-primary">{s}</span>
                    ))}
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <details style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                      📚 Nguồn tham khảo ({msg.sources.length})
                    </summary>
                    {msg.sources.map((src, j) => (
                      <div key={j} style={{
                        marginTop: 'var(--space-xs)',
                        padding: 'var(--space-xs)',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        <strong>{src.source}</strong> (Score: {src.relevance_score})
                        <br />{src.content}
                      </div>
                    ))}
                  </details>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                <span style={{ color: 'var(--color-text-secondary)' }}>Đang phân tích...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="form-input"
            placeholder="Mô tả triệu chứng của bạn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
