import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { API.get('/service-requests').then(r => setRequests(r.data)); }, []);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      const res = await API.put(`/service-requests/${id}/approve`);
      setRequests(r => r.map(x => x.id === id ? res.data.request : x));
      alert(`✅ Approved! Project "${res.data.project.name}" has been created.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally { setLoading(false); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this request?')) return;
    const res = await API.put(`/service-requests/${id}/reject`);
    setRequests(r => r.map(x => x.id === id ? res.data : x));
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Object.entries(counts).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}>
            {key} ({val})
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><h2>Service Requests ({filtered.length})</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Service</th><th>Client</th><th>Notes</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📋</div><p>No requests found</p></div></td></tr>}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.serviceName}</td>
                  <td>{r.clientName}</td>
                  <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--gray-500)' }}>{r.notes || '—'}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(r.id)} disabled={loading}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(r.id)}>✗ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
