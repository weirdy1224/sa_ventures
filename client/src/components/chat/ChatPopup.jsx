import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';

export default function ChatPopup({ user, onClose, onUnreadChange }) {
  const { socket } = useSocket();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingInfo, setTypingInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Load conversation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get('/chat/conversation');
        setConversation(data.conversation);
        setMessages(data.conversation.messages || []);
      } catch (e) {
        console.error('Chat load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !conversation) return;

    socket.emit('chat:join', { conversationId: conversation._id });

    const handleMessage = ({ message }) => {
      setMessages(prev => {
        // Avoid duplicates (our own optimistic send)
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      // If message is from staff/admin, notify parent of unread (widget is open so pass 0)
      if (message.senderRole !== 'customer') {
        onUnreadChange(0);
      }
    };

    const handleTyping = ({ senderName, isTyping }) => {
      setTypingInfo(isTyping ? senderName : null);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.emit('chat:leave', { conversationId: conversation._id });
    };
  }, [socket, conversation, onUnreadChange]);

  // ── Typing emit ───────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !conversation) return;
    socket.emit('chat:typing', { conversationId: conversation._id, senderName: user?.name, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('chat:typing', { conversationId: conversation._id, senderName: user?.name, isTyping: false });
    }, 1500);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      await api.post(`/chat/conversation/${conversation._id}/messages`, { text });
      // message will arrive via socket
    } catch (e) {
      console.error('Send error:', e);
      setInput(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      id="chat-popup"
      style={{
        position: 'fixed',
        bottom: 96,
        right: 28,
        width: 340,
        height: 500,
        zIndex: 9998,
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
        animation: 'chatSlideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #031C2E 0%, #0A2E47 100%)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F2A51A, #D4890E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Support Chat</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>We'll reply as soon as possible</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      {!user ? (
        /* Guest prompt */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: '#F9FAFB' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(242,165,26,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F2A51A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: 15, marginBottom: 6 }}>Login to Chat</div>
            <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.5 }}>Please sign in to start a conversation with our support team.</div>
          </div>
          <Link
            to="/login"
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #F2A51A, #D4890E)',
              color: '#1A1A0A', fontWeight: 700, fontSize: 14,
              padding: '10px 24px', borderRadius: 999,
              boxShadow: '0 2px 12px rgba(242,165,26,0.35)',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </Link>
        </div>
      ) : loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
          <div style={{ width: 24, height: 24, border: '2.5px solid #F2A51A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 8, background: '#F4F6F9' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 24 }}>
                 Hi <b style={{ color: '#F2A51A' }}>{user.name}</b>! How can we help you today?
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.senderRole === 'customer';
              return (
                <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                  {/* Sender name (WhatsApp-style) — show for staff/admin replies */}
                  {!isOwn && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#F2A51A', marginBottom: 2, marginLeft: 4 }}>
                      {msg.senderName}
                    </span>
                  )}
                  <div style={{
                    maxWidth: '78%',
                    padding: '9px 13px',
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isOwn ? 'linear-gradient(135deg, #031C2E, #0A2E47)' : '#fff',
                    color: isOwn ? '#fff' : '#1A1A2E',
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, marginLeft: isOwn ? 0 : 4, marginRight: isOwn ? 4 : 0 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            {typingInfo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 12 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#F2A51A', animation: `typingDot 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <span>{typingInfo} is typing…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
            <textarea
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid #E5E7EB', borderRadius: 12,
                padding: '9px 13px', fontSize: 13, fontFamily: 'inherit',
                color: '#1A1A2E', outline: 'none', lineHeight: 1.5,
                maxHeight: 90, overflowY: 'auto',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#F2A51A'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: !input.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #F2A51A, #D4890E)',
                color: !input.trim() ? '#9CA3AF' : '#1A1A0A',
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
