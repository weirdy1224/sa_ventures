import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PortalTopbar from '../components/PortalTopbar';

export default function PortalLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="portal-main">
        <PortalTopbar role={role} onMenuClick={() => setSidebarOpen(true)} />
        <div className="portal-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
