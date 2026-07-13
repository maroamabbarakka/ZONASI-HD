import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute() {
  const { user } = useApp();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
