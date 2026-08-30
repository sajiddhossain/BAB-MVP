import type { ComponentType } from 'react'
import { Checkin1Predict } from './screens/Checkin1Predict'
import { Checkin3BodyMap } from './screens/Checkin3BodyMap'
import { Checkout1aPickTempo } from './screens/Checkout1aPickTempo'
import { Checkout1bReveal } from './screens/Checkout1bReveal'
import { Checkout2Rpe } from './screens/Checkout2Rpe'
import { Checkout4Energy } from './screens/Checkout4Energy'
import { Checkout5BodyMap } from './screens/Checkout5BodyMap'
import { Checkout3Satisfaction } from './screens/Checkout3Satisfaction'
import { Checkin4SensationSheet } from './screens/Checkin4SensationSheet'
import { Checkout7CloseLoop } from './screens/Checkout7CloseLoop'
import { Checkout6SensationSheet } from './screens/Checkout6SensationSheet'

export type UiScreen = {
  /** componente nello stato "finale" che l'export Figma mostra */
  Component: ComponentType
  width: number
  height: number
  /** export Figma di riferimento, per il diff */
  reference: string
  /** node id Figma, per risalire alla fonte */
  node: string
  /**
   * Alcuni export includono il bleed dell'ombra e sono piu' grandi del frame:
   * qui diciamo al diff quale porzione del riferimento confrontare.
   */
  refClip?: { x: number; y: number }
}

export const UI_SCREENS: Record<string, UiScreen> = {
  'checkin-1-predict': {
    Component: Checkin1Predict,
    width: 404,
    height: 874,
    reference: 'src/assets/checkin/checkin-1-predict.svg',
    node: '3530:4',
  },
  'checkin-3-body-map': {
    Component: Checkin3BodyMap,
    width: 402,
    height: 874,
    reference: 'src/assets/checkin/checkin-3-body-map.svg',
    node: '3523:251',
  },
  'checkout-1a-pick-tempo': {
    Component: Checkout1aPickTempo,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-1a-pick-tempo.svg',
    node: '3673:2',
  },
  'checkout-1b-reveal-comparison': {
    Component: Checkout1bReveal,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-1b-reveal-comparison.svg',
    node: '3562:4',
  },
  'checkout-2-rpe': {
    Component: Checkout2Rpe,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-2-rpe.svg',
    node: '3565:4',
  },
  'checkout-4-energy': {
    Component: Checkout4Energy,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-4-energy.svg',
    node: '3590:4',
  },
  'checkout-5-body-map': {
    Component: Checkout5BodyMap,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-5-body-map.svg',
    node: '3588:167',
  },
  'checkout-3-satisfaction': {
    Component: Checkout3Satisfaction,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-3-satisfaction.svg',
    node: '3568:4',
  },
  'checkin-4-sensation-sheet': {
    Component: Checkin4SensationSheet,
    width: 402,
    height: 874,
    reference: 'src/assets/checkin/checkin-4-sensation-sheet.svg',
    node: '3547:34',
  },
  'checkout-7-close-loop': {
    Component: Checkout7CloseLoop,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-7-close-loop.svg',
    node: '3594:4',
  },
  'checkout-6-sensation-sheet': {
    Component: Checkout6SensationSheet,
    width: 402,
    height: 874,
    reference: 'src/assets/checkout/checkout-6-sensation-sheet.svg',
    node: '3588:213',
    // il bleed dell'ombra e' solo orizzontale: i 3px verticali sono design
    // (il sheet parte a 175 invece che a 172), non vanno tolti anche qui
    refClip: { x: 20, y: 0 },
  },
}
