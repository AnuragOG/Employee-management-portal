import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

const statuses = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { API.get('/projects').then(r => setProjects(r.data)); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      const res = await API.put(`/projects/${id}`, { status });
      setProjects(p => p.map(x => x.id === id ? res.data : x));
      if (selected?.id === id) setSelected(res.data);
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  return (
    <div>
      {projects.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: 64 }}>
            <div className="empty-icon">📁</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>No projects assigned yet</p>
            <p>You'll see your projects here once the admin assigns you to one.</p>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ cursor: 'pointer', border: selected?.id === p.id ? '2px solid var(--primary)' : '1px solid var(--gray-100)' }} onClick={() => setSelected(p)}>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>{p.description || 'No description'}</p>
                  <div style={{ fontSize: 13 }}>
                    <div style={{ color: 'var(--gray-500)' }}>Client: <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>{p.clientName || '—'}</span></div>
                    <div style={{ color: 'var(--gray-500)', marginTop: 4 }}>Team: <span style={{ color: 'var(--gray-700)' }}>{p.assignedEmployees.length} member(s)</span></div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>UPDATE STATUS</label>
                    <select
                      className="form-control"
                      value={p.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(p.id, e.target.value)}
                      disabled={updating}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selected && (
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 88 }}>
            <div className="card-header">
              <h2>Project Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>PROJECT NAME</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.name}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>STATUS</div>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>DESCRIPTION</div>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{selected.description || 'No description'}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>TEAM MEMBERS</div>
                {selected.assignedEmployees.map(e => (
                  <div key={e.id} className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{e.avatar}</div>
                    <span style={{ fontSize: 13 }}>{e.name}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>CREATED</div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
