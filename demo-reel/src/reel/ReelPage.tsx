import { CLIPS } from './clips'
import { Player, useTimeline } from './Player'
import { useClock } from './useClock'
import type { Clip } from './timeline'

/**
 * La pagina del reel: il player a fotogrammi con i controlli.
 *
 * Sta in un modulo suo e si carica su richiesta perche' si porta dietro i 13
 * export SVG di Figma, cioe' ~5MB. Chi apre il prototipo sul telefono non deve
 * scaricarli: ci arriva solo chi passa ?clip= o registra.
 */
export default function ReelPage({ clip, capture }: { clip: Clip; capture: boolean }) {
  const tl = useTimeline(clip)
  const { t, setT, playing, setPlaying } = useClock(tl.duration, capture)

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 py-8">
      <Player clip={clip} t={t} />

      <div className="no-capture flex w-[426px] flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-semibold tracking-wide text-white/85">BAB · {clip.title}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {(t / 1000).toFixed(1)}s / {(tl.duration / 1000).toFixed(1)}s
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={tl.duration}
          step={16}
          value={t}
          onChange={(e) => {
            setPlaying(false)
            setT(Number(e.target.value))
          }}
          className="w-full accent-[#B9E24A]"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-[#B9E24A] px-4 py-1.5 text-sm font-semibold text-[#1B1B22]"
          >
            {playing ? 'Pausa' : 'Play'}
          </button>
          <button
            onClick={() => {
              setT(0)
              setPlaying(true)
            }}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80"
          >
            Riavvia
          </button>
          {Object.values(CLIPS).map((c) => (
            <a
              key={c.id}
              href={`?clip=${c.id}`}
              className={`rounded-full px-4 py-1.5 text-sm ${
                c.id === clip.id ? 'bg-white/15 text-white' : 'border border-white/20 text-white/60'
              }`}
            >
              {c.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
