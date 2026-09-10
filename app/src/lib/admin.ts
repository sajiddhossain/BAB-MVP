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
