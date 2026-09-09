import type { ReactNode } from 'react'

const ICONE = import.meta.glob<string>('../../assets/tutorial/*.svg', {
  eager: true,
  import: 'default',
})

/** Una icona del tutorial presa per nome, senza un `import` per ognuna. */
export function icona(nome: string): string {
  return ICONE[`../../assets/tutorial/${nome}.svg`]
}

/**
 * L'occhiello del tutorial: icona a sinistra, scritta nera in maiuscolo.
 *
 * Diverso da quello dell'onboarding, che è una pastiglia verde chiara, e da
 * quello delle lezioni, che è lilla e piccolo. Sono tre gruppi di frame
 * disegnati in momenti diversi, e la differenza si vede.
 */
export function Occhiello({ segno, children }: { segno: string; children: ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-2">
      <img src={icona(segno)} alt="" aria-hidden className="size-6 shrink-0" />
      <span className="text-[16px] font-bold tracking-[0.5px] text-ink uppercase">{children}</span>
    </p>
  )
}

/** Il titolo del tutorial: 30 su 42, come nei frame. */
export function Titolo({ children }: { children: ReactNode }) {
  return (
    <h1 className="bab-display m-0 mt-[6px] text-[30px] leading-[42px] font-bold tracking-[-0.6px] text-ink">
      {children}
    </h1>
  )
}

/** Il paragrafo sotto al titolo. */
export function Corpo({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mt-4 text-[15px] leading-[1.5] tracking-[-0.3px] whitespace-pre-line text-ink">
      {children}
    </p>
  )
}

/** La riga piccola e grigia, quella che smorza. */
export function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[14px] leading-[1.5] tracking-[-0.28px] whitespace-pre-line text-ink-soft">
      {children}
    </p>
  )
}

/**
 * La scheda bianca con l'ombra dura sotto.
 *
 * L'ombra non è sfocata: è una seconda scheda identica spostata di 6px, come
 * sul bottone principale. È la firma del disegno, e con una `box-shadow`
 * morbida non viene uguale.
 */
export function Scheda({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-[24px] bg-black/4" />
      <div className="relative rounded-[24px] border-[1.5px] border-line bg-surface">{children}</div>
    </div>
  )
}
