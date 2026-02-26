import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const emptyForm = { name: '', description: '', clientId: '', status: 'planning' };
const statuses = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [assignProject, setAssignProject] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/projects').then(r => setProjects(r.data));
    API.get('/users').then(r => {
      setClients(r.data.filter(u => u.role === 'client'));
      setEmployees(r.data.filter(u => u.role === 'employee'));
    });
  }, []);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (editId) {
        const res = await API.put(`/projects/${editId}`, form);
        setProjects(p => p.map(x => x.id === editId ? res.data : x));
      } else {
        const res = await API.post('/projects', form);
        setProjects(p => [...p, res.data]);
      }
      setShowModal(false); setForm(emptyForm); setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, clientId: p.clientId, status: p.status });
    setEditId(p.id); setShowModal(true); setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${id}`);
    setProjects(p => p.filter(x => x.id !== id));
  };

  const openAssign = (p) => {
    setAssignProject(p);
    setSelectedEmployees(p.assignedEmployees.map(e => e.id));
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    const empData = employees.filter(e => selectedEmployees.includes(e.id)).map(e => ({ id: e.id, name: e.name, avatar: e.avatar }));
    const res = await API.put(`/projects/${assignProject.id}`, { assignedEmployees: empData });
    setProjects(p => p.map(x => x.id === assignProject.id ? res.data : x));
    setShowAssignModal(false);
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Projects ({filtered.length})</h2>
          <div className="flex gap-2">
            <input className="form-control" style={{ width: 220 }} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm); setEditId(null); setError(''); }}>+ New Project</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Employees</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📁</div><p>No projects yet</p></div></td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{p.description.substring(0, 60)}{p.description.length > 60 ? '...' : ''}</div>}
                  </td>
                  <td>{p.clientName || '—'}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {p.assignedEmployees.slice(0, 3).map(e => (
                        <div key={e.id} className="avatar" title={e.name} style={{ width: 26, height: 26, fontSize: 10 }}>{e.avatar}</div>
                      ))}
                      {p.assignedEmployees.length > 3 && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>+{p.assignedEmployees.length - 3}</span>}
                      {p.assignedEmployees.length === 0 && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openAssign(p)}>👥 Assign</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
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
            <div className="modal-header"><h3>{editId ? 'Edit Project' : 'New Project'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group"><label className="form-label">Project Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Client</label>
                    <select className="form-control" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                      <option value="">No client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Save' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && assignProject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Employees — {assignProject.name}</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {employees.length === 0 && <div className="alert alert-info">No employees available. Create employees first.</div>}
              {employees.map(e => (
                <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedEmployees.includes(e.id)} onChange={() => toggleEmployee(e.id)} />
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{e.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
