import { GRUPPI } from '../../data/schermi'
import type { SchermoScritte } from '../../data/schermi'
import type { Valore } from '../../lib/scritte'

/** Per confrontare due valori senza pensare se sono stringhe o liste. */
export function testo(v: Valore | null): string {
  if (v === null || v === undefined) return ''
  return Array.isArray(v) ? v.join('\n') : v
}

/**
 * Su quale schermo si legge questa scritta.
 *
 * Serve al cassetto delle bozze: «hai cambiato questa frase» non vuol dire
 * niente senza «e si legge qui». Se una scritta sta su piu' schermi — i tre
 * ritmi, per esempio, che sono gli stessi nel check-in, nel check-out e nel
 * tutorial — vince il primo, che e' anche il primo in cui la si incontra
 * usando l'app.
 */
export function schermoDi(chiave: string): SchermoScritte | null {
  for (const g of GRUPPI) {
    for (const s of g.schermi) {
      if (s.rami.some((r) => chiave === r || chiave.startsWith(`${r}.`))) return s
    }
  }
  return null
}

/** Il gruppo a cui appartiene uno schermo: «Home», «Check-in»… */
export function gruppoDi(schermo: SchermoScritte | null): string {
  if (!schermo) return ''
  return GRUPPI.find((g) => g.schermi.some((s) => s.id === schermo.id))?.nome ?? ''
}

/**
 * Le parole con cui si cerca uno schermo nell'elenco a sinistra.
 *
 * Nome dello schermo e nome del gruppo insieme: chi cerca «check-out» deve
 * trovare tutti i suoi schermi, anche quelli che nel nome hanno solo «Il
 * ritmo».
 */
export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}
