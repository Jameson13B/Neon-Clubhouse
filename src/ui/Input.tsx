import type { CSSProperties, InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

const base: CSSProperties = {
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

export function Input({ style, ...rest }: Props) {
  return (
    <input
      style={{
        ...base,
        ...style,
      }}
      {...rest}
    />
  );
}
