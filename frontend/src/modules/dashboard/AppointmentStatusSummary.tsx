import { DashboardSummary } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  PROGRAMADA: 'Programada',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
};

const STATUS_COLORS: Record<string, string> = {
  PROGRAMADA: '#1a6ab1',
  CONFIRMADA: '#1a7a40',
  EN_CURSO: '#b7770d',
  COMPLETADA: '#4a5568',
  CANCELADA: '#c0392b',
  NO_ASISTIO: '#6b3fa0',
};

interface AppointmentStatusSummaryProps {
  appointmentsByStatus: DashboardSummary['appointmentsByStatus'];
}

export function AppointmentStatusSummary({ appointmentsByStatus }: AppointmentStatusSummaryProps) {
  const total = Object.values(appointmentsByStatus).reduce((acc, n) => acc + n, 0);

  const statuses = Object.keys(STATUS_LABELS);

  return (
    <div className="card dashboard-card">
      <h3 className="dashboard-card__title">Citas por Estado</h3>
      {total === 0 ? (
        <p className="text-muted dashboard-empty">No hay citas registradas.</p>
      ) : (
        <div className="status-summary">
          {statuses.map((status) => {
            const count = appointmentsByStatus[status] ?? 0;
            if (count === 0) return null;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status} className="status-summary__row">
                <span
                  className="status-summary__dot"
                  style={{ background: STATUS_COLORS[status] ?? '#999' }}
                />
                <span className="status-summary__label">{STATUS_LABELS[status]}</span>
                <div className="status-summary__bar-wrap">
                  <div
                    className="status-summary__bar"
                    style={{
                      width: `${pct}%`,
                      background: STATUS_COLORS[status] ?? '#999',
                    }}
                  />
                </div>
                <span className="status-summary__count">{count}</span>
              </div>
            );
          })}
          <div className="status-summary__total">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
