import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FLOWS, STAGE } from './flows'
import type { Flow } from './flows'
import { useFit } from './useFit'
import { NavContext } from './nav'
import { startBlank } from './blank'

const TRANSITION_MS = 460

type Move = { dir: 1 | -1; from: number } | null

export function Prototype({ flow, boxed = false }: { flow: Flow; boxed?: boolean }) {
  // dentro useState e non in un effetto: deve succedere PRIMA che i figli
  // leggano lo store, altrimenti il primo fotogramma mostra lo stato del frame
  // e poi si svuota sotto gli occhi
  useState(startBlank)
  /*
   * `boxed` = siamo dentro la cornice del telefono (il reel), che e' gia'
   * esattamente 402x874: niente da adattare, scala 1. Fuori invece lo stage si
   * ridimensiona per riempire lo schermo vero.
   */
  const fitted = useFit()
  const scale = boxed ? 1 : fitted
  const [index, setIndex] = useState(0)
  const [move, setMove] = useState<Move>(null)
  const [animating, setAnimating] = useState(false)
  const [entered, setEntered] = useState(true)
  const busy = useRef(false)

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (busy.current || delta === 0 || next < 0 || next >= flow.screens.length) return
      busy.current = true

      const dir: 1 | -1 = delta > 0 ? 1 : -1
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

  // sonde per i test: leggere lo stato dal DOM era fragile
  useEffect(() => {
    ;(window as unknown as { __step?: number }).__step = index
  }, [index])
  /*
   * `__moving` dice se una transizione e' in corso. Serve ai test per aspettare
   * il FATTO invece di un numero di millisecondi: da quando il bottone del
   * pannello conferma prima di chiudere, le attese a tempo fisso non tornavano
   * piu' e sarebbero andate ritoccate a ogni cambio di animazione.
   */
  useEffect(() => {
    ;(window as unknown as { __moving?: boolean }).__moving = !!move
  }, [move])

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
  /*
   * Si va AVANTI solo confermando: il bottone principale, oppure un comando che
   * chiude il suo passo (una zona del corpo che apre il pannello). Un tocco a
   * vuoto non deve fare niente.
   *
   * Prima bastava toccare un punto qualunque dello schermo. Era comodo per
   * scorrere i frame, ma è la cosa che più di tutte tradisce che non è un'app:
   * appoggi il pollice per leggere e ti ritrovi due schermi più avanti.
   *
   * Indietro invece resta un gesto: lo swipe da sinistra, come ovunque.
   */
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current
    down.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - d.t < 700) go(-1)
  }

  const nav = useMemo(() => ({ next: () => go(1), back: () => go(-1), go }), [go])

  const layers: { i: number; role: 'out' | 'in' }[] = move
    ? [
        { i: move.from, role: 'out' },
        { i: index, role: 'in' },
      ]
    : [{ i: index, role: 'in' }]

  const current = flow.screens[index]
  const isSheet = current.enter === 'sheet' && (!move || move.dir === 1)

  return (
    /*
     * Il contorno prende il colore dell'app, non il nero da lettore video: su un
     * telefono con proporzioni diverse dalle 402x874 le bande che restano devono
     * sembrare la stessa superficie, non la cornice di un video.
     */
    <div
      className={`${boxed ? 'absolute' : 'fixed'} inset-0 flex items-center justify-center overflow-hidden`}
      style={{ background: 'var(--bab-bg)' }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        /*
         * shrink-0 e' obbligatorio: lo stage e' un flex item largo 402 dentro
         * uno schermo da 375, e il transform: scale NON riduce la larghezza di
         * layout. Senza, il flex lo stringeva a 375 e tutto il contenuto
         * (posizionato in assoluto su coordinate fisse) finiva tagliato a destra.
         */
        className="relative shrink-0 overflow-hidden bg-[#f0ebe6]"
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
          // lo schermo che se ne va si spegne un po': da' profondita' e dice
          // qual e' quello vivo, senza disegnare un velo sopra
          let dim = 1
          let shadow: string | undefined

          if (move && enter !== 'sheet') {
            const outgoing = role === 'out'
            if (enter === 'push') {
              if (outgoing) {
                tx = animating ? -STAGE.w * 0.28 * dir : 0
                dim = animating ? 0.9 : 1
              } else {
                tx = animating ? 0 : STAGE.w * dir
                // il bordo che entra proietta ombra su quello sotto
                shadow = `${-18 * dir}px 0 28px rgba(0,0,0,0.18)`
              }
            } else {
              opacity = outgoing ? (animating ? 0 : 1) : animating ? 1 : 0
            }
          }

          const Comp = s.Component
          const scrolls = s.h > STAGE.h
          return (
            <div
              /*
               * La chiave e' l'indice dello schermo, NON indice+ruolo.
               * Con `${i}-${role}` lo schermo che esce cambiava chiave nel
               * momento in cui iniziava la transizione: React lo buttava via e
               * lo ricostruiva, quindi rifaceva da capo l'animazione d'ingresso
               * mentre scivolava via — si vedeva sbiadire e ricomparire. E si
               * perdeva anche la sua posizione di scorrimento.
               */
              key={i}
              className={scrolls ? 'absolute inset-0 overflow-y-auto' : 'absolute inset-0 overflow-hidden'}
              style={{
                transform: `translate3d(${tx}px,0,0)`,
                opacity,
                filter: dim === 1 ? undefined : `brightness(${dim})`,
                boxShadow: shadow,
                transition: move
                  ? `transform ${TRANSITION_MS}ms cubic-bezier(0.32,0.72,0,1), opacity ${TRANSITION_MS}ms ease-out, filter ${TRANSITION_MS}ms ease-out`
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

      </div>

      {/*
        La barretta "Check-in 3/5" e' un attrezzo: dice che stai guardando un
        prototipo. Serve a me per saltare fra i flussi, non a chi prova l'app.
        Si accende con ?dev=1.
      */}
      {new URLSearchParams(location.search).has('dev') && <FlowSwitcher flow={flow} index={index} />}
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
