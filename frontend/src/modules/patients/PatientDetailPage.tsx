import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsApi, Patient } from '../../services/api';
import { usePermissions } from '../auth/usePermissions';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function genderLabel(gender?: string) {
  if (gender === 'MASCULINO') return 'Masculino';
  if (gender === 'FEMENINO') return 'Femenino';
  if (gender === 'OTRO') return 'Otro';
  return '—';
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { canCreateConsultation, canViewClinicalHistory, canViewEvolution } = usePermissions();

  const {
    data: patient,
    isLoading,
    error,
  } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-muted">Cargando paciente...</p>;
  if (error || !patient)
    return <div className="alert alert-error">No se pudo cargar el paciente.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">
          {patient.lastName}, {patient.firstName}
        </h2>
        <div className="flex gap-2">
          {canViewClinicalHistory() && (
            <Link to={`/patients/${id}/history`} className="btn btn-secondary">
              📋 Historial
            </Link>
          )}
          {canViewEvolution() && (
            <Link to={`/patients/${id}/evolution`} className="btn btn-secondary">
              📈 Evolución
            </Link>
          )}
          {canCreateConsultation() && (
            <Link to={`/consultations/new?patientId=${id}`} className="btn btn-primary">
              + Nueva Consulta
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Apellido y Nombre</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.lastName}, {patient.firstName}
            </div>
          </div>
          <div className="form-group">
            <label>Documento</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.documentId ?? '—'}
            </div>
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {formatDate(patient.birthDate)}
            </div>
          </div>
          <div className="form-group">
            <label>Género</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {genderLabel(patient.gender)}
            </div>
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.phone ?? '—'}
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.email ?? '—'}
            </div>
          </div>
          <div className="form-group">
            <label>Ocupación</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.occupation ?? '—'}
            </div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <div className="form-control" style={{ background: '#f9fafb' }}>
              {patient.address ?? '—'}
            </div>
          </div>
        </div>
        {patient.notes && (
          <div className="form-group">
            <label>Notas</label>
            <div className="form-control" style={{ background: '#f9fafb', minHeight: '3rem' }}>
              {patient.notes}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <Link to="/" className="btn btn-secondary">
          ← Volver al listado
        </Link>
      </div>
    </div>
  );
}
