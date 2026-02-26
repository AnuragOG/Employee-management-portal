import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { axios.get('/api/projects').then(r => { setProjects(r.data); setLoading(false); }); }, []);

  return (
    <>
      <Topbar title="My Projects" subtitle="Track your ongoing and completed projects" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Projects</h1><p className="page-subtitle">{projects.length} total projects</p></div>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gap: 16 }}>
            {projects.map(p => (
              <div key={p._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600 }}>{p.name}</h3>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>👥 Team: <strong>{p.assignedEmployees?.length > 0 ? p.assignedEmployees.map(e => e.name).join(', ') : 'To be assigned'}</strong></span>
                      <span style={{ color: '#64748b' }}>💰 Budget: <strong>₹{p.budget?.toLocaleString() || 0}</strong></span>
                      {p.deadline && <span style={{ color: '#64748b' }}>📅 Deadline: <strong>{new Date(p.deadline).toLocaleDateString()}</strong></span>}
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setDetailModal(p)}>View Details</button>
                </div>
                {/* Progress indicator */}
                <div style={{ marginTop: 16, height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: p.status === 'completed' ? '100%' : p.status === 'review' ? '80%' : p.status === 'in-progress' ? '50%' : p.status === 'pending' ? '10%' : '30%', background: p.status === 'completed' ? '#10b981' : '#4f46e5', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="empty-state"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg><p>No projects yet. Request a service to get started!</p></div>}
          </div>
        )}
      </div>

      {detailModal && (
        <Modal title="Project Details" onClose={() => setDetailModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Project Name</label><p style={{ fontWeight: 600, fontSize: 16 }}>{detailModal.name}</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Description</label><p>{detailModal.description}</p></div>
            <div className="detail-grid">
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</label><span className={`badge badge-${detailModal.status}`}>{detailModal.status}</span></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Service</label><p>{detailModal.service?.name || 'N/A'}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Budget</label><p>₹{detailModal.budget?.toLocaleString() || 0}</p></div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Deadline</label><p>{detailModal.deadline ? new Date(detailModal.deadline).toLocaleDateString() : 'Not set'}</p></div>
              <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Team Members</label><p>{detailModal.assignedEmployees?.map(e => `${e.name}${e.position ? ` (${e.position})` : ''}`).join(', ') || 'To be assigned'}</p></div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
