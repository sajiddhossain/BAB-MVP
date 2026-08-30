import type { ReactNode } from 'react'
import { Frame } from '../primitives/Frame'
import { NavBar } from '../primitives/NavBar'
import { CtaButton } from '../primitives/CtaButton'
import { Slider } from '../primitives/Slider'
import { Touchable } from '../primitives/Touchable'
import { useField } from '../state'
import { TickRow, EndLabel } from '../primitives/TickRow'
import music from '../assets/icons/music-tunein.svg'

const TUNE_GRADIENT =
  'linear-gradient(90deg, rgb(103, 205, 167) 0%, rgb(206, 231, 103) 36.058%, rgb(246, 194, 122) 70.192%, rgb(235, 149, 118) 100%)'

/** Card bianca con la sua ombra sfalsata. Gli sfalsamenti non sono costanti. */
function Card({
  left,
  top,
  height,
  shadowLeft,
  shadowTop,
  shadowHeight,
  children,
}: {
  left: number
  top: number
  height: number
  shadowLeft: number
  shadowTop: number
  shadowHeight?: number
  children: ReactNode
}) {
  return (
    <>
      <div
        className="absolute"
        style={{ left: shadowLeft, top: shadowTop, width: 342, height: shadowHeight ?? height, borderRadius: 22, background: 'var(--bab-shadow)' }}
      />
      <div
        className="absolute"
        style={{ left, top, width: 342, height, borderRadius: 22, background: 'var(--bab-surface)', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box' }}
      >
        {children}
      </div>
    </>
  )
}

function CardHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <p className="absolute whitespace-nowrap font-bold" style={{ left: 18.5, top: 16.5, fontSize: 16, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
        {title}
      </p>
      <p className="absolute" style={{ left: 18.5, top: 36.5, width: 302, fontSize: 13, lineHeight: '18px', letterSpacing: '-0.26px', color: 'var(--bab-ink-soft)', margin: 0 }}>
        {subtitle}
      </p>
    </>
  )
}

const DURATION = [
  { x: 0, w: 70, label: 'Under 6h', labelLeft: 0, labelW: 70, labelTop: 8 },
  { x: 74, w: 56, label: '6–7h', labelLeft: 0, labelW: 56, labelTop: 8 },
  { x: 134, w: 84, label: '7–8h', labelLeft: -1.5, labelW: 84, labelTop: 7.5, on: true },
  { x: 222, w: 52, label: '8h+', labelLeft: 12, labelW: 29, labelTop: 8 },
]

/** node 3532:4 — checkin-2-tune-in (schermo che scorre: 1262 di altezza) */
export function Checkin2TuneIn() {
  const [sleep, setSleep] = useField('checkin.sleep', 139)
  const [energy, setEnergy] = useField('checkin.energy', 240)
  const [mood, setMood] = useField('checkin.mood', 190)
  const [school, setSchool] = useField('checkin.school', 90)
  const [dur, setDur] = useField('checkin.sleepDuration', '7–8h')
  return (
    <Frame width={404} height={1262} textureTops={[0, 868]}>
      <NavBar progress={84 / 277} left={31} top={56} trackWidth={282} />

      <div className="absolute overflow-hidden" style={{ left: 31, top: 130, width: 20, height: 20 }}>
        <img src={music} alt="" className="absolute" style={{ left: 2.4, top: 2.9, width: 14.25, height: 14.25 }} />
      </div>
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{ left: 56, top: 130, fontSize: 16, letterSpacing: '1px', color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
      >
        STEP 2 · TUNE IN
      </p>

      <p
        className="bab-font-display absolute font-bold"
        style={{ left: 31, top: 154, width: 342, fontSize: 30, lineHeight: '40px', letterSpacing: '-0.6px', color: 'var(--bab-ink)', margin: 0 }}
      >
        What’s your body saying?
      </p>

      {/* Sleep */}
      <Card left={29} top={247} height={228.538} shadowLeft={33} shadowTop={250.46}>
        <CardHead title="Sleep" subtitle="How rested do you feel from last night?" />
        <Slider left={23} top={56} width={302} thumbLeft={sleep} gradient={TUNE_GRADIENT} onDrag={setSleep} snap={[1, 7]} />
        <TickRow centerX={174} top={92} />
        <EndLabel centerX={27.5} top={105.5} width={36} lines={['Barely slept']} lineHeight={9} />
        <EndLabel centerX={316} top={105.5} width={35} lines={['Well rested']} lineHeight={9} />
        <div className="absolute" style={{ left: 18.5, top: 137.5, width: 302, height: 1.5, background: '#e7e5e1' }} />
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 20, top: 155, fontSize: 14, color: 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}>
          Roughly how long did you sleep?
        </p>
        <div className="absolute" style={{ left: 20, top: 179, width: 302, height: 34 }}>
          {DURATION.map((d) => {
            const on = dur === d.label
            return (
            <Touchable
              key={d.label}
              className="absolute top-0"
              onTap={() => setDur(d.label)}
              press={0.94}
              style={{
                left: d.x,
                width: d.w,
                height: 32,
                borderRadius: 100,
                boxSizing: 'border-box',
                background: on ? '#e6f5f2' : 'var(--bab-surface)',
                border: on ? '1.5px solid #4ab5a0' : '1px solid var(--bab-border)',
              }}
            >
              <p
                className="absolute text-center font-bold"
                style={{ left: d.labelLeft, top: d.labelTop, width: d.labelW, fontSize: 12, color: on ? '#4ab5a0' : 'var(--bab-ink)', lineHeight: 'normal', margin: 0 }}
              >
                {d.label}
              </p>
            </Touchable>
            )
          })}
        </div>
      </Card>

      {/* Energy */}
      <Card left={29} top={492} height={147.717} shadowLeft={33} shadowTop={495.28}>
        <CardHead title="Energy" subtitle="Where's your energy gauge sitting?" />
        <Slider left={23} top={57} width={302} thumbLeft={energy} gradient={TUNE_GRADIENT} onDrag={setEnergy} snap={[1, 7]} />
        <TickRow centerX={173} top={93} />
        <EndLabel centerX={26} top={108.5} width={41} lines={['Running empty']} />
        <EndLabel centerX={316} top={108.5} width={41} lines={['Fully', 'charged']} />
      </Card>

      {/* Mood */}
      <Card left={29} top={656} height={173} shadowLeft={33} shadowTop={660}>
        <CardHead title="Mood" subtitle="Slide to where you are today." />
        <Slider left={20} top={72} width={302} thumbLeft={mood} gradient={TUNE_GRADIENT} onDrag={setMood} snap={[1, 7]} />
        <TickRow centerX={170} top={108} />
        <EndLabel centerX={23} top={128.5} width={41} lines={['Worst I’ve', 'fell']} />
        <EndLabel centerX={313} top={128.5} width={41} lines={['Worst I’ve', 'fell']} />
      </Card>

      {/* School */}
      <Card left={30} top={842} height={173} shadowLeft={34} shadowTop={846} shadowHeight={174}>
        <CardHead title="School" subtitle="How’s the pressure right now?" />
        <Slider left={18.5} top={70.5} width={302} thumbLeft={school} gradient={TUNE_GRADIENT} onDrag={setSchool} snap={[1, 7]} />
        <TickRow centerX={171} top={106.5} />
        <EndLabel centerX={27.5} top={128.5} width={26} lines={['Chilled']} />
        <EndLabel centerX={314.5} top={125.5} width={26} lines={['Exam week']} />
      </Card>

      {/* due card di contesto affiancate */}
      <div className="absolute flex items-start gap-[10px]" style={{ left: 34, top: 1033, width: 342 }}>
        <ContextCard question="On your period?" field="checkin.period" fallback="Yes" toggleTop={46.5} />
        <ContextCard question="Taken pain relief?" field="checkin.painRelief" fallback="No" toggleTop={44.5} />
      </div>

      <CtaButton label="Pinpoint how it feels" left={29} top={1165} width={342} shadowTop={1} labelTop={15.5} />
    </Frame>
  )
}

/**
 * Le due card di contesto.
 *
 * In Figma le due linguette sono disegnate con geometrie diverse fra le due card
 * (la "No" non selezionata e' larga 81, quella selezionata 66). Le etichette pero'
 * cadono nello stesso punto: unifichiamo la geometria e cambiamo solo l'aspetto,
 * cosi' il toggle si puo' davvero premere senza spostare nulla.
 */
function ContextCard({
  question,
  field,
  fallback,
  toggleTop,
}: {
  question: string
  field: string
  fallback: 'Yes' | 'No'
  toggleTop: number
}) {
  const [value, setValue] = useField<'Yes' | 'No'>(field, fallback)

  const tab = (label: 'Yes' | 'No', left: number, labelLeft: number) => {
    const on = value === label
    return (
      <Touchable
        className="absolute"
        onTap={() => setValue(label)}
        press={0.94}
        style={{
          left,
          top: 3,
          width: 66,
          height: 27,
          borderRadius: 100,
          background: on ? 'var(--bab-surface)' : 'transparent',
          filter: on ? 'drop-shadow(0px 2px 3px rgba(0,0,0,0.08))' : undefined,
        }}
      >
        <p
          className="absolute whitespace-nowrap font-bold"
          style={{ left: labelLeft, top: 5, fontSize: 13, color: on ? '#866bf2' : 'var(--bab-ink-mute)', lineHeight: 'normal', margin: 0 }}
        >
          {label}
        </p>
      </Touchable>
    )
  }

  return (
    <div
      className="relative shrink-0"
      style={{ width: 166, height: 96, borderRadius: 22, background: 'var(--bab-surface)', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box' }}
    >
      <p className="absolute font-bold" style={{ left: 12.5, top: 12.5, width: 138, fontSize: 13, lineHeight: '18px', color: 'var(--bab-ink)', margin: 0 }}>
        {question}
      </p>
      <div className="absolute" style={{ left: 12.5, top: toggleTop, width: 139, height: 33, borderRadius: 100, background: 'var(--bab-bg)' }}>
        {tab('Yes', 4, 22)}
        {tab('No', 70, 25)}
      </div>
    </div>
  )
}
