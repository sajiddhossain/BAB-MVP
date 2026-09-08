import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { dimenticaProfilo } from './profilo'
import type { Risposte } from './risposte'
import { azzera, scrivi, tutte } from './risposte'
import { dimenticaSessione } from './sessione'
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

export type Esito =
  | { ok: true }
  | { ok: false; errore: string; lento?: boolean; fraSecondi?: number; scaduta?: boolean }

/*
 * Quanto aspettare la mail prima di dire che non ce l'abbiamo fatta.
 *
 * Non e' un numero a caso: quando il servizio di posta di Supabase non
 * risponde, la richiesta resta appesa e torna 504 dopo mezzo minuto. Mezzo
 * minuto di "Sto mandando..." e' tempo in cui non si capisce se e' rotto, se
 * e' lento, o se si e' sbagliato qualcosa. Dopo dodici secondi lo diciamo.
 */
const ATTESA_MAX = 12_000

/**
 * Manda la mail con il codice a sei cifre.
 *
 * Niente `emailRedirectTo`: senza un indirizzo di rientro Supabase non ha piu'
 * un link da far aprire, e resta solo il codice. Perche' nella mail arrivi
 * davvero il codice e non il link vanno cambiati i due modelli di mail —
 * "Magic Link" e "Confirm signup" — mettendoci `{{ .Token }}` al posto di
 * `{{ .ConfirmationURL }}`. Questo qui e' meta' del lavoro; l'altra meta' sta
 * nel pannello, ed e' scritta nel README.
 *
 * Il codice e' meglio del link perche' la mail spesso si apre su un altro
 * dispositivo: il link aprirebbe la sessione li' invece che sul telefono in
 * mano, e la ragazza si ritroverebbe fuori dalla app che stava usando.
 */
export async function mandaCodice(email: string): Promise<Esito> {
  if (!supabase) return { ok: true }
  const invio = supabase.auth.signInWithOtp({ email: email.trim() })
  const scaduto = new Promise<'scaduto'>((r) => setTimeout(() => r('scaduto'), ATTESA_MAX))
  const esito = await Promise.race([invio, scaduto])
  if (esito === 'scaduto') return { ok: false, errore: 'la posta non risponde', lento: true }
  if (!esito.error) return { ok: true }

  /*
   * Il limite di una mail al minuto per persona non e' un guasto: e' una
   * difesa contro chi usa il nostro server per riempire la casella di
   * qualcun altro. Va detto come tale — "aspetta venti secondi" e' una cosa
   * che si puo' fare, "non siamo riusciti a mandare" no.
   */
  const attesa = /after (\d+) seconds?/i.exec(esito.error.message)
  if (attesa) return { ok: false, errore: esito.error.message, fraSecondi: Number(attesa[1]) }

  return { ok: false, errore: esito.error.message }
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

/**
 * Uscire davvero: si porta via anche quello che sta su questo telefono.
 *
 * Fra le risposte ci sono le date del ciclo. Un telefono si presta, si perde,
 * si vende, e uscire e' proprio il gesto di chi lo sta per dare a qualcun
 * altro. Qui invece che nell'evento `SIGNED_OUT`, che scatta anche quando la
 * sessione scade da sola: li' cancellare vorrebbe dire buttare via venti
 * risposte a qualcuno che si e' solo distratto per un'ora.
 */
export async function esci() {
  dimenticaProfilo()
  azzera()
  dimenticaSessione()
  try {
    localStorage.removeItem('bab.giornata')
  } catch {
    // niente da fare: non e' un motivo per non uscire
  }
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
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSessione(s)
      // qui si dimentica solo chi era: cancellare le risposte lo fa `esci`,
      // perche' questo evento scatta anche quando la sessione scade da sola
      if (evento === 'SIGNED_OUT') dimenticaProfilo()
    })
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
  /*
   * Senza sessione non c'e' nessuno per cui salvare, e "riprova" sarebbe un
   * consiglio che non puo' funzionare: si rientra, e basta.
   *
   * Capita davvero: l'onboarding sono venti domande, la sessione dura un'ora,
   * e in mezzo si viene interrotti. Per questo le risposte restano dove sono
   * — rientrando le ritrova e finisce, invece di ricominciare da capo.
   */
  if (!id) return { ok: false, errore: 'nessuna sessione', scaduta: true }

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
  // da adesso il profilo c'e': chi lo aveva chiesto prima aveva un'altra risposta
  dimenticaProfilo()

  /*
   * Da qui in poi si scrive nelle tabelle figlie. Prima gli errori non li
   * guardavamo: se la settimana non passava, l'onboarding diceva lo stesso
   * "fatto" e i giorni di allenamento sparivano senza che nessuno lo
   * sapesse. Ora ogni passo dice com'e' andata, e se anche uno solo fallisce
   * fallisce tutto — rifare l'onboarding riscrive le stesse righe, quindi
   * riprovare e' sempre sicuro.
   */
  const passi: [string, PromiseLike<{ error: { message: string } | null }>][] = []

  // gli sport: `athletes.sport` e' il principale, questa e' la lista intera
  if (r.sport.length) {
    passi.push([
      'sport',
      supabase.from('athlete_sports').upsert(
        r.sport.map((sport) => ({ athlete_id: id, sport })),
        { onConflict: 'athlete_id,sport' },
      ),
    ])
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
  const pulizia = await supabase.from('athlete_schedule').delete().eq('athlete_id', id)
  if (pulizia.error) return { ok: false, errore: `settimana: ${pulizia.error.message}` }

  const settimana = [
    ...Object.entries(r.allenamenti).flatMap(([sport, a]) =>
      a.giorni.map((g) => ({ athlete_id: id, weekday: g + 1, kind: 'training', sport })),
    ),
    ...r.edFisica.map((g) => ({ athlete_id: id, weekday: g + 1, kind: 'pe', sport: null })),
  ]
  if (settimana.length) {
    passi.push(['settimana', supabase.from('athlete_schedule').insert(settimana)])
  }

  // le date del ciclo: si salvano solo quelle, le fasi si calcolano nell'app
  const date = r.cicliUltimi.map(isoDaData).filter((d): d is string => d !== null)
  if (date.length) {
    passi.push([
      'ciclo',
      supabase.from('cycle_events').upsert(
        date.map((event_date) => ({ athlete_id: id, kind: 'period_start', event_date })),
        { onConflict: 'athlete_id,kind,event_date' },
      ),
    ])
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
    if (gia.error) return { ok: false, errore: `consensi: ${gia.error.message}` }
    const fatti = new Set((gia.data ?? []).map((c) => c.kind as string))
    const nuovi = [
      { athlete_id: id, kind: 'athlete', text_version: VERSIONE_CONSENSI, granted: r.consensi[0] },
      { athlete_id: id, kind: 'guardian', text_version: VERSIONE_CONSENSI, granted: r.consensi[1] },
    ].filter((c) => !fatti.has(c.kind))
    if (nuovi.length) passi.push(['consensi', supabase.from('consents').insert(nuovi)])
  }

  const esiti = await Promise.all(passi.map(([, p]) => p))
  const rotti = esiti
    .map((e, i) => (e.error ? `${passi[i][0]}: ${e.error.message}` : null))
    .filter((x): x is string => x !== null)

  if (rotti.length) return { ok: false, errore: rotti.join(' · ') }

  return { ok: true }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dalle righe alle risposte.
 * ───────────────────────────────────────────────────────────────────────── */

/** "2011-03-14" -> "14/03/2011". */
function dataDaIso(v: string | null): string {
  if (!v) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

const CICLO_DA_STATO: Record<string, Risposte['ciclo']> = {
  tracking: 'si',
  not_yet: 'non-ancora',
  undisclosed: 'preferisco-non-dirlo',
}

/**
 * Rilegge il profilo dal database e lo rimette nelle risposte.
 *
 * Serve la prima volta che si entra da un telefono nuovo: la sessione si apre
 * col codice, ma tutto quello che ha risposto sta nel database e non in
 * quel telefono. Senza questo passaggio si entra in una app vuota, che dice
 * "Ciao" senza nome e crede che oggi sia un giorno di riposo.
 *
 * Non tocca niente se in locale c'e' gia' un nome: chi e' a meta' onboarding
 * ha le risposte piu' fresche di quelle salvate, e sovrascriverle vorrebbe
 * dire fargli perdere quello che ha appena scritto.
 */
export async function caricaProfilo(): Promise<boolean> {
  if (!supabase) return false
  if (tutte().nome !== '') return false

  const { data: sessione } = await supabase.auth.getSession()
  const id = sessione.session?.user.id
  if (!id) return false

  const [atleta, sport, settimana, cicli] = await Promise.all([
    supabase.from('athletes').select('*').eq('id', id).maybeSingle(),
    supabase.from('athlete_sports').select('sport'),
    supabase.from('athlete_schedule').select('weekday,kind,sport'),
    supabase.from('cycle_events').select('event_date').eq('kind', 'period_start'),
  ])
  if (atleta.error || !atleta.data) return false
  const a = atleta.data as Record<string, string | null>

  // la settimana torna indietro: lo schema conta da 1, l'app da 0
  const allenamenti: Risposte['allenamenti'] = {}
  const edFisica: number[] = []
  for (const riga of settimana.data ?? []) {
    const giorno = Number(riga.weekday) - 1
    if (riga.kind === 'pe') {
      edFisica.push(giorno)
      continue
    }
    const nome = riga.sport ?? ''
    allenamenti[nome] ??= { giorni: [], fascia: 1 }
    allenamenti[nome].giorni.push(giorno)
  }
  for (const v of Object.values(allenamenti)) v.giorni.sort((x, y) => x - y)
  edFisica.sort((x, y) => x - y)

  const date = (cicli.data ?? [])
    .map((c) => String(c.event_date))
    .sort()
    .reverse()
    .slice(0, 3)
    .map(dataDaIso)

  scrivi({
    email: sessione.session?.user.email ?? '',
    nome: a.display_name ?? '',
    nascita: dataDaIso(a.birth_date),
    sport: (sport.data ?? []).map((s) => String(s.sport)),
    sportPrincipale: a.sport ?? '',
    allenamenti,
    edFisica,
    ciclo: CICLO_DA_STATO[a.cycle_status ?? ''] ?? '',
    cicliUltimi: [date[0] ?? '', date[1] ?? '', date[2] ?? ''],
    contraccettivo: a.contraception === 'hormonal' ? 'si' : a.contraception === 'natural' ? 'no' : '',
    consensi: [true, true],
  })
  return true
}
