import type { Passo } from '../../data/tutorial'

/**
 * Quello che il motore del tutorial passa a ogni schermo.
 *
 * Come `PropsSchermo` dell'onboarding, meno le cose che qui non esistono: nel
 * tutorial non si salta niente e non si salva niente per strada — l'unica
 * scrittura è alla fine, e la fa l'ultimo schermo.
 */
export type PropsTutorial = {
  passo: Passo
  /** la chiave delle macchie di sfondo di questo schermo */
  nodo: string
  verso: 'avanti' | 'indietro' | 'niente'
  avanzamento: number
  avanti: () => void
  indietro: () => void
  /** vero mentre l'ultimo schermo sta scrivendo nel database */
  salvando?: boolean
}
