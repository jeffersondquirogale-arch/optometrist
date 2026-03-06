import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, consultationsApi, Patient, EvolutionPoint } from '../../services/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatOpt(value: number | null) {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

export function PatientEvolutionPage() {
  const { id } = useParams<{ id: string }>();

  const { data: patient } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.getById(id!),
    enabled: !!id,
  });

  const {
    data: evolution,
    isLoading,
    error,
  } = useQuery<EvolutionPoint[]>({
    queryKey: ['patient-evolution', id],
    queryFn: () => consultationsApi.getPatientEvolution(id!),
    enabled: !!id,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">
          Evolución clínica
          {patient ? ` — ${patient.lastName}, ${patient.firstName}` : ''}
        </h2>
        <div className="flex gap-2">
          <Link to={`/patients/${id}`} className="btn btn-secondary">
            ← Datos del paciente
          </Link>
          <Link to={`/patients/${id}/history`} className="btn btn-secondary">
            📋 Historial
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">Error al cargar la evolución.</div>}

      {/* Fórmula final por fecha */}
      <div className="card mb-3">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#374151' }}>
          Evolución de Fórmula Final
        </h3>
        {isLoading ? (
          <p className="text-muted">Cargando datos...</p>
        ) : evolution && evolution.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th colSpan={3} style={{ textAlign: 'center', borderLeft: '2px solid #d1d5db' }}>
                    OD (Derecho)
                  </th>
                  <th colSpan={3} style={{ textAlign: 'center', borderLeft: '2px solid #d1d5db' }}>
                    OI (Izquierdo)
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th style={{ borderLeft: '2px solid #d1d5db' }}>Esfera</th>
                  <th>Cilindro</th>
                  <th>Eje</th>
                  <th style={{ borderLeft: '2px solid #d1d5db' }}>Esfera</th>
                  <th>Cilindro</th>
                  <th>Eje</th>
                </tr>
              </thead>
              <tbody>
                {evolution.map((e) => (
                  <tr key={e.consultationId}>
                    <td>
                      <Link
                        to={`/consultations/${e.consultationId}`}
                        style={{ color: '#2563eb' }}
                      >
                        {formatDate(e.date)}
                      </Link>
                    </td>
                    <td style={{ borderLeft: '2px solid #d1d5db' }}>{formatOpt(e.od.sphere)}</td>
                    <td>{formatOpt(e.od.cylinder)}</td>
                    <td>{e.od.axis ?? '—'}</td>
                    <td style={{ borderLeft: '2px solid #d1d5db' }}>{formatOpt(e.oi.sphere)}</td>
                    <td>{formatOpt(e.oi.cylinder)}</td>
                    <td>{e.oi.axis ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No hay datos de evolución disponibles.</p>
        )}
      </div>

      {/* Agudeza visual por fecha */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#374151' }}>
          Evolución de Agudeza Visual
        </h3>
        {isLoading ? (
          <p className="text-muted">Cargando datos...</p>
        ) : evolution && evolution.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th colSpan={2} style={{ textAlign: 'center', borderLeft: '2px solid #d1d5db' }}>
                    OD (Derecho)
                  </th>
                  <th colSpan={2} style={{ textAlign: 'center', borderLeft: '2px solid #d1d5db' }}>
                    OI (Izquierdo)
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th style={{ borderLeft: '2px solid #d1d5db' }}>SC</th>
                  <th>CC</th>
                  <th style={{ borderLeft: '2px solid #d1d5db' }}>SC</th>
                  <th>CC</th>
                </tr>
              </thead>
              <tbody>
                {evolution.map((e) => (
                  <tr key={e.consultationId}>
                    <td>
                      <Link
                        to={`/consultations/${e.consultationId}`}
                        style={{ color: '#2563eb' }}
                      >
                        {formatDate(e.date)}
                      </Link>
                    </td>
                    <td style={{ borderLeft: '2px solid #d1d5db' }}>{e.od.scVision ?? '—'}</td>
                    <td>{e.od.ccVision ?? '—'}</td>
                    <td style={{ borderLeft: '2px solid #d1d5db' }}>{e.oi.scVision ?? '—'}</td>
                    <td>{e.oi.ccVision ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No hay datos de agudeza visual disponibles.</p>
        )}
      </div>
    </div>
  );
}
