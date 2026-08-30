import spriteFront from '../assets/bodymap/body-sprite.png'
import spriteBack from '../assets/bodymap/body-back.png'

const SOURCES = { sprite: spriteFront, back: spriteBack }

/**
 * La figura umana e' uno sprite unico 1546x1546 con fronte e retro affiancati:
 * il toggle Front/Back non cambia immagine, sposta il ritaglio.
 * Percentuali prese dal nodo Figma, non ricavate a mano.
 *
 * Nota: le macchie rosse sono dipinte dentro il raster, quindi non sono
 * accendibili una a una — la selezione si racconta con un alone sopra.
 */
export function BodySprite({
  left,
  top,
  width,
  height,
  imgWidthPct,
  imgHeightPct,
  imgLeftPct,
  imgTopPct,
  src = 'sprite',
}: {
  left: number
  top: number
  width: number
  height: number
  imgWidthPct: number
  imgHeightPct: number
  imgLeftPct: number
  imgTopPct: number
  /** checkout-5 non usa lo sprite fronte/retro ma una figura sua */
  src?: keyof typeof SOURCES
}) {
  return (
    <div className="absolute overflow-hidden" style={{ left, top, width, height }}>
      <img
        src={SOURCES[src]}
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={{
          width: `${imgWidthPct}%`,
          height: `${imgHeightPct}%`,
          left: `${imgLeftPct}%`,
          top: `${imgTopPct}%`,
        }}
      />
    </div>
  )
}
