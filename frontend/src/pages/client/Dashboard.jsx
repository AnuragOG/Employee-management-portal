import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';

export default function ClientDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/client').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar /><div className="loading"><div className="spinner"></div></div></>;

  return (
    <>
      <Topbar subtitle="Overview of your projects and requests" />
      <div className="page-content">
        <div className="stats-grid">
          {[
            { label: 'Total Projects', value: stats?.totalProjects || 0, color: '#4f46e5', bg: '#e0e7ff', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { label: 'Pending Requests', value: stats?.pendingRequests || 0, color: '#d97706', bg: '#fef3c7', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Completed', value: stats?.byStatus?.completed || 0, color: '#059669', bg: '#d1fae5', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Unread Messages', value: stats?.unreadMessages || 0, color: '#7c3aed', bg: '#ede9fe', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">My Projects</h3></div>
          {stats?.recentProjects?.length === 0 ? (
            <div className="empty-state"><p>No projects yet. Request a service to get started!</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Project</th><th>Team</th><th>Status</th><th>Started</th></tr></thead>
                <tbody>
                  {stats?.recentProjects?.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{p.assignedEmployees?.map(e => e.name).join(', ') || 'TBD'}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
