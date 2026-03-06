import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, consultationsApi, Patient, Consultation } from '../../services/api';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function paymentLabel(status: string) {
  const map: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    PAGADO: 'Pagado',
    PARCIAL: 'Parcial',
    ANULADO: 'Anulado',
  };
  return map[status] ?? status;
}

export function PatientHistoryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: patient } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.getById(id!),
    enabled: !!id,
  });

  const {
    data: consultations,
    isLoading,
    error,
  } = useQuery<Consultation[]>({
    queryKey: ['patient-history', id],
    queryFn: () => consultationsApi.getPatientHistory(id!),
    enabled: !!id,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">
          Historial de consultas
          {patient ? ` — ${patient.lastName}, ${patient.firstName}` : ''}
        </h2>
        <div className="flex gap-2">
          <Link to={`/patients/${id}`} className="btn btn-secondary">
            ← Datos del paciente
          </Link>
          <Link to={`/patients/${id}/evolution`} className="btn btn-secondary">
            📈 Evolución
          </Link>
          <Link to={`/consultations/new?patientId=${id}`} className="btn btn-primary">
            + Nueva Consulta
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">Error al cargar el historial.</div>
      )}

      <div className="card">
        {isLoading ? (
          <p className="text-muted">Cargando historial...</p>
        ) : consultations && consultations.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th>Diagnóstico</th>
                  <th>Doctor</th>
                  <th>Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id}>
                    <td>{formatDate(c.consultationDate)}</td>
                    <td>{c.reason ?? '—'}</td>
                    <td>{c.diagnosis ?? '—'}</td>
                    <td>{c.doctor?.user?.name ?? '—'}</td>
                    <td>{paymentLabel(c.paymentStatus)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/consultations/${c.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/consultations/${c.id}/edit`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                        >
                          ✏️ Editar
                        </Link>
                        <Link
                          to={`/print/consultations/${c.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                          target="_blank"
                        >
                          🖨️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">Este paciente no tiene consultas registradas.</p>
        )}
      </div>
    </div>
  );
}
