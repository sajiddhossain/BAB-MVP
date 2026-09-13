import { supabase } from './supabase'

/**
 * I numeri che il database lascia leggere a un amministratore.
 *
 * ── PERCHE' COSI' POCHI ────────────────────────────────────────────────────
 * Perche' oggi il database non gliene lascia leggere altri. Le regole (RLS)
 * danno a ogni atleta le sue righe e basta; a chi amministra arrivano solo le
 * viste `admin_*`, che sono conteggi gia' fatti. `check_ins` e `body_signals`
 * riga per riga non li vede nessuno, nemmeno un admin — e' scritto nello
 * schema come una scelta, non come una dimenticanza.
 *
 * Quindi: l'atrio si accende con quello che c'e' gia'. Per la stanza delle
 * atlete e per i numeri veri serve una migrazione che apra delle viste nuove,
 * ed e' un passo che si fa apposta, non di straforo.
 *
 * ── TRE CONTATORI CHE SARANNO SEMPRE ZERO ──────────────────────────────────
 * `flags_open`, `flags_untold` e `flags_stale` contano righe di `red_flags`,
 * e in `red_flags` non scrive nessuno: l'app segna l'allarme dentro a
 * `body_signals.is_red_flag` e li' si ferma. Non li mostro: uno zero che non
 * puo' cambiare non e' un numero, e' una bugia rassicurante.
 */
export type Polso = {
  athletes: number
  athletes_new_7d: number
  teams: number
  checkins_today: number
  athletes_today: number
  checkins_7d: number
  posts_7d: number
  signals_7d: number
  consents_refused: number
}

export type Strumenti = {
  checkins_30d: number
  timed_30d: number
  median_seconds_pre_30d: number | null
  median_seconds_post_30d: number | null
}

/**
 * Il polso del pilota: quante sono, quante hanno fatto qualcosa oggi.
 *
 * Torna `null` quando non si e' collegate — nel banco di lavoro, o se la
 * rete non risponde. Chi chiama deve distinguere "non lo so" da "zero": un
 * pannello che scrive 0 atlete perche' la rete e' caduta manda a cercare un
 * problema che non c'e'.
 */
export async function leggiPolso(): Promise<Polso | null> {
  const p = await prova()
  if (p) return p.polso()
  if (!supabase) return null
  const { data, error } = await supabase.from('admin_pulse').select('*').maybeSingle()
  if (error || !data) return null
  return data as Polso
}

/** Quanto ci mettono a fare un check-in, e quanti sono cronometrati davvero. */
export async function leggiStrumenti(): Promise<Strumenti | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('admin_instrumentation')
    .select('checkins_30d,timed_30d,median_seconds_pre_30d,median_seconds_post_30d')
    .maybeSingle()
  if (error || !data) return null
  return data as Strumenti
}

/* ── le atlete ────────────────────────────────────────────────────────────── */

/**
 * Una riga dell'elenco delle atlete.
 *
 * Viene da `admin_athletes`, che la migrazione `migrazione-pannello.sql`
 * riscrive: ha dentro sia l'anagrafica sia quanto ha fatto, cosi' l'elenco
 * si riempie con una lettura sola invece che con una per colonna.
 */
export type Atleta = {
  id: string
  created_at: string
  display_name: string
  athlete_code: string | null
  email: string | null
  birth_date: string
  age: number
  sport: string | null
  locale: string
  cycle_status: string
  contraception: string
  first_period_age: number | null
  first_bpm: number | null
  tutorial_done: string | null
  sports: string[] | null
  team_name: string | null
  checkins: number
  checkins_pre: number
  checkins_post: number
  first_day: string | null
  last_day: string | null
  days_7d: number
  days_30d: number
  signals: number
  signals_flagged: number
  lessons_done: number
  cycle_marks: number
  consent_ok: boolean | null
}

export type CheckIn = {
  id: string
  athlete_id: string
  kind: 'pre' | 'post'
  local_date: string
  local_time: string | null
  created_at: string
  seconds: number | null
  tempo_predicted: string | null
  tempo_chosen: string | null
  sleep: number | null
  sleep_hours: string | null
  energy: number | null
  mood: number | null
  school_load: number | null
  effort: number | null
  satisfaction: string | null
  brought_home: string[] | null
  on_period: boolean | null
  painkillers: boolean | null
  protective_pain: boolean | null
  has_note: boolean
}

export type Segnale = {
  id: string
  athlete_id: string
  check_in_id: string | null
  created_at: string
  region: string
  plane: string
  side: string | null
  sensation: string[]
  intensity: number | null
  one_side: boolean | null
  when_noticed: string | null
  onset: string | null
  session_effect: string | null
  is_red_flag: boolean
  has_words: boolean
}

export type Ciclo = { id: string; kind: string; event_date: string }
export type Lezione = { lesson: number; completed_at: string }
export type Impegno = { weekday: number; kind: string; sport: string | null }
export type ParoleCheckIn = { id: string; note: string | null; headspace_other: string | null }
export type ParoleSegnale = { id: string; region_free: string | null; words: string | null }

/**
 * Tutto quello che c'e' di una persona, in una lettura sola.
 *
 * Sei viste diverse, sei richieste, in parallelo. Sequenziali sarebbero sei
 * viaggi di rete uno dopo l'altro per una scheda che si apre con un click.
 *
 * ── SE UNA VISTA NON C'E' ──────────────────────────────────────────────────
 * Le due viste delle parole scritte a mano stanno nella PARTE B della
 * migrazione, e si possono togliere senza toccare il resto. Quindi il loro
 * errore non e' un guasto: e' una risposta. Vengono lette a parte, e se non
 * ci sono la scheda si apre lo stesso senza quella sezione.
 */
export type Scheda = {
  checkins: CheckIn[]
  segnali: Segnale[]
  ciclo: Ciclo[]
  lezioni: Lezione[]
  settimana: Impegno[]
  parole: { checkins: Record<string, ParoleCheckIn>; segnali: Record<string, ParoleSegnale> } | null
}

/** nel banco di lavoro le atlete sono finte: vedi `gestione.ts` */
async function prova() {
  // scritto per intero e non con `SENZA_ACCESSO`: cosi' il compilatore vede
  // un `false` e in produzione non genera nemmeno il file delle prove
  return import.meta.env.DEV && import.meta.env.VITE_SENZA_ACCESSO === '1' ? await import('./adminProva') : null
}

export async function leggiAtlete(): Promise<Atleta[] | null> {
  const p = await prova()
  if (p) return p.atlete()
  if (!supabase) return null
  const { data, error } = await supabase.from('admin_athletes').select('*')
  if (error || !data) return null
  return data as Atleta[]
}

export async function leggiScheda(id: string): Promise<Scheda | null> {
  const p = await prova()
  if (p) return p.scheda(id)
  if (!supabase) return null
  const s = supabase
  const [c, b, e, l, w] = await Promise.all([
    s.from('admin_check_ins').select('*').eq('athlete_id', id).order('local_date', { ascending: false }),
    s.from('admin_body_signals').select('*').eq('athlete_id', id).order('created_at', { ascending: false }),
    s.from('admin_cycle_events').select('id,kind,event_date').eq('athlete_id', id).order('event_date', { ascending: false }),
    s.from('admin_lessons').select('lesson,completed_at').eq('athlete_id', id).order('lesson'),
    s.from('admin_schedule').select('weekday,kind,sport').eq('athlete_id', id).order('weekday'),
  ])
  if (c.error || b.error) return null

  return {
    checkins: (c.data ?? []) as CheckIn[],
    segnali: (b.data ?? []) as Segnale[],
    ciclo: (e.data ?? []) as Ciclo[],
    lezioni: (l.data ?? []) as Lezione[],
    settimana: (w.data ?? []) as Impegno[],
    parole: await leggiParole(id),
  }
}

async function leggiParole(id: string): Promise<Scheda['parole']> {
  if (!supabase) return null
  const [c, b] = await Promise.all([
    supabase.from('admin_check_in_words').select('id,note,headspace_other').eq('athlete_id', id),
    supabase.from('admin_body_signal_words').select('id,region_free,words').eq('athlete_id', id),
  ])
  // le viste della parte B possono non esserci: e' una decisione, non un guasto
  if (c.error || b.error) return null
  return {
    checkins: Object.fromEntries((c.data ?? []).map((r) => [r.id, r as ParoleCheckIn])),
    segnali: Object.fromEntries((b.data ?? []).map((r) => [r.id, r as ParoleSegnale])),
  }
}
