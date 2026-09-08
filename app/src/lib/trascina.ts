import { useRef, useState } from 'react'
import type { PointerEvent as EventoPuntatore } from 'react'

/**
 * Prendere una pastiglia e posarla da un'altra parte.
 *
 * ── DUE GESTI, UNO SOLO DI CODICE ──────────────────────────────────────────
 * Si puo' trascinare — dito sulla pastiglia, la porti dove va — oppure
 * toccare la pastiglia e poi toccare il posto. Sono lo stesso gesto visto da
 * due distanze: qui dentro c'e' una soglia di otto pixel, e sotto a quella un
 * pointerdown/pointerup e' un tocco, sopra e' un trascinamento.
 *
 * Il tocco non e' un ripiego: e' quello che funziona con le mani sudate, col
 * telefono in una mano sola, e con VoiceOver, dove trascinare non si puo'
 * proprio. Il trascinamento e' quello che il disegno mostra ed e' quello che
 * si prova a fare per primo.
 *
 * ── PERCHE' NON L'HTML DRAG AND DROP ───────────────────────────────────────
 * Perche' su iOS non esiste. `dragstart` non parte da un dito, e meta' delle
 * atlete userebbe uno schermo dove l'esercizio non si puo' fare.
 *
 * ── COME SI TROVA IL BERSAGLIO ─────────────────────────────────────────────
 * Con `elementFromPoint` sul punto in cui il dito si stacca, risalendo al
 * primo antenato con `data-posa`. Non serve registrare i bersagli da nessuna
 * parte: chi ne vuole uno gli mette l'attributo, e basta. L'ombra che segue
 * il dito NON deve prendere tocchi, se no si trova sempre e solo lei.
 */
export type Presa = {
  /** chi si sta trascinando */
  id: string
  /** dove sta adesso l'angolo in alto a sinistra dell'ombra, sullo schermo */
  x: number
  y: number
  largo: number
  alto: number
}

export function useTrascina({
  onPosa,
  onTocco,
}: {
  /** il dito si e' staccato su un bersaglio, o fuori da tutti (`null`) */
  onPosa: (id: string, dove: string | null) => void
  /** il dito si e' staccato senza essersi mosso */
  onTocco: (id: string) => void
}) {
  const [presa, setPresa] = useState<Presa | null>(null)
  const corso = useRef<{
    id: string
    x0: number
    y0: number
    mosso: boolean
    dx: number
    dy: number
    largo: number
    alto: number
  } | null>(null)

  /** I gesti da attaccare a una pastiglia. */
  function pastiglia(id: string) {
    return {
      /*
        `touch-action: none` serve o il browser si prende il gesto per
        scorrere la pagina prima che noi sappiamo se e' un trascinamento. Le
        pastiglie sono piccole e non e' li' che si scorre.
      */
      style: { touchAction: 'none' as const },
      onPointerDown(e: EventoPuntatore<HTMLElement>) {
        // solo il tasto principale: col destro si apre il menu, non si gioca
        if (e.button !== 0) return
        const r = e.currentTarget.getBoundingClientRect()
        corso.current = {
          id,
          x0: e.clientX,
          y0: e.clientY,
          mosso: false,
          dx: e.clientX - r.left,
          dy: e.clientY - r.top,
          largo: r.width,
          alto: r.height,
        }
        e.currentTarget.setPointerCapture(e.pointerId)
      },
      onPointerMove(e: EventoPuntatore<HTMLElement>) {
        const c = corso.current
        if (!c || c.id !== id) return
        if (!c.mosso && Math.hypot(e.clientX - c.x0, e.clientY - c.y0) < 8) return
        c.mosso = true
        setPresa({
          id,
          x: e.clientX - c.dx,
          y: e.clientY - c.dy,
          largo: c.largo,
          alto: c.alto,
        })
      },
      onPointerUp(e: EventoPuntatore<HTMLElement>) {
        const c = corso.current
        corso.current = null
        setPresa(null)
        if (!c || c.id !== id) return
        if (!c.mosso) {
          onTocco(id)
          return
        }
        const sotto = document.elementFromPoint(e.clientX, e.clientY)
        onPosa(id, sotto?.closest('[data-posa]')?.getAttribute('data-posa') ?? null)
      },
      onPointerCancel() {
        corso.current = null
        setPresa(null)
      },
    }
  }

  return { presa, pastiglia }
}
