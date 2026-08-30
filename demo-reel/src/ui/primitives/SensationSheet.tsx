import type { ReactNode } from 'react'
import { Slider } from './Slider'
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
}) {
  return (
    <div className="bab-font-ui absolute inset-0">
      {backdrop}
      {/* due veli sovrapposti, come in Figma */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(23,21,21,0.41)',
          opacity: entered ? 0.85 : 0,
          transition: 'opacity 380ms ease-out',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)', opacity: entered ? 1 : 0, transition: 'opacity 380ms ease-out' }}
      />

      <div
        className="absolute overflow-hidden"
        style={{
          left: sheetLeft,
          top: sheetTop,
          width,
          height: sheetHeight,
          background: 'var(--bab-surface)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.15)',
          transform: entered ? 'none' : 'translateY(100%)',
          transition: 'transform 460ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div className="absolute" style={{ left: 183, top: 12, width: 36, height: 4, borderRadius: 2, background: '#d1d5db' }} />

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 30.5, fontSize: 26, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          {title}
        </p>
        <div
          className="absolute"
          style={{ left: 356, top: 30, width: 30, height: 30, borderRadius: 18, background: 'var(--bab-surface)', border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
        >
          <p className="absolute whitespace-nowrap" style={{ left: 6.5, top: 3.5, fontSize: 16, color: '#6b7280', lineHeight: 'normal', margin: 0 }}>
            ✕
          </p>
        </div>

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 79.5, fontSize: 15, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          What does it feel like?
        </p>
        <div
          className="absolute"
          style={{ left: 16, top: 107.5, width: 370, height: 56, borderRadius: 16, background: 'var(--bab-surface)', border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
        >
          <p className="absolute" style={{ left: 12.5, top: 8.5, width: 342, fontSize: 14, color: '#6b7280', lineHeight: 'normal', margin: 0 }}>
            Describe it in your own words...
          </p>
        </div>

        <p className="absolute whitespace-nowrap" style={{ left: 16, top: 178.5, fontSize: 14, fontWeight: 600, color: SEL_TEXT, lineHeight: 'normal', margin: 0 }}>
          A little help ✨
        </p>
        <img src={chevron} alt="" className="absolute" style={{ left: 370, top: 179, width: 16, height: 16 }} />

        {SENSATION_CHIPS.map((c) => {
          const on = selected.includes(c.label)
          return (
            <div
              key={c.label}
              className="absolute"
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
            </div>
          )
        })}

        <div className="absolute" style={{ left: 16, top: 381.5, width: 370, height: 1, background: '#e5e7eb' }} />
        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16, top: 394.5, fontSize: 14, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          Only on one side?
        </p>
        <div
          className="absolute"
          style={{ left: 16, top: 421.5, width: 181, height: 37, borderRadius: 24, background: SEL_BG, border: `1.5px solid ${SEL_LINE}`, boxSizing: 'border-box' }}
        >
          <p className="absolute whitespace-nowrap" style={{ left: 77, top: 8.5, fontSize: 14, fontWeight: 600, color: SEL_TEXT, lineHeight: 'normal', margin: 0 }}>
            Yes
          </p>
        </div>
        <div
          className="absolute"
          style={{ left: 205, top: 421.5, width: 181, height: 37, borderRadius: 24, background: 'var(--bab-surface)', border: '1.5px solid #d1d5db', boxSizing: 'border-box' }}
        >
          <p className="absolute whitespace-nowrap" style={{ left: 79.5, top: 8.5, fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 'normal', margin: 0 }}>
            No
          </p>
        </div>
        <div className="absolute" style={{ left: 16, top: 470.5, width: 370, height: 1, background: '#e5e7eb' }} />

        <p className="absolute whitespace-nowrap font-bold" style={{ left: 16 + intensityDX, top: 483.5 + intensityDY, fontSize: 14, color: '#111827', lineHeight: 'normal', margin: 0 }}>
          Intensity:
        </p>
        <Slider
          left={15 + intensityDX}
          top={521 + intensityDY}
          width={370}
          thumbLeft={intensityThumb}
          gradient="linear-gradient(90deg, rgb(103, 205, 167) 0%, rgb(206, 231, 103) 36.058%, rgb(246, 194, 122) 70.192%, rgb(235, 149, 118) 100%)"
        />
        <p className="absolute whitespace-nowrap" style={{ left: 16 + intensityDX, top: 550.5 + intensityDY, fontSize: 12, color: '#35353f', lineHeight: 'normal', margin: 0 }}>
          No pain
        </p>
        <p className="absolute whitespace-nowrap" style={{ left: 275 + intensityDX, top: 550.5 + intensityDY, fontSize: 12, color: '#35353f', lineHeight: 'normal', margin: 0 }}>
          Worst possible pain
        </p>

        {/* qui il CTA e' verde pieno, non a gradiente, e l'ombra sta sopra */}
        <div
          className="absolute"
          style={{ left: 24, top: ctaTop, width: width - 48, height: 56, borderRadius: 100, background: '#d4f369', border: 'var(--bab-border-w) solid var(--bab-border)', boxSizing: 'border-box', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))' }}
        >
          <p
            className="bab-font-body absolute whitespace-nowrap font-bold"
            style={{ left: ctaLabelLeft, top: 16.5, fontSize: 16, color: 'var(--bab-ink-max)', lineHeight: 'normal', margin: 0 }}
          >
            {ctaLabel}
          </p>
        </div>
        <div className="absolute" style={{ left: 24, top: ctaTop + 6, width: width - 48, height: 56, borderRadius: 100, background: 'var(--bab-shadow)' }} />
      </div>
    </div>
  )
}
