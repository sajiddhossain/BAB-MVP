import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FLOWS, STAGE } from './flows'
import type { Flow } from './flows'
import { useFit } from './useFit'
import { NavContext } from './nav'

const TRANSITION_MS = 460

type Move = { dir: 1 | -1; from: number } | null

/** Un tocco e' un tocco solo se il dito non si e' spostato: altrimenti stava scorrendo. */
const TAP_SLOP = 12
const TAP_MS = 400

export function Prototype({ flow }: { flow: Flow }) {
  const scale = useFit()
  const [index, setIndex] = useState(0)
  const [move, setMove] = useState<Move>(null)
  const [animating, setAnimating] = useState(false)
  const [entered, setEntered] = useState(true)
  const [ripple, setRipple] = useState<{ x: number; y: number; k: number } | null>(null)
  const busy = useRef(false)
  const rippleKey = useRef(0)

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = index + dir
      if (busy.current || next < 0 || next >= flow.screens.length) return
      busy.current = true

      const target = flow.screens[next]
      setMove({ dir, from: index })
      setIndex(next)
      setAnimating(false)
      // il bottom sheet non trasla come layer: si alza da solo
      setEntered(target.enter !== 'sheet' || dir === -1)

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimating(true)
          setEntered(true)
        }),
      )
      window.setTimeout(() => {
        setMove(null)
        busy.current = false
      }, TRANSITION_MS)
    },
    [index, flow],
  )

  // sonda per i test: leggere lo stato dal DOM era fragile
  useEffect(() => {
    ;(window as unknown as { __step?: number }).__step = index
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const down = useRef<{ x: number; y: number; t: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY, t: Date.now() }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current
    down.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const dist = Math.hypot(dx, dy)

    // swipe orizzontale = indietro/avanti
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx > 0 ? -1 : 1)
      return
    }
    if (dist > TAP_SLOP || Date.now() - d.t > TAP_MS) return

    const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = (e.clientX - box.left) / scale
    const y = (e.clientY - box.top) / scale

    // il bottone indietro sta in alto a sinistra su tutti gli schermi
    if (x < 80 && y < 115) {
      go(-1)
      return
    }
    rippleKey.current += 1
    setRipple({ x, y, k: rippleKey.current })
    go(1)
  }

  const nav = useMemo(() => ({ next: () => go(1), back: () => go(-1) }), [go])

  const layers: { i: number; role: 'out' | 'in' }[] = move
    ? [
        { i: move.from, role: 'out' },
        { i: index, role: 'in' },
      ]
    : [{ i: index, role: 'in' }]

  const current = flow.screens[index]
  const isSheet = current.enter === 'sheet' && (!move || move.dir === 1)

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0e0e11]">
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative overflow-hidden bg-[#f0ebe6]"
        style={{
          width: STAGE.w,
          height: STAGE.h,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          touchAction: 'pan-y',
        }}
      >
        {layers.map(({ i, role }) => {
          const s = flow.screens[i]
          const dir = move?.dir ?? 1
          const enter = flow.screens[index].enter
          let tx = 0
          let opacity = 1

          if (move && enter !== 'sheet') {
            const outgoing = role === 'out'
            if (enter === 'push') {
              if (outgoing) tx = animating ? -STAGE.w * 0.28 * dir : 0
              else tx = animating ? 0 : STAGE.w * dir
            } else {
              opacity = outgoing ? (animating ? 0 : 1) : animating ? 1 : 0
            }
          }

          const Comp = s.Component
          const scrolls = s.h > STAGE.h
          return (
            <div
              key={`${i}-${role}`}
              className={scrolls ? 'absolute inset-0 overflow-y-auto' : 'absolute inset-0 overflow-hidden'}
              style={{
                transform: `translate3d(${tx}px,0,0)`,
                opacity,
                transition: move
                  ? `transform ${TRANSITION_MS}ms cubic-bezier(0.32,0.72,0,1), opacity ${TRANSITION_MS}ms ease-out`
                  : undefined,
                WebkitOverflowScrolling: 'touch',
                /*
                 * Serve anche qui, non solo sullo stage: con touch-action auto il
                 * browser si prende QUALSIASI gesto sul contenitore scrollabile,
                 * emette pointercancel e il pointerup non arriva mai. Risultato:
                 * lo swipe orizzontale funzionava ovunque tranne su tune-in.
                 */
                touchAction: 'pan-y',
              }}
            >
              <div style={{ marginLeft: (STAGE.w - s.w) / 2 }}>
                <NavContext.Provider value={nav}>
                  <Comp entered={role === 'in' && isSheet ? entered : true} />
                </NavContext.Provider>
              </div>
            </div>
          )
        })}

        {ripple && (
          <span
            key={ripple.k}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40,
              width: 80,
              height: 80,
              border: '2px solid rgba(44,44,58,0.4)',
              animation: 'bab-ripple 620ms ease-out forwards',
            }}
            onAnimationEnd={() => setRipple(null)}
          />
        )}
      </div>

      <FlowSwitcher flow={flow} index={index} />
    </div>
  )
}

/**
 * Barra minima: quale flusso, a che punto siamo.
 * Sta in ALTO: in basso copriva il bottone principale, che su ogni schermo
 * arriva fino a y=840. Sopra la nav bar (y<55) invece e' zona libera ovunque.
 */
function FlowSwitcher({ flow, index }: { flow: Flow; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end pt-[env(safe-area-inset-top)]">
      <div className="pointer-events-auto mr-2 mt-2 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
        <button onClick={() => setOpen((o) => !o)} className="font-semibold text-white/90">
          {flow.title}
        </button>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {index + 1}/{flow.screens.length}
        </span>
        {open &&
          Object.values(FLOWS)
            .filter((f) => f.id !== flow.id)
            .map((f) => (
              <a key={f.id} href={`?flow=${f.id}`} className="rounded-full bg-white/15 px-2 py-0.5 text-white/85">
                {f.title}
              </a>
            ))}
      </div>
    </div>
  )
}
