import { useSyncExternalStore } from 'react'

/**
 * Store minimo condiviso fra gli schermi.
 *
 * Serve perche' lo stato deve sopravvivere alla navigazione: se torni indietro
 * la tua scelta e' ancora li'. Sta fuori da React apposta — i componenti restano
 * renderizzabili senza provider, cosi' il diff contro Figma continua a funzionare
 * (nessuno tocca lo store, quindi ogni campo cade sul suo default = stato Figma).
 */
const store = new Map<string, unknown>()
const listeners = new Set<() => void>()

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

/** Sonda per i test: leggere lo stato dallo screenshot era fragile. */
;(globalThis as { __babState?: () => Record<string, unknown> }).__babState = () =>
  Object.fromEntries(store)

export function setField(key: string, value: unknown) {
  store.set(key, value)
  listeners.forEach((l) => l())
}

export function resetFields() {
  store.clear()
  listeners.forEach((l) => l())
}

/**
 * `initial` DEVE essere un riferimento stabile per array e oggetti (una costante
 * di modulo), altrimenti getSnapshot ne restituisce uno nuovo a ogni chiamata e
 * React entra in loop.
 */
export function useField<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => (store.has(key) ? (store.get(key) as T) : initial),
    () => initial,
  )
  const set = (v: T) => setField(key, v)
  return [value, set] as const
}

/** Aggiunge o toglie un elemento da una selezione multipla. */
export function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
