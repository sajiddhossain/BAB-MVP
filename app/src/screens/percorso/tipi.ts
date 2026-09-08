import type { Passo } from '../../data/percorso'
import type { TestiLezione } from '../../copy/percorso'

/**
 * Quello che il riproduttore passa a ogni esercizio.
 *
 * Come per il check-in, l'esercizio non sa dove sta nella lezione ne' chi
 * viene dopo: chiama `avanti` e basta.
 */
export type PropsEsercizio<P extends Passo = Passo> = {
  passo: P
  /** il numero della lezione, da 1 a 8 */
  lezione: number
  /** i testi di QUESTA lezione, gia' scelti nella lingua giusta */
  testi: TestiLezione
  /**
   * Il posto di questo esercizio fra quelli dello stesso tipo.
   *
   * Serve solo a `incontra`, che in una lezione c'e' due volte: e' l'indice
   * che dice quale delle due schede-parola mostrare.
   */
  quale: number
  /** i nomi delle due parole della lezione, nella lingua corrente */
  parole: [string, string]
  avanzamento: number
  indietro: () => void
  avanti: () => void
}
