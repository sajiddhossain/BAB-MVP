import { useRef } from 'react'
import { BACK_INK, BODY_SIZE, FRONT_INK, OUTLINE } from '../bodyZones'
import type { BodyZone } from '../bodyZones'
import { ZONE, codiceZona, nomeZona } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'
import type { Lato } from '../../data/sessione'

/** Il corallo delle zone segnate, misurato sul disegno. */
const SEGNATA = '#f36b5b'

/*
 * `onClick` e non `onPointerUp`: il click e' quello che il browser emette
 * dopo un tocco vero, gia' ripulito — un dito che parte sul ginocchio e
 * finisce mentre si scorre la pagina non lo fa scattare, mentre un pointerup
 * si'. E porta con se' le coordinate, che servono per il ripiego qui sotto.
 */

/*
 * Quanto lontano puo' cadere il dito e contare lo stesso, nello spazio del
 * disegno (1366 di lato).
 *
 * Serve perche' le zone sono separate da linee: un dito che cade sulla riga
 * fra ginocchio e tibia non tocca nessuna delle due. Sessanta unita' sono
 * circa 18 pixel sullo schermo — abbastanza da non lasciare buchi, poco
 * abbastanza da non far accendere il polpaccio a chi ha toccato fuori dalla
 * figura.
 */
const VICINO = 60

/**
 * La figura con le zone da toccare.
 *
 * Le zone non esistono come nodi nel file Figma — la' e' un'immagine — e
 * nemmeno nel disegno di partenza, che e' un tratto solo. Quelle in
 * `bodyZones.ts` sono ricavate riempiendo ogni area chiusa dalle linee, quindi
 * seguono il tratto esattamente: e' per questo che il ginocchio ha la forma
 * del ginocchio e non di un cerchio messo li' sopra.
 */
export function Mappa({
  lato,
  scelte,
  onTocca,
}: {
  lato: Lato
  /** i codici zona gia' segnati, nella forma `front_quad_r` */
  scelte: string[]
  onTocca: (zona: { codice: string; nome: string }) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const { lingua } = useLingua()
  const zone = ZONE[lato]
  const [x, y, w, h] = lato === 'front' ? FRONT_INK : BACK_INK

  function scegli(z: BodyZone) {
    onTocca({ codice: codiceZona(lato, z.id), nome: nomeZona(z.id, lingua) })
  }

  /*
   * Il tocco che non prende nessuna zona.
   *
   * Cade sulla linea, o appena fuori dalla figura. Si prende la zona col
   * baricentro piu' vicino, se sta entro `VICINO`: senza questo, gomito e
   * polso — che sono larghi pochi pixel — sarebbero intoccabili col dito.
   */
  function accanto(e: React.MouseEvent<SVGRectElement>) {
    const el = svg.current
    const ctm = el?.getScreenCTM()
    if (!el || !ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())

    let vicina: BodyZone | null = null
    let minima = Infinity
    for (const z of zone) {
      const d = Math.hypot(z.c[0] - p.x, z.c[1] - p.y)
      if (d < minima) {
        minima = d
        vicina = z
      }
    }
    if (vicina && minima <= VICINO) scegli(vicina)
  }

  return (
    <svg
      ref={svg}
      viewBox={`${x - 8} ${y - 8} ${w + 16} ${h + 16}`}
      className="h-full w-auto touch-manipulation"
      role="group"
      aria-label={lato === 'front' ? 'Corpo visto da davanti' : 'Corpo visto da dietro'}
    >
      {/*
        Il rettangolo di ripiego sta SOTTO alle zone: chi tocca dentro a una
        zona prende la zona, chi tocca fra due prende questo, e questo trova
        la piu' vicina. Con l'ordine al contrario non si potrebbe piu'
        toccare niente.
      */}
      <rect
        x={x - 8}
        y={y - 8}
        width={w + 16}
        height={h + 16}
        fill="transparent"
        onClick={accanto}
      />

      {zone.map((z) => {
        const codice = codiceZona(lato, z.id)
        const segnata = scelte.includes(codice)
        return (
          <path
            key={z.id}
            d={z.d}
            fill={segnata ? SEGNATA : 'transparent'}
            /*
              Col tasto tab la zona si segna col suo stesso contorno invece
              che con l'alone di sistema: un outline su un <path> disegna il
              rettangolo che lo contiene, che sul corpo non vuol dire niente.
            */
            className="cursor-pointer outline-none transition-[fill] duration-200 focus-visible:stroke-lilla focus-visible:[stroke-width:10] motion-reduce:transition-none"
            role="button"
            tabIndex={0}
            aria-label={nomeZona(z.id, lingua)}
            aria-pressed={segnata}
            onClick={() => scegli(z)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                scegli(z)
              }
            }}
          />
        )
      })}

      {/*
        Il tratto va sopra alle zone: le linee del disegno devono restare
        visibili anche dove sotto c'e' il corallo. Non prende tocchi, se no
        coprirebbe tutto quello che sta sotto.
      */}
      <path d={OUTLINE} fill="var(--color-ink)" fillRule="evenodd" pointerEvents="none" />
    </svg>
  )
}

/**
 * Il riquadro bianco in cui sta la figura, con la sua ombra dura.
 *
 * L'altezza e' fissa a 397 come nel disegno, e non elastica. Elastica non
 * funziona: la figura e' un SVG alto quanto vuole, e in una colonna flex
 * senza un'altezza definita si prende tutto lo spazio che le pare — sul
 * telefono usciva dal riquadro. Su schermi piu' corti di 874 lo schermo
 * scorre, che e' meglio di una figura schiacciata.
 */
export function Riquadro({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-[397px] shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-[1.5px] border-line bg-surface py-5"
      style={{ filter: 'drop-shadow(6px 5px 0px rgba(0,0,0,0.04))' }}
    >
      {children}
    </div>
  )
}

export { BODY_SIZE }
