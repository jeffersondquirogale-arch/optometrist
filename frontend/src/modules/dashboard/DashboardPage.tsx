import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardSummary } from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { usePermissions } from '../auth/usePermissions';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { AppointmentsWidget } from './AppointmentsWidget';
import { RecentConsultationsWidget } from './RecentConsultationsWidget';
import { RecentPatientsWidget } from './RecentPatientsWidget';
import { AppointmentStatusSummary } from './AppointmentStatusSummary';

const ROLE_GREETINGS: Record<string, string> = {
  ADMIN: 'Panel de administración',
  DOCTOR: 'Panel clínico',
  STAFF: 'Panel operativo',
};

export function DashboardPage() {
  const { user } = useAuth();
  const { canCreateConsultation } = usePermissions();

  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });

  const greeting = user ? (ROLE_GREETINGS[user.role] ?? 'Dashboard') : 'Dashboard';

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>{greeting}</h2>
          {user && (
            <p className="text-muted">
              Bienvenido/a, <strong>{user.name}</strong>
            </p>
          )}
        </div>
      </div>

      {/* ── Estadísticas resumidas ── */}
      <div className="stat-cards">
        {summaryLoading ? (
          <>
            <div className="stat-card stat-card--skeleton" />
            <div className="stat-card stat-card--skeleton" />
            <div className="stat-card stat-card--skeleton" />
            <div className="stat-card stat-card--skeleton" />
          </>
        ) : summary ? (
          <>
            <StatCard
              label="Total de Pacientes"
              value={summary.totalPatients}
              icon="👥"
              color="var(--color-primary)"
            />
            <StatCard
              label="Citas Hoy"
              value={summary.todayAppointmentsCount}
              icon="📅"
              color="var(--color-secondary)"
            />
            <StatCard
              label="Próximas Citas"
              value={summary.upcomingAppointmentsCount}
              icon="🗓️"
              color="var(--color-accent)"
            />
            {canCreateConsultation() && (
              <StatCard
                label="Consultas (7 días)"
                value={summary.recentConsultationsCount}
                icon="📋"
                color="#d35400"
              />
            )}
          </>
        ) : null}
      </div>

      {/* ── Accesos rápidos ── */}
      <QuickActions />

      {/* ── Grid principal ── */}
      <div className="dashboard-grid">
        {/* Citas de hoy */}
        <AppointmentsWidget mode="today" />

        {/* Próximas citas */}
        <AppointmentsWidget mode="upcoming" />

        {/* Pacientes recientes */}
        <RecentPatientsWidget />

        {/* Consultas recientes (solo ADMIN y DOCTOR) */}
        {canCreateConsultation() && <RecentConsultationsWidget />}

        {/* Resumen por estado */}
        {summary && (
          <AppointmentStatusSummary appointmentsByStatus={summary.appointmentsByStatus} />
        )}
      </div>
    </div>
  );
}
