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
 *
 * Le regioni si toccano, e non è estetica: una figura fatta di scatole
 * staccate si legge come un robot, e a una ragazzina che deve indicare dove le
 * fa male serve riconoscere un corpo.
 */

type Shape =
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { k: 'path'; d: string; cx: number; cy: number }

export type Side = 'front' | 'back'

/** Raggio dell'area di tocco invisibile per le zone che non arrivano a 44px. */
const SMALL_HIT = 20

const FRONT: Partial<Record<RegionCode, Shape>> = {
  head:      { k: 'ellipse', cx: 100, cy: 29, rx: 19, ry: 22 },
  neck:      { k: 'path', cx: 100, cy: 60,  d: 'M91,48 L109,48 L111,70 L89,70 Z' },
  shoulders: { k: 'path', cx: 100, cy: 82,  d: 'M56,92 C56,78 74,70 100,70 C126,70 144,78 144,92 Z' },
  chest:     { k: 'path', cx: 100, cy: 113, d: 'M64,92 L136,92 L131,134 L69,134 Z' },
  core:      { k: 'path', cx: 100, cy: 153, d: 'M69,134 L131,134 L128,172 L72,172 Z' },
  hips:      { k: 'path', cx: 100, cy: 193, d: 'M72,172 L128,172 C137,183 140,198 138,214 L62,214 C60,198 63,183 72,172 Z' },
  arm_l:     { k: 'path', cx: 52,  cy: 135, d: 'M56,90 C48,102 44,120 44,144 L45,177 L59,177 L60,144 C61,122 63,105 69,96 Z' },
  arm_r:     { k: 'path', cx: 148, cy: 135, d: 'M144,90 C152,102 156,120 156,144 L155,177 L141,177 L140,144 C139,122 137,105 131,96 Z' },
  hand_l:    { k: 'ellipse', cx: 52,  cy: 190, rx: 10, ry: 13 },
  hand_r:    { k: 'ellipse', cx: 148, cy: 190, rx: 10, ry: 13 },
  quad_l:    { k: 'path', cx: 84,  cy: 245, d: 'M63,214 L97,214 L95,276 L73,278 Z' },
  quad_r:    { k: 'path', cx: 116, cy: 245, d: 'M103,214 L137,214 L127,278 L105,276 Z' },
  knee_l:    { k: 'ellipse', cx: 84,  cy: 286, rx: 13, ry: 11 },
  knee_r:    { k: 'ellipse', cx: 116, cy: 286, rx: 13, ry: 11 },
  shin_l:    { k: 'path', cx: 84,  cy: 323, d: 'M76,295 L92,295 L90,352 L78,352 Z' },
  shin_r:    { k: 'path', cx: 116, cy: 323, d: 'M108,295 L124,295 L122,352 L110,352 Z' },
  foot_l:    { k: 'ellipse', cx: 84,  cy: 362, rx: 12, ry: 10 },
  foot_r:    { k: 'ellipse', cx: 116, cy: 362, rx: 12, ry: 10 },
}

const BACK: Partial<Record<RegionCode, Shape>> = {
  head:       { k: 'ellipse', cx: 100, cy: 29, rx: 19, ry: 22 },
  neck:       { k: 'path', cx: 100, cy: 60,  d: 'M91,48 L109,48 L111,70 L89,70 Z' },
  shoulders:  { k: 'path', cx: 100, cy: 82,  d: 'M56,92 C56,78 74,70 100,70 C126,70 144,78 144,92 Z' },
  upper_back: { k: 'path', cx: 100, cy: 116, d: 'M64,92 L136,92 L130,140 L70,140 Z' },
  arm_l:      { k: 'path', cx: 52,  cy: 135, d: 'M56,90 C48,102 44,120 44,144 L45,177 L59,177 L60,144 C61,122 63,105 69,96 Z' },
  arm_r:      { k: 'path', cx: 148, cy: 135, d: 'M144,90 C152,102 156,120 156,144 L155,177 L141,177 L140,144 C139,122 137,105 131,96 Z' },
  hand_l:     { k: 'ellipse', cx: 52,  cy: 190, rx: 10, ry: 13 },
  hand_r:     { k: 'ellipse', cx: 148, cy: 190, rx: 10, ry: 13 },
  lower_back: { k: 'path', cx: 100, cy: 157, d: 'M70,140 L130,140 L128,174 L72,174 Z' },
  glutes:     { k: 'path', cx: 100, cy: 195, d: 'M72,174 L128,174 C138,185 141,200 138,216 L62,216 C59,200 62,185 72,174 Z' },
  ham_l:      { k: 'path', cx: 84,  cy: 245, d: 'M63,216 L97,216 L95,274 L73,276 Z' },
  ham_r:      { k: 'path', cx: 116, cy: 245, d: 'M103,216 L137,216 L127,276 L105,274 Z' },
  knee_l:     { k: 'ellipse', cx: 84,  cy: 284, rx: 13, ry: 10 },
  knee_r:     { k: 'ellipse', cx: 116, cy: 284, rx: 13, ry: 10 },
  calf_l:     { k: 'path', cx: 84,  cy: 317, d: 'M76,293 C72,306 72,326 76,342 L90,342 C93,326 93,306 91,293 Z' },
  calf_r:     { k: 'path', cx: 116, cy: 317, d: 'M109,293 C107,306 107,326 110,342 L124,342 C128,326 128,306 124,293 Z' },
  ankle_l:    { k: 'path', cx: 84,  cy: 356, d: 'M77,342 L90,342 L89,362 C89,369 82,371 77,369 C74,368 74,362 76,358 Z' },
  ankle_r:    { k: 'path', cx: 116, cy: 356, d: 'M110,342 L123,342 L124,358 C126,362 126,368 123,369 C118,371 111,369 111,362 Z' },
}

export const GEOMETRY = { front: FRONT, back: BACK }

/** Vero per le zone che non reggono un dito senza aiuto. */
function isSmall(s: Shape): boolean {
  return s.k === 'ellipse' && Math.min(s.rx, s.ry) * 2 < 26
}

type Props = {
  selected?: RegionCode | null
  /** Zone già registrate in questa sessione: restano marcate. */
  logged?: RegionCode[]
  /** 🚩 Zone con una bandiera rossa: si distinguono, non si confondono. */
  flagged?: RegionCode[]
  onSelect: (code: RegionCode) => void
  /** `care` colora di corallo: si usa nella segnalazione immediata. */
  tone?: 'neutral' | 'care'
  /** Testo per «da un'altra parte»: la colonna `region_free` esiste da sempre. */
  freeText?: string
  onFreeText?: (v: string) => void
}

export default function BodyMap({
  selected = null, logged = [], flagged = [], onSelect,
  tone = 'neutral', freeText = '', onFreeText,
}: Props) {
  const t = useCopy()
  const locale = useLocale()
  const [side, setSide] = useState<Side>('front')
  const accent = tone === 'care' ? 'var(--care)' : 'var(--color-teal)'
  const tint = tone === 'care' ? 'var(--care-tint)' : 'var(--tempo-steady-tint)'

  const shapes = GEOMETRY[side]
  const codes = (Object.keys(shapes) as RegionCode[]).filter((c) => shapes[c])

  function paint(code: RegionCode) {
    if (code === selected) return { fill: accent, stroke: accent, width: 3 }
    if (flagged.includes(code)) return { fill: 'var(--care-tint)', stroke: 'var(--care)', width: 3 }
    if (logged.includes(code)) return { fill: tint, stroke: accent, width: 2.5 }
    return { fill: 'var(--color-surface)', stroke: 'var(--color-ink)', width: 1.75 }
  }

  function shapeEl(s: Shape, p: { fill: string; stroke: string; width: number }) {
    const attrs = { fill: p.fill, stroke: p.stroke, strokeWidth: p.width, strokeLinejoin: 'round' as const }
    return s.k === 'ellipse'
      ? <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...attrs} />
      : <path d={s.d} {...attrs} />
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex gap-2">
        {(['front', 'back'] as const).map((s) => (
          <button
            key={s} type="button" aria-pressed={side === s}
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

      <svg viewBox="0 0 200 400" className="h-auto w-full max-w-[250px] touch-manipulation"
           role="group" aria-label={t.checkin.pre.pinpoint.title}>
        {codes.map((code) => {
          const s = shapes[code]!
          const p = paint(code)
          return (
            <g
              key={code} className="bab-zone" role="button" tabIndex={0}
              aria-label={regionLabel(code, locale)}
              aria-pressed={code === selected}
              onClick={() => onSelect(code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(code) }
              }}
              style={{ cursor: 'pointer' }}
            >
              <title>{regionLabel(code, locale)}</title>
              {shapeEl(s, p)}
              {/* Mani, caviglie e piedi non arrivano a 44px: un cerchio
                  trasparente allarga il bersaglio senza toccare il disegno. */}
              {isSmall(s) && <circle cx={s.cx} cy={s.cy} r={SMALL_HIT} fill="transparent" />}
            </g>
          )
        })}
      </svg>

      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2">
          {REGIONS.filter((r) => r.side === 'none').map((r) => (
            <button
              key={r.code} type="button" onClick={() => onSelect(r.code)}
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

        {/* «Da un'altra parte» senza un campo dove dirlo è un vicolo cieco:
            polso, mandibola, costole non stanno sulla mappa, e il database ha
            sempre avuto la colonna per accoglierle. */}
        {selected === 'other' && onFreeText && (
          <input
            value={freeText}
            onChange={(e) => onFreeText(e.target.value)}
            maxLength={40}
            placeholder={t.hurt.whereFreeholder}
            aria-label={t.checkin.pre.pinpoint.elsewhere}
            className="bab-card w-full max-w-[300px] px-3 py-2 text-[15px]"
          />
        )}
      </div>
    </div>
  )
}
