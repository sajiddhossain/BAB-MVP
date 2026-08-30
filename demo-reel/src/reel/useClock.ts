import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

declare global {
  interface Window {
    __seek?: (ms: number) => void
    __duration?: number
    __ready?: boolean
    __capture?: boolean
  }
}

/**
 * In modalita normale avanza con rAF (anteprima nel browser).
 * In modalita cattura (?capture=1) il tempo lo detta lo script Playwright
 * via window.__seek(ms): ogni fotogramma e' deterministico, niente jitter.
 */
export function useClock(duration: number, capture: boolean) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(!capture)
  const raf = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    window.__duration = duration
  }, [duration])

  useEffect(() => {
    if (!capture) return
    window.__capture = true
    window.__seek = (ms: number) => {
      flushSync(() => setT(ms))
    }
    window.__ready = true
    return () => {
      window.__seek = undefined
      window.__ready = false
    }
  }, [capture])

  useEffect(() => {
    if (capture || !playing) return
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = now - last.current
      last.current = now
      setT((prev) => (prev + dt >= duration ? 0 : prev + dt))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [capture, playing, duration])

  return { t, setT, playing, setPlaying }
}
