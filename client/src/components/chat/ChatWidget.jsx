import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatPopup from './ChatPopup';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Close popup when user logs out
  useEffect(() => {
    if (!user) setOpen(false);
  }, [user]);

  const handleUnreadChange = (count) => setUnread(count);

  return (
    <>
      {/* Floating button — bottom right */}
      <button
        id="chat-widget-btn"
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Open support chat"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F2A51A 0%, #D4890E 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(242,165,26,0.45), 0 2px 8px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(242,165,26,0.55), 0 4px 12px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(242,165,26,0.45), 0 2px 8px rgba(0,0,0,0.2)';
        }}
      >
        {/* Chat bubble icon */}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#EF4444',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Chat popup */}
      {open && (
        <ChatPopup
          user={user}
          onClose={() => setOpen(false)}
          onUnreadChange={handleUnreadChange}
        />
      )}
    </>
  );
}
