import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { SegmentedToggle } from '../primitives/SegmentedToggle'
import { BodyMap, ELSEWHERE, zoneKey } from '../primitives/BodyMap'
import type { Side } from '../primitives/BodyMap'
import { useField } from '../state'
import { useNav } from '../../proto/nav'
import { SomewhereElse } from '../primitives/SomewhereElse'
import { ElsewhereSpot } from '../primitives/ElsewhereSpot'
import gps from '../assets/icons/gps.svg'

/** costante di modulo: un array nuovo a ogni render manderebbe lo store in loop */
const NO_ZONES: string[] = []

/** node 3588:167 — checkout-5-body-map */
export function Checkout5BodyMap({ spots = 1, pending = null }: { spots?: number; pending?: string | null }) {
  const nav = useNav()
  const [side, setSide] = useField<Side>('checkout.bodySide', 'Front')
  const [picked] = useField<readonly string[]>('checkout.zones', NO_ZONES)
  const [, setLast] = useField<string | null>('checkout.lastZone', null)
  // il frame dice "1 spots added": e' lo stato di chi ha gia' segnato
  // qualcosa. Nel prototipo si parte da zero (vedi proto/blank.ts).
  const [base] = useField('checkout.spotsBase', spots)
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
      <SomewhereElse
        right={402 - 378}
        top={251}
        onTap={() => {
          setLast(ELSEWHERE)
          nav?.next()
        }}
      />

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
      {/* qui la figura e' piu' alta che su checkin-3: 352 invece di 333 */}
      <BodyMap
        centerX={193.5}
        top={330}
        height={352}
        side={side}
        // `pending` e' la zona che stai nominando adesso: si accende subito ma
        // conta solo quando confermi. Arriva dal pannello, che ci sta sopra —
        // sulla mappa da sola non c'e' niente in sospeso.
        selected={pending && !picked.includes(pending) ? [...picked, pending] : picked}
        onPick={(z) => {
          setLast(zoneKey(side, z.id))
          nav?.next()
        }}
      />

      {/*
        Il punto fuori dal disegno. La card finisce a 705: 12 di margine e
        un'altezza di 26 lo mettono a 667, nell'angolo che la figura non usa.
      */}
      {picked.includes(ELSEWHERE) && (
        <ElsewhereSpot
          left={32}
          top={667}
          onTap={() => {
            setLast(ELSEWHERE)
            nav?.next()
          }}
        />
      )}

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

      {/* il pannello e' lo schermo dopo, ma ora si apre toccando una zona: qui lo scavalchiamo */}
      <CtaButton label="Next" left={31} top={778} width={342} labelTop={15.5} onTap={() => nav?.go(2)} />

      <p
        /*
         * Centrato, non ancorato a 154: quel numero e' la posizione di
         * "1 spots added" del frame, ma appena il conto cambia — o si toglie
         * la esse di troppo — la scritta resta storta.
         */
        className="absolute w-full whitespace-nowrap text-center font-bold"
        style={{ left: 0, top: 841, fontSize: 14, lineHeight: 'normal', margin: 0, color: '#866bf2' }}
      >
        {base + picked.length} spot{base + picked.length === 1 ? '' : 's'} added
      </p>
    </Frame>
  )
}
