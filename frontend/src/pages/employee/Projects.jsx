import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

const statusOptions = ['pending', 'in-progress', 'review', 'completed', 'on-hold'];

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const load = () => axios.get('/api/projects').then(r => { setProjects(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateStatus = async () => {
    await axios.put(`/api/projects/${statusModal._id}`, { status: newStatus });
    setStatusModal(null); load();
  };

  return (
    <>
      <Topbar title="My Projects" subtitle="Projects you're assigned to" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Assigned Projects</h1><p className="page-subtitle">{projects.length} projects</p></div>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gap: 16 }}>
            {projects.map(p => (
              <div key={p._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{p.name}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>👤 Client: <strong>{p.client?.name}</strong></span>
                      {p.client?.company && <span style={{ color: '#64748b' }}>🏢 {p.client.company}</span>}
                      {p.deadline && <span style={{ color: '#64748b' }}>📅 Deadline: <strong>{new Date(p.deadline).toLocaleDateString()}</strong></span>}
                      <span style={{ color: '#64748b' }}>📅 Started: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`badge badge-${p.status}`} style={{ fontSize: 13 }}>{p.status}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setDetailModal(p)}>Details</button>
                      <button className="btn btn-primary btn-sm" onClick={() => { setStatusModal(p); setNewStatus(p.status); }}>Update Status</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p>No projects assigned to you yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {statusModal && (
        <Modal title="Update Project Status" onClose={() => setStatusModal(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setStatusModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={updateStatus}>Update Status</button>
          </>}
        >
          <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>Update status for: <strong>{statusModal.name}</strong></p>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Note: Only admin can assign or unassign employees from projects.</p>
        </Modal>
      )}

      {detailModal && (
        <Modal title="Project Details" onClose={() => setDetailModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Project Name</label><p style={{ fontWeight: 600 }}>{detailModal.name}</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Description</label><p>{detailModal.description}</p></div>
            <div className="detail-grid">
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</label><p><span className={`badge badge-${detailModal.status}`}>{detailModal.status}</span></p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Client</label><p>{detailModal.client?.name}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Budget</label><p>₹{detailModal.budget?.toLocaleString() || 0}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Deadline</label><p>{detailModal.deadline ? new Date(detailModal.deadline).toLocaleDateString() : 'Not set'}</p></div>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Team Members</label><p>{detailModal.assignedEmployees?.map(e => e.name).join(', ') || 'None'}</p></div>
          </div>
        </Modal>
      )}
    </>
  );
}
