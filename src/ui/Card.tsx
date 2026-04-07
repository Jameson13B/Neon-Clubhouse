import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingMap = { sm: 12, md: 16, lg: 20 };

export function Card({ children, className, style, padding = 'md' }: Props) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: paddingMap[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
