import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const PatientsPage = lazy(() => import('./pages/PatientsPage').then((module) => ({ default: module.PatientsPage })));
const ProtocolsPage = lazy(() => import('./pages/ProtocolsPage').then((module) => ({ default: module.ProtocolsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="route-loading">Memuat ZONASI-HD…</div>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route index element={<DashboardPage />} /><Route path="patients" element={<PatientsPage />} />
      <Route path="reports" element={<ReportsPage />} /><Route path="protocols" element={<ProtocolsPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></BrowserRouter>;
}
