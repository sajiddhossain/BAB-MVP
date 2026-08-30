import { CLIPS } from './reel/clips'
import { UiProbe } from './dev/UiProbe'
import { Prototype } from './proto/Prototype'
import { FLOWS } from './proto/flows'
import { Player, useTimeline } from './reel/Player'
import { useClock } from './reel/useClock'

const params = new URLSearchParams(location.search)
const capture = params.get('capture') === '1'
const clipId = params.get('clip') ?? location.hash.replace('#', '') ?? 'checkin'
const clip = CLIPS[clipId] ?? CLIPS.checkin

const probe = params.get('probe')
// il reel serve alla registrazione: ci si arriva con ?clip=. Di default,
// aprendo la pagina sul telefono, parte il prototipo camminabile.
const isReel = capture || params.has('clip') || location.hash.startsWith('#reel')
const flow = FLOWS[params.get('flow') ?? 'checkin'] ?? FLOWS.checkin

if (capture || probe) document.body.dataset.capture = '1'

export default function App() {
  if (probe) return <UiProbe id={probe} />
  if (isReel) return <Reel />
  return (
    <div className="bab-proto">
      <Prototype flow={flow} />
    </div>
  )
}

function Reel() {
  const tl = useTimeline(clip)
  const { t, setT, playing, setPlaying } = useClock(tl.duration, capture)

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 py-8">
      <Player clip={clip} t={t} />

      <div className="no-capture flex w-[426px] flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-semibold tracking-wide text-white/85">
            BAB · {clip.title}
          </span>
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
                c.id === clip.id
                  ? 'bg-white/15 text-white'
                  : 'border border-white/20 text-white/60'
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
