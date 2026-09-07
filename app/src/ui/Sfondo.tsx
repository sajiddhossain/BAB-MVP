import texture from '../assets/background-texture.png'
import teal from '../assets/accent-teal.svg'
import coral from '../assets/accent-coral.svg'
import lime from '../assets/accent-lime.svg'
import { DECORO } from '../data/decoro'
import type { Macchia } from '../data/decoro'

const SVG = { teal, coral, lime } as const

/*
 * I quadrati quasi trasparenti: il colore non sta nei metadati di Figma, ma
 * nel disegno seguono sempre lo stesso giro. Il raggio e' un quarto del lato.
 */
const TINTE = ['rgba(212,243,105,0.12)', 'rgba(16,185,129,0.07)', 'rgba(239,84,94,0.06)']

/**
 * Lo sfondo di uno schermo: la trama a puntini e le macchie di colore.
 *
 * Tutto qui dentro e' decorazione. Non prende tocchi, non entra nel flusso, e
 * quando lo schermo si allunga resta ancorato in alto — le macchie sono messe
 * rispetto al frame da 874, non rispetto al contenuto.
 */
export function Sfondo({ nodo }: { nodo: string }) {
  const macchie: Macchia[] = DECORO[nodo] ?? []
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <img src={texture} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {macchie.map((m, i) =>
        m.t === 'deco' ? (
          <div
            key={i}
            className="absolute"
            style={{
              left: m.x,
              top: m.y,
              width: m.d,
              height: m.d,
              borderRadius: m.d / 4,
              background: TINTE[i % TINTE.length],
            }}
          />
        ) : (
          <img
            key={i}
            src={SVG[m.t]}
            alt=""
            className="absolute"
            style={{ left: m.x, top: m.y, width: m.d, height: m.d }}
          />
        ),
      )}
    </div>
  )
}
