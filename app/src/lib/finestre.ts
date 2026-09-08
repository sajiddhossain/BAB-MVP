/**
 * Le due finestre della giornata.
 *
 * Un check-in serve a indovinare come andra' la sessione, e un check-out a
 * dire com'e' andata. Fatti a caso nell'arco delle ventiquattr'ore non sono
 * piu' quelle due cose: un "check-in del mattino" fatto alle undici di sera
 * e' un ricordo, e il confronto fra previsto e sentito — che e' il dato per
 * cui esiste tutta l'app — non misura piu' niente.
 *
 * Da qui:
 *
 *     05:00 ─ 12:00   check-in
 *     12:00 ─ 15:30   check-in in ritardo, si puo' ancora
 *     15:30 ─ 23:30   check-out
 *     23:30 ─ 04:00   check-out in ritardo, si puo' ancora
 *
 * Prima no, dopo si'. Non si puo' anticipare — un check-out alle due del
 * pomeriggio parlerebbe di un allenamento non ancora fatto — ma chi si
 * dimentica recupera, perche' l'alternativa e' un buco nei dati e una ragazza
 * che si sente in castigo per un'ora di ritardo.
 *
 * Fra le 04:00 e le 05:00 non e' aperto niente: e' l'ora in cui il giorno
 * dell'atleta e' gia' cambiato ma la sua giornata non e' cominciata.
 *
 * ── PERCHE' IL GIORNO COMINCIA ALLE QUATTRO ────────────────────────────────
 * Perche' cosi' un check-out dell'una di notte appartiene all'allenamento
 * della sera prima. E' la stessa regola di `giornoAtleta` in `sessione.ts`, e
 * dev'essere la stessa: se le due non fossero d'accordo, l'app scriverebbe
 * una data e ne mostrerebbe un'altra.
 *
 * ── L'OROLOGIO E' QUELLO DEL TELEFONO ──────────────────────────────────────
 * Il fuso lo conosce solo lui. Chi sposta l'orologio del telefono puo'
 * aprire una finestra chiusa: non e' una serratura, e non vuole esserlo — e'
 * un ritmo. Il database registra l'ora locale in cui la cosa e' stata fatta
 * (`local_time`), quindi in analisi un check-in delle tre di notte si vede.
 */

export type TipoSessione = 'checkin' | 'checkout'

/** Le quattro del mattino, in minuti da mezzanotte. */
const INIZIO = 4 * 60

/**
 * Quanti minuti sono passati dall'inizio del giorno DELL'ATLETA.
 *
 * Le quattro del mattino sono lo zero, e le tre e mezza di notte sono 1410:
 * cosi' la giornata e' un segmento crescente e le finestre ci si dispongono
 * dentro in ordine, senza dover trattare la mezzanotte come un caso a parte.
 */
export function minutiDelGiorno(quando = new Date()): number {
  return (quando.getHours() * 60 + quando.getMinutes() - INIZIO + 1440) % 1440
}

type Finestra = {
  /** prima di qui non si puo' */
  apre: number
  /** fin qui e' il suo momento */
  chiude: number
  /** fin qui si recupera; dopo, la giornata e' andata avanti */
  ultimo: number
}

export const FINESTRE: Record<TipoSessione, Finestra> = {
  //          05:00      12:00       15:30
  checkin: { apre: 60, chiude: 480, ultimo: 690 },
  //           15:30       23:30        04:00
  checkout: { apre: 690, chiude: 1170, ultimo: 1440 },
}

export type StatoFinestra =
  /** non e' ancora ora */
  | 'presto'
  /** e' il suo momento */
  | 'aperta'
  /** il momento e' passato, ma si puo' ancora fare */
  | 'ritardo'
  /** per oggi non si fa piu' */
  | 'chiusa'

export function statoFinestra(tipo: TipoSessione, quando = new Date()): StatoFinestra {
  const m = minutiDelGiorno(quando)
  const f = FINESTRE[tipo]
  if (m < f.apre) return 'presto'
  if (m < f.chiude) return 'aperta'
  if (m < f.ultimo) return 'ritardo'
  return 'chiusa'
}

/** Vero quando il bottone ci va: adesso, o ancora per un po'. */
export function siPuoFare(tipo: TipoSessione, quando = new Date()): boolean {
  const s = statoFinestra(tipo, quando)
  return s === 'aperta' || s === 'ritardo'
}

/**
 * L'ora di apertura, scritta come la legge una persona: `05:00`.
 *
 * Non passa dai testi perche' non e' una scritta: e' un numero che dipende
 * dalle costanti qui sopra, e una scritta a mano nel pannello smetterebbe di
 * essere vera il giorno che qualcuno sposta una finestra.
 */
export function oraApertura(tipo: TipoSessione): string {
  return orologio(FINESTRE[tipo].apre)
}

/** L'ora in cui il suo momento finisce e comincia il recupero. */
export function oraChiusura(tipo: TipoSessione): string {
  return orologio(FINESTRE[tipo].chiude)
}

function orologio(minutiDalRisveglio: number): string {
  const m = (minutiDalRisveglio + INIZIO) % 1440
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(m / 60))}:${p(m % 60)}`
}
