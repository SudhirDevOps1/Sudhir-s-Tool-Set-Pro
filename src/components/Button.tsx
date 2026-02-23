import type { ReactNode, MouseEventHandler } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'default' | 'success' | 'ghost';
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

const variantStyles = {
  default: {
    background: 'rgba(56, 189, 248, 0.1)',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    hoverBg: 'var(--accent)',
    hoverColor: 'var(--bg)',
  },
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success)',
    border: '1px solid var(--success)',
    hoverBg: 'var(--success)',
    hoverColor: 'var(--bg)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-dim)',
    border: '1px solid transparent',
    hoverBg: 'rgba(255,255,255,0.05)',
    hoverColor: 'var(--text)',
  },
};

export function Button({ children, onClick, variant = 'default', className = '', title, style }: ButtonProps) {
  const v = variantStyles[variant];

  return (
    <button
      className={`px-4 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm ${className}`}
      style={{
        background: v.background,
        color: v.color,
        border: v.border,
        ...style,
      }}
      onClick={onClick}
      title={title}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = v.hoverBg;
        e.currentTarget.style.color = v.hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.color = v.color;
      }}
    >
      {children}
    </button>
  );
}
