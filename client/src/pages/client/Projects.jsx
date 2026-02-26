import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => { API.get('/projects').then(r => setProjects(r.data)); }, []);

  const progressMap = { planning: 10, 'in-progress': 50, review: 80, completed: 100, 'on-hold': 30 };
  const colorMap = { planning: '#3b82f6', 'in-progress': '#f59e0b', review: '#8b5cf6', completed: '#10b981', 'on-hold': '#ef4444' };

  return (
    <div>
      {projects.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: 64 }}>
            <div className="empty-icon">📁</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>No projects yet</p>
            <p>Request a service and once approved, your project will appear here.</p>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {projects.map(p => (
          <div key={p.id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Started {new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>{p.description || 'No description provided'}</p>
              <div style={{ marginBottom: 16 }}>
                <div className="flex justify-between" style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 600 }}>{progressMap[p.status] || 0}%</span>
                </div>
                <div style={{ background: 'var(--gray-100)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${progressMap[p.status] || 0}%`, height: '100%', background: colorMap[p.status] || '#6366f1', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              </div>
              {p.assignedEmployees.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>Assigned Team</div>
                  <div className="flex items-center gap-1">
                    {p.assignedEmployees.map(e => (
                      <div key={e.id} title={e.name} className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{e.avatar}</div>
                    ))}
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 4 }}>{p.assignedEmployees.map(e => e.name).join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
