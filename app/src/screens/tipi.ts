import type { Passo } from '../data/onboarding'
import type { PassoSessione, Tipo } from '../data/sessione'

/**
 * Quello che il motore passa a ogni schermo.
 *
 * Gli schermi non sanno dove sono nel percorso ne' chi viene dopo: chiamano
 * `avanti` e basta. Cosi' spostare una domanda e' una riga in onboarding.ts.
 */
export type PropsSchermo = {
  passo: Passo
  nodo: string
  /** da che parte si e' arrivati qui: lo decide il motore, non lo schermo */
  verso: 'avanti' | 'indietro' | 'niente'
  avanzamento?: number
  avanti: () => void
  /** vero mentre l'ultimo schermo sta scrivendo nel database */
  salvando?: boolean
  /** il salvataggio finale non e' riuscito */
  erroreSalvataggio?: boolean
  indietro?: () => void
  /** salta questo schermo e vai avanti — usato dai rimandi tipo "non me lo ricordo" */
  saltaA?: (id: string) => void
}

/**
 * Quello che il motore della sessione passa a ogni schermo.
 *
 * Come `PropsSchermo` dell'onboarding, con una cosa in piu': `tipo`. Meta'
 * degli schermi del check-in e del check-out sono lo stesso schermo con
 * un'altra domanda sopra — il ritmo, la mappa del corpo — e sapere in quale
 * dei due giri si sta e' quello che gli permette di essere uno solo.
 */
export type PropsSessione = {
  tipo: Tipo
  passo: PassoSessione
  verso: 'avanti' | 'indietro' | 'niente'
  avanzamento: number
  avanti: () => void
  indietro?: () => void
  salvando?: boolean
  erroreSalvataggio?: boolean
}
