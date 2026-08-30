import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { SegmentedToggle } from '../primitives/SegmentedToggle'
import { BodySprite } from '../primitives/BodySprite'
import { BodyMarkers } from '../primitives/BodyMarkers'
import type { Marker } from '../primitives/BodyMarkers'
import { useField } from '../state'
import { SomewhereElse } from '../primitives/SomewhereElse'
import gps from '../assets/icons/gps.svg'

const NO_MARKERS: Marker[] = []

/** node 3588:167 — checkout-5-body-map */
export function Checkout5BodyMap({ spots = 1 }: { spots?: number }) {
  // qui l'asset e' una figura sola, non lo sprite fronte/retro: il toggle
  // cambia la linguetta ma non puo' girare il corpo
  const [side, setSide] = useField('checkout.bodySide', 'Front')
  const [marks, setMarks] = useField<readonly Marker[]>('checkout.bodyMarks', NO_MARKERS)
  return (
    <Frame>
      <NavBar progress={162 / 285} left={20} top={55} trackWidth={290} />

      <img src={gps} alt="" className="absolute" style={{ left: 28, top: 132, width: 19.5, height: 19.5 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 54, top: 132, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 3 · PINPOINT
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 28, top: 162, width: 350, fontSize: 30, letterSpacing: '-0.2px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        Where do you feel it?
      </p>
      {/* qui il sottotitolo sta a 215, non a 202 come su checkin-3 */}
      <p
        className="absolute font-bold"
        style={{ left: 28, top: 215, width: 350, fontSize: 16, letterSpacing: '-0.32px', color: 'var(--bab-ink-soft)', lineHeight: 'normal', margin: 0 }}
      >
        Tap a spot, then name what you feel.
      </p>

      <SegmentedToggle left={20} top={251} options={['Front', 'Back']} active={side} onSelect={setSide} />
      <SomewhereElse right={402 - 378} top={251} />

      <div
        className="absolute"
        style={{
          left: 20,
          top: 308,
          width: 358,
          height: 397,
          borderRadius: 28,
          background: 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(6px 5px 0px rgba(0,0,0,0.04))',
        }}
      />
      <BodySprite
        src="back"
        // 129/330 e non 127.5/328.5: in Figma i figli di un contenitore con bordo
        // sono relativi al contenuto, quindi il bordo da 1.5px li sposta.
        left={129}
        top={330}
        width={128}
        height={352}
        imgWidthPct={128.45}
        imgHeightPct={104.17}
        imgLeftPct={-14.5}
        imgTopPct={-2.34}
      />
      <BodyMarkers
        left={20}
        top={308}
        width={358}
        height={397}
        markers={marks}
        onAdd={(m) => setMarks([...marks, m])}
      />

      <p
        className="absolute"
        style={{ left: 20, top: 726, width: 362, fontSize: 13, lineHeight: '18px', color: 'var(--bab-ink)', margin: 0 }}
      >
        Pausing to find{' '}
        <span className="font-bold" style={{ color: '#866bf2' }}>
          where
        </span>{' '}
        a sensation sits and putting a{' '}
        <span className="font-bold" style={{ color: '#866bf2' }}>
          word
        </span>{' '}
        to it helps you understand, manage and communicate it.
      </p>

      <CtaButton label="Next" left={31} top={778} width={342} labelTop={15.5} />

      <p
        className="absolute whitespace-nowrap font-bold"
        style={{ left: 154, top: 841, fontSize: 14, lineHeight: 'normal', margin: 0, color: '#866bf2' }}
      >
        {spots + marks.length} spots added
      </p>
    </Frame>
  )
}
