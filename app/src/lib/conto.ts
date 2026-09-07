import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Risposte } from './risposte'
import type { Lingua } from './lingua'

/**
 * L'accesso e il salvataggio dell'onboarding.
 *
 * Senza le chiavi in .env `supabase` e' null: l'app continua a funzionare
 * tutta, solo che le risposte restano nel telefono e l'accesso non chiede
 * niente a nessuno. Serve a poter provare il percorso senza un progetto
 * Supabase acceso, e a non far esplodere niente se le chiavi mancano in
 * produzione — se ne accorge chi guarda, non l'utente.
 */
export const acceso = supabase !== null

/** La versione del testo dei consensi che si sta accettando. */
const VERSIONE_CONSENSI = '2026-09-draft'

export type Esito = { ok: true } | { ok: false; errore: string }

/** Manda la mail con il link e il codice a sei cifre. */
export async function mandaLink(email: string): Promise<Esito> {
  if (!supabase) return { ok: true }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: `${location.origin}/onboarding/intro` },
  })
  return error ? { ok: false, errore: error.message } : { ok: true }
}

/** Controlla il codice a sei cifre. Apre la sessione se e' giusto. */
export async function verificaCodice(email: string, codice: string): Promise<Esito> {
  if (!supabase) return { ok: true }
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: codice,
    type: 'email',
  })
  return error ? { ok: false, errore: error.message } : { ok: true }
}

export async function esci() {
  await supabase?.auth.signOut()
}

/** La sessione di adesso, e null finche' non si sa. */
export function useSessione(): { sessione: Session | null; caricata: boolean } {
  const [sessione, setSessione] = useState<Session | null>(null)
  const [caricata, setCaricata] = useState(!acceso)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSessione(data.session)
      setCaricata(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessione(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return { sessione, caricata }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dalle risposte alle righe.
 * ───────────────────────────────────────────────────────────────────────── */

/** "14/03/2011" -> "2011-03-14". Null se non e' una data. */
function isoDaData(v: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim())
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

const STATO_CICLO = {
  si: 'tracking',
  'non-ancora': 'not_yet',
  'preferisco-non-dirlo': 'undisclosed',
  '': 'undisclosed',
} as const

const CONTRACCEZIONE = {
  si: 'hormonal',
  // il disegno offre solo si'/no: un "no" qui vuol dire "niente ormoni",
  // che nello schema e' 'natural'. Chi non risponde resta 'undisclosed'.
  no: 'natural',
  '': 'undisclosed',
} as const

/**
 * Quanti anni aveva al primo ciclo.
 *
 * Non lo chiediamo piu' — 13-cycle-age e' uscito dal percorso — ma lo schema
 * ha la colonna e il dato si ricava: e' la distanza fra la nascita e il mese
 * che ha indicato. Se manca uno dei due, resta null.
 */
export function etaAlPrimoCiclo(r: Risposte): number | null {
  const nascita = isoDaData(r.nascita)
  if (!nascita || r.primoCicloAnno === null) return null
  const n = new Date(nascita)
  const mese = r.primoCicloMese ?? 6
  let anni = r.primoCicloAnno - n.getFullYear()
  if (mese < n.getMonth()) anni -= 1
  return anni >= 6 && anni <= 20 ? anni : null
}

/**
 * Scrive l'onboarding nel database.
 *
 * Cinque tabelle in fila, non una transazione: il client Supabase non ne ha.
 * Il primo insert e' l'unico che puo' fallire per davvero (i vincoli sono
 * tutti su `athletes`); gli altri sono figli suoi e, se uno non passa, la
 * riga dell'atleta resta e si puo' rifare — sono tutti idempotenti grazie ai
 * vincoli di unicita' dello schema.
 */
export async function salvaOnboarding(r: Risposte, lingua: Lingua): Promise<Esito> {
  if (!supabase) return { ok: true }

  const { data: sessione } = await supabase.auth.getSession()
  const id = sessione.session?.user.id
  if (!id) return { ok: false, errore: 'nessuna sessione' }

  const nascita = isoDaData(r.nascita)
  if (!nascita) return { ok: false, errore: 'data di nascita mancante' }

  const atleta = await supabase.from('athletes').upsert({
    id,
    display_name: r.nome.trim(),
    birth_date: nascita,
    sport: r.sportPrincipale || null,
    cycle_status: STATO_CICLO[r.ciclo],
    contraception: CONTRACCEZIONE[r.contraccettivo],
    locale: lingua,
    first_period_age: etaAlPrimoCiclo(r),
  })
  if (atleta.error) return { ok: false, errore: atleta.error.message }

  // gli sport: `athletes.sport` e' il principale, questa e' la lista intera
  if (r.sport.length) {
    await supabase
      .from('athlete_sports')
      .upsert(
        r.sport.map((sport) => ({ athlete_id: id, sport })),
        { onConflict: 'athlete_id,sport' },
      )
  }

  /*
   * La settimana: i giorni dell'app partono da lunedi' = 0, lo schema da 1.
   *
   * Si cancella e si riscrive invece di fare upsert: il vincolo di unicita'
   * comprende `sport` e `start_time`, che per l'educazione fisica sono null,
   * e in Postgres due null non sono uguali fra loro — un upsert li vedrebbe
   * come righe diverse e a ogni rifacimento dell'onboarding la settimana si
   * riempirebbe di doppioni. Rifare l'onboarding vuol dire rifare la
   * settimana, non aggiungerne un'altra.
   */
  await supabase.from('athlete_schedule').delete().eq('athlete_id', id)
  const settimana = [
    ...Object.entries(r.allenamenti).flatMap(([sport, a]) =>
      a.giorni.map((g) => ({ athlete_id: id, weekday: g + 1, kind: 'training', sport })),
    ),
    ...r.edFisica.map((g) => ({ athlete_id: id, weekday: g + 1, kind: 'pe', sport: null })),
  ]
  if (settimana.length) await supabase.from('athlete_schedule').insert(settimana)

  // le date del ciclo: si salvano solo quelle, le fasi si calcolano nell'app
  const date = r.cicliUltimi.map(isoDaData).filter((d): d is string => d !== null)
  if (date.length) {
    await supabase.from('cycle_events').upsert(
      date.map((event_date) => ({ athlete_id: id, kind: 'period_start', event_date })),
      { onConflict: 'athlete_id,kind,event_date' },
    )
  }

  /*
   * I consensi sono un registro, non uno stato: si aggiungono, non si
   * correggono. Per questo prima si guarda se per questa versione del testo
   * c'e' gia' una riga — rifare l'onboarding non deve far sembrare che
   * abbia acconsentito due volte alla stessa cosa. Un testo nuovo ha una
   * versione nuova, e allora la riga si aggiunge davvero.
   */
  if (r.consensi[0] || r.consensi[1]) {
    const gia = await supabase
      .from('consents')
      .select('kind')
      .eq('athlete_id', id)
      .eq('text_version', VERSIONE_CONSENSI)
    const fatti = new Set((gia.data ?? []).map((c) => c.kind as string))
    const nuovi = [
      { athlete_id: id, kind: 'athlete', text_version: VERSIONE_CONSENSI, granted: r.consensi[0] },
      { athlete_id: id, kind: 'guardian', text_version: VERSIONE_CONSENSI, granted: r.consensi[1] },
    ].filter((c) => !fatti.has(c.kind))
    if (nuovi.length) await supabase.from('consents').insert(nuovi)
  }

  return { ok: true }
}
