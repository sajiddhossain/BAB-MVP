import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { SegmentedToggle } from '../primitives/SegmentedToggle'
import { BodySprite } from '../primitives/BodySprite'
import gps from '../assets/icons/gps.svg'

/** node 3523:251 — checkin-3-body-map */
export function Checkin3BodyMap({ spots = 2 }: { spots?: number }) {
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

      <SegmentedToggle left={20} top={251} options={['Front', 'Back']} active="Front" />

      {/*
        Ancorato a destra dentro la riga larga 358, non a un left fisso:
        con il left fisso il bordo destro finiva 3px corto rispetto al riferimento.
      */}
      <div
        className="absolute flex items-center justify-center gap-[8px]"
        style={{
          right: 402 - 378,
          top: 251,
          height: 41,
          padding: '0 16px',
          borderRadius: 100,
          background: 'var(--bab-surface)',
          border: '1.5px solid var(--bab-bg)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))',
        }}
      >
        <p className="whitespace-nowrap font-bold" style={{ fontSize: 14, lineHeight: 'normal', margin: 0, color: 'var(--bab-ink-mute)' }}>
          Somewhere else
        </p>
        <div
          className="flex items-center justify-center"
          style={{ width: 20, height: 20, borderRadius: 100, background: 'var(--bab-bg)' }}
        >
          <p className="font-bold" style={{ fontSize: 12, lineHeight: 'normal', margin: 0, color: 'var(--bab-ink-soft)' }}>
            ⓘ
          </p>
        </div>
      </div>

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
        imgLeftPct={-29.74}
        imgTopPct={-4.19}
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
        {spots} spots added
      </p>
    </Frame>
  )
}
