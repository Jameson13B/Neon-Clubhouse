import type { CSSProperties, TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const base: CSSProperties = {
  width: '100%',
  minHeight: 88,
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  outline: 'none',
  resize: 'vertical' as const,
};

export function Textarea({ style, ...rest }: Props) {
  return <textarea style={{ ...base, ...style }} {...rest} />;
}
