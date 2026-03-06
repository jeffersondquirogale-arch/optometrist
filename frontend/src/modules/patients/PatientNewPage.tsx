import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, CreatePatientInput, ApiError } from '../../services/api';
import { isValidEmail, isValidPastOrPresentDate } from '../../utils/validation';

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

type FieldErrors = Partial<Record<keyof CreatePatientInput, string>>;

export function PatientNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<CreatePatientInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      navigate('/');
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.errors.length > 0) {
        const fe: FieldErrors = {};
        err.errors.forEach(({ field, message }) => {
          fe[field as keyof CreatePatientInput] = message;
        });
        setFieldErrors(fe);
        setError('Por favor corrige los errores indicados.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al guardar el paciente');
      }
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof CreatePatientInput]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validateForm(): boolean {
    const fe: FieldErrors = {};
    if (!form.firstName.trim()) fe.firstName = 'El nombre es obligatorio';
    if (!form.lastName.trim()) fe.lastName = 'El apellido es obligatorio';
    if (form.email && !isValidEmail(form.email)) fe.email = 'El email no tiene un formato válido';
    if (form.birthDate && !isValidPastOrPresentDate(form.birthDate)) fe.birthDate = 'La fecha de nacimiento debe ser válida y no futura';
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    // Send undefined for empty optional strings to keep the payload clean
    const payload: CreatePatientInput = {
      ...form,
      documentId: form.documentId || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      occupation: form.occupation || undefined,
      notes: form.notes || undefined,
      birthDate: form.birthDate || undefined,
    };
    mutation.mutate(payload);
  }

  return (
    <div>
      <h2 className="page-title">Crear Paciente</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                id="lastName"
                name="lastName"
                className={`form-control${fieldErrors.lastName ? ' is-invalid' : ''}`}
                value={form.lastName}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.lastName}
                aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
              />
              {fieldErrors.lastName && (
                <span id="lastName-error" className="field-error">{fieldErrors.lastName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                id="firstName"
                name="firstName"
                className={`form-control${fieldErrors.firstName ? ' is-invalid' : ''}`}
                value={form.firstName}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
              />
              {fieldErrors.firstName && (
                <span id="firstName-error" className="field-error">{fieldErrors.firstName}</span>
              )}
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
                className={`form-control${fieldErrors.birthDate ? ' is-invalid' : ''}`}
                value={form.birthDate ?? ''}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                aria-invalid={!!fieldErrors.birthDate}
                aria-describedby={fieldErrors.birthDate ? 'birthDate-error' : undefined}
              />
              {fieldErrors.birthDate && (
                <span id="birthDate-error" className="field-error">{fieldErrors.birthDate}</span>
              )}
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
                className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className="field-error">{fieldErrors.email}</span>
              )}
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
