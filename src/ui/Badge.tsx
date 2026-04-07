import type { CSSProperties, ReactNode } from 'react';
import type { ProductStatus } from '../types/product';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type Props = {
  children: ReactNode;
  tone?: Tone;
  style?: CSSProperties;
};

const tones: Record<Tone, CSSProperties> = {
  neutral: {
    background: 'var(--color-surface-hover)',
    color: 'var(--color-text-muted)',
    borderColor: 'var(--color-border)',
  },
  success: {
    background: 'rgba(76, 217, 100, 0.12)',
    color: 'var(--color-success)',
    borderColor: 'rgba(76, 217, 100, 0.35)',
  },
  warning: {
    background: 'rgba(245, 166, 35, 0.12)',
    color: 'var(--color-warning)',
    borderColor: 'rgba(245, 166, 35, 0.35)',
  },
  danger: {
    background: 'rgba(239, 91, 91, 0.12)',
    color: 'var(--color-danger)',
    borderColor: 'rgba(239, 91, 91, 0.35)',
  },
  info: {
    background: 'rgba(61, 156, 245, 0.12)',
    color: 'var(--color-accent)',
    borderColor: 'rgba(61, 156, 245, 0.35)',
  },
};

export function Badge({ children, tone = 'neutral', style }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase' as const,
        padding: '4px 8px',
        borderRadius: '999px',
        border: '1px solid',
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function statusTone(status: ProductStatus): Tone {
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'sold_out':
      return 'danger';
    case 'in_transit':
      return 'warning';
    case 'locked':
      return 'info';
    default:
      return 'neutral';
  }
}
