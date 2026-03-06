import { useAuth, UserRole } from './AuthContext';

/**
 * Hook que expone funciones de autorización basadas en el rol del usuario autenticado.
 * Permite a los componentes decidir qué mostrar u ocultar según el rol.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const hasRole = (...roles: UserRole[]): boolean => !!role && roles.includes(role);

  return {
    // Consultas
    canCreateConsultation: () => hasRole('ADMIN', 'DOCTOR'),
    canEditConsultation: () => hasRole('ADMIN', 'DOCTOR'),
    canViewConsultationDetail: () => hasRole('ADMIN', 'DOCTOR', 'STAFF'),
    canPrintConsultation: () => hasRole('ADMIN', 'DOCTOR'),

    // Pacientes
    canCreatePatient: () => hasRole('ADMIN', 'STAFF'),
    canEditPatient: () => hasRole('ADMIN', 'STAFF'),
    canDeletePatient: () => hasRole('ADMIN'),

    // Citas
    canManageAppointments: () => hasRole('ADMIN', 'DOCTOR', 'STAFF'),

    // Acceso clínico (historial, evolución, gráficas)
    canViewClinicalHistory: () => hasRole('ADMIN', 'DOCTOR', 'STAFF'),
    canViewEvolution: () => hasRole('ADMIN', 'DOCTOR', 'STAFF'),
  };
}
