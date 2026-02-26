import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data));
    API.get('/projects').then(r => setProjects(r.data.slice(0, 5)));
    API.get('/service-requests').then(r => setRequests(r.data.filter(r => r.status === 'pending').slice(0, 5)));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Employees', value: stats.totalEmployees, icon: '👨‍💼', color: 'purple' },
    { label: 'Clients', value: stats.totalClients, icon: '🏢', color: 'cyan' },
    { label: 'Total Projects', value: stats.totalProjects, icon: '📁', color: 'green' },
    { label: 'Active Projects', value: stats.activeProjects, icon: '🚀', color: 'yellow' },
    { label: 'Completed', value: stats.completedProjects, icon: '✅', color: 'green' },
    { label: 'Services', value: stats.totalServices, icon: '⚙️', color: 'blue' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: '⏳', color: 'red' },
  ] : [];

  const statusBadge = (status) => <span className={`badge badge-${status.replace(' ', '-')}`}>{status}</span>;

  return (
    <div>
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h2>Recent Projects</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Project</th><th>Client</th><th>Status</th></tr></thead>
              <tbody>
                {projects.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No projects yet</td></tr>}
                {projects.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.clientName}</td>
                    <td>{statusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Pending Service Requests</h2></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Service</th><th>Client</th><th>Date</th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No pending requests</td></tr>}
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.serviceName}</td>
                    <td>{r.clientName}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
