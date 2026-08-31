import { Touchable } from './Touchable'

/**
 * Il punto "Somewhere else", dentro la card della mappa.
 *
 * Serve perche' un punto segnato fuori dal disegno contava nel totale ma non
 * si vedeva da nessuna parte: leggevi "2 spots added" e sul corpo ne trovavi
 * uno. E soprattutto non c'era modo di tornarci sopra per correggerlo.
 *
 * Sta in basso a sinistra: la figura, in tutte e due le mappe, occupa da x=134
 * in poi, quindi qui sotto e' l'unico angolo libero della card.
 */
/** lo stesso rosso con cui si accendono le zone */
const MARK = '#ec6a5e'

export function ElsewhereSpot({ left, top, onTap }: { left: number; top: number; onTap?: () => void }) {
  return (
    <Touchable
      onTap={onTap}
      press={onTap ? 0.95 : 1}
      stop={!!onTap}
      className="absolute flex items-center gap-[6px]"
      style={{
        left,
        top,
        height: 26,
        padding: '0 10px',
        borderRadius: 100,
        background: 'rgba(236,106,94,0.12)',
        outline: `1.5px solid rgba(236,106,94,0.55)`,
        outlineOffset: -1.5,
        boxSizing: 'border-box',
      }}
    >
      <div className="shrink-0" style={{ width: 8, height: 8, borderRadius: 4, background: MARK }} />
      <p className="whitespace-nowrap font-bold" style={{ fontSize: 11.5, lineHeight: 'normal', margin: 0, color: '#9c4038' }}>
        Somewhere else
      </p>
    </Touchable>
  )
}
