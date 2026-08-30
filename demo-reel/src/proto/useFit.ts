import { useEffect, useState } from 'react'
import { STAGE } from './flows'

/**
 * Scala il frame da 402x874 per riempire lo schermo del telefono.
 *
 * Usa visualViewport quando c'e': su iOS la barra degli indirizzi cambia
 * l'altezza utile mentre scrolli, e window.innerHeight resta indietro.
 *
 * Ma mentre scrivi in un campo NON si rimisura: la tastiera dimezza il
 * visualViewport, e ricalcolando l'app si rimpiccioliva sotto le dita. Nelle
 * app vere la tastiera COPRE lo schermo, non lo restringe.
 */
export function useFit() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const typing = () => {
      const el = document.activeElement
      return !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')
    }
    const fit = () => {
      if (typing()) return
      const vw = window.visualViewport?.width ?? window.innerWidth
      const vh = window.visualViewport?.height ?? window.innerHeight
      setScale(Math.min(vw / STAGE.w, vh / STAGE.h))
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    window.visualViewport?.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
      window.visualViewport?.removeEventListener('resize', fit)
    }
  }, [])

  return scale
}
