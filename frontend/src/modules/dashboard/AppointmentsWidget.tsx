import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, Appointment } from '../../services/api';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, string> = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  PROGRAMADA: { background: '#e8f4fd', color: '#1a6ab1', border: '1px solid #b3d7f5' },
  CONFIRMADA: { background: '#eafaf1', color: '#1a7a40', border: '1px solid #a9dfbf' },
  EN_CURSO:   { background: '#fef9e7', color: '#b7770d', border: '1px solid #f9d983' },
  COMPLETADA: { background: '#f0f4f8', color: '#4a5568', border: '1px solid #cbd5e0' },
  CANCELADA:  { background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' },
  NO_ASISTIO: { background: '#f5f0ff', color: '#6b3fa0', border: '1px solid #d4b8f0' },
};

function AppointmentRow({ appt }: { appt: Appointment }) {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    ...(STATUS_STYLES[appt.status] ?? {}),
  };

  return (
    <div className="dashboard-list-item">
      <div className="dashboard-list-item__main">
        <span className="dashboard-list-item__time">{formatTime(appt.scheduledAt)}</span>
        <span className="dashboard-list-item__name">
          {appt.patient
            ? `${appt.patient.lastName}, ${appt.patient.firstName}`
            : '—'}
        </span>
        {appt.reason && (
          <span className="dashboard-list-item__sub">{appt.reason}</span>
        )}
      </div>
      <span style={badgeStyle}>{STATUS_LABELS[appt.status] ?? appt.status}</span>
    </div>
  );
}

interface AppointmentsWidgetProps {
  mode: 'today' | 'upcoming';
}

export function AppointmentsWidget({ mode }: AppointmentsWidgetProps) {
  const { data, isLoading } = useQuery<Appointment[]>({
    queryKey: ['dashboard', mode === 'today' ? 'today-appointments' : 'upcoming-appointments'],
    queryFn: mode === 'today' ? dashboardApi.getTodayAppointments : dashboardApi.getUpcomingAppointments,
  });

  const title = mode === 'today' ? 'Citas de Hoy' : 'Próximas Citas';

  return (
    <div className="card dashboard-card">
      <div className="dashboard-card__header">
        <h3 className="dashboard-card__title">{title}</h3>
        <Link to="/appointments" className="dashboard-card__link">Ver todas →</Link>
      </div>
      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : data && data.length > 0 ? (
        <div className="dashboard-list">
          {data.map((appt) => (
            <AppointmentRow key={appt.id} appt={appt} />
          ))}
        </div>
      ) : (
        <p className="text-muted dashboard-empty">
          {mode === 'today' ? 'No hay citas programadas para hoy.' : 'No hay próximas citas.'}
        </p>
      )}
    </div>
  );
}
