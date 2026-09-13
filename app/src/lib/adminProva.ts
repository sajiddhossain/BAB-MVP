import { ZONE, PAROLE, codiceZona } from '../data/sessione'
import type { Atleta, CheckIn, Polso, Scheda, Segnale } from './admin'
import type { Esito, Modifica, Nota, Squadra } from './gestione'

/**
 * Le atlete finte del banco di lavoro.
 *
 * Si carica solo con `VITE_SENZA_ACCESSO=1`, in sviluppo: in produzione
 * nessuno lo importa e non finisce nel pacchetto. Serve a provare il pannello
 * senza database — i grafici, i filtri, i gesti — con dati che somigliano a
 * quelli veri: giorni saltati, check-out dimenticati, un'atleta mai partita.
 *
 * Tutto e' in memoria. Ricaricando la pagina si riparte da capo.
 */

let seme = 7
function caso(): number {
  seme = (seme * 16807) % 2147483647
  return (seme - 1) / 2147483646
}
const tra = (a: number, b: number) => a + Math.floor(caso() * (b - a + 1))
const uno = <T,>(xs: readonly T[]): T => xs[Math.floor(caso() * xs.length)]

export const SQUADRE: Squadra[] = [
  { id: 't-vol', name: 'Volley Under 16', sport: 'pallavolo' },
  { id: 't-atl', name: 'Atletica Giovani', sport: 'atletica' },
]

const NOMI: [string, string, string | null, number, number][] = [
  // nome, sport, squadra, eta', quanto e' costante (0..1)
  ['Giulia', 'pallavolo', 't-vol', 15, 0.9],
  ['Sofia', 'pallavolo', 't-vol', 16, 0.6],
  ['Martina', 'atletica', 't-atl', 14, 0.75],
  ['Aurora', 'nuoto', null, 17, 0.35],
  ['Chiara', 'atletica', 't-atl', 13, 0.15],
  ['Alice', 'calcio', null, 19, 0],
  ['Emma', 'pallavolo', 't-vol', 15, 0.5],
]

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function giorniFa(n: number): Date {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

type Dentro = {
  riga: Atleta
  squadra: string | null
  scheda: Scheda
  note: Nota[]
}

const RITMI_DB = ['upbeat', 'steady', 'gentle'] as const
const FACCE = ['disappointed', 'frustrated', 'satisfied', 'confident', 'proud']
const ZONE_FRONTE = ZONE.front.map((z) => codiceZona('front', z.id))
const ZONE_RETRO = ZONE.back.map((z) => codiceZona('back', z.id))

function inventa(i: number, [nome, sport, squadra, eta, costante]: (typeof NOMI)[number]): Dentro {
  const id = `prova-${i + 1}`
  const iscritta = giorniFa(tra(40, 120))
  const checkins: CheckIn[] = []
  const segnali: Segnale[] = []
  const giorniTot = Math.round((Date.now() - iscritta.getTime()) / 86_400_000)
  // due o tre zone "sue", che tornano: i dati veri fanno cosi'
  const preferite = [uno(ZONE_FRONTE), uno(ZONE_FRONTE), uno(ZONE_RETRO)]
  const allenamenti = [1, 3, 5]

  for (let g = giorniTot; g >= 0; g--) {
    const d = giorniFa(g)
    const dow = ((d.getDay() + 6) % 7) + 1
    const allena = allenamenti.includes(dow)
    // chi e' costante apre quasi ogni giorno, e di piu' se si allena
    if (caso() > costante * (allena ? 1 : 0.7)) continue
    const giorno = iso(d)
    const previsto = uno(RITMI_DB)
    const energia = tra(2, 7)
    const pre: CheckIn = {
      id: `${id}-${giorno}-pre`,
      athlete_id: id,
      kind: 'pre',
      local_date: giorno,
      local_time: `0${tra(7, 9)}:${String(tra(0, 59)).padStart(2, '0')}:00`,
      created_at: `${giorno}T07:30:00Z`,
      seconds: tra(40, 180),
      tempo_predicted: previsto,
      tempo_chosen: null,
      sleep: tra(2, 7),
      sleep_hours: uno(['<6h', '6-7h', '7-8h', '8h+']),
      energy: energia,
      mood: tra(2, 7),
      school_load: tra(1, 7),
      effort: null,
      satisfaction: null,
      brought_home: null,
      on_period: caso() < 0.15,
      painkillers: caso() < 0.05,
      protective_pain: null,
      has_note: false,
    }
    checkins.push(pre)
    if (caso() < 0.35) segnali.push(segnale(id, pre, preferite))
    if (caso() > costante + 0.1) continue
    const post: CheckIn = {
      ...pre,
      id: `${id}-${giorno}-post`,
      kind: 'post',
      local_time: `${tra(18, 22)}:${String(tra(0, 59)).padStart(2, '0')}:00`,
      created_at: `${giorno}T19:30:00Z`,
      tempo_predicted: null,
      tempo_chosen: caso() < 0.6 ? previsto : uno(RITMI_DB),
      sleep: null,
      sleep_hours: null,
      mood: null,
      school_load: null,
      energy: Math.max(1, Math.min(7, energia + tra(-2, 1))),
      effort: allena ? tra(3, 10) : null,
      satisfaction: allena ? uno(FACCE) : null,
      brought_home: allena ? ['imparato', 'ascoltato'].slice(0, tra(0, 2)) : null,
      on_period: null,
      painkillers: null,
      protective_pain: caso() < 0.04,
    }
    checkins.push(post)
    if (caso() < 0.3) segnali.push(segnale(id, post, preferite))
  }
  checkins.sort((a, b) => b.local_date.localeCompare(a.local_date) || b.kind.localeCompare(a.kind))
  segnali.sort((a, b) => b.created_at.localeCompare(a.created_at))

  const giorni = [...new Set(checkins.map((c) => c.local_date))]
  const dentro = (n: number) => giorni.filter((g) => g >= iso(giorniFa(n))).length
  const lezioni = tra(0, costante > 0.5 ? 8 : 3)

  return {
    squadra,
    note:
      i === 0
        ? [{ id: 'n-1', body: 'Sentita la mamma: vuole spostarla al gruppo del martedì.', created_at: giorniFa(3).toISOString(), author_email: 'bab.community.official@gmail.com' }]
        : [],
    riga: {
      id,
      created_at: iscritta.toISOString(),
      display_name: nome,
      athlete_code: null,
      email: `${nome.toLowerCase()}@esempio.it`,
      birth_date: iso(new Date(new Date().getFullYear() - eta, 3, 12)),
      age: eta,
      sport,
      locale: 'it',
      cycle_status: uno(['tracking', 'not_yet', 'undisclosed']),
      contraception: 'natural',
      first_period_age: 12,
      first_bpm: tra(60, 90),
      tutorial_done: costante > 0 ? iscritta.toISOString() : null,
      sports: [sport],
      team_name: SQUADRE.find((s) => s.id === squadra)?.name ?? null,
      checkins: checkins.length,
      checkins_pre: checkins.filter((c) => c.kind === 'pre').length,
      checkins_post: checkins.filter((c) => c.kind === 'post').length,
      first_day: giorni.at(-1) ?? null,
      last_day: giorni[0] ?? null,
      days_7d: dentro(7),
      days_30d: dentro(30),
      signals: segnali.length,
      signals_flagged: segnali.filter((s) => s.is_red_flag).length,
      lessons_done: lezioni,
      cycle_marks: 2,
      consent_ok: eta < 18 ? true : null,
    },
    scheda: {
      checkins,
      segnali,
      ciclo: [
        { id: 'c1', kind: 'period_start', event_date: iso(giorniFa(9)) },
        { id: 'c2', kind: 'period_start', event_date: iso(giorniFa(37)) },
      ],
      lezioni: Array.from({ length: lezioni }, (_, k) => ({ lesson: k + 1, completed_at: giorniFa(30 - k * 3).toISOString() })),
      settimana: allenamenti.map((w) => ({ weekday: w, kind: 'training', sport })),
      parole: { checkins: {}, segnali: {} },
    },
  }
}

function segnale(id: string, c: CheckIn, preferite: string[]): Segnale {
  const region = caso() < 0.75 ? uno(preferite) : uno([...ZONE_FRONTE, ...ZONE_RETRO])
  const intensita = tra(1, 9)
  return {
    id: `${c.id}-${region}-${tra(0, 9999)}`,
    athlete_id: id,
    check_in_id: c.id,
    created_at: c.created_at,
    region,
    plane: region.split('_')[0],
    side: region.endsWith('_l') ? 'l' : region.endsWith('_r') ? 'r' : null,
    sensation: [uno(PAROLE)],
    intensity: intensita,
    one_side: caso() < 0.5,
    when_noticed: uno(['on_move', 'on_press', 'at_rest']),
    onset: c.kind === 'post' ? uno(['during', 'after_stopping']) : 'this_morning',
    session_effect: c.kind === 'post' ? uno(['warmed_out', 'unchanged', 'worse']) : null,
    is_red_flag: intensita >= 8 && caso() < 0.4,
    has_words: false,
  }
}

const TUTTE: Dentro[] = NOMI.map((n, i) => inventa(i, n))
const trova = (id: string) => TUTTE.find((a) => a.riga.id === id)
const fatto: Esito = { ok: true, dato: undefined }

export function polso(): Polso {
  const oggi = iso(new Date())
  const sette = iso(giorniFa(7))
  const c = TUTTE.flatMap((a) => a.scheda.checkins)
  const s = TUTTE.flatMap((a) => a.scheda.segnali)
  return {
    athletes: TUTTE.length,
    athletes_new_7d: TUTTE.filter((a) => a.riga.created_at.slice(0, 10) >= sette).length,
    teams: SQUADRE.length,
    checkins_today: c.filter((x) => x.local_date === oggi).length,
    athletes_today: new Set(c.filter((x) => x.local_date === oggi).map((x) => x.athlete_id)).size,
    checkins_7d: c.filter((x) => x.local_date >= sette).length,
    posts_7d: c.filter((x) => x.local_date >= sette && x.kind === 'post').length,
    signals_7d: s.filter((x) => x.created_at.slice(0, 10) >= sette).length,
    consents_refused: 0,
  }
}

export function atlete(): Atleta[] {
  return TUTTE.map((a) => ({ ...a.riga }))
}
export function scheda(id: string): Scheda | null {
  return trova(id)?.scheda ?? null
}
export function squadraDi(id: string): string | null {
  return trova(id)?.squadra ?? null
}
export function tutto(dal: string | null) {
  const checkins = TUTTE.flatMap((a) => a.scheda.checkins).filter((c) => !dal || c.local_date >= dal)
  const segnali = TUTTE.flatMap((a) => a.scheda.segnali).filter((s) => !dal || s.created_at.slice(0, 10) >= dal)
  return { checkins, segnali, parole: { checkins: {}, segnali: {} } }
}
export function cancella(id: string): Esito {
  const i = TUTTE.findIndex((a) => a.riga.id === id)
  if (i >= 0) TUTTE.splice(i, 1)
  return fatto
}
export function modifica(id: string, m: Modifica): Esito {
  const a = trova(id)
  if (!a) return { ok: false, perche: 'atleta non trovata' }
  a.riga.display_name = m.nome
  a.riga.birth_date = m.nascita
  a.riga.sport = m.sport[0] ?? null
  a.riga.sports = m.sport
  a.squadra = m.squadra
  a.riga.team_name = SQUADRE.find((s) => s.id === m.squadra)?.name ?? null
  return fatto
}
export function rifaiTutorial(id: string): Esito {
  const a = trova(id)
  if (a) a.riga.tutorial_done = null
  return fatto
}
export function esporta(id: string) {
  const a = trova(id)
  return { exported_at: new Date().toISOString(), athlete: a?.riga, check_ins: a?.scheda.checkins, body_signals: a?.scheda.segnali }
}
export function note(id: string): Nota[] {
  return trova(id)?.note ?? []
}
export function scriviNota(id: string, testo: string): Esito {
  trova(id)?.note.unshift({ id: `n-${Date.now()}`, body: testo.trim(), created_at: new Date().toISOString(), author_email: 'tu (prova)' })
  return fatto
}
export function cancellaNota(nota: string): Esito {
  for (const a of TUTTE) a.note = a.note.filter((n) => n.id !== nota)
  return fatto
}
