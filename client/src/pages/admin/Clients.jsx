import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', phone: '', companyId: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/users').then(r => setClients(r.data.filter(u => u.role === 'client')));
    API.get('/companies').then(r => setCompanies(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/users', { ...form, role: 'client' });
      setClients(c => [...c, res.data]);
      setShowModal(false); setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this client?')) return;
    await API.delete(`/users/${id}`);
    setClients(c => c.filter(x => x.id !== id));
  };

  const getCompany = (id) => companies.find(c => c.id === id)?.name || '—';

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Clients ({clients.length})</h2>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}>+ Add Client</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              {clients.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🏢</div><p>No clients yet</p></div></td></tr>}
              {clients.map(c => (
                <tr key={c.id}>
                  <td><div className="flex items-center gap-2"><div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{c.avatar}</div><span style={{ fontWeight: 500 }}>{c.name}</span></div></td>
                  <td>{c.email}</td>
                  <td>{getCompany(c.companyId)}</td>
                  <td>{c.phone || '—'}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Add Client</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <select className="form-control" value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}>
                    <option value="">No company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Add Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
