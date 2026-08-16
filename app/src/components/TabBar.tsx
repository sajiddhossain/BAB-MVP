import { NavLink } from 'react-router-dom'
import { useCopy } from '@/copy'
import { SunIcon, PathIcon, TrendIcon } from './icons'

export default function TabBar() {
  const t = useCopy()
  const tabs = [
    { to: '/today', Icon: SunIcon, label: t.tabs.today },
    { to: '/journey', Icon: PathIcon, label: t.tabs.journey },
    { to: '/me', Icon: TrendIcon, label: t.tabs.me },
  ]

  return (
    <nav
      className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2
                 border-t-[3px] border-ink bg-surface pb-[env(safe-area-inset-bottom)]"
      aria-label={t.tabs.ariaLabel}
    >
      <ul className="flex">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold ${
                  isActive ? 'text-ink' : 'text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.Icon size={22} color={isActive ? 'var(--color-ink)' : 'var(--color-ink-soft)'} />
                  <span>{tab.label}</span>
                  {/* La tab attiva è marcata anche dalla FORMA: il significato
                      non si affida mai al solo colore. */}
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
