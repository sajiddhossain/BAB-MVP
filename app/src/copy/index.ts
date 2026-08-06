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

export function CopyProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return createElement(CopyContext.Provider, { value: LOCALES[locale] }, children)
}

export function useCopy(): Copy {
  return useContext(CopyContext)
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
