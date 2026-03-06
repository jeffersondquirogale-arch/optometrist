import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '3rem' }}>🚫</span>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#374151' }}>Acceso no autorizado</h2>
      <p style={{ color: '#6b7280', maxWidth: '360px' }}>
        No tiene permisos para acceder a esta sección. Contacte al administrador si cree que esto es
        un error.
      </p>
      <Link to="/" className="btn btn-secondary">
        ← Volver al inicio
      </Link>
    </div>
  );
}
