import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, RecentConsultation } from '../../services/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  PARCIAL: 'Parcial',
  ANULADO: 'Anulado',
};

const PAYMENT_STYLES: Record<string, React.CSSProperties> = {
  PENDIENTE: { background: '#fef9e7', color: '#b7770d', border: '1px solid #f9d983' },
  PAGADO:    { background: '#eafaf1', color: '#1a7a40', border: '1px solid #a9dfbf' },
  PARCIAL:   { background: '#e8f4fd', color: '#1a6ab1', border: '1px solid #b3d7f5' },
  ANULADO:   { background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' },
};

export function RecentConsultationsWidget() {
  const { data, isLoading } = useQuery<RecentConsultation[]>({
    queryKey: ['dashboard', 'recent-consultations'],
    queryFn: dashboardApi.getRecentConsultations,
  });

  return (
    <div className="card dashboard-card">
      <div className="dashboard-card__header">
        <h3 className="dashboard-card__title">Consultas Recientes</h3>
        <Link to="/consultations" className="dashboard-card__link">Ver todas →</Link>
      </div>
      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : data && data.length > 0 ? (
        <div className="dashboard-list">
          {data.map((c) => {
            const badgeStyle: React.CSSProperties = {
              display: 'inline-block',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              ...(PAYMENT_STYLES[c.paymentStatus] ?? {}),
            };
            return (
              <Link key={c.id} to={`/consultations/${c.id}`} className="dashboard-list-item dashboard-list-item--link">
                <div className="dashboard-list-item__main">
                  <span className="dashboard-list-item__time">{formatDate(c.consultationDate)}</span>
                  <span className="dashboard-list-item__name">
                    {c.patient.lastName}, {c.patient.firstName}
                  </span>
                  {c.reason && <span className="dashboard-list-item__sub">{c.reason}</span>}
                </div>
                <span style={badgeStyle}>{PAYMENT_LABELS[c.paymentStatus] ?? c.paymentStatus}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-muted dashboard-empty">No hay consultas recientes.</p>
      )}
    </div>
  );
}
