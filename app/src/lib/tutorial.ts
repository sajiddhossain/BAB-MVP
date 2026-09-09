import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { battitoValido } from '../data/tutorial'
import type { Banda } from '../data/tutorial'

/**
 * Quello che il tutorial si porta dietro da uno schermo all'altro.
 *
 * Due cose sole: la banda che ha indovinato, e i battiti al minuto che ha
 * contato. Servono allo schermo del confronto, che è l'unico che le legge
 * tutt'e due.
 *
 * Si tengono anche in `localStorage` perché il tutorial ha sette schermi e
 * una ricarica in mezzo — la pagina che si aggiorna, il telefono che scarica
 * la scheda — non deve far ricominciare il minigioco da capo. Si buttano via
 * quando il tutorial finisce: da lì in poi il numero che conta sta nel
 * database, e questa copia sarebbe solo una cosa vecchia in giro.
 */
export type Stato = { ipotesi: Banda | null; bpm: number | null }

const CHIAVE = 'bab.tutorial'
const VUOTO: Stato = { ipotesi: null, bpm: null }

function dallaCache(): Stato {
  try {
    const grezzo = localStorage.getItem(CHIAVE)
    if (!grezzo) return VUOTO
    const letto = JSON.parse(grezzo) as Stato
    return { ipotesi: letto.ipotesi ?? null, bpm: letto.bpm ?? null }
  } catch {
    return VUOTO
  }
}

let stato: Stato = dallaCache()
const ascoltatori = new Set<() => void>()

function annuncia() {
  for (const f of ascoltatori) f()
}

function salva() {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(stato))
  } catch {
    /* niente spazio: si perde solo il filo del minigioco, non un dato */
  }
  annuncia()
}

export function useTutorial(): Stato {
  return useSyncExternalStore(
    (f) => {
      ascoltatori.add(f)
      return () => ascoltatori.delete(f)
    },
    () => stato,
    () => VUOTO,
  )
}

export function scriviIpotesi(ipotesi: Banda) {
  stato = { ...stato, ipotesi }
  salva()
}

export function scriviBattito(bpm: number) {
  stato = { ...stato, bpm }
  salva()
}

export function dimenticaTutorial() {
  stato = VUOTO
  try {
    localStorage.removeItem(CHIAVE)
  } catch {
    /* come sopra */
  }
  annuncia()
}

/**
 * «L'ho finito», e con lui il primo battito contato.
 *
 * Le due cose vanno insieme in una scrittura sola perché sono la stessa cosa
 * — la fine del tutorial — e perché due chiamate vorrebbero dire poterne
 * perdere una per strada e non sapere quale.
 *
 * Il battito si scrive solo se sta in piedi: `battitoValido` tiene fuori il
 * dito che tocca a caso e la ragazza che si è distratta. Se non sta in piedi
 * il tutorial risulta finito lo stesso — averlo fatto è una cosa, aver
 * contato bene è un'altra, e la prima non dipende dalla seconda.
 *
 * Torna l'errore come stringa, o null se è andata. Chi chiama decide: qui non
 * si blocca nessuna in un tutorial che non riesce a salvare.
 */
export async function finisciTutorial(bpm: number | null): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const chi = data.session?.user.id
  if (!chi) return 'nessuna sessione'

  const riga: { tutorial_done: string; first_bpm?: number } = {
    tutorial_done: new Date().toISOString(),
  }
  if (bpm !== null && battitoValido(bpm)) riga.first_bpm = bpm

  const { error } = await supabase.from('athletes').update(riga).eq('id', chi)
  if (error) return error.message
  return null
}
