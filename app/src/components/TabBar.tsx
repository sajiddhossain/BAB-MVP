import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/today', icon: '☀️', label: 'Today' },
  { to: '/journey', icon: '🗺️', label: 'Journey' },
  { to: '/me', icon: '📈', label: 'Me' },
] as const

export default function TabBar() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2
                 border-t-[3px] border-ink bg-surface pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      <ul className="flex">
        {TABS.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold ${
                  isActive ? 'text-ink' : 'text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden className="text-xl leading-none">
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                  {/* The active tab is marked by shape as well as colour —
                      meaning never rests on colour alone. */}
                  <span
                    aria-hidden
                    className={`h-1 w-6 rounded-full ${isActive ? 'bg-ink' : 'bg-transparent'}`}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
