import { supabase } from './supabase'
import type { CheckIn, ParoleCheckIn, ParoleSegnale, Scheda, Segnale } from './admin'

/**
 * Quello che il pannello fa alle atlete, oltre a guardarle.
 *
 * Sta in un file suo e non in `admin.ts` perche' la' c'e' solo lettura, e
 * chi lo apre deve poter essere sicuro che niente di quello che chiama cambi
 * il database. Qui invece ogni funzione cambia qualcosa.
 *
 * Tutte passano da funzioni del database (`migrazione-gestione.sql`) che
 * controllano `is_admin()` per prime: il client non ha il diritto di scrivere
 * sulle tabelle delle atlete, e non lo ottiene.
 *
 * ── L'ESITO ────────────────────────────────────────────────────────────────
 * Ogni gesto torna `{ ok }`, e quando non va il motivo in parole. «Manca la
 * migrazione» e' un motivo diverso da «la rete non risponde», e chi guarda il
 * pannello deve sapere quale dei due: il primo si risolve lanciando un file,
 * il secondo aspettando.
 */
export type Esito<T = undefined> = { ok: true; dato: T } | { ok: false; perche: string }

function male(error: { code?: string; message?: string } | null): string {
  if (!error) return 'Non so cosa sia successo.'
  // funzione o tabella che non c'e': la migrazione non e' stata lanciata
  if (error.code === 'PGRST202' || error.code === '42883' || error.code === '42P01' || error.code === 'PGRST205') {
    return 'Manca migrazione-gestione.sql nel database.'
  }
  return error.message || 'Il database ha detto di no.'
}

const scollegata: Esito<never> = { ok: false, perche: 'Non sei collegata al database.' }

/* ── le prove nel banco di lavoro ─────────────────────────────────────────── */

/**
 * Nel banco di lavoro (`VITE_SENZA_ACCESSO=1`) il database non c'e', e un
 * pannello vuoto non si prova. Li' le letture e i gesti vanno su un'atleta
 * finta tenuta in memoria. In produzione questo ramo non esiste: il
 * compilatore lo toglie insieme al file delle prove.
 */
async function prova() {
  return import.meta.env.DEV && import.meta.env.VITE_SENZA_ACCESSO === '1' ? await import('./adminProva') : null
}

/* ── squadre ──────────────────────────────────────────────────────────────── */

export type Squadra = { id: string; name: string; sport: string }

export async function leggiSquadre(): Promise<Squadra[]> {
  const p = await prova()
  if (p) return p.SQUADRE
  if (!supabase) return []
  const { data, error } = await supabase.from('teams').select('id,name,sport').order('name')
  return error || !data ? [] : (data as Squadra[])
}

/** la squadra di adesso di un'atleta, o null */
export async function squadraDi(id: string): Promise<string | null> {
  const p = await prova()
  if (p) return p.squadraDi(id)
  if (!supabase) return null
  const { data } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('athlete_id', id)
    .is('left_at', null)
    .order('joined_at')
    .limit(1)
  return (data?.[0]?.team_id as string | undefined) ?? null
}

/**
 * Chi amministra. Serve a spegnere «Cancella» sulle loro righe prima di
 * provarci: il database lo rifiuterebbe comunque, ma meglio non offrirlo.
 */
export async function leggiAmministratori(): Promise<Set<string>> {
  const p = await prova()
  if (p || !supabase) return new Set()
  const { data } = await supabase.from('platform_admins').select('user_id')
  return new Set((data ?? []).map((r) => r.user_id as string))
}

/* ── i gesti ──────────────────────────────────────────────────────────────── */

export async function cancellaAtleta(id: string): Promise<Esito> {
  const p = await prova()
  if (p) return p.cancella(id)
  if (!supabase) return scollegata
  const { error } = await supabase.rpc('admin_delete_athlete', { p_id: id })
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: undefined }
}

export type Modifica = { nome: string; nascita: string; sport: string[]; squadra: string | null }

export async function modificaAtleta(id: string, m: Modifica, squadraPrima: string | null): Promise<Esito> {
  const p = await prova()
  if (p) return p.modifica(id, m)
  if (!supabase) return scollegata
  const { error } = await supabase.rpc('admin_update_athlete', {
    p_id: id,
    p_display_name: m.nome,
    p_birth_date: m.nascita,
    p_sports: m.sport,
  })
  if (error) return { ok: false, perche: male(error) }
  if (m.squadra !== squadraPrima) {
    const t = await supabase.rpc('admin_set_team', { p_id: id, p_team: m.squadra })
    if (t.error) return { ok: false, perche: male(t.error) }
  }
  return { ok: true, dato: undefined }
}

export async function rifaiTutorial(id: string): Promise<Esito> {
  const p = await prova()
  if (p) return p.rifaiTutorial(id)
  if (!supabase) return scollegata
  const { error } = await supabase.rpc('admin_reset_tutorial', { p_id: id })
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: undefined }
}

export async function esportaAtleta(id: string): Promise<Esito<unknown>> {
  const p = await prova()
  if (p) return { ok: true, dato: p.esporta(id) }
  if (!supabase) return scollegata
  const { data, error } = await supabase.rpc('admin_export_athlete', { p_id: id })
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: data }
}

/* ── note ─────────────────────────────────────────────────────────────────── */

export type Nota = { id: string; body: string; created_at: string; author_email: string | null }

export async function leggiNote(id: string): Promise<Esito<Nota[]>> {
  const p = await prova()
  if (p) return { ok: true, dato: p.note(id) }
  if (!supabase) return scollegata
  const { data, error } = await supabase
    .from('admin_notes_signed')
    .select('id,body,created_at,author_email')
    .eq('athlete_id', id)
    .order('created_at', { ascending: false })
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: (data ?? []) as Nota[] }
}

export async function scriviNota(id: string, testo: string): Promise<Esito> {
  const p = await prova()
  if (p) return p.scriviNota(id, testo)
  if (!supabase) return scollegata
  const { error } = await supabase.from('admin_notes').insert({ athlete_id: id, body: testo.trim() })
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: undefined }
}

export async function cancellaNota(nota: string): Promise<Esito> {
  const p = await prova()
  if (p) return p.cancellaNota(nota)
  if (!supabase) return scollegata
  const { error } = await supabase.from('admin_notes').delete().eq('id', nota)
  return error ? { ok: false, perche: male(error) } : { ok: true, dato: undefined }
}

/* ── letture per tutte insieme ────────────────────────────────────────────── */

/**
 * I check-in e le sensazioni di tutte, dal giorno `dal` in poi.
 *
 * Servono a due cose dell'elenco: la strisciolina degli ultimi quattordici
 * giorni in ogni riga, e i CSV. Si leggono una volta per tutte invece che
 * una per riga: con cinquanta atlete sarebbero cinquanta richieste.
 *
 * Il database restituisce al massimo mille righe per richiesta, quindi si
 * legge a pagine finche' ne arrivano.
 */
export type Tutto = { checkins: CheckIn[]; segnali: Segnale[]; parole: Scheda['parole'] }

export async function leggiTutto(dal: string | null): Promise<Tutto | null> {
  const p = await prova()
  if (p) return p.tutto(dal)
  if (!supabase) return null
  const s = supabase
  const pagine = async <T,>(tabella: string, colonna: string): Promise<T[] | null> => {
    const fuori: T[] = []
    for (let da = 0; ; da += 1000) {
      let q = s.from(tabella).select('*').order(colonna).range(da, da + 999)
      if (dal) q = q.gte(colonna, colonna === 'created_at' ? `${dal}T00:00:00` : dal)
      const { data, error } = await q
      if (error) return null
      fuori.push(...((data ?? []) as T[]))
      if (!data || data.length < 1000) return fuori
    }
  }
  const [c, b, pc, pb] = await Promise.all([
    pagine<CheckIn>('admin_check_ins', 'local_date'),
    pagine<Segnale>('admin_body_signals', 'created_at'),
    pagine<ParoleCheckIn>('admin_check_in_words', 'local_date'),
    pagine<ParoleSegnale>('admin_body_signal_words', 'created_at'),
  ])
  if (!c || !b) return null
  return {
    checkins: c,
    segnali: b,
    // le parole stanno nella parte B della migrazione e possono non esserci
    parole:
      pc && pb
        ? {
            checkins: Object.fromEntries(pc.map((r) => [r.id, r])),
            segnali: Object.fromEntries(pb.map((r) => [r.id, r])),
          }
        : null,
  }
}
