import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { consultationsApi, patientsApi, Consultation, Patient } from '../../services/api';
import { usePermissions } from '../auth/usePermissions';

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

export function ConsultationListPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [search, setSearch] = useState('');
  const { canCreateConsultation, canEditConsultation, canPrintConsultation } = usePermissions();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: () => patientsApi.getAll(),
  });

  const { data: consultations, isLoading, error } = useQuery<Consultation[]>({
    queryKey: ['consultations', selectedPatientId],
    queryFn: () => consultationsApi.getAll(selectedPatientId || undefined),
  });

  const filtered = consultations
    ? consultations.filter((c) => {
        if (!search.trim()) return true;
        const term = search.trim().toLowerCase();
        const patientName = c.patient
          ? `${c.patient.lastName} ${c.patient.firstName}`.toLowerCase()
          : '';
        const reason = (c.reason ?? '').toLowerCase();
        const diagnosis = (c.diagnosis ?? '').toLowerCase();
        return patientName.includes(term) || reason.includes(term) || diagnosis.includes(term);
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Consultas</h2>
        {canCreateConsultation() && (
          <Link to="/consultations/new" className="btn btn-primary">
            + Nueva Consulta
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          Error al cargar las consultas. Verifique la conexión con el servidor.
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3" style={{ padding: '1rem 1.5rem' }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>
            Filtrar:
          </span>
          <select
            className="form-control"
            style={{ width: 'auto', fontSize: '0.875rem', minWidth: '200px' }}
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="">Todos los pacientes</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.lastName}, {p.firstName}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control"
            style={{ width: 'auto', minWidth: '240px', fontSize: '0.875rem' }}
            placeholder="Buscar por motivo o diagnóstico…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(selectedPatientId || search) && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              onClick={() => { setSelectedPatientId(''); setSearch(''); }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-muted">Cargando consultas...</p>
        ) : filtered.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Diagnóstico</th>
                  <th>Doctor</th>
                  <th>Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.consultationDate)}</td>
                    <td>
                      {c.patient ? (
                        <Link
                          to={`/patients/${c.patient.id}`}
                          style={{ color: '#2563eb' }}
                        >
                          {c.patient.lastName}, {c.patient.firstName}
                        </Link>
                      ) : '—'}
                    </td>
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
                        {canEditConsultation() && (
                          <Link
                            to={`/consultations/${c.id}/edit`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                          >
                            ✏️ Editar
                          </Link>
                        )}
                        {canPrintConsultation() && (
                          <Link
                            to={`/print/consultations/${c.id}`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                            target="_blank"
                          >
                            🖨️
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (selectedPatientId || search) ? (
          <p className="text-muted">No se encontraron consultas con los filtros aplicados.</p>
        ) : (
          <p className="text-muted">No hay consultas registradas aún. Cree la primera desde un paciente o usando el botón de arriba.</p>
        )}
      </div>
    </div>
  );
}
