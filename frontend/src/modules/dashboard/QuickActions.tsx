import { Link } from 'react-router-dom';
import { usePermissions } from '../auth/usePermissions';

export function QuickActions() {
  const {
    canCreatePatient,
    canCreateConsultation,
    canManageAppointments,
  } = usePermissions();

  const actions = [
    canCreatePatient() && {
      label: 'Nuevo Paciente',
      to: '/patients/new',
      icon: '👤',
      color: 'var(--color-primary)',
    },
    canCreateConsultation() && {
      label: 'Nueva Consulta',
      to: '/consultations/new',
      icon: '📋',
      color: 'var(--color-accent)',
    },
    canManageAppointments() && {
      label: 'Ver Citas',
      to: '/appointments',
      icon: '📅',
      color: 'var(--color-secondary)',
    },
    {
      label: 'Ver Pacientes',
      to: '/patients',
      icon: '👥',
      color: '#8e44ad',
    },
    canCreateConsultation() && {
      label: 'Ver Consultas',
      to: '/consultations',
      icon: '🔬',
      color: '#d35400',
    },
  ].filter(Boolean) as { label: string; to: string; icon: string; color: string }[];

  return (
    <div className="card dashboard-card">
      <h3 className="dashboard-card__title">Accesos Rápidos</h3>
      <div className="quick-actions">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="quick-action-btn"
            style={{ '--action-color': action.color } as React.CSSProperties}
          >
            <span className="quick-action-btn__icon">{action.icon}</span>
            <span className="quick-action-btn__label">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
