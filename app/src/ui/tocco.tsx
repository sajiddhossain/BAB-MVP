import { useState } from 'react'
import type { ComponentProps } from 'react'

/**
 * Il tocco su una superficie che non e' il bottone principale.
 *
 * Restituisce le cose da spargere sull'elemento: gli ascoltatori del dito e
 * `data-giu`, che e' quello che la classe `bab-tocco` guarda per stringere.
 *
 * Perche' non `:active` sta scritto accanto alla classe, in `index.css`. Qui
 * conta l'altra meta': `pointerleave` e `pointercancel` servono quanto
 * `pointerup` — un dito che parte da una carta e finisce altrove non fa
 * scattare `pointerup` su quella carta, e senza queste due la carta resterebbe
 * schiacciata per sempre.
 */
export function useTocco() {
  const [giu, setGiu] = useState(false)
  const spegni = () => setGiu(false)
  return {
    'data-giu': giu ? ('si' as const) : undefined,
    onPointerDown: () => setGiu(true),
    onPointerUp: spegni,
    onPointerLeave: spegni,
    onPointerCancel: spegni,
  }
}

/**
 * Un bottone che risponde al dito, per dove il gancio non si puo' chiamare.
 *
 * Le caselle da riempire e le righe delle unita' nascono dentro a un `map`, e
 * un gancio dentro a un ciclo e' proprio la cosa che React non vuole. Questo
 * componente e' lo stesso gancio spostato dove chiamarlo e' lecito: una volta
 * per bottone.
 */
export function BottoneTocco({ className = '', children, ...resto }: ComponentProps<'button'>) {
  const tocco = useTocco()
  return (
    <button type="button" {...resto} {...tocco} className={`bab-tocco ${className}`}>
      {children}
    </button>
  )
}
