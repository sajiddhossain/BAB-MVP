import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Slider } from './Slider'
import { Touchable } from './Touchable'
import { useField, toggle } from '../state'
import { useNav } from '../../proto/nav'
import biceps from '../assets/icons/sens-biceps.svg'
import cloud from '../assets/icons/sens-cloud.svg'
import bandage from '../assets/icons/sens-bandage.svg'
import activity from '../assets/icons/sens-activity.svg'
import link from '../assets/icons/sens-link.svg'
import woodlog from '../assets/icons/sens-woodlog.svg'
import zap from '../assets/icons/sens-zap.svg'
import pin from '../assets/icons/sens-pin.svg'
import refresh from '../assets/icons/sens-refresh.svg'
import fist from '../assets/icons/sens-fist.svg'
import flame from '../assets/icons/sens-flame.svg'
import sparkles from '../assets/icons/sens-sparkles.svg'
import circlex from '../assets/icons/sens-circlex.svg'
import scale from '../assets/icons/sens-scale.svg'
import droplet from '../assets/icons/sens-droplet.svg'
import thermo from '../assets/icons/sens-thermo.svg'
import chevron from '../assets/icons/chevron-down.svg'

/** Ogni chip ha larghezza propria in Figma, non calcolata dal testo. */
type Chip = { x: number; y: number; w: number; label: string; icon: string; rot?: number }

export const SENSATION_CHIPS: Chip[] = [
  { x: 16, y: 205.5, w: 84, label: 'strong', icon: biceps },
  { x: 106, y: 205.5, w: 71, label: 'light', icon: cloud },
  { x: 183, y: 205.5, w: 71, label: 'sore', icon: bandage },
  { x: 260, y: 205.5, w: 74, label: 'achy', icon: activity },
  { x: 16, y: 239.5, w: 73, label: 'tight', icon: link },
  { x: 95, y: 239.5, w: 68, label: 'stiff', icon: woodlog, rot: -90 },
  { x: 169, y: 239.5, w: 79, label: 'sharp', icon: zap },
  { x: 254, y: 239.5, w: 98, label: 'stabbing', icon: pin },
  { x: 16, y: 273.5, w: 90, label: 'crampy', icon: refresh },
  { x: 112, y: 273.5, w: 95, label: 'gripping', icon: fist },
  { x: 213, y: 273.5, w: 91, label: 'burning', icon: flame },
  { x: 16, y: 307.5, w: 90, label: 'tingling', icon: sparkles },
  { x: 112, y: 307.5, w: 79, label: 'numb', icon: circlex },
  { x: 197, y: 307.5, w: 97, label: 'unstable', icon: scale },
  { x: 16, y: 341.5, w: 91, label: 'swollen', icon: droplet },
  { x: 113, y: 341.5, w: 65, label: 'hot', icon: thermo },
]

/** costanti di modulo: un riferimento nuovo a ogni render manda lo store in loop */
const NO_CHIPS: string[] = []
/** mezzo dello slider del pannello (largo 370, pallino 24) */
const MID_INTENSITY = 173

const SEL_BG = '#e5f5f2'
const SEL_LINE = '#4ab5a0'
const SEL_TEXT = '#367569'

/**
 * Il bottom sheet "nomina la sensazione".
 * Tutto qui dentro e' Inter, non Space Grotesk — tranne l'etichetta del CTA.
 * Le coordinate sono relative al sheet, che parte a top 172.
 */
export function SensationSheet({
  title,
  selected,
  intensityThumb,
  ctaLabel,
  ctaLabelLeft,
  backdrop,
  sheetLeft = 0,
  sheetTop = 172,
  sheetHeight = 702,
  width = 402,
  /** checkout-6 sposta tutto il blocco intensity di (3, 2.5) e alza il CTA di 4 */
  intensityDX = 0,
  intensityDY = 0,
  ctaTop = 606,
  chipOverrides = {},
  entered = true,
  field,
  saved = false,
  onSave,
  onRemove,
}: {
  title: string
  selected: string[]
  intensityThumb: number
  ctaLabel: string
  /** relativa al bottone, non allo schermo. Figma non la centra: la ancora. */
  ctaLabelLeft: number
  backdrop?: ReactNode
  sheetLeft?: number
  sheetTop?: number
  sheetHeight?: number
  width?: number
  intensityDX?: number
  intensityDY?: number
  ctaTop?: number
  chipOverrides?: Record<string, { y?: number; w?: number }>
  /** false = sheet fuori schermo e velo trasparente: serve all'animazione d'ingresso */
  entered?: boolean
  /** chiave dello store: OGNI punto del corpo ha la sua */
  field?: string
  /** true = questo punto e' gia' stato salvato, quindi lo stai correggendo */
  saved?: boolean
  /** conferma: salva il punto e torna alla mappa */
  onSave?: () => void
  /** toglie il punto dalla mappa */
  onRemove?: () => void
}) {
  const nav = useNav()
  /*
   * Un punto nuovo si apre vuoto, non con le risposte del frame.
   *
   * Le chiavi sono una per zona, quindi blank.ts non puo' elencarle: segna
   * invece che la sessione parte da foglio bianco, e qui scegliamo i default
   * di conseguenza. Il probe del diff non tocca lo store, quindi legge false e
   * cade sui valori del frame.
   */
  const [blank] = useField('proto.blank', false)
  const [picked, setPicked] = useField<readonly string[]>(
    `${field ?? 'sheet'}.chips`,
    blank ? NO_CHIPS : selected,
  )
  const [side, setSide] = useField<'Yes' | 'No' | null>(
    `${field ?? 'sheet'}.side`,
    blank ? null : 'Yes',
  )
  const [thumb, setThumb] = useField(
    `${field ?? 'sheet'}.intensity`,
    blank ? MID_INTENSITY : intensityThumb,
  )
  const [note, setNote] = useField(`${field ?? 'sheet'}.note`, '')
  const [focus, setFocus] = useState(false)

  /*
   * "A little help ✨" e' una tendina, e la freccia deve aprirla e chiuderla.
   *
   * Chiudendola il pannello si ACCORCIA: parte piu' in basso ed e' piu' corto,
   * come fa un bottom sheet vero. Nascondere solo i chip lascerebbe un buco in
   * mezzo, che e' peggio di una freccia che non fa niente.
   */
  const [help, setHelp] = useField(`${field ?? 'sheet'}.help`, true)
  const HELP_H = 176

  // "Add this sensation" con nessuna sensazione nominata non aggiunge niente:
  // finche' non scegli un chip o scrivi qualcosa, il bottone resta spento
  const named = picked.length > 0 || note.trim().length > 0
  const live = named && !!nav && !!onSave

  /*
   * Prima di chiudere, il bottone diventa un segno di spunta.
   *
   * Qui stai salvando un dato tuo: vedere che e' stato preso vale la mezza
   * pausa. Sugli altri bottoni no — sono solo un passo avanti, e ritardarli
   * allungherebbe tutto il giro senza dire niente.
   *
   * Il segno e' disegnato, non un carattere: ✓ non c'e' in Space Grotesk, e
   * sarebbe l'ennesimo glifo che Figma e Chrome rendono diversi.
   */
  const [okay, setOkay] = useState(false)
  const confirm = () => {
    if (okay) return
    setOkay(true)
    // niente reset: da qui il pannello si chiude e il componente se ne va
    window.setTimeout(() => onSave?.(), 460)
  }

  /*
   * Trascinare il pannello via.
   *
   * Il gesto parte solo dalla fascia in alto (maniglia + titolo): sotto ci sono
   * i chip e lo slider, e un pannello che scappa mentre trascini l'intensita'
   * sarebbe peggio che non poterlo trascinare affatto. La ✕ ferma il tocco per
   * conto suo, quindi li' non parte.
   */
  const [drag, setDrag] = useState(0)
  const grab = useRef<number | null>(null)
  const CLOSE_AT = 110

  const onDown = (e: React.PointerEvent) => {
    if (!nav) return
    const box = e.currentTarget.getBoundingClientRect()
    const k = box.width / width
    if ((e.clientY - box.top) / k > 72) return
    grab.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (grab.current === null) return
    const box = e.currentTarget.getBoundingClientRect()
    setDrag(Math.max(0, (e.clientY - grab.current) / (box.width / width)))
  }
  const onUp = () => {
    if (grab.current === null) return
    grab.current = null
    if (drag > CLOSE_AT) nav?.back()
    setDrag(0)
  }
  const dragging = grab.current !== null
  // i veli si alzano insieme al pannello: e' quello che fa sentire il gesto
  // collegato a quello che c'e' sotto, invece di due cose separate
  const veil = entered ? Math.max(0, 1 - drag / 420) : 0
  return (
    <div className="bab-font-ui absolute inset-0">
      {/*
        Lo schermo dietro arretra e si arrotonda mentre il pannello sale: e' il
        gesto che dice "questo sta SOPRA a quello", invece di limitarsi a
        scurirlo. Rientra da solo se trascini il pannello giu'.

        Solo dentro al prototipo: e' la presentazione di uno schermo sopra un
        altro, e senza navigazione non c'e' niente da presentare. Fuori (nel
        probe del diff) lo sfondo e' un fondale, non uno schermo arretrato.
      */}
      {backdrop && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: nav ? `scale(${1 - 0.062 * veil}) translateY(${-11 * veil}px)` : undefined,
            borderRadius: nav ? 16 * veil : undefined,
            transition: dragging ? 'none' : 'transform 460ms cubic-bezier(0.32,0.72,0,1), border-radius 460ms ease-out',
          }}
        >
          {backdrop}
        </div>
      )}
      {/* due veli sovrapposti, come in Figma */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(23,21,21,0.41)',
          opacity: veil * 0.85,
          transition: dragging ? 'none' : 'opacity 380ms ease-out',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)', opacity: veil, transition: dragging ? 'none' : 'opacity 380ms ease-out' }}
      />

      <div
        className="absolute overflow-hidden"
        onPointerDown={nav ? onDown : undefined}
        onPointerMove={nav ? onMove : undefined}
        onPointerUp={nav ? onUp : undefined}
        onPointerCancel={nav ? onUp : undefined}
        style={{
          left: sheetLeft,
          top: help ? sheetTop : sheetTop + HELP_H,
          width,
          height: help ? sheetHeight : sheetHeight - HELP_H,
          background: 'var(--bab-surface)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.15)',
          transform: drag > 0 ? `translateY(${drag}px)` : entered ? undefined : 'translateY(100%)',
          transition: dragging
            ? 'none'
            : 'transform 460ms cubic-bezier(0.32,0.72,0,1), top 320ms cubic-bezier(0.22,1,0.36,1), height 320ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div className="absolute" style={{ left: 183, top: 12, width: 36, height: 4, borderRadius: 2, background: '#d1d5db' }} />

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 30.5, fontSize: 26, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          {title}
        </p>
        <Touchable
          className="absolute"
          onTap={nav ? nav.back : undefined}
          press={nav ? 0.88 : 1}
          stop={!!nav}
          style={{ left: 356, top: 30, width: 30, height: 30, borderRadius: 18, background: 'var(--bab-surface)', border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
        >
          <p className="absolute whitespace-nowrap" style={{ left: 6.5, top: 3.5, fontSize: 16, color: '#6b7280', lineHeight: 'normal', margin: 0 }}>
            ✕
          </p>
        </Touchable>

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 79.5, fontSize: 15, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          What does it feel like?
        </p>
        {/*
          * Un campo vero, non un testo che sembra un campo. Il segnaposto e' la
          * stessa stringa nella stessa posizione, quindi a riposo e' identico al
          * frame; quando ci scrivi dentro pero' scrive davvero, e il bordo si
          * accende come in qualsiasi campo.
          */}
        <div
          className="absolute"
          style={{ left: 16, top: 107.5, width: 370, height: 56, borderRadius: 16, background: 'var(--bab-surface)', border: `1.5px solid ${focus ? SEL_LINE : '#d1d5db'}`, boxSizing: 'border-box', transition: 'border-color 180ms ease-out' }}
        >
          <textarea
            className="bab-field absolute"
            value={note}
            placeholder="Describe it in your own words..."
            onChange={(e) => setNote(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            style={{ left: 12.5, top: 8.5, width: 342, height: 38, fontSize: 14, color: '#111827', lineHeight: 'normal', margin: 0, fontFamily: 'inherit' }}
          />
        </div>

        <Touchable
          className="absolute"
          onTap={() => setHelp(!help)}
          press={0.99}
          style={{ left: 12, top: 172, width: 378, height: 30 }}
        >
          <p className="absolute whitespace-nowrap" style={{ left: 4, top: 6.5, fontSize: 14, fontWeight: 600, color: SEL_TEXT, lineHeight: 'normal', margin: 0 }}>
            A little help ✨
          </p>
          <img
            src={chevron}
            alt=""
            className="absolute"
            style={{ left: 358, top: 7, width: 16, height: 16, transform: help ? undefined : 'rotate(-90deg)', transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </Touchable>

        {help &&
          SENSATION_CHIPS.map((c) => {
          const on = picked.includes(c.label)
          return (
            <Touchable
              key={c.label}
              className="absolute"
              onTap={() => setPicked(toggle(picked, c.label))}
              press={0.93}
              style={{
                left: c.x,
                top: chipOverrides[c.label]?.y ?? c.y,
                width: chipOverrides[c.label]?.w ?? c.w,
                height: 28,
                borderRadius: 24,
                boxSizing: 'border-box',
                background: on ? SEL_BG : 'var(--bab-surface)',
                border: `1.5px solid ${on ? SEL_LINE : '#e5e7eb'}`,
              }}
            >
              <img
                src={c.icon}
                alt=""
                className="absolute"
                style={{ left: 10.5, top: 5.5, width: 14, height: 14, transform: c.rot ? `rotate(${c.rot}deg)` : undefined }}
              />
              <p
                className="absolute whitespace-nowrap"
                style={{ left: 30.5, top: 4.5, fontSize: 13, fontWeight: 500, color: on ? SEL_TEXT : '#374151', lineHeight: 'normal', margin: 0 }}
              >
                {c.label}
              </p>
            </Touchable>
            )
          })}

        {/*
          * Da qui in giu' il blocco sale quando la tendina e' chiusa. E' avvolto
          * in un div senza posizionamento: sta all'origine del pannello e ha
          * altezza zero, quindi i figli in assoluto risolvono sulle stesse
          * coordinate di prima — ma il transform gli fa da blocco contenitore,
          * e li porta su tutti insieme.
          */}
        <div
          style={{
            transform: help ? undefined : `translateY(-${HELP_H}px)`,
            transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
        <div className="absolute" style={{ left: 16, top: 381.5, width: 370, height: 1, background: '#e5e7eb' }} />
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 394.5, fontSize: 14, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          Only on one side?
        </p>
        {([
          { label: 'Yes' as const, left: 16, labelLeft: 77 },
          { label: 'No' as const, left: 205, labelLeft: 79.5 },
        ]).map((b) => {
          const on = side === b.label
          return (
            <Touchable
              key={b.label}
              className="absolute"
              onTap={() => setSide(b.label)}
              press={0.96}
              style={{
                left: b.left,
                top: 421.5,
                width: 181,
                height: 37,
                borderRadius: 24,
                boxSizing: 'border-box',
                background: on ? SEL_BG : 'var(--bab-surface)',
                border: `1.5px solid ${on ? SEL_LINE : '#d1d5db'}`,
              }}
            >
              <p
                className="absolute whitespace-nowrap"
                style={{ left: b.labelLeft, top: 8.5, fontSize: 14, fontWeight: 600, color: on ? SEL_TEXT : '#1f2937', lineHeight: 'normal', margin: 0 }}
              >
                {b.label}
              </p>
            </Touchable>
          )
        })}
        <div className="absolute" style={{ left: 16, top: 470.5, width: 370, height: 1, background: '#e5e7eb' }} />

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16 + intensityDX, top: 483.5 + intensityDY, fontSize: 14, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          Intensity:
        </p>
        <Slider
          left={15 + intensityDX}
          top={521 + intensityDY}
          width={370}
          thumbLeft={thumb}
          onDrag={setThumb}
          gradient="linear-gradient(90deg, rgb(103, 205, 167) 0%, rgb(206, 231, 103) 36.058%, rgb(246, 194, 122) 70.192%, rgb(235, 149, 118) 100%)"
        />
        <p className="absolute whitespace-nowrap" style={{ left: 16 + intensityDX, top: 550.5 + intensityDY, fontSize: 12, color: '#35353f', lineHeight: 'normal', margin: 0 }}>
          No pain
        </p>
        <p className="absolute whitespace-nowrap" style={{ left: 275 + intensityDX, top: 550.5 + intensityDY, fontSize: 12, color: '#35353f', lineHeight: 'normal', margin: 0 }}>
          Worst possible pain
        </p>

        {/* qui il CTA e' verde pieno, non a gradiente, e l'ombra sta sopra */}
        <Touchable
          className="absolute"
          data-cta
          style={{ left: 24, top: ctaTop, width: width - 48, height: 62 }}
          onTap={live ? confirm : undefined}
          press={live ? 0.975 : 1}
          stop={!!nav}
        >
          <div
            className="absolute left-0 top-0"
            style={{ width: width - 48, height: 56, borderRadius: 100, background: named ? '#d4f369' : 'var(--bab-surface)', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))', transition: 'background 220ms ease-out' }}
          >
            {/*
              Correggendo un punto gia' salvato "Add" e' la parola sbagliata.
              L'etichetta di ricambio e' centrata e non ancorata: l'ancoraggio di
              Figma e' misurato su "Add this sensation", non su una frase piu'
              lunga. (Copy mia, non esiste nel file.)
            */}
            <p
              className="bab-font-body absolute whitespace-nowrap font-bold"
              style={{
                ...(saved
                  ? { left: 0, top: 16.5, width: width - 48, textAlign: 'center' as const }
                  : { left: ctaLabelLeft, top: 16.5 }),
                fontSize: 16,
                color: named ? 'var(--bab-ink-max)' : 'var(--bab-ink-mute)',
                lineHeight: 'normal',
                margin: 0,
                opacity: okay ? 0 : 1,
                transform: okay ? 'scale(0.9)' : undefined,
                transition: 'color 220ms ease-out, opacity 160ms ease-out, transform 160ms ease-out',
              }}
            >
              {saved ? 'Update this sensation' : ctaLabel}
            </p>
            <svg
              className="absolute"
              width={26}
              height={26}
              viewBox="0 0 26 26"
              fill="none"
              style={{
                left: (width - 48) / 2 - 13,
                top: 15,
                opacity: okay ? 1 : 0,
                transform: okay ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: 'center',
                transition: okay
                  ? 'opacity 140ms ease-out 60ms, transform 320ms cubic-bezier(0.34,1.56,0.64,1) 60ms'
                  : 'none',
              }}
            >
              <path
                d="M5 13.6 10.4 19 21 7.6"
                stroke="var(--bab-ink-max)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="absolute" style={{ left: 0, top: 6, width: width - 48, height: 56, borderRadius: 100, background: 'var(--bab-shadow)' }} />
        </Touchable>

        {/*
          "Rimuovi" compare solo su un punto gia' salvato: e' l'unico momento in
          cui ha senso, e vuol dire che nello stato del frame (dove nessuna zona
          e' segnata) non c'e' — quindi il confronto con Figma non cambia.

          Sta SOPRA il bottone e non sotto: sotto finiva negli ultimi 34px del
          frame, che Figma lascia liberi apposta perche' li' ci passa la barra
          home dell'iPhone. Sarebbe stato un comando che non si riesce a toccare.
        */}
        {saved && onRemove && (
          <Touchable
            className="absolute"
            onTap={onRemove}
            press={0.94}
            style={{ left: 24, top: ctaTop - 32, width: width - 48, height: 20 }}
          >
            <p
              className="bab-font-body absolute w-full text-center font-bold"
              style={{ left: 0, top: 2, fontSize: 13, color: '#ec6a5e', lineHeight: 'normal', margin: 0 }}
            >
              Remove this spot
            </p>
          </Touchable>
        )}
        </div>
      </div>
    </div>
  )
}
