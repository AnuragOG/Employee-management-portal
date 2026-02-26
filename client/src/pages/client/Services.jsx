import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

export default function ClientServices() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { API.get('/services').then(r => setServices(r.data)); }, []);

  const openRequest = (service) => { setSelected(service); setNotes(''); setError(''); setShowModal(true); };

  const handleRequest = async () => {
    setLoading(true); setError('');
    try {
      await API.post('/service-requests', { serviceId: selected.id, notes });
      setShowModal(false);
      setSuccess(`Service request for "${selected.name}" submitted successfully! Admin will review and approve it.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally { setLoading(false); }
  };

  const categoryIcons = { 'Web Development': '🌐', 'Mobile Development': '📱', 'Design': '🎨', 'Cloud & DevOps': '☁️', 'Consulting': '💡', 'Data & Analytics': '📊', 'Security': '🔒', 'Support': '🛠️', 'General': '⚙️' };

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}
      {services.length === 0 && (
        <div className="card"><div className="empty-state" style={{ padding: 64 }}><div className="empty-icon">⚙️</div><p>No services available yet. Contact admin.</p></div></div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {services.map(s => (
          <div key={s.id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div className="card-body">
              <div style={{ fontSize: 32, marginBottom: 12 }}>{categoryIcons[s.category] || '⚙️'}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{s.category}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, minHeight: 40 }}>{s.description || 'No description available'}</p>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>${s.price.toLocaleString()}</span>
                <button className="btn btn-primary btn-sm" onClick={() => openRequest(s)}>Request Service →</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Request: {selected.name}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{selected.description}</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 8 }}>${selected.price.toLocaleString()}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes / Requirements</label>
                <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe your specific requirements, timeline expectations, or any additional information..." style={{ minHeight: 120 }} />
              </div>
              <div className="alert alert-info">Your request will be reviewed by our admin team. Once approved, a project will be created for you.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRequest} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
