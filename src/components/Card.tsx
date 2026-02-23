import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = '', style, onClick }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 mb-5 relative transition-colors duration-300 ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid rgba(255,255,255,0.05)',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
      }}
    >
      {children}
    </div>
  );
}
