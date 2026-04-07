import type { CSSProperties } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Stack } from "../ui/Stack"

const linkStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text-muted)",
  fontWeight: 600,
  fontSize: "0.9rem",
}

const activeStyle: CSSProperties = {
  ...linkStyle,
  background: "var(--color-surface-hover)",
  color: "var(--color-text)",
}

export function Layout() {
  const { canUseAuth, ready, user, isAdmin } = useAuth()
  const showAdminNav = !canUseAuth || !ready || !user || isAdmin

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(15, 20, 25, 0.85)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "var(--space-4) var(--space-5)",
          }}
        >
          <NavLink
            to="/"
            style={{
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "var(--color-text)",
            }}
          >
            Neon Clubhouse
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                marginLeft: 6,
              }}
            >
              by Atomic10 Studio
            </span>
          </NavLink>
          <nav style={{ display: "flex", gap: 8 }}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
            >
              Catalog
            </NavLink>
            {showAdminNav ? (
              <NavLink
                to="/admin"
                style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
              >
                Admin
              </NavLink>
            ) : null}
          </nav>
        </Stack>
      </header>
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "var(--space-6) var(--space-5)",
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
