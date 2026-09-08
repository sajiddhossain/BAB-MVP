import { useCallback, useSyncExternalStore } from 'react'
import type { StatoGiornata, Tempo } from '../data/casa'
import { tutte } from './risposte'

/**
 * Com'e' messa la giornata di oggi.
 *
 * Il check-in e il check-out veri non ci sono ancora: qui si tiene solo il
 * fatto che siano stati fatti o no, in modo che la home cambi davvero invece
 * di mostrare uno stato deciso a mano. Quando arriveranno gli schermi del
 * check-in, questo file diventa la loro scrittura e la home non si tocca.
 */
export type Giornata = {
  data: string
  fattoCheckin: boolean
  fattoCheckout: boolean
  /** il tempo che aveva indovinato al check-in */
  previsto: Tempo | null
  /** il tempo che ha sentito al check-out */
  sentito: Tempo | null
  /** la frase che riassume la giornata, scritta dal check-out */
  riassunto: string
  /** vero quando lo stesso punto e lo stesso gesto tornano piu' di una volta */
  segnalata: boolean
  streak: number
}

function oggi(): string {
  return new Date().toISOString().slice(0, 10)
}

const VUOTA: Giornata = {
  data: oggi(),
  fattoCheckin: false,
  fattoCheckout: false,
  previsto: null,
  sentito: null,
  riassunto: '',
  segnalata: false,
  streak: 0,
}

const CHIAVE = 'bab.giornata'

function leggi(): Giornata {
  try {
    const g = JSON.parse(localStorage.getItem(CHIAVE) ?? 'null') as Giornata | null
    // una giornata di ieri non e' la giornata di oggi: si riparte da capo,
    // tranne la striscia, che e' proprio la cosa che attraversa i giorni
    if (!g || g.data !== oggi()) return { ...VUOTA, streak: g?.streak ?? 0 }
    return { ...VUOTA, ...g }
  } catch {
    return VUOTA
  }
}

let stato = leggi()
const ascoltatori = new Set<() => void>()

function iscrivi(f: () => void) {
  ascoltatori.add(f)
  return () => void ascoltatori.delete(f)
}

export function segna(campi: Partial<Giornata>) {
  stato = { ...stato, ...campi, data: oggi() }
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(stato))
  } catch {
    // spazio finito: la home funziona lo stesso, si riparte da zero domani
  }
  ascoltatori.forEach((f) => f())
}

export function useGiornata(): Giornata {
  return useSyncExternalStore(
    iscrivi,
    useCallback(() => stato, []),
  )
}

/**
 * Se oggi c'e' allenamento, e a che ora.
 *
 * Guarda gli allenamenti e l'educazione fisica messi nell'onboarding. I
 * giorni li' sono indicizzati da lunedi' = 0, mentre `getDay()` mette
 * domenica a 0: da qui il giro dei sette.
 */
export function allenamentoDiOggi(quando = new Date()): { ce: boolean; ora: string } {
  const giorno = (quando.getDay() + 6) % 7
  const r = tutte()

  const seAllena = Object.values(r.allenamenti).some((a) => a.giorni.includes(giorno))
  const sePalestra = r.edFisica.includes(giorno)
  if (!seAllena && !sePalestra) return { ce: false, ora: '' }

  // la fascia scelta nell'onboarding non e' un orario: e' mattina, pomeriggio
  // o sera. Finche' non chiediamo l'ora vera, questa e' l'ora al centro della
  // fascia — si vede sull'etichetta, quindi va detto che e' una nostra scelta
  const fascia = Object.values(r.allenamenti).find((a) => a.giorni.includes(giorno))?.fascia ?? 1
  return { ce: true, ora: ['08:00', '17:30', '20:00'][fascia] ?? '17:30' }
}

/** Lo stato in cui e' la giornata di oggi, viste le risposte e cosa ha fatto. */
export function statoDiOggi(g: Giornata, quando = new Date()): StatoGiornata {
  if (!allenamentoDiOggi(quando).ce) return 'riposo'
  if (!g.fattoCheckin) return 'checkin'
  if (!g.fattoCheckout) return 'checkout'
  return 'fatto'
}
