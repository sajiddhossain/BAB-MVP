import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { TempoChip } from '../primitives/TempoChip'
import rotate from '../assets/icons/rotate-ccw.svg'
import flash from '../assets/icons/flash.svg'
import waves from '../assets/icons/waves.svg'
import leaf from '../assets/icons/leaf.svg'

/** node 3562:4 — checkout-1b-reveal-comparison */
export function Checkout1bReveal() {
  return (
    <Frame>
      <NavBar progress={31 / 288} left={24} top={56} trackWidth={294} borderWidth="1px" inset={3} />

      <img src={rotate} alt="" className="absolute" style={{ left: 31, top: 130, width: 20, height: 20 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 57, top: 130, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 1 · LOOK BACK
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 30, top: 154, width: 342, fontSize: 30, lineHeight: '40px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        How did your body feel?
      </p>

      <p
        className="absolute"
        style={{ left: 30, top: 249, width: 342, fontSize: 15, lineHeight: 1.5, letterSpacing: '-0.3px', color: 'var(--bab-ink-soft)', margin: 0 }}
      >
        Thinking back on training, pick the tempo your body{' '}
        <span className="font-bold" style={{ color: 'var(--bab-accent)' }}>
          actually followed
        </span>
        .{' '}
      </p>

      {/*
        Stato "rivelato": Upbeat resta la previsione (ombra ambra, bordo spesso),
        Gentle e' cio' che il corpo ha fatto davvero (riempimento ambra).
      */}
      <div className="absolute" style={{ left: 24, top: 341, width: 354, height: 62 }}>
        <TempoChip left={0} label="Upbeat" icon={flash} iconSize={18} iconLeft={45} iconTop={10} labelLeft={29.5} labelTop={32} tone="thick" shadow="var(--bab-amber-shadow)" labelColor="var(--bab-ink-strong)" />
        <TempoChip left={122} label="Steady" icon={waves} iconSize={16} iconLeft={45.5} iconTop={10.5} labelLeft={31} />
        <TempoChip left={244} label="Gentle" icon={leaf} iconSize={18} iconLeft={45.5} iconTop={10.5} tone="amber-fill" shadow="var(--bab-shadow)" labelColor="var(--bab-ink)" />
      </div>

      {/* qui la card ha bordo 1px e una vera box-shadow morbida, non il rettangolo sfalsato */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: 30,
          top: 427,
          width: 342,
          height: 142,
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
          You guessed Steady — Your body’s tempo was Gentle.
        </p>
        <p
          className="absolute"
          style={{ left: 17, top: 59, width: 308, fontSize: 13, lineHeight: 1.5, letterSpacing: '-0.26px', color: 'var(--bab-ink-soft)', margin: 0 }}
        >
          The space between your guess and your body’s tempo is where you get sharper at decoding
          its signals. Being "off" isn't a fail: it's information.{' '}
        </p>
      </div>

      <CtaButton label="Next" left={19} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} />
    </Frame>
  )
}
