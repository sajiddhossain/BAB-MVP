import { useCallback, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { LEZIONI } from '../data/percorso'
import type { Parola } from '../data/sessione'

/**
 * A che punto e' del percorso.
 *
 * Stessa forma della giornata: dal database, con una copia nel telefono. La
 * copia perche' la mappa e' uno schermo che si apre e non puo' restare bianca
 * ad aspettare la rete; il database perche' otto lezioni sono settimane di
 * lavoro, e perderle cambiando telefono sarebbe la cosa peggiore che l'app
 * possa fare a un'atleta.
 *
 * ── UNA LEZIONE E' FINITA O NON E' MAI ESISTITA ────────────────────────────
 * Non si tiene traccia di quelle cominciate. Una lezione dura tre minuti:
 * riprenderla a meta' vorrebbe dire ricordarsi a quale esercizio era, per
 * risparmiarle novanta secondi. Non vale la complicazione, e nemmeno il
 * rischio di rimetterla dentro a un esercizio che non ricorda piu'.
 */
export type Progresso = {
  /** i numeri delle lezioni finite */
  fatte: number[]
}

const VUOTO: Progresso = { fatte: [] }
const CHIAVE = 'bab.percorso'

function dallaCopia(): Progresso {
  try {
    const p = JSON.parse(localStorage.getItem(CHIAVE) ?? 'null') as Progresso | null
    if (!p || !Array.isArray(p.fatte)) return VUOTO
    return { fatte: p.fatte.filter((n) => typeof n === 'number') }
  } catch {
    return VUOTO
  }
}

let stato = dallaCopia()
const ascoltatori = new Set<() => void>()

function iscrivi(f: () => void) {
  ascoltatori.add(f)
  return () => void ascoltatori.delete(f)
}

function scrivi(p: Progresso) {
  stato = p
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(p))
  } catch {
    // spazio finito: al prossimo avvio torna dal database
  }
  ascoltatori.forEach((f) => f())
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(
    iscrivi,
    useCallback(() => stato, []),
  )
}

export function progressoOra(): Progresso {
  return stato
}

/** Legge dal database quali lezioni ha gia' finito. */
export async function caricaProgresso(): Promise<void> {
  if (!supabase) return
  const { data: sessione } = await supabase.auth.getSession()
  const atleta = sessione.session?.user.id
  if (!atleta) return

  const { data, error } = await supabase
    .from('body_language_progress')
    .select('lesson')
    .eq('athlete_id', atleta)
  if (error || !data) return

  scrivi({ fatte: (data as { lesson: number }[]).map((r) => r.lesson).sort((a, b) => a - b) })
}

/**
 * Segna una lezione come finita.
 *
 * Si scrive prima nel telefono e poi nel database, al contrario di come fa il
 * check-in. La ragione e' che qui non c'e' niente da perdere: la lezione l'ha
 * fatta, e se il database non risponde la si riscrive al prossimo giro
 * (`upsert` sulla chiave, quindi rifarlo non fa danno). Un check-in invece
 * porta dati che esistono solo li', e per quelli si aspetta la conferma.
 */
export async function finisciLezione(numero: number): Promise<void> {
  if (!stato.fatte.includes(numero)) {
    scrivi({ fatte: [...stato.fatte, numero].sort((a, b) => a - b) })
  }
  if (!supabase) return
  const { data: sessione } = await supabase.auth.getSession()
  const atleta = sessione.session?.user.id
  if (!atleta) return
  await supabase
    .from('body_language_progress')
    .upsert({ athlete_id: atleta, lesson: numero }, { onConflict: 'athlete_id,lesson' })
}

/* ── cosa e' aperto e cosa no ─────────────────────────────────────────────── */

/**
 * Una lezione si apre quando quella prima e' finita.
 *
 * La prima e' sempre aperta. Non e' una serratura contro nessuno: e' che le
 * parole della quinta lezione parlano di dolore acuto, e per capirle serve
 * gia' sapere cosa vuol dire "il corpo sta lavorando" — che e' la prima.
 */
export function lezioneAperta(numero: number, p: Progresso = stato): boolean {
  if (numero <= 1) return true
  return p.fatte.includes(numero - 1)
}

/** La prossima da fare: la piu' bassa che non e' ancora finita. */
export function prossimaLezione(p: Progresso = stato): number | null {
  const da = LEZIONI.find((l) => !p.fatte.includes(l.numero))
  return da?.numero ?? null
}

/**
 * Le parole gia' sbloccate.
 *
 * Sono quelle delle lezioni finite: due per lezione. Il disegno del percorso
 * dice che ogni parola sbloccata si aggiunge al check-in — chi lo legge da
 * qui decide cosa farne.
 */
export function paroleSbloccate(p: Progresso = stato): Parola[] {
  return LEZIONI.filter((l) => p.fatte.includes(l.numero)).flatMap((l) => l.parole)
}

/** Un'unita' e' aperta se lo e' la sua prima lezione. */
export function unitaAperta(lezioni: [number, number], p: Progresso = stato): boolean {
  return lezioneAperta(lezioni[0], p)
}
