import { createContext, createElement, useContext, type ReactNode } from 'react'
import { it } from './it'
import { en } from './en'

/**
 * Il tipo lo detta l'italiano: `it` è la fonte di verità della forma.
 * `en` deve conformarsi, quindi una chiave mancante è un errore di
 * compilazione — la garanzia più economica che esista contro le stringhe
 * dimenticate in una lingua.
 */
export type Copy = typeof it

export const LOCALES = { it, en } satisfies Record<string, Copy>
export type Locale = keyof typeof LOCALES

/** Si spedisce una lingua sola; l'architettura resta pronta per le altre. */
export const DEFAULT_LOCALE: Locale = 'it'

const CopyContext = createContext<Copy>(it)
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)
/** Cambiare lingua. Fuori dal provider non fa niente: nessuno deve rompersi. */
const SetLocaleContext = createContext<(l: Locale) => void>(() => {})

export function CopyProvider(
  { locale, onLocale, children }:
  { locale: Locale; onLocale?: (l: Locale) => void; children: ReactNode },
) {
  return createElement(
    SetLocaleContext.Provider,
    { value: onLocale ?? (() => {}) },
    createElement(
      LocaleContext.Provider,
      { value: locale },
      createElement(CopyContext.Provider, { value: LOCALES[locale] }, children),
    ),
  )
}

export function useCopy(): Copy {
  return useContext(CopyContext)
}

/**
 * La lingua corrente, non i testi.
 *
 * Serve perché il copy dell'interfaccia e i CONTENUTI stanno in posti diversi:
 * `content/bodymap.ts`, `lexicon.ts` e `tempo.ts` tengono un codice stabile più
 * le etichette per lingua, e per leggerne una serve sapere quale. Senza questo,
 * ogni componente finirebbe per scrivere `'it'` a mano — che è esattamente il
 * modo in cui una seconda lingua smette di funzionare senza che nessuno se ne
 * accorga.
 */
export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** Il solo modo di cambiare lingua: la schermata dei dati. */
export function useSetLocale(): (l: Locale) => void {
  return useContext(SetLocaleContext)
}

/**
 * Interpolazione minima: `fill(t.checkin.days, { n: 3 })`.
 * Volutamente povera — se una stringa ha bisogno di più di questo, quasi sempre
 * il problema è la stringa.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, k: string) =>
    k in vars ? String(vars[k]) : whole,
  )
}

/**
 * Singolare e plurale: due stringhe intere, non una regola.
 *
 * «1 cose non sono ancora partite» è il genere di sciatteria che, a una
 * ragazzina, dice che l'app è fatta male — e da lì in poi si fida meno anche
 * di quello che le dice sul suo corpo. Due frasi separate perché l'accordo
 * cambia da lingua a lingua (in italiano si porta dietro verbo e participio),
 * e una regola sola non ce la può fare.
 */
export function plural(n: number, one: string, other: string): string {
  return fill(n === 1 ? one : other, { n })
}
