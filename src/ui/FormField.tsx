import type { ReactNode } from 'react';
import { Stack } from './Stack';

type Props = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ label, hint, children }: Props) {
  return (
    <Stack gap={1}>
      <label
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </label>
      {children}
      {hint ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {hint}
        </span>
      ) : null}
    </Stack>
  );
}
