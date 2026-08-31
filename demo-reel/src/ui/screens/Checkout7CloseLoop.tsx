import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { Touchable } from '../primitives/Touchable'
import { useField } from '../state'
import star from '../assets/icons/star.svg'
import arrowRight from '../assets/icons/arrow-right.svg'
import dotGreen from '../assets/icons/dot-green.svg'
import dotRed from '../assets/icons/dot-red.svg'

const ACHES = [
  {
    dot: dotGreen,
    title: 'Working ache',
    body: 'Burn or tiredness in muscles that worked, fairly even on both sides, easing as you cool down.',
  },
  {
    dot: dotRed,
    title: 'Protective pain',
    body: 'Sharp or sudden, inside a joint or bone, one side only, makes you limp, or does not settle.',
  },
]

/** node 3594:4 — checkout-7-close-loop */
export function Checkout7CloseLoop() {
  const [answer, setAnswer] = useField<'Yes' | 'No' | null>('checkout.protective', 'No')
  return (
    <Frame>
      {/* qui la track e' beige traslucida con raggio 8, non bianca con raggio 99 */}
      <div className="absolute" style={{ left: 24, top: 56, width: 44, height: 44 }}>
        <NavBar progress={0} left={0} top={0} trackWidth={0} />
      </div>
      <div
        className="absolute"
        style={{
          left: 84,
          top: 70,
          width: 294,
          height: 16,
          borderRadius: 8,
          background: 'rgba(224,220,216,0.5)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          boxShadow: '0px 1px 4px 0px rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="absolute"
          style={{
            left: 2.5,
            top: 2.5,
            width: 285,
            height: 8,
            borderRadius: 4,
            background: 'linear-gradient(to right, var(--bab-lime-from), var(--bab-lime-to))',
          }}
        />
      </div>

      <img src={star} alt="" className="absolute" style={{ left: 31, top: 116, width: 19.5, height: 19.5 }} />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 56, top: 116, fontSize: 16, letterSpacing: '1px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 4 · YOUR READ
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 31, top: 154, width: 342, fontSize: 30, lineHeight: '30px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        Here's what today taught you.
      </p>

      {/* previsione -> richiesta del corpo */}
      <div
        className="absolute flex flex-col items-start gap-[2px] font-bold"
        style={{
          left: 24,
          top: 229,
          width: 130,
          height: 50,
          padding: '8px 10px',
          borderRadius: 14,
          background: '#fcf3e2',
          boxSizing: 'border-box',
          outline: '1.5px solid #e8d6bd',
          outlineOffset: -1.5,
          color: '#e8a33d',
        }}
      >
        <p className="whitespace-nowrap uppercase" style={{ fontSize: 9, letterSpacing: '1px', lineHeight: 'normal', margin: 0 }}>
          Prediction
        </p>
        <p className="whitespace-nowrap" style={{ fontSize: 16, lineHeight: 'normal', margin: 0 }}>
          Steady
        </p>
      </div>
      <div className="absolute flex items-center justify-center" style={{ left: 186, top: 246, width: 30, height: 20 }}>
        <img src={arrowRight} alt="" style={{ width: 16, height: 16 }} />
      </div>
      <div
        className="absolute font-bold"
        style={{
          left: 248,
          top: 229,
          width: 130,
          height: 50,
          borderRadius: 14,
          background: '#f1effd',
          boxSizing: 'border-box',
          outline: '1.5px solid #dcd7fb',
          outlineOffset: -1.5,
          color: '#7b6ef6',
        }}
      >
        <p className="absolute whitespace-nowrap uppercase" style={{ left: 8.5, top: 6.5, fontSize: 9, letterSpacing: '1px', lineHeight: 'normal', margin: 0 }}>
          body’S ask
        </p>
        <p className="absolute whitespace-nowrap" style={{ left: 8.5, top: 19.5, fontSize: 16, lineHeight: 'normal', margin: 0 }}>
          Gentle{' '}
        </p>
      </div>

      <p
        className="absolute"
        style={{ left: 24, top: 299, width: 354, fontSize: 13, lineHeight: 1.5, letterSpacing: '-0.13px', color: 'var(--bab-ink-soft)', margin: 0 }}
      >
        You went in expecting more than your body had today - and you noticed it. That's{' '}
        <span className="font-bold">your read getting</span> <span className="font-bold">sharper</span>, not a
        session gone wrong.
      </p>

      <div
        className="absolute flex flex-col items-start gap-[8px]"
        style={{
          left: 24,
          top: 379,
          width: 354,
          height: 270,
          padding: 12,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          boxSizing: 'border-box',
          outline: 'var(--bab-border-w) solid var(--bab-border)',
          outlineOffset: 'calc(var(--bab-border-w) * -1)',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))',
        }}
      >
        <p className="shrink-0 whitespace-nowrap font-bold" style={{ fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          Decode the ache
        </p>
        <p className="w-full shrink-0" style={{ fontSize: 11.5, lineHeight: '16px', color: '#6b6a72', margin: 0 }}>
          Some things only show up once you stop. Naming it comes first - deciding what to do comes
          after.
        </p>

        {ACHES.map((a) => (
          <div key={a.title} className="flex w-full shrink-0 items-start gap-[10px]">
            <img src={a.dot} alt="" className="shrink-0" style={{ width: 8, height: 8, marginTop: 4 }} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[2px]">
              <p className="shrink-0 whitespace-nowrap font-bold" style={{ fontSize: 12.5, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
                {a.title}
              </p>
              <p className="w-full shrink-0" style={{ fontSize: 11, lineHeight: '14px', color: 'var(--bab-ink-mute)', margin: 0 }}>
                {a.body}
              </p>
            </div>
          </div>
        ))}

        <div className="w-full shrink-0" style={{ height: 1, background: 'var(--bab-border)' }} />
        <div className="relative w-full shrink-0" style={{ height: 16 }}>
          <p className="absolute whitespace-nowrap font-bold" style={{ left: 0, top: 0, fontSize: 12.5, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
            Feeling any of the protective kind?
          </p>
        </div>
        <div className="relative shrink-0" style={{ width: 300, height: 28 }}>
          {([
            { label: 'Yes' as const, left: 12, labelLeft: 61.5 },
            { label: 'No' as const, left: 166, labelLeft: 64 },
          ]).map((b) => {
            const on = answer === b.label
            return (
              <Touchable
                key={b.label}
                className="absolute"
                onTap={() => setAnswer(b.label)}
                press={0.95}
                style={{
                  left: b.left,
                  top: 0,
                  width: 146,
                  height: 28,
                  borderRadius: 100,
                  background: on ? '#e5f5f2' : 'var(--bab-surface)',
                  border: `var(--bab-border-w) solid ${on ? '#4ab5a0' : 'var(--bab-border)'}`,
                  boxSizing: 'border-box',
                }}
              >
                <p
                  className="absolute whitespace-nowrap font-bold"
                  style={{ left: b.labelLeft, top: 5, fontSize: 12, color: on ? '#0b7a5a' : 'var(--bab-ink-soft)', lineHeight: 'normal', margin: 0 }}
                >
                  {b.label}
                </p>
              </Touchable>
            )
          })}
        </div>
      </div>

      <div
        className="absolute flex flex-col items-start"
        style={{
          left: 24,
          top: 667,
          width: 354,
          padding: 10,
          borderRadius: 16,
          background: '#f1effd',
          boxSizing: 'border-box',
          outline: '1.5px solid #dcd7fb',
          outlineOffset: -1.5,
        }}
      >
        <p className="w-full shrink-0" style={{ fontSize: 11, lineHeight: 1.4, color: '#7b6ef6', margin: 0 }}>
          Recovery isn't the boring bit after training - it's where the training actually works. For{' '}
          <span className="font-bold">protective pain</span> or anything that feels off, loop in your
          coach, physio or a parent.
        </p>
      </div>

      {/* CTA verde pieno con ombra sopra, come su checkin-4 */}
      <div
        className="absolute"
        style={{ left: 30, top: 784, width: 354, height: 56, borderRadius: 100, background: '#d4f369', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))' }}
      >
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 119, top: 16.5, fontSize: 16, color: 'var(--bab-ink-max)', lineHeight: 'normal', margin: 0 }}>
          Done for today
        </p>
      </div>
      <div className="absolute" style={{ left: 30, top: 790, width: 354, height: 56, borderRadius: 100, background: 'var(--bab-shadow)' }} />
    </Frame>
  )
}
