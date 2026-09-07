import type { ReactNode } from 'react'

/**
 * L'occhiello sopra al titolo: 16px in nero su una pastiglia verde chiara.
 *
 * La pastiglia nel disegno e' larga quanto il testo piu' 10px per parte, e
 * comincia 10px prima di lui: da qui il margine negativo, che la fa sbordare
 * a sinistra senza spostare il testo.
 */
export function Occhiello({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 -ml-[10px] inline-flex h-7 items-center rounded-lg bg-[rgba(16,185,129,0.08)] px-[10px] text-[16px] font-bold uppercase tracking-[0.5px] text-ink">
      {children}
    </p>
  )
}

/** Il titolo dello schermo. L'unico posto in cui si usa Bricolage. */
export function Titolo({ children }: { children: ReactNode }) {
  return (
    <h1 className="bab-display m-0 mt-1 text-[30px] font-bold leading-[40px] tracking-[-0.6px] text-ink">
      {children}
    </h1>
  )
}

/** Il paragrafo sotto al titolo. */
export function Occhio({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mt-3 text-[15px] leading-[1.5] tracking-[-0.3px] text-ink-soft">{children}</p>
  )
}

/** L'etichetta di un campo: 11px, grigia, lettere larghe. */
export function Etichetta({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[11px] font-bold uppercase tracking-[1px] text-ink-soft">{children}</p>
  )
}

/**
 * Etichetta piu' quello che etichetta, con lo stacco giusto in mezzo.
 * Nel disegno fra le due cose ci sono 6px, sempre.
 */
export function Gruppo({ etichetta, children }: { etichetta: ReactNode; children: ReactNode }) {
  return (
    <div>
      <Etichetta>{etichetta}</Etichetta>
      <div className="mt-[6px]">{children}</div>
    </div>
  )
}

/** Il messaggio quando qualcosa non e' andato. Rosso ma non urlato. */
export function Errore({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="m-0 mt-[6px] text-[13px] leading-[1.4] font-bold text-[#ef545e]"
    >
      {children}
    </p>
  )
}
