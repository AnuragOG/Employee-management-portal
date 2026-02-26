import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const emptyForm = { name: '', description: '', price: '', category: 'General' };
const categories = ['General', 'Web Development', 'Mobile Development', 'Design', 'Cloud & DevOps', 'Consulting', 'Data & Analytics', 'Security', 'Support'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { API.get('/services').then(r => setServices(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (editId) {
        const res = await API.put(`/services/${editId}`, { ...form, price: parseFloat(form.price) || 0 });
        setServices(s => s.map(x => x.id === editId ? res.data : x));
      } else {
        const res = await API.post('/services', { ...form, price: parseFloat(form.price) || 0 });
        setServices(s => [...s, res.data]);
      }
      setShowModal(false); setForm(emptyForm); setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (s) => { setForm({ name: s.name, description: s.description, price: s.price, category: s.category }); setEditId(s.id); setShowModal(true); setError(''); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await API.delete(`/services/${id}`);
    setServices(s => s.filter(x => x.id !== id));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Services ({services.length})</h2>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm); setEditId(null); setError(''); }}>+ Add Service</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Service Name</th><th>Category</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {services.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">⚙️</div><p>No services yet</p></div></td></tr>}
              {services.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-planning">{s.category}</span></td>
                  <td style={{ fontWeight: 600 }}>${s.price.toLocaleString()}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: 13 }}>{s.description || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>{editId ? 'Edit Service' : 'Add Service'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group"><label className="form-label">Service Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" min="0" />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this service..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Save Changes' : 'Add Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
