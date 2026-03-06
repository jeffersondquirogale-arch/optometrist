interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, color = 'var(--color-primary)', subtitle }: StatCardProps) {
  return (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}
