import { SensationSheet } from '../primitives/SensationSheet'
import { labelOf } from '../primitives/BodyMap'
import { useField } from '../state'
import { useNav } from '../../proto/nav'
import { Checkin3BodyMap } from './Checkin3BodyMap'

/** costante di modulo: un array nuovo a ogni render manderebbe lo store in loop */
const DEFAULT_CHIPS = ['sore', 'tight', 'burning']
const NO_ZONES: string[] = []

/**
 * node 3547:34 — checkin-4-sensation-sheet
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
export function Checkin4SensationSheet({ backdrop = true, entered = true }: { backdrop?: boolean; entered?: boolean }) {
  const nav = useNav()
  const [last] = useField<string | null>('checkin.lastZone', null)
  const [zones, setZones] = useField<readonly string[]>('checkin.zones', NO_ZONES)
  const saved = !!last && zones.includes(last)
  return (
    <div className="relative overflow-hidden" style={{ width: 402, height: 874 }}>
      <SensationSheet
        title={labelOf(last) ?? 'Right quad'}
        selected={DEFAULT_CHIPS}
        field={last ? `checkin.spot.${last}` : 'checkin.sheet'}
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
        backdrop={backdrop ? <Checkin3BodyMap pending={last} /> : null}
      />
    </div>
  )
}
