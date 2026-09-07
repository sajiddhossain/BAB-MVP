import type { ReactNode } from 'react'
import texture from '../assets/background-texture.png'

/**
 * La tela di uno schermo.
 *
 * Il disegno e' fatto su un frame da 402x874 con tutto in posizione assoluta.
 * Qui NON si riproducono quelle coordinate: si riproduce il risultato. La
 * colonna e' larga 402 al massimo e centrata, il contenuto scorre nel flusso
 * normale con le distanze misurate dal frame, e il bottone principale sta in
 * fondo. Cosi' un testo piu' lungo del previsto allarga lo schermo invece di
 * finire sopra a quello che viene dopo — che e' l'unica differenza che conta
 * fra un prototipo e un'app.
 *
 * `azione` e' il blocco che resta in fondo: sta fuori dallo scorrimento,
 * sopra la barra di sistema del telefono.
 */
export function Screen({
  children,
  azione,
  accenti,
}: {
  children: ReactNode
  azione?: ReactNode
  /** le macchie di colore che sbordano dai lati, una per schermo */
  accenti?: ReactNode
}) {
  return (
    <div className="flex min-h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        {/* la trama a puntini: decorazione, non deve mai prendere tocchi */}
        <img
          src={texture}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {accenti}
        <div className="relative flex flex-1 flex-col px-[30px] pb-6 pt-[94px]">{children}</div>
        {azione && (
          <div className="relative px-6 pb-[calc(34px+env(safe-area-inset-bottom))]">{azione}</div>
        )}
      </div>
    </div>
  )
}

/**
 * Una macchia d'accento. Sborda dal bordo apposta: nel disegno ne esce sempre
 * una in alto e una in basso, mai al centro.
 */
export function Accento({
  src,
  left,
  top,
  size,
}: {
  src: string
  left: number
  top: number
  size: number
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left, top, width: size, height: size }}
    />
  )
}
