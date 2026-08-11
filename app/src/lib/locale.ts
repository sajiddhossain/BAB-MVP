import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/copy'

/**
 * Quale lingua parla l'app.
 *
 * R9 dice italiano E inglese, quindi la scelta deve esistere davvero e non
 * essere una costante nel main.
 *
 * 🔴 Sta in `localStorage`, non in IndexedDB, ed è l'unica cosa in tutto il
 * prodotto che ci sta. Motivo: non è un dato, è una preferenza
 * dell'interfaccia. Se sparisce non si perde niente — l'app riparte in
 * italiano e lei ritocca un bottone — mentre metterla nell'archivio la
 * legherebbe all'idratazione, e vorrebbe dire mostrare la schermata di attesa
 * nella lingua sbagliata proprio a chi ha scelto l'altra.
 *
 * Viaggia comunque con lei: la stessa scelta finisce anche in
 * `athletes.locale`, quindi su un telefono nuovo si ritrova (vedi `adopt`).
 */

const KEY = 'bab.locale'

const isLocale = (v: unknown): v is Locale =>
  typeof v === 'string' && v in LOCALES

export function readLocale(): Locale {
  try {
    const v = localStorage.getItem(KEY)
    if (isLocale(v)) return v
  } catch { /* storage negato: si parte dal default */ }
  return DEFAULT_LOCALE
}

export function writeLocale(l: Locale): void {
  try { localStorage.setItem(KEY, l) } catch { /* pazienza, vale per questa sessione */ }
}

/** Vero se su questo dispositivo non ha mai scelto: si può adottare la sua. */
export function hasChosen(): boolean {
  try { return isLocale(localStorage.getItem(KEY)) } catch { return false }
}

/**
 * Adotta la lingua del profilo appena arrivata dal server, ma SOLO se su
 * questo dispositivo non è mai stata scelta.
 *
 * L'ordine conta: se sovrascrivesse sempre, un'atleta che passa a inglese sul
 * tablet se lo vedrebbe tornare italiano a ogni idratazione, e non capirebbe
 * perché.
 */
export function adopt(profileLocale: unknown): Locale | null {
  if (hasChosen() || !isLocale(profileLocale)) return null
  writeLocale(profileLocale)
  return profileLocale
}
