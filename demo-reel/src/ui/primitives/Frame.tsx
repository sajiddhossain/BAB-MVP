import type { ReactNode } from 'react'
import texture from '../assets/background-texture.png'

/**
 * Il contenitore di uno schermo: 402x874 con la texture a griglia di sfondo.
 * Tutto dentro e' posizionato in assoluto sulle coordinate esatte di Figma —
 * e' cosi' che il diff pixel converge invece di avvicinarsi e basta.
 */
export function Frame({
  children,
  width = 402,
  height = 874,
}: {
  children: ReactNode
  width?: number
  height?: number
}) {
  return (
    <div
      className="bab-font-body relative overflow-hidden"
      style={{ width, height, background: 'var(--bab-bg)' }}
    >
      <img
        src={texture}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {children}
    </div>
  )
}
