import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, CreatePatientInput } from '../../services/api';

const initialForm: CreatePatientInput = {
  firstName: '',
  lastName: '',
  documentId: '',
  phone: '',
  email: '',
  address: '',
  occupation: '',
  notes: '',
};

export function PatientNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<CreatePatientInput>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      navigate('/');
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('El nombre y apellido son obligatorios.');
      return;
    }
    mutation.mutate(form);
  }

  return (
    <div>
      <h2 className="page-title">Crear Paciente</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                id="lastName"
                name="lastName"
                className="form-control"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                id="firstName"
                name="firstName"
                className="form-control"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="documentId">DNI / Documento</label>
              <input
                id="documentId"
                name="documentId"
                className="form-control"
                value={form.documentId}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Género</label>
              <select
                id="gender"
                name="gender"
                className="form-control"
                value={form.gender ?? ''}
                onChange={handleChange}
              >
                <option value="">— Seleccionar —</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">Fecha de nacimiento</label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="form-control"
                value={form.birthDate ?? ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="occupation">Ocupación</label>
              <input
                id="occupation"
                name="occupation"
                className="form-control"
                value={form.occupation}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              id="address"
              name="address"
              className="form-control"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Observaciones</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Paciente'}
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
