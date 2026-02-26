import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import ClientDashboard from './Dashboard';
import Projects from './Projects';
import Services from './Services';
import ServiceRequests from './ServiceRequests';
import Messages from './Messages';
import Profile from './Profile';

export default function ClientLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/services" element={<Services />} />
          <Route path="/requests" element={<ServiceRequests />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
