import { supabase } from './supabase'

/**
 * I dati della dashboard squadra.
 *
 * 🔴 SI LEGGE SOLO DALLE VISTE `coach_*`. Mai dalle tabelle di base.
 *
 * Non è una convenzione di stile: le viste sono il posto dove la regola R2
 * — «la squadra vede i dati dei due check-in, non il journaling» — è fatta di
 * colonne invece che di buone intenzioni. `note`, `headspace_other` e
 * `region_free` in quelle viste non esistono, quindi nessuna query scritta qui
 * può tirarle fuori nemmeno per sbaglio. Interrogare una tabella di base
 * riporterebbe la decisione a dipendere da chi scrive il codice.
 *
 * 🔴 A differenza dell'app dell'atleta, questa NON funziona offline. È
 * deliberato: l'atleta possiede i suoi dati e li tiene sul telefono; il coach
 * guarda i dati di venti persone, che vivono sul server e non devono essere
 * copiati su ogni portatile della società.
 */

export type StaffTeam = { team_id: string; name: string; sport: string; role: string }

export type RosterAthlete = {
  id: string
  display_name: string
  age: number
  sport: string | null
}

export type TodayRow = {
  athlete_id: string
  kind: 'pre' | 'post'
  local_date: string
  tempo_predicted: string | null
  tempo_chosen: string | null
  effort: number | null
  pe_attended: boolean | null
}

export type RedFlag = {
  /** uuid, non numero: le chiavi delle tabelle scritte dall'atleta sono uuid
      generati sul client — vedi il blocco «CHIAVI» in schema.sql. */
  id: string
  athlete_id: string
  opened_at: string
  region: string
  sensation: string
  told_adult: boolean
  resolved_at: string | null
}

export type CycleDate = { athlete_id: string; kind: string; event_date: string }

/**
 * `null` quando i dati non si sanno — la query è fallita — MAI quando sono
 * semplicemente zero. Per `openRedFlags` non è un dettaglio: "non sono
 * riuscito a controllare" e "non ce ne sono" sono due fatti diversi, e
 * confonderli vorrebbe dire mostrare rassicurazione a un coach che in realtà
 * non ha ricevuto risposta dal server (§11).
 *
 * `myTeams` distingue in più "non collegato" (`'offline'`) da "collegato ma
 * la query è fallita" (`'error'`): sono due schermate diverse, la prima dice
 * di trovare rete, la seconda di riprovare.
 */
export async function myTeams(): Promise<StaffTeam[] | 'offline' | 'error'> {
  if (!supabase) return 'offline'
  const { data, error } = await supabase
    .from('team_staff')
    .select('team_id, role, teams(name, sport)')
  if (error) { console.error('[coach] teams', error.message); return 'error' }
  return (data ?? []).map((r) => {
    const team = r.teams as unknown as { name: string; sport: string } | null
    return { team_id: r.team_id as string, role: r.role as string,
             name: team?.name ?? '', sport: team?.sport ?? '' }
  })
}

export async function roster(teamId: string): Promise<RosterAthlete[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('coach_athletes')
    .select('id, display_name, age, sport')
    .eq('team_id', teamId)
    .order('display_name')
  if (error) { console.error('[coach] roster', error.message); return null }
  return (data ?? []) as RosterAthlete[]
}

/** I check-in di una giornata per tutta la squadra. */
export async function checkInsOn(date: string, ids: string[]): Promise<TodayRow[] | null> {
  if (!supabase) return null
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('coach_check_ins')
    .select('athlete_id, kind, local_date, tempo_predicted, tempo_chosen, effort, pe_attended')
    .eq('local_date', date)
    .in('athlete_id', ids)
  if (error) { console.error('[coach] check-ins', error.message); return null }
  return (data ?? []) as TodayRow[]
}

/**
 * 🔴 §11: le bandiere rosse escalano a un umano, mai sepolte in un trend.
 * Questa query è il modo in cui ci arrivano, quindi prende PRIMA le non
 * risolte e le ordina dalla più vecchia: una aperta da tre giorni è più
 * urgente di una di stamattina, non meno.
 */
export async function openRedFlags(ids: string[]): Promise<RedFlag[] | null> {
  if (!supabase) return null
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('coach_red_flags')
    .select('id, athlete_id, opened_at, region, sensation, told_adult, resolved_at')
    .in('athlete_id', ids)
    .is('resolved_at', null)
    .order('opened_at', { ascending: true })
  if (error) { console.error('[coach] red flags', error.message); return null }
  return (data ?? []) as RedFlag[]
}

/** Le ultime due settimane di una singola atleta. */
export async function historyFor(athleteId: string, since: string): Promise<TodayRow[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('coach_check_ins')
    .select('athlete_id, kind, local_date, tempo_predicted, tempo_chosen, effort, pe_attended')
    .eq('athlete_id', athleteId)
    .gte('local_date', since)
    .order('local_date', { ascending: false })
  if (error) { console.error('[coach] history', error.message); return null }
  return (data ?? []) as TodayRow[]
}

/**
 * ⚠️ R2: lo staff vede anche le date del ciclo. È la decisione che si allontana
 * di più dal progetto originale, ed è presa. Si leggono le DATE: la fase resta
 * un'inferenza che si calcola a runtime, e nessuno deve poterla scambiare per
 * un fatto clinico.
 */
export async function cycleFor(athleteId: string): Promise<CycleDate[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('coach_cycle_events')
    .select('athlete_id, kind, event_date')
    .eq('athlete_id', athleteId)
    .order('event_date', { ascending: false })
    .limit(6)
  if (error) { console.error('[coach] cycle', error.message); return null }
  return (data ?? []) as CycleDate[]
}
