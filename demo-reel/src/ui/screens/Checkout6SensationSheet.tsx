import { SensationSheet } from '../primitives/SensationSheet'
import { labelOf } from '../primitives/BodyMap'
import type { Side } from '../primitives/BodyMap'
import { useField } from '../state'
import { useNav } from '../../proto/nav'
import { Checkout5BodyMap } from './Checkout5BodyMap'

/** costante di modulo: un array nuovo a ogni render manderebbe lo store in loop */
const DEFAULT_CHIPS = ['sore', 'tight', 'burning']
const NO_ZONES: string[] = []

/**
 * node 3588:213 — checkout-6-sensation-sheet
 *
 * Nell'export Figma lo sfondo e' un PNG appiattito dello schermo precedente.
 * Qui ci mettiamo lo schermo VERO, con la zona che stai nominando gia' accesa.
 *
 * Il punto si SALVA col bottone, non toccando la zona: finche' non confermi la
 * zona e' solo "in sospeso" e il contatore non si muove. Uscendo con la ✕ non
 * resta niente, che e' quello che ci si aspetta da un pannello che chiedeva
 * ancora di dare un nome.
 *
 * Ogni punto tiene le SUE risposte: la chiave dello store porta l'id della zona.
 */
export function Checkout6SensationSheet({ backdrop = true, entered = true }: { backdrop?: boolean; entered?: boolean }) {
  const nav = useNav()
  const [side] = useField<Side>('checkout.bodySide', 'Front')
  const [last] = useField<string | null>('checkout.lastZone', null)
  const [zones, setZones] = useField<readonly string[]>('checkout.zones', NO_ZONES)
  const saved = !!last && zones.includes(last)
  return (
    <div className="relative overflow-hidden" style={{ width: 402, height: 874 }}>
      <SensationSheet
        title={labelOf(side, last) ?? 'Left hamstring'}
        selected={DEFAULT_CHIPS}
        field={last ? `checkout.spot.${last}` : 'checkout.sheet'}
        saved={saved}
        onSave={() => {
          if (last && !zones.includes(last)) setZones([...zones, last])
          nav?.back()
        }}
        onRemove={() => {
          if (last) setZones(zones.filter((z) => z !== last))
          nav?.back()
        }}
        intensityThumb={131}
        ctaLabel="Add this sensation"
        ctaLabelLeft={105}
        entered={entered}
        sheetTop={175}
        sheetHeight={699}
        intensityDX={3}
        intensityDY={2.5}
        ctaTop={602}
        chipOverrides={{ numb: { y: 307, w: 80 } }}
        backdrop={backdrop ? <Checkout5BodyMap pending={last} /> : null}
      />
    </div>
  )
}
