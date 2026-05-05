import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

// ── Conversation Card ─────────────────────────────────────────────────────────
function ConversationCard({ conv, isSelected, onClick }) {
  const hasUnread = conv.unreadByStaff > 0;

  return (
    <button
      id={`conv-card-${conv._id}`}
      onClick={() => onClick(conv)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px 18px',
        borderRadius: 14,
        border: `2px solid ${isSelected ? 'var(--gold, #F2A51A)' : 'var(--portal-border, rgba(255,255,255,0.08))'}`,
        background: isSelected
          ? 'rgba(242,165,26,0.08)'
          : 'var(--portal-card-bg, #111827)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.18s ease',
        position: 'relative',
        boxShadow: isSelected ? '0 0 0 1px rgba(242,165,26,0.3)' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(242,165,26,0.4)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--portal-border, rgba(255,255,255,0.08))'; }}
    >
      {/* Top row: avatar + name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #F2A51A, #D4890E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#1A1A0A',
        }}>
          {conv.customerName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--portal-text-primary, #F8FAFC)', marginBottom: 1 }}>
            {conv.customerName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--portal-text-secondary, #94A3B8)' }}>
            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No messages yet'}
          </div>
        </div>
        {/* Unread badge */}
        {hasUnread && (
          <span style={{
            background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700,
            borderRadius: 999, minWidth: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 5px', flexShrink: 0,
          }}>
            {conv.unreadByStaff > 9 ? '9+' : conv.unreadByStaff}
          </span>
        )}
      </div>

      {/* Preview text */}
      <div style={{
        fontSize: 12, color: 'var(--portal-text-secondary, #94A3B8)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        fontWeight: hasUnread ? 600 : 400,
      }}>
        {conv.lastMessage || 'No messages yet'}
      </div>
    </button>
  );
}

// ── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isCustomer = msg.senderRole === 'customer';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-start' : 'flex-end' }}>
      {!isCustomer && (
        <span style={{ fontSize: 11, fontWeight: 600, color: '#F2A51A', marginBottom: 2, marginRight: 4 }}>
          {msg.senderName}
        </span>
      )}
      {isCustomer && (
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--portal-text-secondary, #94A3B8)', marginBottom: 2, marginLeft: 4 }}>
          {msg.senderName}
        </span>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '9px 14px',
        borderRadius: isCustomer ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isCustomer
          ? 'var(--portal-card-bg, #1E293B)'
          : 'linear-gradient(135deg, #F2A51A, #D4890E)',
        color: isCustomer ? 'var(--portal-text-primary, #F8FAFC)' : '#1A1A0A',
        fontSize: 13,
        lineHeight: 1.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        wordBreak: 'break-word',
        border: isCustomer ? '1px solid var(--portal-border, rgba(255,255,255,0.08))' : 'none',
      }}>
        {msg.text}
      </div>
      <span style={{ fontSize: 10, color: 'var(--portal-text-secondary, #94A3B8)', marginTop: 3, marginLeft: isCustomer ? 4 : 0, marginRight: isCustomer ? 0 : 4 }}>
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CustomerQueriesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingInfo, setTypingInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Load all conversations ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/chat/conversations');
        setConversations(data.conversations);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingConvs(false);
      }
    })();
  }, []);

  // ── Socket: join staff room, listen for updates ───────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join_staff');

    const handleConvUpdate = (update) => {
      setConversations(prev =>
        prev.map(c => c._id === update.conversationId ? { ...c, ...update } : c)
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    };

    socket.on('chat:conversation_update', handleConvUpdate);

    return () => {
      socket.off('chat:conversation_update', handleConvUpdate);
      socket.emit('chat:leave_staff');
    };
  }, [socket]);

  // ── Socket: messages for selected conversation ────────────────────────────
  useEffect(() => {
    if (!socket || !selected) return;
    socket.emit('chat:join', { conversationId: selected._id });

    const handleMsg = ({ message }) => {
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };
    const handleTyping = ({ senderName, isTyping }) => {
      setTypingInfo(isTyping ? senderName : null);
    };

    socket.on('chat:message', handleMsg);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMsg);
      socket.off('chat:typing', handleTyping);
      socket.emit('chat:leave', { conversationId: selected._id });
    };
  }, [socket, selected]);

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelectConv = async (conv) => {
    setSelected(conv);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const { data } = await api.get(`/chat/conversation/${conv._id}/messages`);
      setMessages(data.messages);
      // Mark as read
      await api.patch(`/chat/conversations/${conv._id}/read`);
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadByStaff: 0 } : c));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ── Send reply ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      await api.post(`/chat/conversation/${selected._id}/messages`, { text });
    } catch (e) {
      console.error(e);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filtered = conversations.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByStaff || 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--portal-border, rgba(255,255,255,0.08))' }}>

      {/* LEFT: Conversation List */}
      <div style={{
        width: 310,
        flexShrink: 0,
        background: 'var(--portal-card-bg, #111827)',
        borderRight: '1px solid var(--portal-border, rgba(255,255,255,0.08))',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 18px 12px', borderBottom: '1px solid var(--portal-border, rgba(255,255,255,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              Customer Queries
            </h2>
            {totalUnread > 0 && (
              <span style={{
                background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700,
                borderRadius: 999, minWidth: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
              }}>
                {totalUnread}
              </span>
            )}
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--portal-text-secondary, #94A3B8)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="conv-search"
              type="text"
              placeholder="Search customers…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px 8px 32px',
                borderRadius: 8, border: '1.5px solid var(--portal-input-border, rgba(255,255,255,0.1))',
                background: 'var(--portal-input-bg, rgba(255,255,255,0.03))',
                color: 'var(--portal-text-primary, #F8FAFC)',
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#F2A51A'}
              onBlur={e => e.target.style.borderColor = 'var(--portal-input-border, rgba(255,255,255,0.1))'}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingConvs ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 78, borderRadius: 14, background: 'var(--portal-border, rgba(255,255,255,0.05))', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--portal-text-secondary, #94A3B8)', fontSize: 13, marginTop: 32 }}>
              {searchQuery ? 'No matching customers' : 'No conversations yet'}
            </div>
          ) : (
            filtered.map(conv => (
              <ConversationCard
                key={conv._id}
                conv={conv}
                isSelected={selected?._id === conv._id}
                onClick={handleSelectConv}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Conversation Detail */}
      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--portal-content-bg, #0B1120)', minWidth: 0 }}>
          {/* Detail header */}
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--portal-border, rgba(255,255,255,0.08))',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--portal-card-bg, #111827)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F2A51A, #D4890E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#1A1A0A', flexShrink: 0,
            }}>
              {selected.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.customerName}</div>
              <div style={{ fontSize: 12, color: 'var(--portal-text-secondary, #94A3B8)' }}>
                {typingInfo ? <span style={{ color: '#10B981' }}>✦ {typingInfo} is typing…</span> : 'Customer support conversation'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingMsgs ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{ width: 28, height: 28, border: '2.5px solid #F2A51A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--portal-text-secondary, #94A3B8)', fontSize: 13, marginTop: 40 }}>
                No messages yet. Wait for the customer to send a message.
              </div>
            ) : (
              messages.map((msg, i) => <MessageBubble key={msg._id || i} msg={msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--portal-border, rgba(255,255,255,0.08))',
            background: 'var(--portal-card-bg, #111827)',
            display: 'flex', gap: 10, alignItems: 'flex-end',
          }}>
            <textarea
              id="staff-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Reply to ${selected.customerName}…`}
              rows={1}
              style={{
                flex: 1, resize: 'none',
                border: '1.5px solid var(--portal-input-border, rgba(255,255,255,0.1))',
                borderRadius: 12,
                padding: '9px 14px', fontSize: 13, fontFamily: 'inherit',
                color: 'var(--portal-text-primary, #F8FAFC)',
                background: 'var(--portal-input-bg, rgba(255,255,255,0.03))',
                outline: 'none', lineHeight: 1.5,
                maxHeight: 100, overflowY: 'auto',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#F2A51A'}
              onBlur={e => e.target.style.borderColor = 'var(--portal-input-border, rgba(255,255,255,0.1))'}
            />
            <button
              id="staff-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none',
                background: !input.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F2A51A, #D4890E)',
                color: !input.trim() ? 'rgba(255,255,255,0.3)' : '#1A1A0A',
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--portal-text-secondary, #94A3B8)', background: 'var(--portal-content-bg, #0B1120)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(242,165,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F2A51A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--portal-text-primary, #F8FAFC)', marginBottom: 6 }}>Select a Conversation</div>
            <div style={{ fontSize: 13 }}>Choose a customer from the left to view and reply to their messages.</div>
          </div>
        </div>
      )}
    </div>
  );
}
