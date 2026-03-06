import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, RecentPatient } from '../../services/api';

export function RecentPatientsWidget() {
  const { data, isLoading } = useQuery<RecentPatient[]>({
    queryKey: ['dashboard', 'recent-patients'],
    queryFn: dashboardApi.getRecentPatients,
  });

  return (
    <div className="card dashboard-card">
      <div className="dashboard-card__header">
        <h3 className="dashboard-card__title">Pacientes Recientes</h3>
        <Link to="/patients" className="dashboard-card__link">Ver todos →</Link>
      </div>
      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : data && data.length > 0 ? (
        <div className="dashboard-list">
          {data.map((p) => (
            <Link key={p.id} to={`/patients/${p.id}`} className="dashboard-list-item dashboard-list-item--link">
              <div className="dashboard-list-item__main">
                <span className="dashboard-list-item__name">
                  {p.lastName}, {p.firstName}
                </span>
                {p.documentId && (
                  <span className="dashboard-list-item__sub">Doc: {p.documentId}</span>
                )}
                {p.phone && (
                  <span className="dashboard-list-item__sub">Tel: {p.phone}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted dashboard-empty">No hay pacientes registrados aún.</p>
      )}
    </div>
  );
}
