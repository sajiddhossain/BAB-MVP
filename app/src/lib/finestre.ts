/**
 * Le due finestre della giornata.
 *
 * Un check-in serve a indovinare come andra' la sessione, e un check-out a
 * dire com'e' andata. Fatti lontano dall'allenamento non sono piu' quelle due
 * cose: un check-in fatto la mattina per un allenamento delle sei di sera
 * indovina una giornata intera, non una sessione, e un check-out fatto a
 * mezzanotte e' un ricordo. Il confronto fra previsto e sentito — che e' il
 * dato per cui esiste tutta l'app — misura qualcosa solo se i due stanno
 * attaccati all'allenamento.
 *
 * Da qui, con gli orari che ha scritto nell'onboarding (es. 17:00–18:30):
 *
 *     16:30 ─ 17:00   check-in, nei trenta minuti prima
 *     18:30 ─ 19:00   check-out, nei trenta minuti dopo
 *
 * Fuori da li' non si fa: niente recupero. E' una scelta, e costa qualche
 * giorno vuoto — ma un dato preso due ore dopo sembrerebbe uguale agli altri
 * senza esserlo, mentre un buco almeno si vede.
 *
 * Con due allenamenti nello stesso giorno il check-in sta prima di quello che
 * comincia per primo, e il check-out dopo quello che finisce per ultimo: il
 * database tiene un check-in e un check-out al giorno, non uno per sport.
 *
 * ── I GIORNI SENZA ORARI ───────────────────────────────────────────────────
 * Riposo, sola educazione fisica, o un'atleta iscritta prima che gli orari si
 * chiedessero: li' valgono le finestre fisse di prima.
 *
 *     05:00 ─ 12:00   check-in
 *     12:00 ─ 15:30   check-in in ritardo, si puo' ancora
 *     15:30 ─ 23:30   check-out
 *     23:30 ─ 04:00   check-out in ritardo, si puo' ancora
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

import { tutte } from './risposte'
import { minutiDaOra } from './ore'
import { IN_ANTEPRIMA } from './sviluppo'

export type TipoSessione = 'checkin' | 'checkout'

/** Le quattro del mattino, in minuti da mezzanotte. */
const INIZIO = 4 * 60

/** Quanto dura il momento: il check-in prima dell'allenamento, il check-out dopo. */
const MARGINE = 30

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

/** Le finestre fisse: valgono nei giorni senza orari. */
export const FINESTRE: Record<TipoSessione, Finestra> = {
  //          05:00      12:00       15:30
  checkin: { apre: 60, chiude: 480, ultimo: 690 },
  //           15:30       23:30        04:00
  checkout: { apre: 690, chiude: 1170, ultimo: 1440 },
}

/**
 * Il giorno della settimana DELL'ATLETA, da lunedi' = 0.
 *
 * Come `giornoAtleta`, finisce alle quattro del mattino: all'una di notte e'
 * ancora il giorno dell'allenamento della sera prima. Senza, un check-out
 * dopo un allenamento finito a mezzanotte guarderebbe gli orari del giorno
 * dopo. `getDay()` mette la domenica a 0: da qui il giro dei sette.
 */
export function giornoDellaSettimana(quando = new Date()): number {
  const d = new Date(quando)
  if (d.getHours() < 4) d.setDate(d.getDate() - 1)
  return (d.getDay() + 6) % 7
}

/**
 * Vero nei giorni senza allenamento e senza educazione fisica.
 *
 * E' la stessa regola di `allenamentoDiOggi` in `giornata.ts`. Sta qui perche'
 * la usano anche il percorso del check-out e il foglio delle sensazioni, che
 * da `giornata.ts` si tirerebbero dietro un giro di import.
 *
 * Nei giorni di riposo il check-out non chiede niente della sessione — sforzo,
 * soddisfazione, quando e' comparsa, cosa le ha fatto — perche' una sessione
 * non c'e' stata.
 *
 * Nell'anteprima dei testi e' sempre falso: li' gli allenamenti non ci sono,
 * e senza questo gli schermi di sforzo e soddisfazione sparirebbero proprio
 * dal posto in cui si guardano per scriverne i testi.
 */
export function giornoDiRiposo(quando = new Date()): boolean {
  if (IN_ANTEPRIMA) return false
  const giorno = giornoDellaSettimana(quando)
  const r = tutte()
  const seAllena = Object.values(r.allenamenti).some((a) => a.giorni.includes(giorno))
  return !seAllena && !r.edFisica.includes(giorno)
}

/**
 * Gli allenamenti del giorno, in minuti dall'inizio del giorno dell'atleta.
 *
 * Solo quelli con tutti e due gli orari leggibili: un orario che manca non
 * diventa un'ora inventata, fa ripiegare sulle finestre fisse. La fine si
 * conta come durata dall'inizio, cosi' un allenamento che finisce dopo
 * mezzanotte finisce dopo, e non prima, di quando e' cominciato.
 */
function allenamentiDelGiorno(quando: Date): { inizio: number; fine: number }[] {
  const giorno = giornoDellaSettimana(quando)
  const fuori: { inizio: number; fine: number }[] = []
  for (const a of Object.values(tutte().allenamenti)) {
    if (!a.giorni.includes(giorno)) continue
    const o = a.perGiorno?.[giorno] ?? a
    const inizio = minutiDaOra(o.inizio)
    const fine = minutiDaOra(o.fine)
    if (inizio === null || fine === null) continue
    const da = (inizio - INIZIO + 1440) % 1440
    fuori.push({ inizio: da, fine: da + ((fine - inizio + 1440) % 1440) })
  }
  return fuori
}

/**
 * La finestra di oggi per il check-in o il check-out.
 *
 * Trenta minuti prima del primo allenamento, trenta dopo l'ultimo, e niente
 * recupero: `ultimo` coincide con `chiude`. Senza orari, quelle fisse.
 */
export function finestraDi(tipo: TipoSessione, quando = new Date()): Finestra {
  const allenamenti = allenamentiDelGiorno(quando)
  if (allenamenti.length === 0) return FINESTRE[tipo]

  if (tipo === 'checkin') {
    const primo = Math.min(...allenamenti.map((a) => a.inizio))
    return { apre: Math.max(0, primo - MARGINE), chiude: primo, ultimo: primo }
  }
  // il giorno dell'atleta finisce alle quattro: oltre, non si va
  const ultima = Math.min(1440, Math.max(...allenamenti.map((a) => a.fine)))
  const chiude = Math.min(1440, ultima + MARGINE)
  return { apre: ultima, chiude, ultimo: chiude }
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
  const f = finestraDi(tipo, quando)
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
export function oraApertura(tipo: TipoSessione, quando = new Date()): string {
  return orologio(finestraDi(tipo, quando).apre)
}

/** L'ora in cui il suo momento finisce (e, nei giorni con orari, chiude). */
export function oraChiusura(tipo: TipoSessione, quando = new Date()): string {
  return orologio(finestraDi(tipo, quando).chiude)
}

function orologio(minutiDalRisveglio: number): string {
  const m = (minutiDalRisveglio + INIZIO) % 1440
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(m / 60))}:${p(m % 60)}`
}
