import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { Slider, SliderTicks, SliderEnds } from '../primitives/Slider'
import rotate from '../assets/icons/rotate-ccw.svg'

const TICKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

/** node 3565:4 — checkout-2-rpe */
export function Checkout2Rpe() {
  return (
    <Frame>
      <NavBar progress={62 / 284} left={26} top={56} trackWidth={290} borderWidth="1px" inset={3} />

      <img src={rotate} alt="" className="absolute" style={{ left: 31, top: 130, width: 20, height: 20 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 57, top: 130, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 1 · LOOK BACK
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 31, top: 154, width: 342, fontSize: 30, lineHeight: '40px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        How hard did the session feel?
      </p>

      {/* card Effort */}
      <div
        className="absolute"
        style={{
          left: 30,
          top: 248,
          width: 342,
          height: 146,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          border: '1px solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))',
        }}
      >
        <p
          className="absolute whitespace-nowrap font-bold"
          style={{ left: 19, top: 17, fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
        >
          Effort
        </p>
        <Slider left={19} top={47} width={302} thumbLeft={137} />
        <SliderTicks left={21} top={83} width={301} ticks={TICKS} active="5" />
        <SliderEnds top={113} leftX={13} rightX={327} leftLabel="Nothing at all" rightLabel="All-out" />
      </div>

      <div
        className="absolute overflow-hidden"
        style={{
          left: 30,
          top: 408,
          width: 342,
          height: 120,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          border: '1px solid var(--bab-border)',
          boxSizing: 'border-box',
          boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)',
        }}
      >
        <p
          className="absolute font-bold"
          style={{ left: 17, top: 15, width: 308, fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
        >
          Only you can answer this one.
        </p>
        <p
          className="absolute"
          style={{ left: 17, top: 44, width: 308, fontSize: 13, lineHeight: 1.5, letterSpacing: '-0.26px', color: 'var(--bab-ink-soft)', margin: 0 }}
        >
          Two people can do the exact same session and feel it completely differently — and both
          are right because <span className="font-bold">each body is unique</span>.
        </p>
      </div>

      <CtaButton label="Next" left={24} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} />
    </Frame>
  )
}
