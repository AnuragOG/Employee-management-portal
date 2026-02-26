import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

const statusOptions = ['pending', 'in-progress', 'review', 'completed', 'on-hold'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', client: '', assignedEmployees: [], status: 'pending', service: '', budget: '', deadline: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [p, e, c, s] = await Promise.all([
      axios.get('/api/projects'),
      axios.get('/api/users/employees'),
      axios.get('/api/users/clients'),
      axios.get('/api/services')
    ]);
    setProjects(p.data); setEmployees(e.data); setClients(c.data); setServices(s.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '', client: '', assignedEmployees: [], status: 'pending', service: '', budget: '', deadline: '' });
    setError(''); setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      name: p.name, description: p.description,
      client: p.client?._id || '', assignedEmployees: p.assignedEmployees?.map(e => e._id) || [],
      status: p.status, service: p.service?._id || '', budget: p.budget || '', deadline: p.deadline ? p.deadline.slice(0, 10) : ''
    });
    setError(''); setShowModal(true);
  };

  const toggleEmployee = (id) => {
    setForm(f => ({
      ...f,
      assignedEmployees: f.assignedEmployees.includes(id)
        ? f.assignedEmployees.filter(e => e !== id)
        : [...f.assignedEmployees, id]
    }));
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (!form.name || !form.description || !form.client) { setError('Name, description and client are required'); return; }
      if (editProject) await axios.put(`/api/projects/${editProject._id}`, form);
      else await axios.post('/api/projects', form);
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await axios.delete(`/api/projects/${id}`); load();
  };

  return (
    <>
      <Topbar title="Projects" subtitle="Manage all company projects" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Projects</h1><p className="page-subtitle">{projects.length} total projects</p></div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:16,height:16}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Client</th><th>Employees</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.client?.name} <span style={{ color: '#94a3b8', fontSize: 12 }}>{p.client?.company}</span></td>
                      <td>{p.assignedEmployees?.length > 0 ? p.assignedEmployees.map(e => e.name).join(', ') : <span style={{ color: '#94a3b8' }}>None</span>}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(p)}>View</button>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No projects yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editProject ? 'Edit Project' : 'Create Project'}
          onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editProject ? 'Save Changes' : 'Create Project'}</button>
          </>}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Project description" />
          </div>
          <div className="form-group">
            <label className="form-label">Client *</label>
            <select className="form-select" value={form.client} onChange={e => setForm({...form, client: e.target.value})}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.company || 'No company'})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Service</label>
            <select className="form-select" value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
              <option value="">Select service</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Budget (₹)</label>
              <input type="number" className="form-input" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign Employees</label>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, maxHeight: 160, overflowY: 'auto' }}>
              {employees.map(e => (
                <label key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.assignedEmployees.includes(e._id)} onChange={() => toggleEmployee(e._id)} />
                  <span style={{ fontSize: 14 }}>{e.name} <span style={{ color: '#94a3b8' }}>({e.position || 'Employee'})</span></span>
                </label>
              ))}
              {employees.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No employees available</p>}
            </div>
          </div>
        </Modal>
      )}

      {showDetail && (
        <Modal title="Project Details" onClose={() => setShowDetail(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Name</label><p style={{ fontWeight: 600, fontSize: 16 }}>{showDetail.name}</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Description</label><p>{showDetail.description}</p></div>
            <div className="detail-grid">
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</label><p><span className={`badge badge-${showDetail.status}`}>{showDetail.status}</span></p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Client</label><p>{showDetail.client?.name}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Budget</label><p>₹{showDetail.budget?.toLocaleString() || 0}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Deadline</label><p>{showDetail.deadline ? new Date(showDetail.deadline).toLocaleDateString() : 'Not set'}</p></div>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Assigned Employees</label>
              <p>{showDetail.assignedEmployees?.length > 0 ? showDetail.assignedEmployees.map(e => e.name).join(', ') : 'None assigned'}</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
