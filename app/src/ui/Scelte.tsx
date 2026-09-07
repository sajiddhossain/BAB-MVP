import type { ReactNode } from 'react'

/**
 * Una fila di pastiglie di cui se ne accende una: le fasce orarie, il si'/no.
 * Stessa forma dei giorni ma larghe quanto serve invece che quadrate.
 */
export function Pillole<T extends string | number>({
  voci,
  scelta,
  onChange,
}: {
  voci: { id: T; testo: ReactNode }[]
  scelta: T | null
  onChange: (id: T) => void
}) {
  return (
    <div className="flex gap-[5px]">
      {voci.map((v) => {
        const acceso = v.id === scelta
        return (
          <button
            key={String(v.id)}
            type="button"
            aria-pressed={acceso}
            onClick={() => onChange(v.id)}
            className={`h-11 min-w-0 flex-1 rounded-[12px] border-[1.5px] px-2 text-[13px] font-bold transition-colors duration-150 ${
              acceso ? 'border-ink bg-lime text-ink' : 'border-line bg-surface text-ink'
            }`}
          >
            {v.testo}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Il menu a tendina. E' un <select> vero, non una finta lista: cosi' sul
 * telefono si apre la ruota del sistema, che e' meglio di qualsiasi cosa
 * potremmo rifare noi.
 */
export function Selettore({
  valore,
  onChange,
  segnaposto,
  voci,
}: {
  valore: number | null
  onChange: (v: number | null) => void
  segnaposto: string
  voci: { valore: number; testo: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={valore ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={`h-12 w-full appearance-none rounded-field border-[1.5px] border-line bg-surface px-[14.5px] pr-10 text-[15px] outline-none focus:border-violet ${
          valore === null ? 'text-ink-mute' : 'text-ink'
        }`}
      >
        <option value="">{segnaposto}</option>
        {voci.map((v) => (
          <option key={v.valore} value={v.valore}>
            {v.testo}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-[14px] top-1/2 -mt-[3px] block h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-ink-soft" />
    </div>
  )
}

/** La casella da spuntare del consenso. */
export function Casella({
  spuntata,
  onChange,
  children,
}: {
  spuntata: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={spuntata}
      onClick={() => onChange(!spuntata)}
      className="flex w-full items-start gap-3 rounded-[18px] border-[1.5px] border-line bg-surface p-4 text-left"
    >
      <span
        className={`mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] ${
          spuntata ? 'border-ink bg-lime' : 'border-line bg-surface'
        }`}
      >
        {spuntata && (
          <svg viewBox="0 0 12 10" className="w-[11px]" aria-hidden>
            <path
              d="M1 5l3.2 3.2L11 1.4"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-[14px] leading-[1.45] text-ink">{children}</span>
    </button>
  )
}

/** Il rimando testuale sotto al bottone: "Non me lo ricordo", "Rimandalo". */
export function Rimando({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto block text-[14px] font-bold text-violet underline underline-offset-[3px]"
    >
      {children}
    </button>
  )
}
