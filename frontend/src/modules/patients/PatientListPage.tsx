import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientsApi, Patient } from '../../services/api';
import { usePermissions } from '../auth/usePermissions';

export function PatientListPage() {
  const [search, setSearch] = useState('');
  const { canCreatePatient, canCreateConsultation, canViewClinicalHistory, canViewEvolution } = usePermissions();

  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: () => patientsApi.getAll(),
  });

  const filtered = patients
    ? patients.filter((p) => {
        if (!search.trim()) return true;
        const term = search.trim().toLowerCase();
        return (
          p.firstName.toLowerCase().includes(term) ||
          p.lastName.toLowerCase().includes(term) ||
          (p.documentId ?? '').toLowerCase().includes(term) ||
          (p.phone ?? '').toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Listado de Pacientes</h2>
        {canCreatePatient() && (
          <Link to="/patients/new" className="btn btn-primary">
            + Nuevo Paciente
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          Error al cargar los pacientes. Verifique la conexión con el servidor.
        </div>
      )}

      <div className="card">
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, apellido, documento o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '420px' }}
          />
        </div>

        {isLoading ? (
          <p className="text-muted">Cargando pacientes...</p>
        ) : filtered.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Apellido y Nombre</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <Link to={`/patients/${patient.id}`} style={{ color: '#2563eb' }}>
                        {patient.lastName}, {patient.firstName}
                      </Link>
                    </td>
                    <td>{patient.documentId ?? '—'}</td>
                    <td>{patient.phone ?? '—'}</td>
                    <td>{patient.email ?? '—'}</td>
                    <td>
                      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        <Link
                          to={`/patients/${patient.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                          title="Ver datos del paciente"
                        >
                          👤 Detalle
                        </Link>
                        {canViewClinicalHistory() && (
                          <Link
                            to={`/patients/${patient.id}/history`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                            title="Ver historial de consultas"
                          >
                            📋 Historial
                          </Link>
                        )}
                        {canViewEvolution() && (
                          <Link
                            to={`/patients/${patient.id}/evolution`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                            title="Ver evolución clínica"
                          >
                            📈 Evolución
                          </Link>
                        )}
                        {canCreateConsultation() && (
                          <Link
                            to={`/consultations/new?patientId=${patient.id}`}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                            title="Crear nueva consulta"
                          >
                            + Consulta
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : patients && patients.length === 0 ? (
          <p className="text-muted">No hay pacientes registrados aún. Cree el primer paciente usando el botón de arriba.</p>
        ) : (
          <p className="text-muted">No se encontraron pacientes con el criterio de búsqueda.</p>
        )}
      </div>
    </div>
  );
}
