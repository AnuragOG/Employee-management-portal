import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', phone: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => API.get('/users').then(r => setEmployees(r.data.filter(u => u.role === 'employee')));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/users', { ...form, role: 'employee' });
      setEmployees(e => [...e, res.data]);
      setShowModal(false); setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee?')) return;
    await API.delete(`/users/${id}`);
    setEmployees(e => e.filter(x => x.id !== id));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Employees ({employees.length})</h2>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}>+ Add Employee</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.length === 0 && <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">👨‍💼</div><p>No employees yet</p></div></td></tr>}
              {employees.map(e => (
                <tr key={e.id}>
                  <td><div className="flex items-center gap-2"><div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{e.avatar}</div><span style={{ fontWeight: 500 }}>{e.name}</span></div></td>
                  <td>{e.email}</td>
                  <td>{e.phone || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Add Employee</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
