import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Topbar from '../../components/shared/Topbar';

const statusColors = { pending: '#f59e0b', 'in-progress': '#3b82f6', review: '#8b5cf6', completed: '#10b981', 'on-hold': '#6b7280' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/admin').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <><Topbar /><div className="loading"><div className="spinner"></div></div></>;

  return (
    <>
      <Topbar subtitle="Welcome to your admin dashboard" />
      <div className="page-content">
        <div className="stats-grid">
          {[
            { label: 'Total Employees', value: stats?.totalEmployees || 0, color: '#4f46e5', bg: '#e0e7ff', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
            { label: 'Total Clients', value: stats?.totalClients || 0, color: '#0891b2', bg: '#cffafe', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
            { label: 'Total Projects', value: stats?.totalProjects || 0, color: '#7c3aed', bg: '#ede9fe', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { label: 'Pending Requests', value: stats?.pendingRequests || 0, color: '#d97706', bg: '#fef3c7', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Active Services', value: stats?.totalServices || 0, color: '#059669', bg: '#d1fae5', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Projects</h3>
            </div>
            {stats?.recentProjects?.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No projects yet</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Project</th><th>Client</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats?.recentProjects?.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td>{p.client?.name}</td>
                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Projects by Status</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.projectsByStatus?.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No data</p>
              ) : stats?.projectsByStatus?.map(s => (
                <div key={s._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize', fontWeight: 500 }}>{s._id}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{s.count}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.count / (stats?.totalProjects || 1)) * 100}%`, background: statusColors[s._id] || '#4f46e5', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
