import type { CheckIn, ParoleCheckIn, ParoleSegnale, Segnale } from '../../lib/admin'
import type { Vocabolario } from './vocabolario'

/**
 * Cosa ha risposto e quando, in righe.
 *
 * La stessa riga serve alla tabella delle risposte nella scheda e ai CSV
 * dell'elenco: se le due cose si scrivessero a parte, prima o poi la tabella
 * direbbe «Tranquillo» e il CSV `gentle`, o una colonna ci sarebbe in una e
 * non nell'altra.
 *
 * Le scale restano numeri nudi (e il fondoscala sta nel nome della colonna):
 * nel CSV un «5 / 7» non si somma e non si fa la media.
 */

export type Cella = string | number | boolean | null

export const COLONNE_RISPOSTE = [
  'Giorno',
  'Ora',
  'Momento',
  'Ritmo',
  'Sonno 1–7',
  'Ore di sonno',
  'Energia 1–7',
  'Umore 1–7',
  'Pressione 1–7',
  'Sforzo 0–10',
  'Soddisfazione',
  'Ha portato a casa',
  'Ciclo',
  'Antidolorifici',
  'Dolore protettivo',
  'Sensazioni',
  'Durata (s)',
  'Nota',
]

export function rigaRisposta(
  c: CheckIn,
  v: Vocabolario,
  segnali: Segnale[],
  parole?: ParoleCheckIn,
): Cella[] {
  return [
    c.local_date,
    c.local_time ? c.local_time.slice(0, 5) : null,
    c.kind === 'pre' ? 'Check-in' : 'Check-out',
    v.ritmo(c.kind === 'pre' ? c.tempo_predicted : c.tempo_chosen) || null,
    c.sleep,
    c.sleep_hours,
    c.energy,
    c.mood,
    c.school_load,
    c.effort,
    v.faccia(c.satisfaction) || null,
    c.brought_home?.length ? c.brought_home.map((b) => v.bottino(b)).join(', ') : null,
    c.on_period,
    c.painkillers,
    c.protective_pain,
    segnali.length
      ? segnali
          .map((s) => `${v.zona(s.region)}${s.intensity !== null ? ` ${s.intensity}/10` : ''}`)
          .join(', ')
      : null,
    c.seconds,
    parole?.note ?? (c.has_note ? '(nascosta)' : null),
  ]
}

export const COLONNE_SENSAZIONI = [
  'Giorno',
  'Momento',
  'Zona',
  'Davanti o dietro',
  'Sensazione',
  'Intensità 0–10',
  'Solo da un lato',
  'Quando la sente',
  'Quando è comparsa',
  'Effetto della sessione',
  'Protettiva',
  'Parole sue',
]

export function rigaSensazione(
  s: Segnale,
  v: Vocabolario,
  giorno: string,
  momento: 'pre' | 'post' | null,
  parole?: ParoleSegnale,
): Cella[] {
  return [
    giorno,
    momento === 'pre' ? 'Check-in' : momento === 'post' ? 'Check-out' : null,
    s.region === 'altrove' ? (parole?.region_free ?? 'Altrove') : v.zona(s.region),
    s.plane === 'back' ? 'dietro' : 'davanti',
    s.sensation.map((p) => v.parola(p)).join(', ') || null,
    s.intensity,
    s.one_side,
    v.quando(s.when_noticed) || null,
    v.comparsa(s.onset) || null,
    v.effetto(s.session_effect) || null,
    s.is_red_flag,
    parole?.words ?? null,
  ]
}

/** il giorno e il momento di una sensazione: quelli del suo check-in, se c'e' */
export function doveCade(checkins: CheckIn[]) {
  const per = new Map(checkins.map((c) => [c.id, c]))
  return (s: Segnale): { giorno: string; momento: 'pre' | 'post' | null } => {
    const c = s.check_in_id ? per.get(s.check_in_id) : undefined
    return c ? { giorno: c.local_date, momento: c.kind } : { giorno: s.created_at.slice(0, 10), momento: null }
  }
}
