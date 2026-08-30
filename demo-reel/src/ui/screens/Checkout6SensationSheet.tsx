import { SensationSheet } from '../primitives/SensationSheet'
import { Checkout5BodyMap } from './Checkout5BodyMap'

/** node 3588:213 — checkout-6-sensation-sheet */
export function Checkout6SensationSheet({ backdrop = true, entered = true }: { backdrop?: boolean; entered?: boolean }) {
  return (
    <div className="relative overflow-hidden" style={{ width: 402, height: 874 }}>
      <SensationSheet
        title="Left hamstring"
        selected={['sore', 'tight', 'burning']}
        intensityThumb={131}
        ctaLabel="Add this sensation"
        ctaLabelLeft={105}
        sheetTop={175}
        sheetHeight={699}
        intensityDX={3}
        intensityDY={2.5}
        ctaTop={602}
        chipOverrides={{ numb: { y: 307, w: 80 } }}
        entered={entered}
        backdrop={backdrop ? <Checkout5BodyMap /> : null}
      />
    </div>
  )
}
