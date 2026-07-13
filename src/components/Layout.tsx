import { Activity, FileChartColumn, LogOut, RotateCcw, ShieldCheck, UserCog, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roleLabels } from '../lib/permissions';

export function Layout() {
  const { user, logout, resetDemo, dataMode } = useApp();
  const links = [
    { to: '/', label: 'Command Center', icon: Activity },
    { to: '/patients', label: 'Pasien', icon: Users },
    { to: '/reports', label: 'Laporan', icon: FileChartColumn },
    { to: '/protocols', label: 'Protokol', icon: ShieldCheck },
    ...(user?.role === 'ADMIN' ? [{ to: '/users', label: 'Pengguna', icon: UserCog }] : []),
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-logo brand-logo-sidebar" aria-label="ZONASI-HD — Smart Fluid Monitoring. Safe Heart."><img src="/logo-zonasi-hd-white.png" alt="Logo ZONASI-HD" /></div>
        <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon />{label}</NavLink>)}</nav>
        <div className="sidebar-footer">
          {dataMode === 'demo' && <button className="button ghost" onClick={resetDemo}><RotateCcw /> Reset data demo</button>}
          <div className="user-card"><span>{user?.displayName}</span><small>{user ? roleLabels[user.role] : ''} · {user?.uid.startsWith('demo-') ? 'Mode demo' : 'Firebase Auth'}</small></div>
          <button className="button ghost" onClick={logout}><LogOut /> Keluar</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
      <nav className="mobile-nav">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon /><span>{label}</span></NavLink>)}</nav>
    </div>
  );
}
