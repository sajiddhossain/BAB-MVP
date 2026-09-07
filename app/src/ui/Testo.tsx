import type { ReactNode } from 'react'

/** L'occhiello: sempre maiuscolo, 11px, lettere distanziate di 1px. */
export function Occhiello({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">{children}</p>
  )
}

/** Il titolo dello schermo. L'unico posto in cui si usa Bricolage. */
export function Titolo({ children }: { children: ReactNode }) {
  return (
    <h1 className="bab-display m-0 mt-[9px] text-[30px] font-bold leading-[40px] tracking-[-0.6px] text-ink">
      {children}
    </h1>
  )
}

/** Il paragrafo sotto al titolo. */
export function Occhio({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mt-[10px] text-[15px] leading-[1.5] tracking-[-0.3px] text-ink-soft">
      {children}
    </p>
  )
}

/** L'etichetta di un campo: come l'occhiello ma attaccata a quello che segue. */
export function Etichetta({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">{children}</p>
  )
}
