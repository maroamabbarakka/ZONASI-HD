import { Activity, FileChartColumn, HeartPulse, LogOut, RotateCcw, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Layout() {
  const { user, logout, resetDemo } = useApp();
  const links = [
    { to: '/', label: 'Command Center', icon: Activity },
    { to: '/patients', label: 'Pasien', icon: Users },
    { to: '/reports', label: 'Laporan', icon: FileChartColumn },
    { to: '/protocols', label: 'Protokol', icon: ShieldCheck },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><HeartPulse /></span><div><strong>ZONASI-HD</strong><small>Command Center</small></div></div>
        <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon />{label}</NavLink>)}</nav>
        <div className="sidebar-footer">
          <button className="button ghost" onClick={resetDemo}><RotateCcw /> Reset data demo</button>
          <div className="user-card"><span>{user?.displayName}</span><small>{user?.role.replace('_', ' ')} · {user?.uid.startsWith('demo-') ? 'Mode demo' : 'Firebase Auth'}</small></div>
          <button className="button ghost" onClick={logout}><LogOut /> Keluar</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
      <nav className="mobile-nav">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon /><span>{label}</span></NavLink>)}</nav>
    </div>
  );
}
