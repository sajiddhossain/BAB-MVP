import { useEffect, useRef } from 'react'

/**
 * Quello che sta sopra a tutto il resto, per chi non lo vede.
 *
 * `aria-modal` da solo non basta: dice a VoiceOver che il resto non conta, ma
 * con la tastiera — e con il lettore dello schermo che scorre di elemento in
 * elemento — si finiva lo stesso sui bottoni della mappa, sotto al foglio.
 * Qui tutto quello che non e' la finestra diventa `inert` finche' la finestra
 * e' aperta: non si tocca, non si mette a fuoco, non si legge.
 *
 * Il fuoco entra nella finestra aprendola, e chiudendola torna dove era: sulla
 * parola che si era toccata, sulla zona della mappa. Senza, chi usa la
 * tastiera ricominciava da capo la pagina ogni volta.
 *
 * Una finestra dentro l'altra funziona da sola: la seconda spegne la prima, e
 * chiudendosi riaccende solo quello che aveva spento lei.
 */
export function useModale<T extends HTMLElement>() {
  const radice = useRef<T>(null)

  useEffect(() => {
    const el = radice.current
    if (!el) return
    // anche SVG: le zone della mappa sono tracciati, non elementi HTML
    const attivo = document.activeElement
    const prima = attivo instanceof HTMLElement || attivo instanceof SVGElement ? attivo : null

    const spenti: HTMLElement[] = []
    for (let n: HTMLElement = el; n !== document.body && n.parentElement; n = n.parentElement) {
      for (const fratello of Array.from(n.parentElement.children)) {
        if (fratello === n || !(fratello instanceof HTMLElement) || fratello.inert) continue
        fratello.inert = true
        spenti.push(fratello)
      }
    }

    const finestra = el.querySelector<HTMLElement>('[role="dialog"]') ?? el
    if (!finestra.contains(document.activeElement)) finestra.focus({ preventScroll: true })

    return () => {
      for (const f of spenti) f.inert = false
      if (prima?.isConnected) prima.focus({ preventScroll: true })
    }
  }, [])

  return radice
}
