import React, { useState, useEffect, useRef } from 'react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function Messaging() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    API.get('/contacts').then(r => setContacts(r.data));
    API.get('/messages/conversations').then(r => setConversations(r.data));
  }, []);

  useEffect(() => {
    if (selected) {
      API.get(`/messages?withUserId=${selected.id}`).then(r => setMessages(r.data));
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectContact = (contact) => {
    setSelected(contact);
    API.get(`/messages?withUserId=${contact.id}`).then(r => setMessages(r.data));
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;
    setLoading(true);
    try {
      const res = await API.post('/messages', { receiverId: selected.id, content: input.trim() });
      setMessages(m => [...m, res.data]);
      setInput('');
      // Update conversations
      API.get('/messages/conversations').then(r => setConversations(r.data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString();
  };

  // Merge contacts and conversations
  const conversationMap = new Map(conversations.map(c => [c.userId, c]));
  const allContacts = contacts.map(c => ({
    ...c,
    lastMessage: conversationMap.get(c.id)?.lastMessage || null,
    lastTime: conversationMap.get(c.id)?.lastTime || null
  })).sort((a, b) => {
    if (!a.lastTime && !b.lastTime) return 0;
    if (!a.lastTime) return 1;
    if (!b.lastTime) return -1;
    return new Date(b.lastTime) - new Date(a.lastTime);
  });

  return (
    <div className="messaging-layout">
      <div className="contact-list">
        <div className="contact-list-header">Messages</div>
        {allContacts.length === 0 && <div style={{ padding: 20, color: 'var(--gray-400)', fontSize: 13 }}>No contacts available</div>}
        {allContacts.map(c => (
          <div
            key={c.id}
            className={`contact-item ${selected?.id === c.id ? 'active' : ''}`}
            onClick={() => selectContact(c)}
          >
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{c.avatar || c.name?.[0]}</div>
            <div className="contact-info">
              <div className="contact-name">{c.name}</div>
              <div className="contact-preview">{c.lastMessage || `${c.role} · Start a conversation`}</div>
            </div>
            {c.lastTime && <div style={{ fontSize: 10, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{formatDate(c.lastTime)}</div>}
          </div>
        ))}
      </div>
      <div className="chat-area">
        {!selected ? (
          <div className="chat-placeholder">
            <div style={{ fontSize: 48 }}>💬</div>
            <p>Select a contact to start messaging</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="avatar">{selected.avatar || selected.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{selected.role}</div>
              </div>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13, marginTop: 24 }}>No messages yet. Say hello!</div>}
              {messages.map(m => (
                <div key={m.id}>
                  <div className={`message-bubble ${m.senderId === user.id ? 'sent' : 'received'}`}>
                    {m.content}
                    <div className="message-time">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <input
                className="chat-input"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
                Send ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
