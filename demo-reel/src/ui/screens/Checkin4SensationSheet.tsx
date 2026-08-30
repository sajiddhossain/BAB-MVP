import { SensationSheet } from '../primitives/SensationSheet'
import { labelOf } from '../primitives/BodyMap'
import type { Side } from '../primitives/BodyMap'
import { useField } from '../state'

/** costante di modulo: un array nuovo a ogni render manderebbe lo store in loop */
const DEFAULT_CHIPS = ['sore', 'tight', 'burning']
import { Checkin3BodyMap } from './Checkin3BodyMap'

/**
 * node 3547:34 — checkin-4-sensation-sheet
 *
 * Nell'export Figma lo sfondo e' un PNG appiattito dello schermo precedente.
 * Qui ci mettiamo lo schermo VERO: il sheet sale davvero sopra la body map,
 * invece che sopra una sua fotografia. Il titolo e' la zona che hai toccato;
 * "Right quad" e' solo il valore di partenza, quello del frame Figma.
 */
export function Checkin4SensationSheet({ backdrop = true, entered = true }: { backdrop?: boolean; entered?: boolean }) {
  const [side] = useField<Side>('checkin.bodySide', 'Front')
  const [last] = useField<string | null>('checkin.lastZone', null)
  return (
    <div className="relative overflow-hidden" style={{ width: 402, height: 874 }}>
      <SensationSheet
        title={labelOf(side, last) ?? 'Right quad'}
        selected={DEFAULT_CHIPS}
        field="checkin.sheet"
        intensityThumb={131}
        ctaLabel="Add this sensation"
        ctaLabelLeft={105}
        entered={entered}
        backdrop={backdrop ? <Checkin3BodyMap /> : null}
      />
    </div>
  )
}
