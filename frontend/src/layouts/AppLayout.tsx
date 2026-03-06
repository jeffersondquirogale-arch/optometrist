import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { usePermissions } from '../modules/auth/usePermissions';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  STAFF: 'Personal',
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const { canCreateConsultation } = usePermissions();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Clínica Óptica</h1>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink
            to="/patients"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Pacientes
          </NavLink>
          {canCreateConsultation() && (
            <NavLink
              to="/consultations"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Consultas
            </NavLink>
          )}
          <NavLink
            to="/appointments"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Citas
          </NavLink>
        </nav>
        {user && (
          <div className="app-header__user">
            <span className="app-header__user-name">
              {user.name}
              <span className="app-header__user-role">{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
            <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Sistema de Gestión Clínica Óptica — Fase 4D</p>
      </footer>
    </div>
  );
}
