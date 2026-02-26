import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/employees', icon: '👨‍💼', label: 'Employees' },
    { to: '/admin/clients', icon: '🏢', label: 'Clients' },
    { to: '/admin/companies', icon: '🏛️', label: 'Companies' },
    { to: '/admin/projects', icon: '📁', label: 'Projects' },
    { to: '/admin/services', icon: '⚙️', label: 'Services' },
    { to: '/admin/requests', icon: '📋', label: 'Service Requests' },
    { to: '/admin/messages', icon: '💬', label: 'Messages' },
    { to: '/admin/profile', icon: '👤', label: 'Profile' },
  ],
  employee: [
    { to: '/employee/projects', icon: '📁', label: 'My Projects' },
    { to: '/employee/messages', icon: '💬', label: 'Messages' },
    { to: '/employee/profile', icon: '👤', label: 'Profile' },
  ],
  client: [
    { to: '/client/projects', icon: '📁', label: 'My Projects' },
    { to: '/client/services', icon: '⚙️', label: 'Browse Services' },
    { to: '/client/requests', icon: '📋', label: 'My Requests' },
    { to: '/client/messages', icon: '💬', label: 'Messages' },
    { to: '/client/profile', icon: '👤', label: 'Profile' },
  ]
};

const roleLabel = { admin: 'Administrator', employee: 'Employee', client: 'Client' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>💼 ASS Portal</h1>
        <p>Anurag Software Solutions</p>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">Navigation</div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="avatar">{user?.avatar || user?.name?.[0] || 'U'}</div>
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{roleLabel[user?.role]}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 13 }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
