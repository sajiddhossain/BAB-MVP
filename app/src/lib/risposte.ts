import { useCallback, useSyncExternalStore } from 'react'

/** Tutto quello che l'onboarding raccoglie. Una cosa sola, non uno stato per schermo. */
export type Risposte = {
  email: string
  nome: string
  nascita: string
  sport: string[]
  sportPrincipale: string
  /** per ogni sport: i giorni (0 = lunedi') e la fascia oraria (indice di `fasce`) */
  allenamenti: Record<string, { giorni: number[]; fascia: number }>
  edFisica: number[]
  prossimaGara: string
  ciclo: '' | 'si' | 'non-ancora' | 'preferisco-non-dirlo'
  cicliUltimi: [string, string, string]
  primoCicloMese: number | null
  primoCicloAnno: number | null
  contraccettivo: '' | 'si' | 'no'
  consensi: [boolean, boolean]
  indovinato: '' | 'lento' | 'medio' | 'veloce'
  bpm: number | null
}

export const VUOTE: Risposte = {
  email: '',
  nome: '',
  nascita: '',
  sport: [],
  sportPrincipale: '',
  allenamenti: {},
  edFisica: [],
  prossimaGara: '',
  ciclo: '',
  cicliUltimi: ['', '', ''],
  primoCicloMese: null,
  primoCicloAnno: null,
  contraccettivo: '',
  consensi: [false, false],
  indovinato: '',
  bpm: null,
}

/*
 * Un magazzino a modulo invece che un context: le risposte le leggono e le
 * scrivono schermi diversi in momenti diversi, e cosi' chi legge solo un campo
 * non si ridisegna quando ne cambia un altro.
 *
 * Salvate mentre si scrive: chiudere la app a meta' onboarding e riaprirla non
 * deve far ricominciare da capo.
 */
const CHIAVE = 'bab.risposte'

function leggi(): Risposte {
  try {
    const grezzo = localStorage.getItem(CHIAVE)
    if (!grezzo) return VUOTE
    return { ...VUOTE, ...(JSON.parse(grezzo) as Partial<Risposte>) }
  } catch {
    return VUOTE
  }
}

let stato = leggi()
const ascoltatori = new Set<() => void>()

function iscrivi(f: () => void) {
  ascoltatori.add(f)
  return () => void ascoltatori.delete(f)
}

/**
 * Cambia uno o piu' campi. Il resto resta com'era.
 *
 * Si puo' passare anche una funzione, e allora riceve le risposte di adesso.
 * Serve quando il campo nuovo si calcola da quello vecchio: due tocchi vicini
 * finiscono nello stesso giro di React, e il secondo leggerebbe il valore di
 * prima del primo — cancellandolo.
 */
export function scrivi(campi: Partial<Risposte> | ((r: Risposte) => Partial<Risposte>)) {
  stato = { ...stato, ...(typeof campi === 'function' ? campi(stato) : campi) }
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(stato))
  } catch {
    // spazio finito o navigazione privata: l'onboarding funziona lo stesso,
    // solo non sopravvive alla chiusura
  }
  ascoltatori.forEach((f) => f())
}

export function azzera() {
  localStorage.removeItem(CHIAVE)
  stato = VUOTE
  ascoltatori.forEach((f) => f())
}

export function tutte(): Risposte {
  return stato
}

/** Legge un campo solo: `const nome = useRisposta('nome')`. */
export function useRisposta<K extends keyof Risposte>(chiave: K): Risposte[K] {
  return useSyncExternalStore(
    iscrivi,
    useCallback(() => stato[chiave], [chiave]),
  )
}

/** Legge tutto. Serve al riepilogo e alle domande che dipendono dalle altre. */
export function useRisposte(): Risposte {
  return useSyncExternalStore(iscrivi, tutte)
}
