import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

const initialForm = { name: '', email: '', password: '', role: 'employee', company: '', position: '', phone: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { role: filter } : {};
    axios.get('/api/users', { params }).then(r => { setUsers(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, [filter]);

  const openCreate = () => { setEditUser(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, company: u.company || '', position: u.position || '', phone: u.phone || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async () => {
    setError('');
    try {
      const data = { ...form };
      if (!data.password && !editUser) { setError('Password is required'); return; }
      if (!data.password) delete data.password;
      if (editUser) await axios.put(`/api/users/${editUser._id}`, data);
      else await axios.post('/api/users', data);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/users/${id}`);
    load();
  };

  const toggleActive = async (u) => {
    await axios.put(`/api/users/${u._id}`, { isActive: !u.isActive });
    load();
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <>
      <Topbar title="User Management" subtitle="Manage employees and clients" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">{users.length} total users</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="employee">Employees</option>
              <option value="client">Clients</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn btn-primary" onClick={openCreate}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add User
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading"><div className="spinner"></div></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Company/Position</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: '#64748b' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td style={{ color: '#64748b' }}>{u.company || u.position || '—'}</td>
                      <td><span className={`badge badge-${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
                          <button className="btn btn-outline btn-sm" onClick={() => toggleActive(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editUser ? 'Edit User' : 'Create User'}
          onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editUser ? 'Save Changes' : 'Create User'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Enter email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password {editUser ? '(leave blank to keep)' : '*'}</label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'client' && (
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Company name" />
            </div>
          )}
          {form.role === 'employee' && (
            <div className="form-group">
              <label className="form-label">Position</label>
              <input className="form-input" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Job position" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number" />
          </div>
        </Modal>
      )}
    </>
  );
}
