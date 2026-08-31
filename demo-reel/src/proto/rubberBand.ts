import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Il rimbalzo elastico ai bordi, quello di iOS.
 *
 * Chrome non ce l'ha: arrivi in fondo e lo scorrimento si pianta di netto. E'
 * uno dei pochi movimenti che l'occhio usa per dire "questa e' una pagina web e
 * non un telefono", quindi va costruito a mano.
 *
 * Solo il trascinamento rimbalza, non l'inerzia dopo che il dito si e' alzato:
 * durante l'inerzia non arrivano eventi del dito e non c'e' niente da seguire.
 * Nel video il dito resta sempre appoggiato mentre scorre, quindi si vede.
 */
/** oltre questo non si va, per quanto tiri */
const MAX = 150
/** quanto conta il trascinamento oltre il bordo */
const resist = (d: number) => MAX * (1 - Math.exp(-d / MAX))

export function useRubberBand(scroller: RefObject<HTMLDivElement | null>, on: boolean) {
  useEffect(() => {
    const el = scroller.current
    if (!on || !el) return
    const content = el.firstElementChild as HTMLElement | null
    if (!content) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* dove stava il dito quando ha toccato il bordo. null = non stiamo tirando */
    let anchor: number | null = null
    let prev = 0
    let pull = 0

    const set = (v: number, snap: boolean) => {
      pull = v
      content.style.transform = v ? `translate3d(0,${v}px,0)` : ''
      content.style.transition = snap ? 'transform 400ms cubic-bezier(0.22,1,0.36,1)' : 'none'
    }

    const atTop = () => el.scrollTop <= 0
    const atEnd = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 0.5

    const down = (e: PointerEvent) => {
      prev = e.clientY
      anchor = null
      if (pull) set(0, true)
    }

    const move = (e: PointerEvent) => {
      const y = e.clientY
      const dy = y - prev
      if (anchor === null) {
        /*
         * Il bordo si tocca adesso. L'ancora e' dov'era il dito PRIMA di
         * questo movimento, non dov'e' ora: mettendola qui lo strappo di
         * questo primo movimento varrebbe zero, si rientrerebbe subito, e
         * ricominciando ogni volta da capo non si tirerebbe mai niente.
         */
        if ((atTop() && dy > 0) || (atEnd() && dy < 0)) anchor = prev
        else {
          prev = y
          return
        }
      }
      prev = y
      const over = y - anchor
      if (atTop() && over > 0) set(resist(over), false)
      else if (atEnd() && over < 0) set(-resist(-over), false)
      else {
        // sei rientrato: molla la presa e lascia scorrere il browser
        anchor = null
        if (pull) set(0, false)
      }
    }

    const up = () => {
      anchor = null
      if (pull) set(0, true)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      content.style.transform = ''
      content.style.transition = ''
    }
  }, [scroller, on])
}
