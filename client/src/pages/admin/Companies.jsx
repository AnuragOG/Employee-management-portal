import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const emptyForm = { name: '', industry: '', email: '', phone: '' };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { API.get('/companies').then(r => setCompanies(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (editId) {
        const res = await API.put(`/companies/${editId}`, form);
        setCompanies(c => c.map(x => x.id === editId ? res.data : x));
      } else {
        const res = await API.post('/companies', form);
        setCompanies(c => [...c, res.data]);
      }
      setShowModal(false); setForm(emptyForm); setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (c) => { setForm({ name: c.name, industry: c.industry, email: c.email, phone: c.phone }); setEditId(c.id); setShowModal(true); setError(''); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    await API.delete(`/companies/${id}`);
    setCompanies(c => c.filter(x => x.id !== id));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Client Companies ({companies.length})</h2>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm); setEditId(null); setError(''); }}>+ Add Company</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Company Name</th><th>Industry</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              {companies.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🏛️</div><p>No companies yet</p></div></td></tr>}
              {companies.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>🏢 {c.name}</td>
                  <td>{c.industry || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <div className="modal-header"><h3>{editId ? 'Edit Company' : 'Add Company'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group"><label className="form-label">Company Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Industry</label><input className="form-control" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Technology, Healthcare" /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Save Changes' : 'Add Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
