import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../modules/auth/AuthContext';
import { ForbiddenPage } from '../modules/auth/ForbiddenPage';

interface RoleGuardProps {
  roles: UserRole[];
  /** When true, render a 403 page instead of redirecting to /login */
  showForbidden?: boolean;
}

/**
 * Protege rutas restringiéndolas a roles específicos.
 * Si el usuario no está autenticado, redirige a /login.
 * Si el usuario está autenticado pero no tiene el rol requerido, muestra la página 403.
 */
export function RoleGuard({ roles, showForbidden = true }: RoleGuardProps) {
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

  if (!roles.includes(user.role)) {
    return showForbidden ? <ForbiddenPage /> : <Navigate to="/" replace />;
  }

  return <Outlet />;
}
