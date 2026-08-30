import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { TempoChip } from '../primitives/TempoChip'
import rotate from '../assets/icons/rotate-ccw.svg'
import flash from '../assets/icons/flash.svg'
import waves from '../assets/icons/waves.svg'
import leaf from '../assets/icons/leaf.svg'

/** node 3673:2 — checkout-1a-pick-tempo */
export function Checkout1aPickTempo() {
  return (
    <Frame>
      {/* qui la track e' 294 e il bordo 1px, non 1.5 come negli altri schermi */}
      <NavBar progress={21.7 / 288} left={24} top={56} trackWidth={294} borderWidth="1px" inset={3} />

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

      <div className="absolute" style={{ left: 24, top: 341, width: 354, height: 62 }}>
        <TempoChip left={0} label="Upbeat" icon={flash} iconSize={18} iconLeft={44} iconTop={8} labelLeft={29.5} labelTop={32} tone="thick" />
        <TempoChip left={122} label="Steady" icon={waves} iconSize={16} iconLeft={44.5} iconTop={8.5} labelLeft={31} />
        <TempoChip left={244} label="Gentle" icon={leaf} iconSize={18} iconLeft={44.5} iconTop={8.5} tone="amber-line" />
      </div>

      <CtaButton label="Next" left={19} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} />
    </Frame>
  )
}
