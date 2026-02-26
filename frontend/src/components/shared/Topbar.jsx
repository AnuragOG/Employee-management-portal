import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title || `${greeting()}, ${user?.name?.split(' ')[0]}!`}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-right">
        <span style={{ fontSize: 13, color: '#64748b' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
