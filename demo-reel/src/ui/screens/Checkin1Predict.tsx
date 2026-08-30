import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { Eyebrow } from '../primitives/Eyebrow'
import { CtaButton } from '../primitives/CtaButton'
import star from '../assets/icons/star.svg'
import flash from '../assets/icons/flash.svg'
import waves from '../assets/icons/waves.svg'
import leaf from '../assets/icons/leaf.svg'

export type Tempo = 'upbeat' | 'steady' | 'gentle'

const TEMPI: { id: Tempo; label: string; icon: string; iconSize: number; iconTop: number }[] = [
  { id: 'upbeat', label: 'Upbeat', icon: flash, iconSize: 16, iconTop: 10 },
  { id: 'steady', label: 'Steady', icon: waves, iconSize: 16, iconTop: 10.5 },
  { id: 'gentle', label: 'Gentle', icon: leaf, iconSize: 18, iconTop: 10.5 },
]

/** node 3530:4 — checkin-1-predict */
export function Checkin1Predict({ selected = 'upbeat' }: { selected?: Tempo }) {
  return (
    <Frame width={404}>
      <NavBar progress={78 / 284} />

      <Eyebrow icon={star}>STEP 1 · PREDICT</Eyebrow>

      <p
        className="bab-font-display absolute font-bold"
        style={{
          left: 31,
          top: 154,
          width: 342,
          fontSize: 30,
          lineHeight: '42px',
          letterSpacing: '-0.6px',
          color: 'var(--bab-ink)',
          margin: 0,
        }}
      >
        What’s your tempo today?
      </p>

      <p
        className="absolute"
        style={{
          left: 31,
          // 249 e non 248: misurato, il line box di Figma arrotonda in giu'
          top: 249,
          width: 342,
          fontSize: 16,
          lineHeight: 1.5,
          letterSpacing: '-0.32px',
          color: 'var(--bab-ink-soft)',
          margin: 0,
        }}
      >
        Your tempo is just{' '}
        <span className="font-bold" style={{ color: 'var(--bab-accent)' }}>
          how much your body's got to give today
        </span>
        . Take a guess now — you'll check it again after training. Guessing first is how your
        inner read gets sharp.
      </p>

      {/* riga dei tempi: 3 chip da 110px con 12px di gap */}
      <div className="absolute" style={{ left: 25, top: 384, width: 354, height: 62 }}>
        {TEMPI.map((tempo, i) => {
          const on = tempo.id === selected
          return (
            <div key={tempo.id} className="absolute top-0" style={{ left: i * 122, width: 110, height: 62 }}>
              <div
                className="absolute"
                style={{
                  left: 4,
                  top: 4,
                  width: 110,
                  height: 62,
                  borderRadius: 16,
                  background: on ? 'var(--bab-amber-shadow)' : 'var(--bab-shadow)',
                }}
              />
              <div
                className="absolute left-0 top-0"
                style={{
                  width: 110,
                  height: 62,
                  borderRadius: 16,
                  boxSizing: 'border-box',
                  background: on ? 'var(--bab-amber-bg)' : 'var(--bab-surface)',
                  border: on
                    ? '2px solid var(--bab-amber-line)'
                    : 'var(--bab-border-w) solid var(--bab-border)',
                }}
              >
                <img
                  src={tempo.icon}
                  alt=""
                  className="absolute"
                  style={{
                    left: (110 - tempo.iconSize) / 2,
                    top: tempo.iconTop,
                    width: tempo.iconSize,
                    height: tempo.iconSize,
                  }}
                />
                <p
                  className="bab-font-ui absolute w-full text-center font-bold"
                  style={{
                    left: 0,
                    top: 32,
                    fontSize: 13,
                    lineHeight: 'normal',
                    color: on ? 'var(--bab-ink-strong)' : 'var(--bab-ink)',
                    margin: 0,
                  }}
                >
                  {tempo.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* card informativa */}
      <div className="absolute" style={{ left: 25, top: 476, width: 358, height: 124 }}>
        <div
          className="absolute"
          style={{ left: 4, top: 4, width: 338, height: 120, borderRadius: 22, background: 'var(--bab-shadow)' }}
        />
        <div
          className="absolute left-0 top-0"
          style={{
            width: 354,
            height: 120,
            borderRadius: 22,
            background: 'var(--bab-surface)',
            border: 'var(--bab-border-w) solid var(--bab-border)',
            boxSizing: 'border-box',
          }}
        >
          <p
            className="absolute font-bold"
            style={{ left: 18.5, top: 17.5, width: 302, fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
          >
            No tempo is good or bad.
          </p>
          <p
            className="absolute"
            style={{
              left: 18.5,
              top: 40.5,
              width: 302,
              fontSize: 13,
              lineHeight: '18px',
              letterSpacing: '-0.26px',
              color: 'var(--bab-ink-soft)',
              margin: 0,
            }}
          >
            It's your body's unique message for you — you notice it, honour it, and learn to work
            with it.
          </p>
        </div>
      </div>

      <CtaButton label="Now let's tune in" left={31} top={778} width={342} />
    </Frame>
  )
}
