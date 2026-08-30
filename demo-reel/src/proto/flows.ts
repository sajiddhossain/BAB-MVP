import type { ComponentType } from 'react'
import { Checkin1Predict } from '../ui/screens/Checkin1Predict'
import { Checkin2TuneIn } from '../ui/screens/Checkin2TuneIn'
import { Checkin3BodyMap } from '../ui/screens/Checkin3BodyMap'
import { Checkin4SensationSheet } from '../ui/screens/Checkin4SensationSheet'
import { Checkin5MakeSense } from '../ui/screens/Checkin5MakeSense'
import { Checkout1aPickTempo } from '../ui/screens/Checkout1aPickTempo'
import { Checkout1bReveal } from '../ui/screens/Checkout1bReveal'
import { Checkout2Rpe } from '../ui/screens/Checkout2Rpe'
import { Checkout3Satisfaction } from '../ui/screens/Checkout3Satisfaction'
import { Checkout4Energy } from '../ui/screens/Checkout4Energy'
import { Checkout5BodyMap } from '../ui/screens/Checkout5BodyMap'
import { Checkout6SensationSheet } from '../ui/screens/Checkout6SensationSheet'
import { Checkout7CloseLoop } from '../ui/screens/Checkout7CloseLoop'

/** Il viewport del prototipo. Gli schermi da 404 vengono centrati dentro. */
export const STAGE = { w: 402, h: 874 }

export type Enter = 'push' | 'fade' | 'sheet'

export type ScreenProps = { entered?: boolean }

/**
 * Gli schermi hanno props diverse fra loro (selected, spots, backdrop) perche'
 * servono anche al diff e al reel. Il prototipo passa solo `entered` e lascia
 * il resto ai default: il cast sta qui, una volta, invece di aggiungere una
 * prop finta a ogni componente.
 */
const screen = (C: unknown) => C as ComponentType<ScreenProps>

export type Screen = {
  Component: ComponentType<ScreenProps>
  /** larghezza nativa del frame: 404 su alcuni schermi, 402 sugli altri */
  w: number
  /** altezza del contenuto: se supera STAGE.h lo schermo scorre davvero */
  h: number
  enter: Enter
  label: string
}

export type Flow = { id: string; title: string; screens: Screen[] }

export const FLOWS: Record<string, Flow> = {
  checkin: {
    id: 'checkin',
    title: 'Check-in',
    screens: [
      { Component: screen(Checkin1Predict), w: 404, h: 874, enter: 'fade', label: 'Predict' },
      { Component: screen(Checkin2TuneIn), w: 404, h: 1262, enter: 'push', label: 'Tune in' },
      { Component: screen(Checkin3BodyMap), w: 402, h: 874, enter: 'push', label: 'Pinpoint' },
      { Component: screen(Checkin4SensationSheet), w: 402, h: 874, enter: 'sheet', label: 'Name it' },
      { Component: screen(Checkin5MakeSense), w: 404, h: 874, enter: 'push', label: 'Body scan' },
    ],
  },
  checkout: {
    id: 'checkout',
    title: 'Check-out',
    screens: [
      { Component: screen(Checkout1aPickTempo), w: 402, h: 874, enter: 'fade', label: 'Pick tempo' },
      { Component: screen(Checkout1bReveal), w: 402, h: 874, enter: 'fade', label: 'Reveal' },
      { Component: screen(Checkout2Rpe), w: 402, h: 874, enter: 'push', label: 'Effort' },
      { Component: screen(Checkout3Satisfaction), w: 402, h: 874, enter: 'push', label: 'Satisfaction' },
      { Component: screen(Checkout4Energy), w: 402, h: 874, enter: 'push', label: 'Energy' },
      { Component: screen(Checkout5BodyMap), w: 402, h: 874, enter: 'push', label: 'Pinpoint' },
      { Component: screen(Checkout6SensationSheet), w: 402, h: 874, enter: 'sheet', label: 'Name it' },
      { Component: screen(Checkout7CloseLoop), w: 402, h: 874, enter: 'push', label: 'Your read' },
    ],
  },
}
