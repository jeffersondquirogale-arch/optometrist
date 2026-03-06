import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, patientsApi, Appointment, CreateAppointmentInput } from '../../services/api';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PROGRAMADA: 'Programada',
    CONFIRMADA: 'Confirmada',
    EN_CURSO: 'En curso',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
    NO_ASISTIO: 'No asistió',
  };
  return map[status] ?? status;
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    PROGRAMADA: { background: '#e8f4fd', color: '#1a6ab1', border: '1px solid #b3d7f5' },
    CONFIRMADA: { background: '#eafaf1', color: '#1a7a40', border: '1px solid #a9dfbf' },
    EN_CURSO:   { background: '#fef9e7', color: '#b7770d', border: '1px solid #f9d983' },
    COMPLETADA: { background: '#f0f4f8', color: '#4a5568', border: '1px solid #cbd5e0' },
    CANCELADA:  { background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' },
    NO_ASISTIO: { background: '#f5f0ff', color: '#6b3fa0', border: '1px solid #d4b8f0' },
  };
  return {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    ...(styles[status] ?? {}),
  };
}

export function AppointmentListPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAppointmentInput>({
    patientId: '',
    scheduledAt: '',
    reason: '',
    status: 'PROGRAMADA',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', filterStatus, filterDateFrom, filterDateTo],
    queryFn: () => appointmentsApi.getAll({
      status: filterStatus || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    }),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setForm({ patientId: '', scheduledAt: '', reason: '', status: 'PROGRAMADA', notes: '' });
      setSuccessMsg('Cita creada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CreateAppointmentInput['status'] }) =>
      appointmentsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setSuccessMsg('Estado actualizado.');
      setTimeout(() => setSuccessMsg(null), 2000);
    },
  });

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.patientId) errors.patientId = 'Seleccione un paciente.';
    if (!form.scheduledAt) errors.scheduledAt = 'Ingrese la fecha y hora de la cita.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    createMutation.mutate(form);
  }

  function clearFilters() {
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Citas / Turnos</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm((v) => !v); setError(null); setFieldErrors({}); }}>
          {showForm ? 'Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Nueva Cita</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Paciente *</label>
                <select
                  name="patientId"
                  className="form-control"
                  value={form.patientId}
                  onChange={handleChange}
                  style={fieldErrors.patientId ? { borderColor: 'var(--color-danger)' } : {}}
                >
                  <option value="">— Seleccionar —</option>
                  {patients?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName}
                    </option>
                  ))}
                </select>
                {fieldErrors.patientId && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.patientId}</span>
                )}
              </div>
              <div className="form-group">
                <label>Fecha y hora *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  className="form-control"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  style={fieldErrors.scheduledAt ? { borderColor: 'var(--color-danger)' } : {}}
                />
                {fieldErrors.scheduledAt && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.scheduledAt}</span>
                )}
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  name="status"
                  className="form-control"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PROGRAMADA">Programada</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="NO_ASISTIO">No asistió</option>
                </select>
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <input
                  type="text"
                  name="reason"
                  className="form-control"
                  value={form.reason}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea
                name="notes"
                className="form-control"
                rows={2}
                value={form.notes}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Guardando...' : 'Guardar Cita'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3" style={{ padding: '1rem 1.5rem' }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>
            Filtros:
          </span>
          <select
            className="form-control"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EN_CURSO">En curso</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NO_ASISTIO">No asistió</option>
          </select>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            title="Desde"
            placeholder="Desde"
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>→</span>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            title="Hasta"
            placeholder="Hasta"
          />
          {hasFilters && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              onClick={clearFilters}
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-muted">Cargando citas...</p>
        ) : appointments && appointments.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.scheduledAt)}</td>
                    <td>
                      {a.patient
                        ? `${a.patient.lastName}, ${a.patient.firstName}`
                        : '—'}
                    </td>
                    <td>{a.reason ?? '—'}</td>
                    <td>
                      <span style={statusBadgeStyle(a.status)}>{statusLabel(a.status)}</span>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', width: 'auto' }}
                        value={a.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: a.id,
                            status: e.target.value as CreateAppointmentInput['status'],
                          })
                        }
                      >
                        <option value="PROGRAMADA">Programada</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="EN_CURSO">En curso</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="NO_ASISTIO">No asistió</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">
            {hasFilters
              ? 'No hay citas que coincidan con los filtros aplicados.'
              : 'No hay citas registradas. Cree la primera cita usando el botón de arriba.'}
          </p>
        )}
      </div>
    </div>
  );
}
