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

/*
 * Lo sprite contiene fronte e retro affiancati: passare a "Back" significa
 * spostare il ritaglio di mezza immagine (396.34 / 2 = 198.17px su un
 * contenitore da 140, cioe' -141.55 punti percentuali).
 */
const FRONT_LEFT_PCT = -29.74
const BACK_LEFT_PCT = FRONT_LEFT_PCT - 141.55

/** node 3523:251 — checkin-3-body-map */
export function Checkin3BodyMap({ spots = 2 }: { spots?: number }) {
  const [side, setSide] = useField('checkin.bodySide', 'Front')
  const [marks, setMarks] = useField<readonly Marker[]>('checkin.bodyMarks', NO_MARKERS)
  return (
    <Frame>
      <NavBar progress={162 / 285} left={20} top={55} trackWidth={290} />

      {/* eyebrow: qui l'icona e il testo hanno coordinate diverse da checkin-1 */}
      <img src={gps} alt="" className="absolute" style={{ left: 30, top: 131, width: 19.5, height: 19.5 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 54, top: 132, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 3 · PINPOINT
      </p>

      <p
        className="bab-font-display absolute font-bold"
        // Figma dichiara -0.5px ma renderizza -0.3px (misurato con scripts/sweep.mjs)
        style={{ left: 28, top: 162, width: 350, fontSize: 30, letterSpacing: '-0.2px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        Where do you feel it?
      </p>
      <p
        className="absolute font-bold"
        style={{ left: 28, top: 202, width: 350, fontSize: 16, letterSpacing: '-0.32px', color: 'var(--bab-ink-soft)', lineHeight: 'normal', margin: 0 }}
      >
        Tap a spot, then name what you feel.
      </p>

      <SegmentedToggle left={20} top={251} options={['Front', 'Back']} active={side} onSelect={setSide} />

      <SomewhereElse right={402 - 378} top={251} />

      {/* la card della mappa ha un'ombra dura sfalsata 6px/5px, non morbida */}
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
        left={125}
        top={335}
        width={140}
        height={352}
        imgWidthPct={283.1}
        imgHeightPct={112.1}
        imgLeftPct={side === 'Back' ? BACK_LEFT_PCT : FRONT_LEFT_PCT}
        imgTopPct={-4.19}
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
        to it help you understand, manage and communicate it.
      </p>

      <CtaButton label="Almost done" left={31} top={778} width={342} labelTop={15.5} />

      <p
        className="absolute whitespace-nowrap font-bold"
        style={{ left: 153, top: 841, fontSize: 14, lineHeight: 'normal', margin: 0, color: '#866bf2' }}
      >
        {spots + marks.length} spots added
      </p>
    </Frame>
  )
}
