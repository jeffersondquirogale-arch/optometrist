import { Outlet, NavLink } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Clínica Óptica</h1>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Pacientes
          </NavLink>
          <NavLink
            to="/consultations"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Consultas
          </NavLink>
          <NavLink
            to="/appointments"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Citas
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Sistema de Gestión Clínica Óptica — Fase 3C</p>
      </footer>
    </div>
  );
}
