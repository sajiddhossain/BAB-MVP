import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import sparkle from '../assets/icons/sparkle.svg'
import pin from '../assets/icons/pin-coral.svg'
import bulletTeal from '../assets/icons/bullet-teal.svg'
import bulletCoral from '../assets/icons/bullet-coral.svg'
import chevron from '../assets/icons/chevron-down-18.svg'

const ACHES = [
  {
    bullet: bulletTeal,
    y: 50.5,
    title: 'Working ache',
    body: 'Muscle burn or tightness from what you did recently. Eases as you warm up, sits in the muscle, not the joint.',
  },
  {
    bullet: bulletCoral,
    y: 106.5,
    title: 'Protective pain',
    body: 'Sharp, sudden or deep in a joint. One side only. Moving it makes you limp, or worsens the pain.',
  },
]

/** node 3554:4 — checkin-5-make-sense */
export function Checkin5MakeSense() {
  return (
    <Frame width={404}>
      <NavBar progress={289 / 293} left={25} top={54} trackWidth={298} />

      <img src={sparkle} alt="" className="absolute" style={{ left: 31, top: 130, width: 19.5, height: 19.5 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 57, top: 130, fontSize: 16, letterSpacing: '0.5px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 3 · BODY SCAN
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 25, top: 154, width: 354, fontSize: 30, lineHeight: '36px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        About that right quad.
      </p>

      {/* riepilogo del punto scelto */}
      <div
        className="absolute"
        style={{ left: 25, top: 198, width: 354, height: 70, borderRadius: 22, background: 'var(--bab-surface)', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box' }}
      >
        <div className="absolute" style={{ left: 12.5, top: 12.5, width: 42, height: 42, borderRadius: 14, background: '#fde9e6' }}>
          <img src={pin} alt="" className="absolute" style={{ left: 9, top: 9, width: 24, height: 24 }} />
        </div>
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 66.5, top: 13.5, fontSize: 16, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          Right quad
        </p>
        <p
          className="absolute"
          style={{ left: 66.5, top: 34.5, fontSize: 12, color: 'var(--bab-ink-mute)', lineHeight: 'normal', margin: 0, whiteSpace: 'pre' }}
        >
          {'tight · sore · burning  |  one side  |  4/10'}
        </p>
      </div>

      <div
        className="absolute"
        style={{ left: 25, top: 276, width: 354, height: 170, borderRadius: 22, background: 'var(--bab-surface)', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box' }}
      >
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 14.5, top: 12.5, fontSize: 14, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          Let’s decode it
        </p>
        {ACHES.map((a) => (
          <div key={a.title}>
            <img src={a.bullet} alt="" className="absolute" style={{ left: 14.5, top: a.y + 4, width: 8, height: 8 }} />
            <p className="absolute whitespace-nowrap font-bold" style={{ left: 31.5, top: a.y, fontSize: 13, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
              {a.title}
            </p>
            <p
              className="absolute"
              style={{ left: 31.5, top: a.y + 18, width: 308, fontSize: 11.5, lineHeight: '15px', color: 'var(--bab-ink-soft)', margin: 0 }}
            >
              {a.body}
            </p>
          </div>
        ))}
      </div>

      {/* accordion chiuso */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: 25,
          top: 454,
          width: 354,
          height: 48,
          padding: '14px 16px',
          borderRadius: 22,
          background: 'var(--bab-surface)',
          boxSizing: 'border-box',
          outline: 'var(--bab-border-w) solid var(--bab-border)',
          outlineOffset: 'calc(var(--bab-border-w) * -1)',
          filter: 'drop-shadow(0px 6px 9px rgba(0,0,0,0.05))',
        }}
      >
        <p className="shrink-0 whitespace-nowrap font-bold" style={{ fontSize: 14, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          Try this today
        </p>
        <img src={chevron} alt="" className="shrink-0" style={{ width: 18, height: 18 }} />
      </div>

      <div
        className="absolute"
        style={{ left: 25, top: 510, width: 354, height: 68, borderRadius: 16, background: '#f1effd', border: '1px solid #dcd7fb', boxSizing: 'border-box' }}
      >
        <p
          className="absolute"
          style={{ left: 13, top: 9, width: 326, fontSize: 11, lineHeight: '14.5px', color: '#4a3fc0', margin: 0 }}
        >
          BAB never tells you to train or not to train. For{' '}
          <span className="font-bold">protective pain</span>, anything new, or anything that isn't
          settling, loop in your coach, physio or a parent.
        </p>
      </div>

      <CtaButton label="Got it! Let’s start" left={25} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} />
    </Frame>
  )
}
