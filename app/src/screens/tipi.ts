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
  avanzamento?: number
  avanti: () => void
  indietro?: () => void
  /** salta questo schermo e vai avanti — usato dai rimandi tipo "non me lo ricordo" */
  saltaA?: (id: string) => void
}
