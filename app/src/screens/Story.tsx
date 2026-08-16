import { useEffect, useMemo, useRef, useState } from 'react'
import { useCopy, useLocale } from '@/copy'
import { recentCheckIns, recentSignals, cycleDates, saveShare } from '@/lib/repo'
import { buildWeek, DEFAULT_BLOCKS, hasContent, type BlockCode, type Week } from '@/lib/story'
import { regionLabel } from '@/content/bodymap'
import { SENSATIONS } from '@/content/lexicon'
import { PHASES, readCycle } from '@/content/cycle'
import { useSession } from '@/lib/session'
import type { Row } from '@/lib/insights'
import Mascot from '@/components/Mascot'
import { PinIcon, TempoIcon } from '@/components/icons'

/**
 * La body-story — l'output "Communicate" del §11.
 *
 * 🔴 Quello che manda è UN'IMMAGINE, non un accesso. Nessun link, nessuna
 * dashboard, nessun login: chi la riceve vede quella e basta. Per questo la
 * card è un SVG — l'anteprima e il file esportato sono letteralmente la stessa
 * cosa, quindi «questo è esattamente quello che vedranno» è vero e non una
 * promessa che qualcuno dovrà ricordarsi di mantenere.
 *
 * 🔴 Il ciclo è ESCLUSO di default e la spunta vale solo per questa card.
 */

const W = 360
const PAD = 20

/**
 * Il font della card è di sistema, non quello dell'app. Deliberato: quando
 * l'SVG viene rasterizzato in PNG i font remoti non ci sono, e l'immagine
 * uscirebbe diversa dall'anteprima. Meglio una card leggermente diversa
 * dall'app che un'anteprima che mente.
 */
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

type Section = { h: number; render: (y: number) => React.ReactNode }

export default function Story() {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()
  const svgRef = useRef<SVGSVGElement>(null)

  const [week, setWeek] = useState<Week | null>(null)
  const [phase, setPhase] = useState<string | null>(null)
  const [on, setOn] = useState<BlockCode[]>(DEFAULT_BLOCKS)
  const [done, setDone] = useState<'idle' | 'saved'>('idle')
  const [copied, setCopied] = useState(false)
  const [showStuck, setShowStuck] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([recentCheckIns(200), recentSignals(200), cycleDates()])
      .then(([c, s, dates]) => {
        if (!alive) return
        setWeek(buildWeek(c as Row[], s as Row[]))
        const read = readCycle(dates, new Date())
        setPhase(read ? PHASES[read.phase].name[locale] : null)
      })
      .catch(() => { if (alive) setWeek(buildWeek([], [])) })
    return () => { alive = false }
  }, [locale])

  const toggle = (b: BlockCode) =>
    setOn((p) => (p.includes(b) ? p.filter((x) => x !== b) : [...p, b]))

  const words = useMemo(() => {
    if (!week) return ''
    const spot = week.spots[0]
    const named = spot
      ? `${regionLabel(spot.region, locale)} — ${SENSATIONS.find((s) => s.code === spot.sensation)?.label[locale] ?? spot.sensation}`
      : null
    return named
      ? `${t.story.title}: ${named}. ${t.checkin.post.communicate.title}`
      : t.story.title
  }, [week, locale, t])

  if (!week) {
    return <p className="pt-6 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  const shown = on.filter((b) => hasContent(week, b, phase))

  /* ── la card ─────────────────────────────────────────────────────────── */
  const sections: Section[] = []
  const line = (y: number, label: string) => (
    <text x={PAD} y={y} fontSize={10} fontWeight={700} letterSpacing={1.2}
          fill="#5C6A86" fontFamily={FONT}>{label.toUpperCase()}</text>
  )

  if (shown.includes('tempos')) sections.push({ h: 46, render: (y) => (
    <g key="tempos">
      {line(y, t.story.blocks.tempos)}
      {week.tempos.map((c, i) => c ? (
        <g key={i} transform={`translate(${PAD + i * 46},${y + 6})`}>
          <TempoIcon code={c} size={20} color="#0F0F12" />
        </g>
      ) : (
        <text key={i} x={PAD + i * 46} y={y + 26} fontSize={20} fontFamily={FONT}>·</text>
      ))}
    </g>
  ) })

  if (shown.includes('spots')) sections.push({ h: 24 + week.spots.length * 18, render: (y) => (
    <g key="spots">
      {line(y, t.story.blocks.spots)}
      {week.spots.map((s, i) => (
        <g key={i}>
          <g transform={`translate(${PAD},${y + 9 + i * 18})`}>
            <PinIcon size={13} color="#0F0F12" />
          </g>
          <text x={PAD + 17} y={y + 20 + i * 18} fontSize={13} fill="#0F0F12" fontFamily={FONT}>
            {regionLabel(s.region, locale)} — {SENSATIONS.find((x) => x.code === s.sensation)?.label[locale] ?? s.sensation}
          </text>
        </g>
      ))}
    </g>
  ) })

  if (shown.includes('energy')) sections.push({ h: 52, render: (y) => {
    // 🔴 L'energia qui è quella del check-in pre, 1-7 (Hooper — vedi
    // content/channels.ts): (e-1)/6 la porta a 0-1, non (e-1)/4 come quando
    // era 1-5. Sbagliarlo non dà un errore, disegna solo la linea storta.
    const pts = week.energy
      .map((e, i) => (e === null ? null : `${PAD + i * 46},${y + 40 - ((e - 1) / 6) * 26}`))
      .filter(Boolean).join(' ')
    return (
      <g key="energy">
        {line(y, t.story.blocks.energy)}
        {/* Nessun asse e nessun numero, qui come nella vista Me (§7). */}
        <polyline points={pts} fill="none" stroke="#34BBC0" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  } })

  if (shown.includes('note')) sections.push({ h: 46, render: (y) => (
    <g key="note">
      {line(y, t.story.blocks.note)}
      <text x={PAD} y={y + 22} fontSize={13} fontStyle="italic" fill="#0F0F12" fontFamily={FONT}>
        «{(week.note ?? '').slice(0, 46)}{(week.note ?? '').length > 46 ? '…' : ''}»
      </text>
    </g>
  ) })

  if (shown.includes('cycle') && phase) sections.push({ h: 40, render: (y) => (
    <g key="cycle">
      {line(y, t.story.blocks.cycle)}
      <text x={PAD} y={y + 22} fontSize={13} fill="#0F0F12" fontFamily={FONT}>{phase}</text>
    </g>
  ) })

  const bodyTop = 74
  let cursor = bodyTop
  const placed = sections.map((s) => { const y = cursor; cursor += s.h; return s.render(y) })
  const H = Math.max(cursor + PAD, 140)

  async function finish(recipient?: 'coach' | 'parent') {
    if (userId) {
      try {
        await saveShare(userId, week!.days[0], shown, shown.includes('cycle'), recipient)
      } catch { /* resta in coda locale */ }
    }
    setDone('saved')
  }

  /** Rasterizza lo stesso SVG che sta guardando: nessuna seconda versione. */
  async function download() {
    const svg = svgRef.current
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }))
    const img = new Image()
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })
    const canvas = document.createElement('canvas')
    canvas.width = W * 2; canvas.height = H * 2
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'bab-settimana.png'
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }

  const BLOCKS: { code: BlockCode; label: string; help: string }[] = [
    { code: 'tempos', label: t.story.blocks.tempos, help: t.story.blocks.temposHelp },
    { code: 'spots',  label: t.story.blocks.spots,  help: t.story.blocks.spotsHelp },
    { code: 'energy', label: t.story.blocks.energy, help: t.story.blocks.energyHelp },
    { code: 'note',   label: t.story.blocks.note,   help: t.story.blocks.noteHelp },
    { code: 'cycle',  label: t.story.blocks.cycle,  help: t.story.blocks.cycleHelp },
  ]

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-2">
        <Mascot size={32} />
        <h1 className="font-display text-[26px]">{t.story.title}</h1>
      </div>

      <section className="bab-card flex flex-col gap-3 px-4 py-4">
        <h2 className="font-display text-[18px]">{t.story.chooseTitle}</h2>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.story.chooseHelp}</p>
        {BLOCKS.map((b) => {
          const empty = !hasContent(week, b.code, phase)
          const active = on.includes(b.code)
          return (
            <button
              key={b.code} type="button" onClick={() => toggle(b.code)}
              disabled={empty} aria-pressed={active}
              className="bab-card flex flex-col gap-0.5 px-3 py-2.5 text-left disabled:opacity-45"
              style={active && !empty
                ? { background: b.code === 'cycle' ? 'var(--cycle-tint)' : 'var(--tempo-steady-tint)',
                    borderColor: b.code === 'cycle' ? 'var(--cycle)' : 'var(--color-teal)' }
                : undefined}
            >
              <span className="text-[15px] font-bold">{active && !empty ? '☑ ' : '☐ '}{b.label}</span>
              <span className="text-[12.5px] text-[var(--color-ink-soft)]">{b.help}</span>
            </button>
          )
        })}
        {/* 🔴 La nota sul ciclo compare quando lo accende, non prima. */}
        {on.includes('cycle') && (
          <p className="bab-card px-3 py-2 text-[13px]" style={{ background: 'var(--cycle-tint)' }}>
            {t.story.cycleNote.replace(/\*\*/g, '')}
          </p>
        )}
      </section>

      <section className="bab-card flex flex-col gap-3 px-4 py-4">
        <h2 className="font-display text-[18px]">{t.story.previewTitle}</h2>
        {shown.length === 0 ? (
          // 🔴 Solo qui, MAI dentro l'SVG più sotto: quella è l'immagine
          // esatta che parte, non c'è spazio per una mascotte che chi la
          // riceve non ha mai visto nell'app.
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <Mascot size={40} />
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.story.emptyState}</p>
          </div>
        ) : (
          <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`}
               width={W} height={H} className="h-auto w-full" role="img" aria-label={t.story.title}>
            <rect x={1.5} y={1.5} width={W - 3} height={H - 3} rx={16}
                  fill="#FAF9F6" stroke="#0F0F12" strokeWidth={3} />
            <text x={PAD} y={36} fontSize={19} fontWeight={800} fill="#0F0F12" fontFamily={FONT}>
              {t.story.title}
            </text>
            <text x={PAD} y={54} fontSize={11} fill="#5C6A86" fontFamily={FONT}>
              {week.days[0]} → {week.days[6]}
            </text>
            {placed}
          </svg>
        )}
        <p className="text-[13px] text-[var(--color-ink-soft)]">{t.story.previewHelp}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void finish('coach')} disabled={shown.length === 0}
                className="bab-pill flex-1 px-4 py-3 text-[15px] disabled:opacity-50"
                style={{ background: 'var(--color-lime)' }}>
          {t.story.send}
        </button>
        <button type="button" onClick={() => void finish()} disabled={shown.length === 0}
                className="bab-pill px-4 py-3 text-[15px] disabled:opacity-50">
          {t.story.keep}
        </button>
        <button type="button" onClick={() => void download()} disabled={shown.length === 0}
                className="bab-pill px-4 py-3 text-[15px] disabled:opacity-50">
          {t.story.download}
        </button>
      </div>
      {done === 'saved' && (
        <p className="text-center text-[13px] text-[var(--color-ink-soft)]">{t.story.saved}</p>
      )}

      <section className="bab-card flex flex-col gap-2 px-4 py-4">
        <h2 className="font-display text-[18px]">{t.story.saidTitle}</h2>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.story.saidHelp}</p>
        <p className="text-[15px]">«{words}»</p>
        <button type="button" onClick={() => { void navigator.clipboard?.writeText(words); setCopied(true) }}
                className="bab-pill self-start px-4 py-2 text-[14px]">
          {copied ? t.story.copied : t.story.copyWords}
        </button>

        <button type="button" onClick={() => setShowStuck((v) => !v)}
                aria-expanded={showStuck} aria-controls="story-stuck-phrases"
                className="self-start text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.story.stuckTitle}
        </button>
        {showStuck && (
          <ul id="story-stuck-phrases" className="flex flex-col gap-2">
            {t.story.stuckPhrases.map((p, i) => (
              <li key={i} className="bab-card px-3 py-2.5 text-[14px]">«{p}»</li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
