import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import Dashboard from './Dashboard';
import Users from './Users';
import Employees from './Employees';
import Clients from './Clients';
import Companies from './Companies';
import Projects from './Projects';
import Services from './Services';
import ServiceRequests from './ServiceRequests';
import Messaging from '../../components/Messaging';
import Profile from '../../components/Profile';

const pageTitles = {
  dashboard: 'Dashboard',
  users: 'User Management',
  employees: 'Employees',
  clients: 'Clients',
  companies: 'Companies',
  projects: 'Projects',
  services: 'Services',
  requests: 'Service Requests',
  messages: 'Messages',
  profile: 'My Profile'
};

export default function AdminLayout() {
  const { user } = useAuth();
  const path = window.location.pathname.split('/')[2] || 'dashboard';
  const title = pageTitles[path] || 'Admin Portal';

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <div className="avatar">{user?.avatar || 'A'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Administrator</div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="employees" element={<Employees />} />
            <Route path="clients" element={<Clients />} />
            <Route path="companies" element={<Companies />} />
            <Route path="projects" element={<Projects />} />
            <Route path="services" element={<Services />} />
            <Route path="requests" element={<ServiceRequests />} />
            <Route path="messages" element={<Messaging />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
