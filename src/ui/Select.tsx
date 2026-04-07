import type { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement>;

const base: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  outline: 'none',
};

export function Select({ style, children, ...rest }: Props) {
  return (
    <select style={{ ...base, ...style }} {...rest}>
      {children}
    </select>
  );
}
