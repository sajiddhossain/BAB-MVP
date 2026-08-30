import { createContext, useContext } from 'react'

/**
 * Navigazione esposta agli schermi.
 *
 * Fuori dal prototipo (diff, reel) il contesto e' null e i bottoni restano
 * semplici forme: gli schermi non devono sapere se sono dentro un prototipo.
 */
export type Nav = {
  next: () => void
  back: () => void
  /**
   * Salto di piu' schermi.
   *
   * Serve alla body map: il pannello e' lo schermo dopo, ma ora si apre
   * toccando una zona, non col bottone. "Almost done" deve scavalcarlo.
   */
  go: (delta: number) => void
}

export const NavContext = createContext<Nav | null>(null)
export const useNav = () => useContext(NavContext)
