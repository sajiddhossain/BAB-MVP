import { createContext, useContext } from 'react'

/**
 * Navigazione esposta agli schermi.
 *
 * Fuori dal prototipo (diff, reel) il contesto e' null e i bottoni restano
 * semplici forme: gli schermi non devono sapere se sono dentro un prototipo.
 */
export type Nav = { next: () => void; back: () => void }

export const NavContext = createContext<Nav | null>(null)
export const useNav = () => useContext(NavContext)
