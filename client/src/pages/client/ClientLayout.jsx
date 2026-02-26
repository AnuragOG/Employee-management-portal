import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import Projects from './Projects';
import Services from './Services';
import MyRequests from './MyRequests';
import Messaging from '../../components/Messaging';
import Profile from '../../components/Profile';

export default function ClientLayout() {
  const { user } = useAuth();
  const path = window.location.pathname.split('/')[2] || 'projects';
  const titles = { projects: 'My Projects', services: 'Browse Services', requests: 'My Requests', messages: 'Messages', profile: 'My Profile' };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">{titles[path] || 'Client Portal'}</span>
          <div className="topbar-right">
            <div className="avatar">{user?.avatar || 'C'}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Client</div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="projects" element={<Projects />} />
            <Route path="services" element={<Services />} />
            <Route path="requests" element={<MyRequests />} />
            <Route path="messages" element={<Messaging />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
