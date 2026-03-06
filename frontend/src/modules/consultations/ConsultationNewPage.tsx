import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consultationsApi, patientsApi, CreateConsultationInput } from '../../services/api';

export function ConsultationNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const preselectedPatientId = searchParams.get('patientId') ?? '';

  const [form, setForm] = useState<CreateConsultationInput>({
    patientId: preselectedPatientId,
    doctorId: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    observations: '',
    paymentStatus: 'PENDIENTE',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  const mutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      navigate('/');
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.patientId) {
      setError('Seleccione un paciente.');
      return;
    }
    if (!form.doctorId) {
      setError('Ingrese el ID del doctor.');
      return;
    }
    mutation.mutate(form);
  }

  return (
    <div>
      <h2 className="page-title">Nueva Consulta</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="patientId">Paciente *</label>
              <select
                id="patientId"
                name="patientId"
                className="form-control"
                value={form.patientId}
                onChange={handleChange}
                required
              >
                <option value="">— Seleccionar paciente —</option>
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lastName}, {p.firstName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="doctorId">ID del Doctor *</label>
              <input
                id="doctorId"
                name="doctorId"
                className="form-control"
                placeholder="ID del perfil del doctor"
                value={form.doctorId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentStatus">Estado de pago</label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                className="form-control"
                value={form.paymentStatus}
                onChange={handleChange}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="PAGADO">Pagado</option>
                <option value="PARCIAL">Parcial</option>
                <option value="ANULADO">Anulado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo de consulta</label>
            <textarea
              id="reason"
              name="reason"
              className="form-control"
              rows={2}
              value={form.reason}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="diagnosis">Diagnóstico</label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              className="form-control"
              rows={2}
              value={form.diagnosis}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="treatment">Tratamiento</label>
            <textarea
              id="treatment"
              name="treatment"
              className="form-control"
              rows={2}
              value={form.treatment}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="observations">Observaciones</label>
            <textarea
              id="observations"
              name="observations"
              className="form-control"
              rows={2}
              value={form.observations}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Consulta'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
