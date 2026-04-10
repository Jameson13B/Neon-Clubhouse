import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  prefix?: ReactNode
}

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
}

export function Input({ style, ...rest }: Props) {
  const { prefix, ...inputProps } = rest

  if (prefix == null) {
    return (
      <input
        style={{
          ...base,
          ...style,
        }}
        {...inputProps}
      />
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
          fontSize: '0.9rem',
          lineHeight: 1,
        }}
      >
        {prefix}
      </span>
      <input
        style={{
          ...base,
          paddingLeft: '26px',
          ...style,
        }}
        {...inputProps}
      />
    </div>
  )
}
