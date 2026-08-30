import type { ComponentType } from 'react'
import { Checkin1Predict } from './screens/Checkin1Predict'

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
}
