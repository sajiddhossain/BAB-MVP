import { SensationSheet } from '../primitives/SensationSheet'
import { Checkin3BodyMap } from './Checkin3BodyMap'

/**
 * node 3547:34 — checkin-4-sensation-sheet
 *
 * Nell'export Figma lo sfondo e' un PNG appiattito dello schermo precedente.
 * Qui ci mettiamo lo schermo VERO: per il reel il sheet sale davvero sopra
 * la body map, invece che sopra una sua fotografia.
 */
export function Checkin4SensationSheet({ backdrop = true }: { backdrop?: boolean }) {
  return (
    <div className="relative overflow-hidden" style={{ width: 402, height: 874 }}>
      <SensationSheet
        title="Right quad"
        selected={['sore', 'tight', 'burning']}
        intensityThumb={131}
        ctaLabel="Add this sensation"
        ctaLabelLeft={105}
        backdrop={backdrop ? <Checkin3BodyMap /> : null}
      />
    </div>
  )
}
