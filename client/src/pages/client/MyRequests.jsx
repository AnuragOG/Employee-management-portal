import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => { API.get('/service-requests').then(r => setRequests(r.data)); }, []);

  const statusInfo = {
    pending: { label: 'Pending Review', icon: '⏳', desc: 'Your request is being reviewed by the admin team.' },
    approved: { label: 'Approved', icon: '✅', desc: 'Your request has been approved and a project has been created!' },
    rejected: { label: 'Rejected', icon: '❌', desc: 'Unfortunately, this request was not approved. Please contact admin for details.' },
  };

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Requests', value: requests.length, icon: '📋', color: 'blue' },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: '⏳', color: 'yellow' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, icon: '✅', color: 'green' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="card"><div className="empty-state" style={{ padding: 64 }}><div className="empty-icon">📋</div><p style={{ fontSize: 16, fontWeight: 500 }}>No requests yet</p><p>Browse our services and submit a request to get started.</p></div></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {requests.map(r => {
          const info = statusInfo[r.status] || {};
          return (
            <div key={r.id} className="card">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: 32 }}>{info.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center">
                    <h3 style={{ fontWeight: 600, fontSize: 16 }}>{r.serviceName}</h3>
                    <span className={`badge badge-${r.status}`}>{info.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{info.desc}</p>
                  {r.notes && <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                    <span style={{ fontWeight: 600 }}>Your notes: </span>{r.notes}
                  </div>}
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>Submitted {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
