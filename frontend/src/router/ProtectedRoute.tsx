import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Cargando…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
