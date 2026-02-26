import React, { useState } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '', position: user?.position || '', password: '', confirmPassword: '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar ? `${process.env.REACT_APP_API_URL || ""}${user.avatar}` : null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password && form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('company', form.company);
      fd.append('position', form.position);
      if (form.password) fd.append('password', form.password);
      if (avatar) fd.append('avatar', avatar);
      const res = await axios.put('/api/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Topbar title="My Profile" subtitle="Manage your account information" />
      <div className="page-content">
        <div style={{ maxWidth: 600 }}>
          <h1 className="page-title" style={{ marginBottom: 24 }}>Edit Profile</h1>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</h3>
                <p style={{ color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</p>
                <label style={{ display: 'inline-block', marginTop: 8, cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  <span className="btn btn-outline btn-sm">Change Photo</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={user?.email} disabled style={{ background: '#f8fafc' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" value={user?.role} disabled style={{ background: '#f8fafc', textTransform: 'capitalize' }} />
                </div>
                {user?.role === 'client' && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Company</label>
                    <input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Company name" />
                  </div>
                )}
                {user?.role === 'employee' && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Position</label>
                    <input className="form-input" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Your position" />
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 16, paddingTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Change Password</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Leave blank to keep" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-input" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Confirm new password" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
