import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import rotate from '../assets/icons/rotate-ccw.svg'
import sad from '../assets/icons/face-sad.svg'
import meh from '../assets/icons/face-meh.svg'
import smile from '../assets/icons/face-smile.svg'
import grin from '../assets/icons/face-grin.svg'
import smilePlus from '../assets/icons/face-smile-plus.svg'
import checkEmpty from '../assets/icons/check-empty.svg'
import checkEllipse from '../assets/icons/check-ellipse.svg'
import checkMark from '../assets/icons/check-mark.svg'
import pencil from '../assets/icons/pencil.svg'

/** Le 5 facce: offset presi uno per uno da Figma, non distribuiti a passo fisso. */
const FACES = [
  { icon: sad, label: 'Disappointed', x: 0, labelX: 0, faceX: 1 },
  { icon: meh, label: 'Frustrated', x: 60.5, labelX: 5.5, faceX: 0 },
  { icon: smile, label: 'Satisfied', x: 120, labelX: 8, faceX: 0, on: true },
  { icon: grin, label: 'Confident', x: 179.5, labelX: 5.5, faceX: 0 },
  { icon: smilePlus, label: 'Proud', x: 239, labelX: 15, faceX: 0 },
]

const PILLS = [
  { w: 175, text: 'Learned something new' },
  { w: 156, text: 'Listened to my body', on: true },
  { w: 149, text: 'Helped a teammate' },
  { w: 194, text: 'Showed kindness to myself', on: true },
  { w: 142, text: 'Nailed an exercise' },
  { w: 127, text: 'Add your own...', dashed: true },
]

/** node 3568:4 — checkout-3-satisfaction */
export function Checkout3Satisfaction() {
  return (
    <Frame>
      <NavBar progress={89 / 288} left={24} top={56} trackWidth={294} borderWidth="1px" inset={3} />

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
        And how do you feel about it?
      </p>

      {/* card delle facce: flex-col con gap 7, come in Figma — la spaziatura
          dipende dall'altezza reale del titolo, meglio non fissarla a mano */}
      <div
        className="absolute flex flex-col items-start gap-[7px] overflow-hidden"
        style={{
          left: 30,
          top: 248,
          width: 342,
          height: 170,
          padding: '16px 18px',
          borderRadius: 22,
          background: 'var(--bab-surface)',
          boxSizing: 'border-box',
          // outline e non border: in Figma lo stroke e' disegnato dentro ma non
          // riduce il contenuto. Con border il contenuto scendeva a 304 invece di 306.
          outline: '1px solid var(--bab-border)',
          outlineOffset: -1,
          boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)',
        }}
      >
        <p className="w-full font-bold" style={{ fontSize: 15, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          How satisfied do you feel?
        </p>
        <div className="relative w-full shrink-0 overflow-hidden" style={{ height: 110, borderRadius: 16 }}>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(243,144,127,0.1) 0%, rgba(204,233,101,0.1) 50%, rgba(95,207,168,0.1) 100%)',
            }}
          />
          {/*
            Il gruppo facce+etichette e' alto 64 ed e' centrato verticalmente
            nella striscia da 110 (items-center in Figma), non attaccato in alto.
          */}
          <div className="absolute inset-x-0" style={{ top: '50%', height: 64, transform: 'translateY(-50%)' }}>
          {FACES.map((f) => (
            <div key={f.label}>
              <div
                className="absolute flex flex-col items-center justify-center"
                style={{ left: 6 + f.x + f.faceX, top: 0, width: 56, height: 56 }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: f.on ? 48 : 44,
                    height: f.on ? 48 : 44,
                    borderRadius: f.on ? 24 : 22,
                    background: f.on ? '#e5f5f2' : '#f6f5f1',
                    border: f.on ? '2px solid #10b981' : undefined,
                    boxSizing: 'border-box',
                  }}
                >
                  <img src={f.icon} alt="" style={{ width: 36, height: 36 }} />
                </div>
              </div>
              <p
                className="absolute whitespace-nowrap"
                style={{
                  left: 6 + f.x + f.labelX,
                  top: 53,
                  fontSize: 9,
                  lineHeight: 'normal',
                  margin: 0,
                  fontWeight: f.on ? 700 : 500,
                  color: f.on ? '#0b7a5a' : 'var(--bab-ink-soft)',
                }}
              >
                {f.label}
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* doppio bordo: Figma sovrappone un corpo da 1.5px su un contenitore da 1px */}
      <div
        className="absolute"
        style={{
          left: 30,
          top: 451,
          width: 342,
          height: 252,
          borderRadius: 22,
          border: '1px solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))',
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            // Figma dice -1/-1, ma misurato il contenuto cade 2px piu' a destra:
            // lo stroke del contenitore non consuma spazio nel loro modello.
            left: 1,
            top: -1,
            width: 342,
            height: 252,
            borderRadius: 22,
            background: 'var(--bab-surface)',
            boxSizing: 'border-box',
            outline: 'var(--bab-border-w) solid var(--bab-border)',
            outlineOffset: 'calc(var(--bab-border-w) * -1)',
          }}
        >
          <p
            className="absolute font-bold"
            style={{ left: 16.5, top: 14.5, width: 309, fontSize: 17, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
          >
            What did you bring home?
          </p>
          <p
            className="absolute whitespace-nowrap"
            style={{ left: 16.5, top: 36.5, fontSize: 11, lineHeight: '14px', letterSpacing: '0.5px', color: 'var(--bab-ink-soft)', margin: 0 }}
          >
            Select all that apply
          </p>

          <div
            className="absolute flex flex-wrap content-start items-start gap-[6px]"
            style={{ left: 16.5, top: 60.5, width: 306 }}
          >
            {PILLS.map((p) => (
              <div
                key={p.text}
                className="flex shrink-0 items-center gap-[6px]"
                style={{
                  width: p.w,
                  padding: '7px 10px 7px 9px',
                  borderRadius: 999,
                  boxSizing: 'border-box',
                  background: p.on ? '#e5f5f2' : '#f7f5f1',
                  outline: `1.5px ${p.dashed ? 'dashed' : 'solid'} ${p.on ? '#10b981' : 'var(--bab-border)'}`,
                  outlineOffset: -1.5,
                }}
              >
                <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
                  {p.dashed ? (
                    <img src={pencil} alt="" className="absolute" style={{ left: 1, top: 1, width: 14, height: 14 }} />
                  ) : p.on ? (
                    <>
                      <img src={checkEllipse} alt="" className="absolute inset-0" style={{ width: 16, height: 16 }} />
                      <img src={checkMark} alt="" className="absolute" style={{ left: 3.5, top: 4.5, width: 9, height: 7 }} />
                    </>
                  ) : (
                    <img src={checkEmpty} alt="" className="absolute inset-0" style={{ width: 16, height: 16 }} />
                  )}
                </div>
                <p
                  style={{
                    flex: '1 0 0',
                    minWidth: 0,
                    fontSize: 11.5,
                    lineHeight: '14px',
                    margin: 0,
                    fontWeight: p.on ? 700 : 400,
                    color: p.on ? '#0b7a5a' : p.dashed ? 'var(--bab-ink-soft)' : 'var(--bab-ink)',
                  }}
                >
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CtaButton label="Now let’s tune in" left={24} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} />
    </Frame>
  )
}
