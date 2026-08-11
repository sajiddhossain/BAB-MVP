import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * La console di chi amministra.
 *
 * 🔴 Non è l'app. Si apre da un portatile, ha una densità da strumento e non
 * da prodotto, e il suo testo sta qui invece che in `src/copy` — è l'unica
 * esenzione al controllo, ed è documentata in `scripts/check-copy.mjs`.
 *
 * Quello che NON fa, e non per dimenticanza: non mostra un check-in, non mostra
 * il ciclo, non mostra una parola scritta da un'atleta. Le viste `admin_*` non
 * hanno quelle colonne. Chi amministra ha più potere di un coach, non meno
 * bisogno di limiti.
 */

export const TABS = [
  { to: '/admin', label: 'Battito', end: true },
  { to: '/admin/squadre', label: 'Squadre' },
  { to: '/admin/bandiere', label: 'Bandiere rosse' },
  { to: '/admin/consensi', label: 'Consensi' },
]

export function Card({ title, children, wide = false }: {
  title?: string; children: React.ReactNode; wide?: boolean
}) {
  return (
    <section className={`bab-card flex flex-col gap-3 px-5 py-4 ${wide ? 'col-span-full' : ''}`}>
      {title && <h2 className="font-display text-[17px]">{title}</h2>}
      {children}
    </section>
  )
}

export function Tab({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="bab-pill px-4 py-2 text-[14px]"
      style={({ isActive }) => (isActive
        ? { background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: 'var(--color-surface)' }
        : undefined)}
    >
      {label}
    </NavLink>
  )
}

/** Un numero grande e cosa vuol dire. `warn` lo colora solo quando conta. */
export function Stat({ n, label, warn = false }: { n: number; label: string; warn?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[30px] leading-none"
            style={warn && n > 0 ? { color: 'var(--care)' } : undefined}>
        {n}
      </span>
      <span className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">{label}</span>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-[var(--color-ink-soft)]">
      {label}{children}
    </label>
  )
}

export const inputClass = 'bab-card px-3 py-2 text-[14px] text-[var(--color-ink)]'

/**
 * Carica, e dice la verità sui tre esiti.
 *
 * 🔴 «Zero righe» e «non sono riuscita a chiedere» non sono la stessa cosa, e
 * una console che le confonde è peggio di niente: fa credere che il pilota sia
 * fermo quando è solo caduta la rete, o che vada tutto bene quando la RLS sta
 * rifiutando ogni query.
 */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setError(null)
    fn()
      .then((d) => { if (alive) setData(d) })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, error, reload: () => setTick((n) => n + 1) }
}

export function Problem({ error }: { error: string }) {
  return (
    <p className="bab-card px-4 py-3 text-[13.5px]"
       style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}>
      {error === 'not-connected'
        ? 'Supabase non è collegato: manca VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.'
        : error}
    </p>
  )
}

/** La data come la legge una persona, non come la scrive Postgres. */
export const when = (iso: string | null): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export const days = (iso: string): number =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
