import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';
import { useAuth } from '../../context/AuthContext';

export default function MessagesPage({ allowedRoles }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = () => axios.get('/api/messages/conversations').then(r => setConversations(r.data));

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (activeUser) {
      axios.get(`/api/messages/${activeUser._id}`).then(r => { setMessages(r.data); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); });
    }
  }, [activeUser]);

  const loadAvailableUsers = async () => {
    const fetches = allowedRoles.map(role => axios.get(`/api/users/${role}s`));
    const results = await Promise.all(fetches);
    setAvailableUsers(results.flatMap(r => r.data).filter(u => u._id !== user._id));
    setShowNewChat(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('receiver', activeUser._id);
      fd.append('content', newMessage);
      if (attachment) fd.append('attachment', attachment);
      const res = await axios.post('/api/messages', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages(m => [...m, res.data]);
      setNewMessage(''); setAttachment(null);
      loadConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const startChat = (u) => { setActiveUser(u); setShowNewChat(false); };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Topbar title="Messages" subtitle="Communicate with your team and clients" />
      <div className="page-content">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">Messages</h1>
          <button className="btn btn-primary" onClick={loadAvailableUsers}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
        </div>

        <div className="chat-container">
          <div className="chat-sidebar">
            <div className="chat-header">Conversations</div>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No conversations yet. Start a new chat!</div>
            ) : conversations.map(c => (
              <div key={c.user._id} className={`conversation-item ${activeUser?._id === c.user._id ? 'active' : ''}`} onClick={() => setActiveUser(c.user)}>
                <div className="conversation-avatar">{initials(c.user.name)}</div>
                <div className="conversation-info">
                  <div className="conversation-name">{c.user.name}</div>
                  <div className="conversation-preview">{c.lastMessage?.content?.slice(0, 30)}...</div>
                </div>
                <span className={`badge badge-${c.user.role}`} style={{ fontSize: 10 }}>{c.user.role}</span>
              </div>
            ))}
          </div>

          <div className="chat-main">
            {!activeUser ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 12 }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 48, height: 48, opacity: 0.3 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Select a conversation or start a new chat</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="conversation-avatar">{initials(activeUser.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{activeUser.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{activeUser.role} {activeUser.company ? `• ${activeUser.company}` : ''}</div>
                  </div>
                </div>
                <div className="chat-messages">
                  {messages.map(m => (
                    <div key={m._id} className={`message-bubble ${m.sender?._id === user._id ? 'sent' : ''}`}>
                      <div className="conversation-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(m.sender?.name)}</div>
                      <div>
                        <div className="message-content">
                          {m.content}
                          {m.attachment && <div style={{ marginTop: 8 }}><a href={`${process.env.REACT_APP_API_URL || ""}${m.attachment}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline', fontSize: 12 }}>📎 Attachment</a></div>}
                        </div>
                        <div className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 14 }}>No messages yet. Say hello!</div>}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input">
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                    <textarea
                      placeholder={`Message ${activeUser.name}...`}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                    />
                    {attachment && <div style={{ fontSize: 12, color: '#64748b' }}>📎 {attachment.name} <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => setAttachment(null)}>✕</button></div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ cursor: 'pointer' }}>
                      <input type="file" style={{ display: 'none' }} onChange={e => setAttachment(e.target.files[0])} />
                      <span className="btn btn-outline btn-icon btn-sm" title="Attach file">📎</span>
                    </label>
                    <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={sending || (!newMessage.trim() && !attachment)}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showNewChat && (
        <Modal title="Start New Chat" onClose={() => setShowNewChat(false)}>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Select someone to message:</p>
          {availableUsers.length === 0 ? <p style={{ color: '#94a3b8' }}>No users available</p> : (
            availableUsers.map(u => (
              <div key={u._id} className="user-list-item" onClick={() => startChat(u)}>
                <div className="conversation-avatar">{initials(u.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{u.role} {u.company || u.position ? `• ${u.company || u.position}` : ''}</div>
                </div>
                <span className={`badge badge-${u.role}`}>{u.role}</span>
              </div>
            ))
          )}
        </Modal>
      )}
    </>
  );
}
