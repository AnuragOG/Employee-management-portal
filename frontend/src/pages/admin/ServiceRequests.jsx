import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';
import Modal from '../../components/shared/Modal';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveForm, setApproveForm] = useState({ projectName: '', description: '', budget: '', adminNote: '' });
  const [rejectNote, setRejectNote] = useState('');

  const load = () => axios.get('/api/service-requests').then(r => { setRequests(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openApprove = (r) => {
    setApproveForm({ projectName: `${r.service?.name} - ${r.client?.name}`, description: r.message || '', budget: r.service?.price || '', adminNote: '' });
    setApproveModal(r);
  };

  const handleApprove = async () => {
    await axios.put(`/api/service-requests/${approveModal._id}/approve`, approveForm);
    setApproveModal(null); load();
  };

  const handleReject = async () => {
    await axios.put(`/api/service-requests/${rejectModal._id}/reject`, { adminNote: rejectNote });
    setRejectModal(null); setRejectNote(''); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    await axios.delete(`/api/service-requests/${id}`); load();
  };

  return (
    <>
      <Topbar title="Service Requests" subtitle="Review and approve client service requests" />
      <div className="page-content">
        <div className="page-header">
          <div><h1 className="page-title">Service Requests</h1><p className="page-subtitle">{requests.filter(r => r.status === 'pending').length} pending approval</p></div>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Client</th><th>Service</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.client?.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.client?.company}</div>
                      </td>
                      <td>{r.service?.name}</td>
                      <td style={{ maxWidth: 200 }}><p style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.message || '—'}</p></td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {r.status === 'pending' && <>
                            <button className="btn btn-success btn-sm" onClick={() => openApprove(r)}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(r); setRejectNote(''); }}>Reject</button>
                          </>}
                          {r.project && <span style={{ fontSize: 12, color: '#4f46e5' }}>Project created</span>}
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No service requests</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {approveModal && (
        <Modal title="Approve & Create Project" onClose={() => setApproveModal(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setApproveModal(null)}>Cancel</button>
            <button className="btn btn-success" onClick={handleApprove}>Approve & Create Project</button>
          </>}
        >
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
            Approving request from <strong>{approveModal.client?.name}</strong> for <strong>{approveModal.service?.name}</strong>
          </div>
          <div className="form-group"><label className="form-label">Project Name</label><input className="form-input" value={approveForm.projectName} onChange={e => setApproveForm({...approveForm, projectName: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={approveForm.description} onChange={e => setApproveForm({...approveForm, description: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Budget (₹)</label><input type="number" className="form-input" value={approveForm.budget} onChange={e => setApproveForm({...approveForm, budget: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Admin Note</label><textarea className="form-textarea" value={approveForm.adminNote} onChange={e => setApproveForm({...approveForm, adminNote: e.target.value})} placeholder="Note to client..." /></div>
        </Modal>
      )}

      {rejectModal && (
        <Modal title="Reject Request" onClose={() => setRejectModal(null)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleReject}>Reject Request</button>
          </>}
        >
          <p style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>Rejecting request from <strong>{rejectModal.client?.name}</strong> for <strong>{rejectModal.service?.name}</strong></p>
          <div className="form-group"><label className="form-label">Reason for rejection</label><textarea className="form-textarea" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Explain why this request is being rejected..." /></div>
        </Modal>
      )}
    </>
  );
}
