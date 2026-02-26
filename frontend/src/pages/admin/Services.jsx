import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: 'General', isActive: true });
  const [error, setError] = useState('');

  const load = () => axios.get('/api/services/all').then(r => { setServices(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditService(null); setForm({ name: '', description: '', price: '', duration: '', category: 'General', isActive: true }); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditService(s); setForm({ name: s.name, description: s.description, price: s.price, duration: s.duration, category: s.category, isActive: s.isActive }); setError(''); setShowModal(true); };

  const handleSubmit = async () => {
    setError('');
    try {
      if (!form.name || !form.description) { setError('Name and description are required'); return; }
      if (editService) await axios.put(`/api/services/${editService._id}`, form);
      else await axios.post('/api/services', form);
      setShowModal(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving service'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await axios.delete(`/api/services/${id}`); load();
  };

  return (
    <>
      <Topbar title="Services" subtitle="Manage company service offerings" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Services</h1><p className="page-subtitle">{services.length} services</p></div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Service
          </button>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <div key={s._id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</h3>
                    <span className="badge badge-pending" style={{ marginTop: 6, background: '#f0f9ff', color: '#0369a1' }}>{s.category}</span>
                  </div>
                  <span className={`badge badge-${s.isActive ? 'active' : 'inactive'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>{s.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Price</div><div style={{ fontSize: 18, fontWeight: 700 }}>₹{Number(s.price).toLocaleString()}</div></div>
                  <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Duration</div><div style={{ fontSize: 14, fontWeight: 500 }}>{s.duration || 'Varies'}</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                </div>
              </div>
            ))}
            {services.length === 0 && <div className="empty-state"><p>No services yet. Create your first service!</p></div>}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editService ? 'Edit Service' : 'Create Service'}
          onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editService ? 'Save Changes' : 'Create Service'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Service Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Web Development" /></div>
          <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the service" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Price (₹)</label><input type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" /></div>
            <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 3-6 months" /></div>
          </div>
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {['Development', 'Design', 'Marketing', 'DevOps', 'Consulting', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
            <span style={{ fontSize: 14 }}>Active (visible to clients)</span>
          </label>
        </Modal>
      )}
    </>
  );
}
