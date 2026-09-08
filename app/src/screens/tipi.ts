import type { Passo } from '../data/onboarding'

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
