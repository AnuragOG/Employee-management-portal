import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import EmployeeDashboard from './Dashboard';
import Projects from './Projects';
import Messages from './Messages';
import Profile from './Profile';

export default function EmployeeLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}
