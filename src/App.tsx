import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InstallAppPrompt } from './components/ui/InstallAppPrompt';
import { LoginPage } from './pages/LoginPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const PatientsPage = lazy(() => import('./pages/PatientsPage').then((module) => ({ default: module.PatientsPage })));
const ProtocolsPage = lazy(() => import('./pages/ProtocolsPage').then((module) => ({ default: module.ProtocolsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((module) => ({ default: module.UsersPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const PublicPatientCardPage = lazy(() => import('./pages/PublicPatientCardPage').then((module) => ({ default: module.PublicPatientCardPage })));

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="route-loading"><img src="/logo-zonasi-hd-square.png" alt="" /><span>Memuat ZONASI-HD…</span></div>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/kartu/:patientId" element={<PublicPatientCardPage />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route index element={<DashboardPage />} /><Route path="patients" element={<PatientsPage />} />
      <Route path="reports" element={<ReportsPage />} /><Route path="protocols" element={<ProtocolsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="about" element={<AboutPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense><InstallAppPrompt /></BrowserRouter>;
}
