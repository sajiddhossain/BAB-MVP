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
  textureTops = [0],
}: {
  children: ReactNode
  width?: number
  height?: number
  /**
   * La texture e' un'immagine da 404x874: su uno schermo che scorre va ripetuta,
   * non stirata. tune-in ne mette una seconda a 868 (leggera sovrapposizione).
   */
  textureTops?: number[]
}) {
  return (
    <div
      /* bab-enter: i figli entrano sfalsati (vedi index.css). Sta qui e non
         sui singoli schermi perche' i figli di Frame SONO i blocchi. */
      className="bab-font-body bab-enter relative overflow-hidden"
      style={{ width, height, background: 'var(--bab-bg)' }}
    >
      {textureTops.map((t) => (
        <img
          key={t}
          src={texture}
          alt=""
          className="pointer-events-none absolute left-0"
          style={{ top: t, width, height: 874 }}
          draggable={false}
        />
      ))}
      {children}
    </div>
  )
}
