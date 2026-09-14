import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'

/**
 * Le impostazioni che il pannello cambia al volo: gli orari di check-in e
 * check-out, e le eccezioni di una singola atleta.
 *
 * Stessa forma delle sezioni: il codice dice com'e' l'app di partenza
 * (`ORARI_DI_PARTENZA`), il database tiene solo quello che qualcuno ha
 * cambiato, e una copia locale fa in modo che la home non aspetti la rete per
 * sapere se il check-in e' aperto. Senza database, senza rete o al primo
 * avvio, valgono i numeri di partenza — che sono quelli di prima.
 *
 * ── DUE LIVELLI ────────────────────────────────────────────────────────────
 * `orari` vale per tutte. `mie` sono le eccezioni di chi e' collegata: un
 * numero nullo vuol dire «come tutte». Chi vince lo decide `finestre.ts`, in
 * un posto solo.
 *
 * ── L'ACCOUNT DI PROVA ─────────────────────────────────────────────────────
 * `mie.prova`: check-in e check-out sempre aperti e rifattibili. Lo accende
 * solo un admin, e il database non lascia a nessun altro scriverlo.
 */

export type Orario = { apre: string; chiude: string; ultimo: string }

export type Orari = {
  /** minuti prima dell'allenamento in cui apre il check-in */
  prima: number
  /** minuti dopo la fine dell'allenamento in cui resta aperto il check-out */
  dopo: number
  /** minuti in cui si puo' ancora recuperare, dopo che il momento e' passato */
  ritardo: number
  /** le finestre dei giorni senza orari, come ore sull'orologio */
  fisse: { checkin: Orario; checkout: Orario }
}

export type Mie = {
  prova: boolean
  prima: number | null
  dopo: number | null
  ritardo: number | null
}

export const ORARI_DI_PARTENZA: Orari = {
  prima: 30,
  dopo: 30,
  ritardo: 0,
  fisse: {
    checkin: { apre: '05:00', chiude: '12:00', ultimo: '15:30' },
    checkout: { apre: '15:30', chiude: '23:30', ultimo: '04:00' },
  },
}

export const NESSUNA_ECCEZIONE: Mie = { prova: false, prima: null, dopo: null, ritardo: null }

/** quattro ore: oltre, un check-in non sta piu' attaccato al suo allenamento */
export const MINUTI_MAX = 240

const ORA = /^([01]\d|2[0-3]):[0-5]\d$/

function minuti(v: unknown, riserva: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(MINUTI_MAX, Math.round(v))) : riserva
}
function minutiONull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(MINUTI_MAX, Math.round(v))) : null
}
function ora(v: unknown, riserva: string): string {
  return typeof v === 'string' && ORA.test(v) ? v : riserva
}
function oggetto(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

/**
 * Qualunque cosa arrivi dal database o dalla copia locale, torna degli orari
 * validi. Un campo che manca o non si legge prende il valore di partenza:
 * un JSON scritto male non deve chiudere il check-in a tutte.
 */
export function pulisciOrari(grezzo: unknown): Orari {
  const g = oggetto(grezzo)
  const f = oggetto(g.fisse)
  const finestra = (k: 'checkin' | 'checkout'): Orario => {
    const x = oggetto(f[k])
    const d = ORARI_DI_PARTENZA.fisse[k]
    return { apre: ora(x.apre, d.apre), chiude: ora(x.chiude, d.chiude), ultimo: ora(x.ultimo, d.ultimo) }
  }
  return {
    prima: minuti(g.prima, ORARI_DI_PARTENZA.prima),
    dopo: minuti(g.dopo, ORARI_DI_PARTENZA.dopo),
    ritardo: minuti(g.ritardo, ORARI_DI_PARTENZA.ritardo),
    fisse: { checkin: finestra('checkin'), checkout: finestra('checkout') },
  }
}

/** una riga di `athlete_settings` nella forma dell'app */
export function mieDaRiga(riga: unknown): Mie {
  const r = oggetto(riga)
  return {
    prova: r.is_test === true,
    prima: minutiONull(r.checkin_before),
    dopo: minutiONull(r.checkout_after),
    ritardo: minutiONull(r.late_minutes),
  }
}

function pulisciMie(grezzo: unknown): Mie {
  const m = oggetto(grezzo)
  return { prova: m.prova === true, prima: minutiONull(m.prima), dopo: minutiONull(m.dopo), ritardo: minutiONull(m.ritardo) }
}

/**
 * Un'ora dell'orologio contata dall'inizio del giorno dell'atleta, che e'
 * alle quattro del mattino (vedi `finestre.ts`): `05:00` e' 60, `04:00` e' 0.
 */
export function minutiDalRisveglio(orologio: string): number {
  const [h, m] = orologio.split(':').map(Number)
  return (h * 60 + m - 240 + 1440) % 1440
}

/* ── la copia di chi e' collegata ─────────────────────────────────────────── */

type Stato = { orari: Orari; mie: Mie }

const CHIAVE = 'bab.impostazioni'

function dallaCache(): Stato {
  try {
    const grezzo = localStorage.getItem(CHIAVE)
    if (grezzo) {
      const g = oggetto(JSON.parse(grezzo))
      return { orari: pulisciOrari(g.orari), mie: pulisciMie(g.mie) }
    }
  } catch {
    // copia rovinata o memoria del browser spenta: si riparte dal codice
  }
  return { orari: ORARI_DI_PARTENZA, mie: NESSUNA_ECCEZIONE }
}

let stato: Stato = dallaCache()
const ascoltatori = new Set<() => void>()

function metti(nuovo: Stato) {
  stato = nuovo
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(nuovo))
  } catch {
    // resta in memoria fino alla prossima apertura
  }
  for (const f of ascoltatori) f()
}

export function impostazioniDiAdesso(): Stato {
  return stato
}

/** per ridisegnare la home quando le impostazioni arrivano dal database */
export function useImpostazioni(): Stato {
  return useSyncExternalStore(
    (f) => {
      ascoltatori.add(f)
      return () => ascoltatori.delete(f)
    },
    () => stato,
    () => stato,
  )
}

/**
 * Rilegge dal database gli orari di tutte e le eccezioni di chi e' collegata.
 *
 * Una tabella che non c'e' (migrazione non lanciata) o una rete che non
 * risponde non cambiano niente: resta quello che c'era. Senza sessione le
 * eccezioni si azzerano — un account di prova non deve restare acceso sul
 * telefono dopo che quella persona e' uscita.
 */
export async function caricaImpostazioni(): Promise<void> {
  if (!supabase) return
  const { data: sessione } = await supabase.auth.getSession()
  const id = sessione.session?.user.id

  const [o, m] = await Promise.all([
    supabase.from('app_settings').select('value').eq('id', 'orari').maybeSingle(),
    id
      ? supabase
          .from('athlete_settings')
          .select('is_test,checkin_before,checkout_after,late_minutes')
          .eq('athlete_id', id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  metti({
    orari: o.error ? stato.orari : pulisciOrari(o.data?.value),
    mie: !id ? NESSUNA_ECCEZIONE : m.error ? stato.mie : mieDaRiga(m.data),
  })
}
