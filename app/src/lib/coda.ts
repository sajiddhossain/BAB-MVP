import { giornoAtleta } from './sessione'
import type { Dati } from './sessione'
import type { Tipo } from '../data/sessione'

/**
 * I salvataggi che aspettano la rete.
 *
 * In palestra il campo manca. Prima di questa coda, un check-out finito nello
 * spogliatoio senza segnale mostrava "non siamo riusciti a salvare" e stava
 * li': o si ripremeva subito, o alle quattro del mattino quella giornata
 * spariva. Un'atleta che ha appena passato due minuti ad ascoltare il proprio
 * corpo non deve perderli perche' il telefono non prende.
 *
 * Adesso il salvataggio che non parte resta scritto qui, e riparte da solo
 * appena c'e' rete. Con dentro l'ora in cui e' stato FATTO, non quella in cui
 * riesce a partire: se no un check-out delle dieci di sera spedito la mattina
 * dopo finirebbe scritto sul giorno sbagliato.
 *
 * ── SI TIENE FUORI DAL LAVORATORE DI SERVIZIO ──────────────────────────────
 * La cache del `sw.js` non c'entra e non deve entrarci: quella conserva
 * risposte da rimostrare, questa conserva cose da mandare. Una risposta di
 * Supabase riservata dalla cache direbbe "gia' fatto" per una riga che nel
 * database non esiste.
 */
export type InSospeso = {
  tipo: Tipo
  dati: Dati
  /** il giorno dell'atleta a cui appartiene */
  giorno: string
  /** l'istante in cui ha finito, non quello in cui partira' */
  quando: string
}

const CHIAVE = 'bab.insospeso'

/**
 * Quante ne può aspettare.
 *
 * Due al giorno per un paio di settimane senza rete: oltre, o e' successo
 * qualcosa di strano o quel telefono online non ci va, e riempire la memoria
 * del telefono non aiuterebbe nessuno. Si buttano le piu' vecchie.
 */
const QUANTE_MAX = 30

export function inSospeso(): InSospeso[] {
  try {
    const letto = JSON.parse(localStorage.getItem(CHIAVE) ?? '[]') as InSospeso[]
    return Array.isArray(letto) ? letto : []
  } catch {
    return []
  }
}

function scrivi(lista: InSospeso[]): void {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(lista.slice(-QUANTE_MAX)))
  } catch {
    // spazio finito: non c'e' niente di meglio da fare che perderla, ed e'
    // comunque meglio che far fallire il salvataggio davanti a lei
  }
}

/**
 * Mette in coda, sostituendo quella dello stesso giro e dello stesso giorno.
 *
 * Rifare il check-out prima che il primo sia partito non deve lasciarne due:
 * nel database ce n'e' uno solo per tipo per giorno, e il secondo e' quello
 * che pensa lei.
 */
export function accoda(v: InSospeso): void {
  const senza = inSospeso().filter((x) => !(x.tipo === v.tipo && x.giorno === v.giorno))
  scrivi([...senza, v])
}

export function togliDallaCoda(tipo: Tipo, giorno: string): void {
  scrivi(inSospeso().filter((x) => !(x.tipo === tipo && x.giorno === giorno)))
}

/**
 * Cosa risulta fatto oggi contando anche quello che deve ancora partire.
 *
 * Serve alla home: senza, la rilettura dal database direbbe "check-in da
 * fare" per un check-in che lei ha appena finito e che sta solo aspettando
 * il campo. Rifarlo sarebbe la cosa piu' ovvia da fare, e la piu' sbagliata.
 */
export function fattoInCoda(): { checkin: boolean; checkout: boolean } {
  const oggi = giornoAtleta()
  const miei = inSospeso().filter((x) => x.giorno === oggi)
  return {
    checkin: miei.some((x) => x.tipo === 'checkin'),
    checkout: miei.some((x) => x.tipo === 'checkout'),
  }
}
