import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';
import { useNavigate } from 'react-router-dom';

export default function ClientServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => { axios.get('/api/services').then(r => { setServices(r.data); setLoading(false); }); }, []);

  const handleRequest = async () => {
    await axios.post('/api/service-requests', { service: requestModal._id, message });
    setRequestModal(null); setMessage('');
    setSuccess('Service request submitted! Admin will review it shortly.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const categoryColors = { Development: '#4f46e5', Design: '#ec4899', Marketing: '#f59e0b', DevOps: '#06b6d4', Consulting: '#8b5cf6', General: '#10b981' };

  return (
    <>
      <Topbar title="Services" subtitle="Browse our service offerings" />
      <div className="page-content">
        <h1 className="page-title" style={{ marginBottom: 8 }}>Our Services</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Browse available services and submit a request. Admin will review and create your project.</p>

        {success && <div className="alert alert-success">{success} <button className="btn btn-outline btn-sm" style={{ marginLeft: 12 }} onClick={() => navigate('/client/requests')}>View Requests</button></div>}

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</h3>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: `${categoryColors[s.category] || '#4f46e5'}18`, color: categoryColors[s.category] || '#4f46e5' }}>{s.category}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 14, flex: 1, marginBottom: 16 }}>{s.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Starting from</div><div style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>₹{Number(s.price).toLocaleString()}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Duration</div><div style={{ fontSize: 14, fontWeight: 500 }}>{s.duration || 'Varies'}</div></div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setRequestModal(s); setMessage(''); }}>Request Service</button>
              </div>
            ))}
            {services.length === 0 && <div className="empty-state"><p>No services available at the moment</p></div>}
          </div>
        )}
      </div>

      {requestModal && (
        <Modal title="Request Service" onClose={() => setRequestModal(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setRequestModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRequest}>Submit Request</button>
          </>}
        >
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>{requestModal.name}</div>
            <div style={{ fontSize: 14, color: '#0369a1' }}>₹{Number(requestModal.price).toLocaleString()} • {requestModal.duration}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Message / Requirements</label>
            <textarea className="form-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your requirements, timeline preferences, or any specific needs..." style={{ minHeight: 120 }} />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Your request will be reviewed by admin. Once approved, a project will be created for you.</p>
        </Modal>
      )}
    </>
  );
}
