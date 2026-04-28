import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import PortalTopbar from '../components/PortalTopbar';
import { PortalThemeProvider, usePortalTheme } from '../context/PortalThemeContext';

function PortalShell({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = usePortalTheme();

  return (
    <div className="portal-layout" data-portal-theme={theme}>
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

export default function PortalLayout({ role }) {
  return (
    <PortalThemeProvider>
      <PortalShell role={role} />
    </PortalThemeProvider>
  );
}
