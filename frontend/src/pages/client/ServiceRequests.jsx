import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';

export default function ClientServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { axios.get('/api/service-requests').then(r => { setRequests(r.data); setLoading(false); }); }, []);

  return (
    <>
      <Topbar title="My Requests" subtitle="Track your service requests" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Service Requests</h1><p className="page-subtitle">{requests.length} total requests</p></div>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gap: 16 }}>
            {requests.map(r => (
              <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>{r.service?.name}</h3>
                      <span className={`badge badge-${r.status}`}>{r.status}</span>
                    </div>
                    {r.message && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>Your message: {r.message}</p>}
                    {r.adminNote && (
                      <div style={{ background: r.status === 'approved' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${r.status === 'approved' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
                        <strong>Admin note:</strong> {r.adminNote}
                      </div>
                    )}
                    {r.project && (
                      <div style={{ marginTop: 8, padding: '6px 12px', background: '#e0e7ff', borderRadius: 6, fontSize: 13, color: '#4f46e5' }}>
                        ✅ Project created: <strong>{r.project.name}</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13, color: '#64748b' }}>
                    <div>₹{r.service?.price?.toLocaleString()}</div>
                    <div style={{ marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p>No requests yet. Browse our services to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
