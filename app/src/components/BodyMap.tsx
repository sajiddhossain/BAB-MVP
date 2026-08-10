import { useState } from 'react'
import { useCopy, useLocale } from '@/copy'
import { REGIONS, regionLabel, type RegionCode } from '@/content/bodymap'

/**
 * La mappa corporea. Compare in tre posti — check-in pre, check-in post e
 * segnalazione immediata — quindi vale la pena farne una sola, buona.
 *
 * 🔴 Convenzione sinistra/destra: **la sua sinistra sta a sinistra dello
 * schermo, in entrambe le viste.** È la convenzione dello specchio, ed è quella
 * già testata nei prototipi. Non è il disegno anatomico da manuale (dove la
 * vista frontale è speculare), ma è l'unica che non la costringe a fare un
 * ribaltamento mentale mentre ha male — e i codici salvati (`knee_l`) restano
 * corretti a prescindere da dove sono disegnati.
 *
 * Le forme stanno qui e non in `content/bodymap.ts`: lì ci sono i codici, che
 * finiscono nel database e non si toccano. La geometria è presentazione.
 */

type Shape =
  | { k: 'circle'; cx: number; cy: number; r: number }
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { k: 'rect'; x: number; y: number; w: number; h: number; rx: number }

export type Side = 'front' | 'back'

/** Raggio dell'area di tocco invisibile, per le zone troppo piccole per 44px. */
const SMALL_HIT = 20

const FRONT: Partial<Record<RegionCode, Shape>> = {
  head:      { k: 'circle',  cx: 100, cy: 30,  r: 20 },
  neck:      { k: 'rect',    x: 84,  y: 51,  w: 32, h: 16, rx: 8 },
  shoulders: { k: 'rect',    x: 56,  y: 66,  w: 88, h: 16, rx: 8 },
  chest:     { k: 'rect',    x: 62,  y: 84,  w: 76, h: 34, rx: 12 },
  arm_l:     { k: 'rect',    x: 38,  y: 84,  w: 17, h: 86, rx: 8 },
  arm_r:     { k: 'rect',    x: 145, y: 84,  w: 17, h: 86, rx: 8 },
  hand_l:    { k: 'ellipse', cx: 46,  cy: 182, rx: 11, ry: 13 },
  hand_r:    { k: 'ellipse', cx: 154, cy: 182, rx: 11, ry: 13 },
  core:      { k: 'rect',    x: 66,  y: 121, w: 68, h: 46, rx: 11 },
  hips:      { k: 'rect',    x: 64,  y: 169, w: 72, h: 28, rx: 11 },
  quad_l:    { k: 'rect',    x: 66,  y: 199, w: 30, h: 76, rx: 13 },
  quad_r:    { k: 'rect',    x: 104, y: 199, w: 30, h: 76, rx: 13 },
  knee_l:    { k: 'ellipse', cx: 81,  cy: 284, rx: 16, ry: 11 },
  knee_r:    { k: 'ellipse', cx: 119, cy: 284, rx: 16, ry: 11 },
  shin_l:    { k: 'rect',    x: 69,  y: 295, w: 24, h: 60, rx: 11 },
  shin_r:    { k: 'rect',    x: 107, y: 295, w: 24, h: 60, rx: 11 },
  foot_l:    { k: 'ellipse', cx: 81,  cy: 366, rx: 15, ry: 10 },
  foot_r:    { k: 'ellipse', cx: 119, cy: 366, rx: 15, ry: 10 },
}

const BACK: Partial<Record<RegionCode, Shape>> = {
  head:       { k: 'circle',  cx: 100, cy: 30,  r: 20 },
  neck:       { k: 'rect',    x: 84,  y: 51,  w: 32, h: 16, rx: 8 },
  shoulders:  { k: 'rect',    x: 56,  y: 66,  w: 88, h: 16, rx: 8 },
  upper_back: { k: 'rect',    x: 62,  y: 84,  w: 76, h: 36, rx: 12 },
  arm_l:      { k: 'rect',    x: 38,  y: 84,  w: 17, h: 86, rx: 8 },
  arm_r:      { k: 'rect',    x: 145, y: 84,  w: 17, h: 86, rx: 8 },
  hand_l:     { k: 'ellipse', cx: 46,  cy: 182, rx: 11, ry: 13 },
  hand_r:     { k: 'ellipse', cx: 154, cy: 182, rx: 11, ry: 13 },
  lower_back: { k: 'rect',    x: 66,  y: 123, w: 68, h: 32, rx: 11 },
  glutes:     { k: 'rect',    x: 64,  y: 157, w: 72, h: 32, rx: 13 },
  ham_l:      { k: 'rect',    x: 66,  y: 192, w: 30, h: 72, rx: 13 },
  ham_r:      { k: 'rect',    x: 104, y: 192, w: 30, h: 72, rx: 13 },
  knee_l:     { k: 'ellipse', cx: 81,  cy: 273, rx: 16, ry: 10 },
  knee_r:     { k: 'ellipse', cx: 119, cy: 273, rx: 16, ry: 10 },
  calf_l:     { k: 'rect',    x: 69,  y: 284, w: 24, h: 58, rx: 11 },
  calf_r:     { k: 'rect',    x: 107, y: 284, w: 24, h: 58, rx: 11 },
  ankle_l:    { k: 'ellipse', cx: 81,  cy: 353, rx: 15, ry: 10 },
  ankle_r:    { k: 'ellipse', cx: 119, cy: 353, rx: 15, ry: 10 },
}

export const GEOMETRY = { front: FRONT, back: BACK }

/** Centro della forma: serve per l'area di tocco allargata. */
function centre(s: Shape): [number, number] {
  if (s.k === 'rect') return [s.x + s.w / 2, s.y + s.h / 2]
  return [s.cx, s.cy]
}

/** Vero per le zone troppo piccole per reggere un dito senza aiuto. */
function isSmall(s: Shape): boolean {
  if (s.k === 'rect') return Math.min(s.w, s.h) < 26
  if (s.k === 'ellipse') return Math.min(s.rx, s.ry) * 2 < 26
  return s.r * 2 < 26
}

type Props = {
  /** La zona attualmente scelta, se c'è. */
  selected?: RegionCode | null
  /** Zone già registrate in questa sessione: restano marcate. */
  logged?: RegionCode[]
  onSelect: (code: RegionCode) => void
  /** `care` colora di corallo: si usa nella segnalazione immediata. */
  tone?: 'neutral' | 'care'
}

export default function BodyMap({ selected = null, logged = [], onSelect, tone = 'neutral' }: Props) {
  const t = useCopy()
  const locale = useLocale()
  const [side, setSide] = useState<Side>('front')
  const accent = tone === 'care' ? 'var(--care)' : 'var(--color-teal)'
  const tint = tone === 'care' ? 'var(--care-tint)' : 'var(--tempo-steady-tint)'

  const shapes = GEOMETRY[side]
  const codes = (Object.keys(shapes) as RegionCode[]).filter((c) => shapes[c])

  function zoneFill(code: RegionCode) {
    if (code === selected) return accent
    if (logged.includes(code)) return tint
    return 'var(--color-surface)'
  }

  function renderShape(s: Shape, props: Record<string, unknown>) {
    if (s.k === 'circle') return <circle cx={s.cx} cy={s.cy} r={s.r} {...props} />
    if (s.k === 'ellipse') return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...props} />
    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...props} />
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Fronte / retro */}
      <div className="flex gap-2" role="tablist" aria-label={t.checkin.pre.pinpoint.title}>
        {(['front', 'back'] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={side === s}
            onClick={() => setSide(s)}
            className="bab-pill px-4 py-2 text-[13px]"
            style={side === s
              ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
              : undefined}
          >
            {s === 'front' ? t.checkin.pre.pinpoint.front : t.checkin.pre.pinpoint.back}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 200 400"
        className="h-auto w-full max-w-[260px] touch-manipulation"
        role="group"
        aria-label={t.checkin.pre.pinpoint.title}
      >
        {codes.map((code) => {
          const s = shapes[code]!
          const isOn = code === selected
          const [cx, cy] = centre(s)
          return (
            <g
              key={code}
              role="button"
              tabIndex={0}
              aria-label={regionLabel(code, locale)}
              aria-pressed={isOn}
              onClick={() => onSelect(code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(code) }
              }}
              style={{ cursor: 'pointer', outlineOffset: 2 }}
            >
              <title>{regionLabel(code, locale)}</title>
              {renderShape(s, {
                fill: zoneFill(code),
                stroke: isOn || logged.includes(code) ? accent : 'var(--color-ink)',
                strokeWidth: isOn ? 3 : 1.75,
              })}
              {/* Le zone piccole (mani, caviglie, piedi) non arrivano a 44px:
                  un cerchio trasparente allarga il bersaglio senza cambiare il disegno. */}
              {isSmall(s) && <circle cx={cx} cy={cy} r={SMALL_HIT} fill="transparent" />}
            </g>
          )
        })}
      </svg>

      {/* Le due zone senza posizione: §4.3 le vuole raggiungibili quanto le altre. */}
      <div className="flex flex-wrap justify-center gap-2">
        {REGIONS.filter((r) => r.side === 'none').map((r) => (
          <button
            key={r.code}
            type="button"
            onClick={() => onSelect(r.code)}
            aria-pressed={selected === r.code}
            className="bab-pill px-4 py-2 text-[13px]"
            style={selected === r.code
              ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
              : undefined}
          >
            {r.code === 'all_over' ? t.checkin.pre.pinpoint.allOver : t.checkin.pre.pinpoint.elsewhere}
          </button>
        ))}
      </div>
    </div>
  )
}
