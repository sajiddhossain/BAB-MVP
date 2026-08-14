import { supabase } from './supabase'

/**
 * La console di chi amministra.
 *
 * 🔴 Come `coach.ts`, si legge SOLO dalle viste — qui `admin_*`. Le viste sono
 * il posto dove «le sue parole sono sue» è fatto di colonne invece che di buone
 * intenzioni, e la regola non ha un'eccezione per chi amministra: chi ha più
 * potere non ha meno bisogno di limiti.
 *
 * 🔴 Le scritture passano da funzioni `security definer` che controllano
 * `is_admin()` al loro interno. Non è ridondanza rispetto alla RLS: quelle
 * funzioni girano come proprietario, quindi la RLS non le ferma, e il controllo
 * dentro al corpo è l'unica cosa che le tiene chiuse. `check-schema.mjs` lo
 * verifica a ogni build.
 */

const need = () => {
  if (!supabase) throw Object.assign(new Error('not-connected'), { kind: 'not-connected' })
  return supabase
}

export type Pulse = {
  athletes: number
  athletes_new_7d: number
  teams: number
  checkins_today: number
  athletes_today: number
  checkins_7d: number
  posts_7d: number
  signals_7d: number
  flags_open: number
  flags_untold: number
  flags_stale: number
  consents_refused: number
}

export async function pulse(): Promise<Pulse | null> {
  const { data, error } = await need().from('admin_pulse').select('*').maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Pulse) ?? null
}

export type Team = { id: string; name: string; sport: string; event_word: string; locale: string }

export async function teams(): Promise<Team[]> {
  const { data, error } = await need()
    .from('teams').select('id, name, sport, event_word, locale').order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Team[]
}

export async function createTeam(t: Omit<Team, 'id'>): Promise<void> {
  const { error } = await need().from('teams').insert(t)
  if (error) throw new Error(error.message)
}

export type StaffRow = {
  team_id: string; user_id: string; email: string; role: string; added_at: string
}

export async function staffOf(teamId: string): Promise<StaffRow[]> {
  const { data, error } = await need()
    .from('admin_staff').select('team_id, user_id, email, role, added_at')
    .eq('team_id', teamId).order('added_at')
  if (error) throw new Error(error.message)
  return (data ?? []) as StaffRow[]
}

export type RosterRow = {
  id: string; display_name: string; age: number; sport: string | null
  team_id: string | null; team_name: string | null; joined_at: string | null; left_at: string | null
}

export async function rosterOf(teamId: string): Promise<RosterRow[]> {
  const { data, error } = await need()
    .from('admin_athletes')
    .select('id, display_name, age, sport, team_id, team_name, joined_at, left_at')
    .eq('team_id', teamId).is('left_at', null).order('display_name')
  if (error) throw new Error(error.message)
  return (data ?? []) as RosterRow[]
}

/** Tutte, comprese quelle senza squadra: sono quelle da iscrivere. */
export async function allAthletes(): Promise<RosterRow[]> {
  const { data, error } = await need()
    .from('admin_athletes')
    .select('id, display_name, age, sport, team_id, team_name, joined_at, left_at')
    .order('display_name')
  if (error) throw new Error(error.message)
  return (data ?? []) as RosterRow[]
}

/**
 * 🔴 Si attacca per EMAIL, e la persona deve essere già entrata almeno una
 * volta. Non si creano account per conto di qualcun altro — men che meno per
 * una minorenne — e non si mandano inviti che sembrano account.
 */
export async function attachStaff(teamId: string, email: string, role: string): Promise<void> {
  const { error } = await need().rpc('admin_attach_staff', {
    p_team: teamId, p_email: email, p_role: role,
  })
  if (error) throw new Error(error.message)
}

export async function attachAthlete(teamId: string, email: string): Promise<void> {
  const { error } = await need().rpc('admin_attach_athlete', { p_team: teamId, p_email: email })
  if (error) throw new Error(error.message)
}

/** Non cancella: mette una data di uscita, e le sue righe restano sue. */
export async function detachAthlete(teamId: string, athleteId: string): Promise<void> {
  const { error } = await need().rpc('admin_detach_athlete', {
    p_team: teamId, p_athlete: athleteId,
  })
  if (error) throw new Error(error.message)
}

export type Flag = {
  id: string; athlete_id: string; display_name: string
  opened_at: string; region: string; sensation: string
  told_adult: boolean; told_adult_at: string | null; resolved_at: string | null
  team_name: string | null
}

export async function flags(openOnly = true): Promise<Flag[]> {
  let q = need().from('admin_red_flags')
    .select('id, athlete_id, display_name, opened_at, region, sensation, told_adult, told_adult_at, resolved_at, team_name')
    .order('opened_at', { ascending: false })
  if (openOnly) q = q.is('resolved_at', null)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as Flag[]
}

/**
 * Chiudere il cerchio su una bandiera rossa. §11 chiede che escalino a un
 * umano: fino a oggi si aprivano e basta, e un'escalation che non si può
 * chiudere è un elenco che cresce — e un elenco che cresce si smette di
 * guardare.
 */
export async function markFlag(id: string, told: boolean, resolved: boolean): Promise<void> {
  const { error } = await need().rpc('mark_red_flag', {
    p_id: id, p_told: told, p_resolved: resolved,
  })
  if (error) throw new Error(error.message)
}

export type Consent = {
  id: string; athlete_id: string; display_name: string
  kind: string; text_version: string; granted: boolean; granted_at: string
}

export async function consents(): Promise<Consent[]> {
  const { data, error } = await need()
    .from('admin_consents')
    .select('id, athlete_id, display_name, kind, text_version, granted, granted_at')
    .order('granted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Consent[]
}

/**
 * I tre numeri del pilota (`docs/05-roadmap/01-piano-mvp.md`): erano scritti
 * dal primo giorno, mai letti da nessuno schermo. Vedi `admin_instrumentation`
 * in schema.sql per come sono calcolati — solo aggregati, mai un check-in solo.
 */
export type Instrumentation = {
  checkins_30d: number
  timed_30d: number
  median_seconds_pre_30d: number | null
  median_seconds_post_30d: number | null
  suggested_pairs_30d: number
  suggested_overridden_30d: number
}

export async function instrumentation(): Promise<Instrumentation | null> {
  const { data, error } = await need().from('admin_instrumentation').select('*').maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Instrumentation) ?? null
}

export type SkippedField = { field: string; n: number }

export async function skippedFields(): Promise<SkippedField[]> {
  const { data, error } = await need().from('admin_skipped_fields').select('field, n')
  if (error) throw new Error(error.message)
  return (data ?? []) as SkippedField[]
}
