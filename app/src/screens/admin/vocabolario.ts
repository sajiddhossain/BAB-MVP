import { useLingua } from '../../lib/lingua'
import {
  COMPARSA,
  COMPARSA_DB,
  EFFETTO,
  EFFETTO_DB,
  QUANDO,
  QUANDO_DB,
  RITMI,
  nomeCodice,
} from '../../data/sessione'

/**
 * Dal codice del database alla parola che ha letto l'atleta.
 *
 * Nel database c'e' `gentle`, `after_stopping`, `front_knee_l`. Sono codici
 * inglesi, e nel pannello da soli non dicono niente: chi guarda deve poter
 * leggere «Tranquillo», «Appena mi sono fermata», «Ginocchio destro».
 *
 * ── PERCHE' NON UNA TABELLA DI TRADUZIONI QUI DENTRO ───────────────────────
 * Perche' esiste gia': sono le scritte dell'app, quelle che l'atleta ha visto
 * davvero, correzioni del pannello comprese. Scrivere qui «Tranquillo» a mano
 * vorrebbe dire che il giorno in cui qualcuno lo ribattezza dal pannello,
 * l'amministrazione continua a chiamarlo con il vecchio nome — e a chi guarda
 * i dati sembrerebbe un'altra cosa.
 *
 * Il verso della traduzione va girato: le tabelle dell'app vanno da id a
 * codice del database (`EFFETTO_DB`), e qui serve il contrario.
 */
function gira(m: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(m).map(([id, db]) => [db, id]))
}

const RITMO_ID = Object.fromEntries(RITMI.map((r) => [r.db, r.id]))
const QUANDO_ID = gira(QUANDO_DB)
const COMPARSA_ID = gira(COMPARSA_DB)
const EFFETTO_ID = gira(EFFETTO_DB)

export type Vocabolario = ReturnType<typeof useVocabolario>

export function useVocabolario() {
  const { ts } = useLingua()

  /** se il codice non lo conosce nessuno, si vede il codice: meglio di un vuoto */
  const cerca = (voci: Record<string, string>, id: string | null | undefined, db: string) =>
    (id && voci[id]) || db

  return {
    ritmo: (db: string | null) => (db ? cerca(ts.comune.ritmi, RITMO_ID[db], db) : ''),
    parola: (db: string) => ts.foglio.parole[db as keyof typeof ts.foglio.parole] ?? db,
    faccia: (db: string | null) =>
      db ? (ts.soddisfazione.facce[db as keyof typeof ts.soddisfazione.facce] ?? db) : '',
    bottino: (db: string) =>
      ts.soddisfazione.bottino.voci[db as keyof typeof ts.soddisfazione.bottino.voci] ?? db,
    quando: (db: string | null) => (db ? cerca(ts.foglio.quando.voci, QUANDO_ID[db], db) : ''),
    comparsa: (db: string | null) => (db ? cerca(ts.foglio.comparsa.voci, COMPARSA_ID[db], db) : ''),
    effetto: (db: string | null) => (db ? cerca(ts.foglio.effetto.voci, EFFETTO_ID[db], db) : ''),
    /** «Ginocchio destro», da `front_knee_l`. `altrove` non e' una zona della mappa */
    zona: (codice: string) => (codice === 'altrove' ? 'Altrove' : nomeCodice(codice, ts.zone)),
  }
}

/* Le cose che nel database non passano dalle scritte dell'app. */

export const CICLO: Record<string, string> = {
  tracking: 'Ce l’ha, e lo segna',
  not_yet: 'Non ancora',
  undisclosed: 'Preferisce non dirlo',
}

export const CONTRACCETTIVO: Record<string, string> = {
  natural: 'No',
  hormonal: 'Ormonale',
  unsure: 'Non lo sa',
  undisclosed: 'Preferisce non dirlo',
}

export const GIORNI = ['', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

export const IMPEGNO: Record<string, string> = {
  training: 'Allenamento',
  pe: 'Educazione fisica',
  other: 'Altro',
}

/** Le tre parole che l'app usa per le due liste chiuse, viste dal pannello. */
export const QUANDO_TUTTI = QUANDO
export const COMPARSA_TUTTI = COMPARSA
export const EFFETTO_TUTTI = EFFETTO
