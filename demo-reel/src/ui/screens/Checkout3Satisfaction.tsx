import { useRef, useState } from 'react'
import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { Touchable } from '../primitives/Touchable'
import { useField, toggle } from '../state'
import { Keyboard } from '../primitives/Keyboard'
import { fakeKeyboard } from '../keyboard'
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
  { icon: smile, label: 'Satisfied', x: 120, labelX: 8, faceX: 0 },
  { icon: grin, label: 'Confident', x: 179.5, labelX: 5.5, faceX: 0 },
  { icon: smilePlus, label: 'Proud', x: 239, labelX: 15, faceX: 0 },
]

/** costanti di modulo: riferimenti stabili per lo store */
const DEFAULT_FACE = 'Satisfied'
const DEFAULT_PILLS = ['Listened to my body', 'Showed kindness to myself']

/** la pillola tratteggiata non e' una scelta dall'elenco: e' un campo */
const OWN = 'Add your own...'

const PILLS = [
  { w: 175, text: 'Learned something new' },
  { w: 156, text: 'Listened to my body' },
  { w: 149, text: 'Helped a teammate' },
  { w: 194, text: 'Showed kindness to myself' },
  { w: 142, text: 'Nailed an exercise' },
  { w: 127, text: OWN },
]

/** node 3568:4 — checkout-3-satisfaction */
export function Checkout3Satisfaction() {
  const [face, setFace] = useField<string | null>('checkout.face', DEFAULT_FACE)
  const [pills, setPills] = useField<readonly string[]>('checkout.takeHome', DEFAULT_PILLS)
  /*
   * "Add your own..." era un finto campo: sembrava scrivibile e non lo era.
   * Ora lo e'. Il campo vero pero' compare solo quando lo tocchi: a riposo
   * resta il testo di prima, identico al frame, e il confronto con Figma non
   * si muove di un pixel.
   */
  const [own, setOwn] = useField('checkout.ownTakeHome', '')
  const [editing, setEditing] = useState(false)
  const kb = fakeKeyboard()
  const ownBox = useRef<HTMLInputElement>(null)
  const hasOwn = own.trim().length > 0
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
          {FACES.map((f) => {
            const on = face === f.label
            return (
            <div key={f.label}>
              <Touchable
                className="absolute flex flex-col items-center justify-center"
                onTap={() => setFace(f.label)}
                press={0.9}
                style={{ left: 6 + f.x + f.faceX, top: 0, width: 56, height: 56 }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: on ? 48 : 44,
                    height: on ? 48 : 44,
                    borderRadius: on ? 24 : 22,
                    background: on ? '#e5f5f2' : '#f6f5f1',
                    // il bordo c'e' sempre: da undefined a 2px il cerchio
                    // scattava di due pixel invece di ingrossarsi
                    border: `2px solid ${on ? '#10b981' : 'transparent'}`,
                    boxSizing: 'border-box',
                    /* la scelta si ingrossa, non salta: la faccia scelta
                       passa da 44 a 48 e prima ci arrivava di colpo */
                    transition:
                      'width 260ms cubic-bezier(0.34,1.56,0.64,1), height 260ms cubic-bezier(0.34,1.56,0.64,1), border-radius 260ms ease-out',
                  }}
                >
                  <img src={f.icon} alt="" style={{ width: 36, height: 36 }} />
                </div>
              </Touchable>
              <p
                className="absolute whitespace-nowrap"
                style={{
                  left: 6 + f.x + f.labelX,
                  top: 53,
                  fontSize: 9,
                  lineHeight: 'normal',
                  margin: 0,
                  fontWeight: on ? 700 : 500,
                  color: on ? '#0b7a5a' : 'var(--bab-ink-soft)',
                }}
              >
                {f.label}
              </p>
            </div>
            )
          })}
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
            {PILLS.map((p) => {
              const mine = p.text === OWN
              const on = mine ? hasOwn && !editing : pills.includes(p.text)
              return (
              <Touchable
                key={p.text}
                className="flex shrink-0 items-center gap-[6px]"
                onTap={
                  mine
                    ? () => {
                        setEditing(true)
                        // il campo nasce ora: aspetta che ci sia prima di puntarlo
                        requestAnimationFrame(() => ownBox.current?.focus({ preventScroll: true }))
                      }
                    : () => setPills(toggle(pills, p.text))
                }
                press={mine ? 0.98 : 0.96}
                style={{
                  // largo quanto il frame finche' e' vuoto e fermo; poi cresce
                  width: mine ? (editing ? 306 : hasOwn ? 'auto' : p.w) : p.w,
                  maxWidth: 306,
                  padding: '7px 10px 7px 9px',
                  borderRadius: 999,
                  boxSizing: 'border-box',
                  background: on ? '#e5f5f2' : '#f7f5f1',
                  outline: `1.5px ${mine && !hasOwn && !editing ? 'dashed' : 'solid'} ${
                    on ? '#10b981' : editing && mine ? '#10b981' : 'var(--bab-border)'
                  }`,
                  outlineOffset: -1.5,
                }}
              >
                <div className="relative shrink-0" style={{ width: 16, height: 16 }}>
                  {mine && !on ? (
                    <img src={pencil} alt="" className="absolute" style={{ left: 1, top: 1, width: 14, height: 14 }} />
                  ) : on ? (
                    <>
                      <img src={checkEllipse} alt="" className="absolute inset-0" style={{ width: 16, height: 16 }} />
                      <img src={checkMark} alt="" className="absolute" style={{ left: 3.5, top: 4.5, width: 9, height: 7 }} />
                    </>
                  ) : (
                    <img src={checkEmpty} alt="" className="absolute inset-0" style={{ width: 16, height: 16 }} />
                  )}
                </div>
                {mine && editing ? (
                  <input
                    ref={ownBox}
                    className="bab-field"
                    value={own}
                    placeholder={OWN}
                    onChange={(e) => setOwn(e.target.value)}
                    onBlur={() => setEditing(false)}
                    onPointerDown={(e) => e.stopPropagation()}
                    /* con la nostra tastiera accesa non deve salire quella di iOS */
                    inputMode={kb ? 'none' : undefined}
                    style={{
                      flex: '1 0 0',
                      minWidth: 0,
                      fontSize: 11.5,
                      lineHeight: '14px',
                      margin: 0,
                      fontFamily: 'inherit',
                      color: 'var(--bab-ink)',
                    }}
                  />
                ) : (
                  <p
                    style={{
                      flex: '1 0 0',
                      minWidth: 0,
                      fontSize: 11.5,
                      lineHeight: '14px',
                      margin: 0,
                      whiteSpace: mine && on ? 'nowrap' : undefined,
                      fontWeight: on ? 700 : 400,
                      color: on ? '#0b7a5a' : mine ? 'var(--bab-ink-soft)' : 'var(--bab-ink)',
                    }}
                  >
                    {mine ? (hasOwn ? own : OWN) : p.text}
                  </p>
                )}
              </Touchable>
              )
            })}
          </div>
        </div>
      </div>

      <CtaButton label="Now let’s tune in" left={24} top={778} width={354} shadowTop={4} labelColor="var(--bab-ink)" labelCenter={175.5} enabled={!!face} />

      {kb && (
        <Keyboard open={editing} value={own} onChange={setOwn} onDone={() => ownBox.current?.blur()} multiline={false} />
      )}
    </Frame>
  )
}
