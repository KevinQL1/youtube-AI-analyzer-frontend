import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, User, Loader2, Sparkles, Video,
  ChevronDown, ChevronUp, Code2, Flame, Copy, Check, RefreshCw, Database
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "¿Cuáles son los 5 vídeos con mejor porcentaje de retención?",
  "¿Qué patrón tienen mis vídeos con más vistas?",
  "¿Qué vídeos han generado más reproducciones que la media?",
  "¿Cuál es mi mejor playlist en cuanto a vistas y retención?",
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://youtube-ai-analyzer-backend.onrender.com/api").replace(/\/$/, '');

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '¡Hola, Kevin! 🚀 Soy tu **Head of Growth AI** para el canal **KEQUILO**.\n\nTengo acceso directo a tus datos de vídeos, Shorts, retención, playlists y etiquetas en **PostgreSQL**. Selecciona una pregunta rápida o escribe tu consulta estratégica.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSql, setExpandedSql] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [channel, setChannel] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadChannel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/channel`);
      if (response.ok) setChannel(await response.json());
    } catch {
      setChannel(null);
    }
  };

  useEffect(() => {
    // El canal se carga una vez al montar la aplicacion para mostrar el contexto actual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChannel();
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage('Actualizando datos de YouTube...');
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo sincronizar');
      await loadChannel();
      setSyncMessage(data.partial ? 'Canal actualizado; Analytics quedo parcial.' : 'Canal actualizado correctamente.');
    } catch (error) {
      setSyncMessage(`No se pudo actualizar: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (messages.length > 1 || loading) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading]);

  const toggleSql = (index) => {
    setExpandedSql(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: '¡Chat reiniciado! 🚀 ¿En qué otra métrica o estrategia te gustaría profundizar hoy?',
      },
    ]);
  };

  const handleAsk = async (questionText) => {
    if (!questionText.trim() || loading) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setMessages((prev) => [...prev, { sender: 'user', text: questionText }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer,
            sql: data.sqlUsed,
            rowsCount: data.data ? data.data.length : 0
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `⚠️ **Error en la consulta:** ${data.error || 'No se pudo procesar la pregunta.'}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `❌ **Error de conexión:** No se pudo conectar con el servidor backend en \`${API_BASE_URL}\`.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAsk(input);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app-container">
      {/* Background Subtle Glows */}
      <div className="glow-top-left" />
      <div className="glow-bottom-right" />

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="logo-badge">
            <Video size={20} color="#ffffff" />
          </div>
          <div>
            <div className="title-row">
              <h1 className="brand-title">KEQUILO</h1>
              <span className="badge-pro">GROWTH ENGINE</span>
            </div>
            <p className="brand-subtitle">AI Strategic Consultant & Analytics</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-status">
            <Database size={13} className="status-icon" />
            <span className="status-dot"></span>
            <span>{channel ? `${Number(channel.subscribers || 0).toLocaleString()} suscriptores` : 'Conectando al canal...'}</span>
          </div>

          <button onClick={handleSync} className="sync-btn" disabled={syncing} title="Actualizar datos de YouTube">
            <RefreshCw size={15} className={syncing ? 'spinner' : ''} />
            <span>{syncing ? 'Actualizando' : 'Actualizar'}</span>
          </button>

          <button onClick={handleResetChat} className="reset-btn" title="Limpiar conversación">
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {syncMessage && <div className="sync-message">{syncMessage}</div>}
      {channel && (
        <div className="channel-summary">
          <span>{channel.title}</span>
          <span>{Number(channel.total_views || 0).toLocaleString()} vistas</span>
          <span>{Number(channel.total_videos || 0).toLocaleString()} videos</span>
          <span>Actualizado {new Date(channel.updated_at).toLocaleDateString()}</span>
        </div>
      )}

      {/* ÁREA DEL CHAT */}
      <main className="chat-area">
        <div className="chat-content">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender}`}>
              <div className="avatar">
                {msg.sender === 'ai' ? (
                  <div className="bot-icon"><Sparkles size={16} color="#fff" /></div>
                ) : (
                  <div className="user-icon"><User size={16} color="#fff" /></div>
                )}
              </div>

              <div className="bubble-wrapper">
                <div className="bubble">
                  {/* Botón de copiar para respuestas de la IA */}
                  {msg.sender === 'ai' && (
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copiar respuesta"
                    >
                      {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  )}

                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Bloque desplegable de SQL */}
                  {msg.sql && (
                    <div className="sql-box">
                      <button className="sql-toggle-btn" onClick={() => toggleSql(idx)}>
                        <div className="sql-btn-label">
                          <Code2 size={14} color="#818cf8" />
                          <span>Consulta SQL ejecutada ({msg.rowsCount} filas obtenidas)</span>
                        </div>
                        {expandedSql[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {expandedSql[idx] && (
                        <div className="sql-code-container">
                          <pre className="sql-code">
                            <code>{msg.sql}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row ai loading-row">
              <div className="avatar">
                <div className="bot-icon pulse"><Sparkles size={16} color="#fff" /></div>
              </div>
              <div className="bubble loading-bubble">
                <Loader2 className="spinner" size={18} />
                <span>Ejecutando SQL en PostgreSQL y analizando patrones de retención...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* FOOTER & INPUT */}
      <footer className="footer">
        {messages.length <= 2 && !loading && (
          <div className="quick-prompts">
            <span className="quick-title"><Flame size={14} color="#f43f5e" /> Sugerencias de análisis:</span>
            <div className="prompts-grid">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} className="prompt-chip" onClick={() => handleAsk(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            rows={1}
            placeholder="Escribe tu pregunta sobre el canal..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="send-btn">
            {loading ? <Loader2 className="spinner" size={18} /> : <Send size={16} />}
            <span>Analizar</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
