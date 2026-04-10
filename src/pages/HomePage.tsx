import { Link } from 'react-router-dom'
import { Stack } from '../ui/Stack'

export function HomePage() {
  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-5)',
        minHeight: '80vh',
        textAlign: 'center',
      }}
    >
      <Stack direction="column" align="center" gap={24}>
        <div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Neon Clubhouse
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              marginTop: 8,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            by Atomic10 Studio
          </p>
        </div>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--color-text-muted)',
            maxWidth: 480,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Browse our catalog of booster packs, booster bundles, ETBs, and more.
          This is an invitation-only shop. Orders are not available to the public.
        </p>

        <Link
          to="/catalog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--color-accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '14px 28px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              'var(--color-accent-hover)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              'var(--color-accent)')
          }
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx={9} cy={21} r={1} />
            <circle cx={20} cy={21} r={1} />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Shop the Catalog
        </Link>

        <div>
          <h2
            style={{
              color: 'var(--color-text)',
            }}
          >
            Drop Updates Coming Soon...
          </h2>
        </div>
      </Stack>
    </main>
  )
}
