import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  direction?: 'row' | 'column';
  gap?: number;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Stack({
  children,
  direction = 'column',
  gap = 3,
  align,
  justify,
  wrap,
  className,
  style,
}: Props) {
  const gapPx = gap * 4;
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: gapPx,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
