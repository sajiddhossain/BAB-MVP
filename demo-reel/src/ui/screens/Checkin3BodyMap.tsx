import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { SegmentedToggle } from '../primitives/SegmentedToggle'
import { BodyMap, ELSEWHERE } from '../primitives/BodyMap'
import type { Side } from '../primitives/BodyMap'
import { useField } from '../state'
import { useNav } from '../../proto/nav'
import { SomewhereElse } from '../primitives/SomewhereElse'
import gps from '../assets/icons/gps.svg'

/** costante di modulo: un array nuovo a ogni render manderebbe lo store in loop */
const NO_ZONES: string[] = []

/** node 3523:251 — checkin-3-body-map */
export function Checkin3BodyMap({ spots = 2, pending = null }: { spots?: number; pending?: string | null }) {
  const nav = useNav()
  const [side, setSide] = useField<Side>('checkin.bodySide', 'Front')
  const [picked] = useField<readonly string[]>('checkin.zones', NO_ZONES)
  const [, setLast] = useField<string | null>('checkin.lastZone', null)
  // il frame dice "2 spots added": e' lo stato di chi ha gia' segnato
  // qualcosa. Nel prototipo si parte da zero (vedi proto/blank.ts).
  const [base] = useField('checkin.spotsBase', spots)
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

      <SomewhereElse
        right={402 - 378}
        top={251}
        onTap={() => {
          setLast(ELSEWHERE)
          nav?.next()
        }}
      />

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
      {/* toccare una zona la accende e fa salire il sheet: la tendina e' lo
          schermo successivo, che ha come sfondo questo stesso schermo, quindi
          la zona resta colorata dietro al pannello */}
      <BodyMap
        // misurati sull'export Figma: la figura sta in 113x333 centrata a 196
        centerX={196}
        top={346}
        height={333}
        side={side}
        // `pending` e' la zona che stai nominando adesso: si accende subito ma
        // conta solo quando confermi. Arriva dal pannello, che ci sta sopra —
        // sulla mappa da sola non c'e' niente in sospeso.
        selected={pending && !picked.includes(pending) ? [...picked, pending] : picked}
        onPick={(z) => {
          setLast(z.id)
          nav?.next()
        }}
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

      {/* il pannello e' lo schermo dopo, ma ora si apre toccando una zona: qui lo scavalchiamo */}
      <CtaButton label="Almost done" left={31} top={778} width={342} labelTop={15.5} onTap={() => nav?.go(2)} />

      <p
        className="absolute whitespace-nowrap font-bold"
        style={{ left: 153, top: 841, fontSize: 14, lineHeight: 'normal', margin: 0, color: '#866bf2' }}
      >
        {base + picked.length} spots added
      </p>
    </Frame>
  )
}
