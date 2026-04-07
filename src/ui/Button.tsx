import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: '#0a1628',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(239, 91, 91, 0.15)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239, 91, 91, 0.35)',
  },
};

export function Button({
  variant = 'primary',
  children,
  style,
  disabled,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '0.875rem',
        padding: '10px 16px',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
