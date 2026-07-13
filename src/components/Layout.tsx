import { Activity, FileChartColumn, LogOut, RotateCcw, ShieldCheck, UserCog, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roleLabels } from '../lib/permissions';

export function Layout() {
  const { user, logout, resetDemo, dataMode } = useApp();
  const location = useLocation();
  const links = [
    { to: '/', label: 'Command Center', mobileLabel: 'Beranda', icon: Activity },
    { to: '/patients', label: 'Pasien', mobileLabel: 'Pasien', icon: Users },
    { to: '/reports', label: 'Laporan', mobileLabel: 'Laporan', icon: FileChartColumn },
    { to: '/protocols', label: 'Protokol', mobileLabel: 'Protokol', icon: ShieldCheck },
    ...(user?.role === 'ADMIN' ? [{ to: '/users', label: 'Pengguna', mobileLabel: 'Akun', icon: UserCog }] : []),
  ];
  const currentPage = links.find((link) => link.to === location.pathname)?.mobileLabel ?? 'ZONASI-HD';
  const initials = user?.displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ZH';

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

      <header className="mobile-topbar">
        <div className="mobile-brand">
          <img src="/logo-zonasi-hd-square.png" alt="" />
          <div><span>ZONASI-HD</span><strong>{currentPage}</strong></div>
        </div>
        <div className="mobile-account">
          <div className="mobile-account-copy"><span>{initials}</span><div><strong>{user?.displayName}</strong><small><i />{dataMode === 'firebase' ? 'Terhubung' : 'Mode demo'}</small></div></div>
          <button type="button" className="mobile-logout" onClick={logout} aria-label="Keluar dari aplikasi" title="Keluar"><LogOut /></button>
        </div>
      </header>

      <main className="main"><Outlet /></main>
      <nav className="mobile-nav" aria-label="Navigasi utama">{links.map(({ to, mobileLabel, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><span className="mobile-nav-icon"><Icon /></span><span>{mobileLabel}</span></NavLink>)}</nav>
    </div>
  );
}
