import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { IN_ANTEPRIMA } from './sviluppo'
import { SEZIONI, predefinitoDi } from '../data/sezioni'
import type { StatoSezione } from '../data/sezioni'

/**
 * Quali sezioni dell'app sono accese.
 *
 * Stessa forma delle scritte, e per lo stesso motivo: il codice dice com'e'
 * l'app di partenza, il database tiene solo cio' che qualcuno ha cambiato
 * dopo, e una copia locale fa in modo che il primo disegno non aspetti la
 * rete. Senza database, senza rete, o al primo avvio, vale `data/sezioni.ts`.
 *
 * ── PERCHE' QUI NON C'E' LA BOZZA ──────────────────────────────────────────
 * Le scritte hanno due colonne — bozza e pubblicato — perche' un refuso
 * salvato per sbaglio non deve arrivare sullo schermo di una ragazza di
 * dodici anni. Spegnere una sezione e' un'altra cosa: e' una decisione, non
 * una frase, e quando la si prende la si vuole subito. Una bozza di "il
 * percorso e' spento" non vuol dire niente.
 */
export type Stati = Record<string, StatoSezione>

const CHIAVE_CACHE = 'bab.sezioni'

function dallaCache(): Stati {
  try {
    const grezzo = localStorage.getItem(CHIAVE_CACHE)
    if (!grezzo) return {}
    const letto = JSON.parse(grezzo) as Stati
    return letto && typeof letto === 'object' ? letto : {}
  } catch {
    return {}
  }
}

let cambiati: Stati = dallaCache()
const ascoltatori = new Set<() => void>()

function annuncia() {
  for (const f of ascoltatori) f()
}

function adesso(): Stati {
  return cambiati
}

/** Tutti gli stati: il codice, con sopra quello che il database ha cambiato. */
export function statiDiAdesso(): Stati {
  const fuori: Stati = {}
  for (const s of SEZIONI) fuori[s.id] = cambiati[s.id] ?? s.predefinito
  return fuori
}

/**
 * La sezione che l'anteprima vuole vedere spenta.
 *
 * Dentro alla cornice le sezioni sono tutte aperte, se no la prima cosa che si
 * fa spegnendone una e' non poter piu' correggere le sue parole. Ma allora lo
 * schermo "arriva presto" non si vedrebbe mai — e anche quello ha delle parole
 * da correggere. `?arrivo=percorso` chiede proprio quello schermo li'.
 */
const ARRIVO =
  typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('arrivo')

/**
 * Com'e' messa una sezione, adesso.
 *
 * Dentro alla cornice dell'anteprima sono tutte aperte: chi scrive i testi
 * deve poter aprire lo schermo di una lezione anche mentre quella sezione e'
 * spenta per le atlete — se no la prima cosa che fa spegnendola e' non poter
 * piu' correggere le sue parole.
 */
export function useStatoSezione(id: string): StatoSezione {
  const stati = useSyncExternalStore(
    (f) => {
      ascoltatori.add(f)
      return () => ascoltatori.delete(f)
    },
    adesso,
    () => ({}) as Stati,
  )
  if (IN_ANTEPRIMA) return id === ARRIVO ? 'in-arrivo' : 'aperta'
  return stati[id] ?? predefinitoDi(id)
}

/** Legge dal database quali sezioni sono state accese o spente. */
export async function caricaSezioni(): Promise<void> {
  if (!supabase) return
  const { data, error } = await supabase.from('app_sections').select('id,stato')
  if (error || !data) return

  const nuovi: Stati = {}
  for (const r of data as { id: string; stato: string }[]) {
    if (r.stato === 'aperta' || r.stato === 'in-arrivo' || r.stato === 'nascosta') {
      nuovi[r.id] = r.stato
    }
  }
  cambiati = nuovi
  try {
    localStorage.setItem(CHIAVE_CACHE, JSON.stringify(nuovi))
  } catch {
    /* niente spazio: al prossimo avvio si riparte dal codice, e va bene */
  }
  annuncia()
}

/**
 * Cambia lo stato di una sezione. Lo puo' fare solo un admin, e a dirlo e' il
 * database: qui si scrive, e se le regole rifiutano torna l'errore.
 */
export async function cambiaSezione(id: string, stato: StatoSezione): Promise<string | null> {
  if (!supabase) return 'nessun database'
  const { error } = await supabase
    .from('app_sections')
    .upsert({ id, stato, aggiornato: new Date().toISOString() }, { onConflict: 'id' })
  if (error) return error.message
  cambiati = { ...cambiati, [id]: stato }
  try {
    localStorage.setItem(CHIAVE_CACHE, JSON.stringify(cambiati))
  } catch {
    /* come sopra */
  }
  annuncia()
  return null
}
