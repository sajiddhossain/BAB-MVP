import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { Slider, SliderTicks, SliderEnds } from '../primitives/Slider'
import music from '../assets/icons/music.svg'

/** gradiente invertito rispetto a rpe: qui il rosso e' "scarico" */
const ENERGY_GRADIENT =
  'linear-gradient(90deg, rgb(243, 144, 127) 0%, rgb(245, 200, 122) 33%, rgb(204, 233, 101) 66%, rgb(95, 207, 168) 100%)'

/** node 3590:4 — checkout-4-energy */
export function Checkout4Energy() {
  return (
    <Frame>
      <NavBar progress={120.84 / 289} left={24} top={56} trackWidth={294} />

      {/* l'icona sta in un box da 20 con inset 12.5% -> 15px a offset 2.5 */}
      <div className="absolute overflow-hidden" style={{ left: 31, top: 130, width: 20, height: 20 }}>
        <img src={music} alt="" className="absolute" style={{ left: 2.5, top: 2.5, width: 15, height: 15 }} />
      </div>
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 57, top: 130, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 2 · TUNE IN
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 31, top: 154, width: 342, fontSize: 30, lineHeight: '40px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        Where’s your energy now?
      </p>

      <div
        className="absolute"
        style={{
          left: 30,
          top: 248,
          width: 342,
          height: 214,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))',
        }}
      >
        <p
          className="absolute whitespace-nowrap font-bold"
          style={{ left: 18.5, top: 16.5, fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
        >
          Energy
        </p>
        <Slider left={18.5} top={46.5} width={302} thumbLeft={87} gradient={ENERGY_GRADIENT} />
        {/* qui le tacche sono distribuite, non a gap fisso come su rpe */}
        <SliderTicks left={12.5} top={82.5} width={314} ticks={['1', '2', '3', '4', '5', '6', '7']} active="3" fontSize={11.5} />
        <SliderEnds top={112.5} leftX={12.5} rightX={326.5} leftLabel="Drained" rightLabel="Still buzzing" fontSize={11.5} />

        <div
          className="absolute"
          style={{
            left: 20,
            top: 148.5,
            width: 302,
            height: 33,
            borderRadius: 12,
            background: '#f6f5f1',
            border: '1px solid var(--bab-border)',
            boxSizing: 'border-box',
          }}
        >
          <p
            className="absolute w-full text-center font-bold"
            style={{ left: 0, top: 7, fontSize: 13, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0, whiteSpace: 'nowrap' }}
          >
            3 · A bit low · Something in between
          </p>
        </div>
      </div>

      <div
        className="absolute overflow-hidden"
        style={{
          left: 30,
          top: 478,
          width: 342,
          height: 100,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)',
        }}
      >
        <p
          className="absolute font-bold"
          style={{ left: 16.5, top: 14.5, width: 309, fontSize: 15.5, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
        >
          This morning you were at 4.
        </p>
        <p
          className="absolute"
          style={{ left: 16.5, top: 42.5, width: 309, fontSize: 12.5, lineHeight: 1.5, letterSpacing: '-0.25px', color: '#6b6a72', margin: 0 }}
        >
          Energy dropping after a session is normal and expected.
        </p>
      </div>

      <CtaButton
        label="Pinpoint how it feels"
        left={30}
        top={778}
        width={342}
        labelColor="var(--bab-ink)"
        shadowInsetX={3}
        shadowOnTop
        labelWidth={354}
        labelCenter={175.5}
      />
    </Frame>
  )
}
