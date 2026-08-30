import type { ComponentType } from 'react'
import { Checkin1Predict } from './screens/Checkin1Predict'
import { Checkin3BodyMap } from './screens/Checkin3BodyMap'
import { Checkout1aPickTempo } from './screens/Checkout1aPickTempo'
import { Checkout1bReveal } from './screens/Checkout1bReveal'
import { Checkout2Rpe } from './screens/Checkout2Rpe'
import { Checkout4Energy } from './screens/Checkout4Energy'

export type UiScreen = {
  /** componente nello stato "finale" che l'export Figma mostra */
  Component: ComponentType
  width: number
  height: number
  /** export Figma di riferimento, per il diff */
  reference: string
  /** node id Figma, per risalire alla fonte */
  node: string
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
}
