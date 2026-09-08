import { useEffect, useRef, useState } from 'react'
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

function Macchie({ nodo }: { nodo: string }) {
  return (
    <>
      {(DECORO[nodo] ?? []).map((m: Macchia, i) =>
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
    </>
  )
}

/**
 * Lo sfondo di uno schermo: la trama a puntini e le macchie di colore.
 *
 * Tutto qui dentro e' decorazione. Non prende tocchi, non entra nel flusso, e
 * quando lo schermo si allunga resta ancorato in alto — le macchie sono messe
 * rispetto al frame da 874, non rispetto al contenuto.
 *
 * Le macchie sfumano invece di cambiare di colpo. Di solito non si vede,
 * perche' cambiando schermo cambia tutto insieme; si vede dove lo schermo
 * resta e cambia solo lui — la domanda sul ciclo che si apre — e li' uno
 * scatto delle macchie tradirebbe che sotto sono due schermi diversi.
 */
export function Sfondo({ nodo }: { nodo: string }) {
  const [uscente, setUscente] = useState<string | null>(null)
  const precedente = useRef(nodo)

  useEffect(() => {
    if (precedente.current === nodo) return
    setUscente(precedente.current)
    precedente.current = nodo
    const t = setTimeout(() => setUscente(null), 420)
    return () => clearTimeout(t)
  }, [nodo])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <img src={texture} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/*
        Due animazioni e non una transizione: una transizione ha bisogno che
        l'elemento esista gia' con il valore di partenza, e questi due strati
        nascono nel momento in cui devono muoversi.
      */}
      {uscente && (
        <div key={uscente} className="bab-svanisce absolute inset-0">
          <Macchie nodo={uscente} />
        </div>
      )}
      <div key={nodo} className="bab-affiora absolute inset-0">
        <Macchie nodo={nodo} />
      </div>
    </div>
  )
}
