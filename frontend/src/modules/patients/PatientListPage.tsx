import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientsApi, Patient } from '../../services/api';

export function PatientListPage() {
  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Listado de Pacientes</h2>
        <Link to="/patients/new" className="btn btn-primary">
          + Nuevo Paciente
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          Error al cargar los pacientes. Verifique la conexión con el servidor.
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <p className="text-muted">Cargando pacientes...</p>
        ) : patients && patients.length > 0 ? (
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
                {patients.map((patient) => (
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
                      <div className="flex gap-2">
                        <Link
                          to={`/patients/${patient.id}/history`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                        >
                          Historial
                        </Link>
                        <Link
                          to={`/consultations/new?patientId=${patient.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                        >
                          Nueva consulta
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No hay pacientes registrados aún.</p>
        )}
      </div>
    </div>
  );
}
