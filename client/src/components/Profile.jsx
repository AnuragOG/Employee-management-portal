import React, { useState } from 'react';
import { useAuth, API } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password && form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password;
      const res = await API.put(`/users/${user.id}`, payload);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = { admin: '#7c3aed', employee: '#2563eb', client: '#0e7490' };

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{user?.avatar || user?.name?.[0]}</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>{user?.email}</p>
          <span className={`badge badge-${user?.role}`} style={{ marginTop: 8 }}>{user?.role?.toUpperCase()}</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h2>Edit Profile</h2></div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-control" value={user?.role} disabled style={{ background: 'var(--gray-50)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="New password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '✓ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
