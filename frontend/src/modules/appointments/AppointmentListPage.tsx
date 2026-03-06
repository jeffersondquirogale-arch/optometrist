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

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: appointmentsApi.getAll,
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setForm({ patientId: '', scheduledAt: '', reason: '', status: 'PROGRAMADA', notes: '' });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CreateAppointmentInput['status'] }) =>
      appointmentsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.patientId) { setError('Seleccione un paciente.'); return; }
    if (!form.scheduledAt) { setError('Ingrese la fecha y hora de la cita.'); return; }
    createMutation.mutate(form);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Citas / Turnos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

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
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {patients?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha y hora *</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  className="form-control"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  required
                />
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDate(a.scheduledAt)}</td>
                    <td>
                      {a.patient
                        ? `${a.patient.lastName}, ${a.patient.firstName}`
                        : '—'}
                    </td>
                    <td>{a.reason ?? '—'}</td>
                    <td>{statusLabel(a.status)}</td>
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
          <p className="text-muted">No hay citas registradas.</p>
        )}
      </div>
    </div>
  );
}
