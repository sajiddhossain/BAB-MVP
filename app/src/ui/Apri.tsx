import type { ReactNode } from 'react'

/**
 * Un pezzo di schermo che si apre e si chiude in altezza.
 *
 * L'altezza si anima con `grid-template-rows` da 0fr a 1fr: l'altezza di
 * arrivo e' quella vera del contenuto, qualunque sia, senza doverla misurare.
 *
 * Non misurarla non e' solo piu' corto: misurando, la prima misura arriva
 * dopo il primo disegno, e allora ogni volta che si entra nello schermo il
 * blocco gia' aperto si apre di nuovo da solo sotto gli occhi. Qui il valore
 * giusto c'e' dal primo fotogramma, e si muove solo quando cambia davvero.
 *
 * Chiuso non e' solo invisibile: `inert` lo toglie anche dalla tabulazione e
 * dai lettori di schermo, altrimenti un campo nascosto resta raggiungibile.
 */
export function Apri({
  aperto,
  dentroTesto = false,
  children,
}: {
  aperto: boolean
  /** dentro a un titolo servono span, non div: un div dentro a un h1 non e' HTML valido */
  dentroTesto?: boolean
  children: ReactNode
}) {
  const Fuori = dentroTesto ? 'span' : 'div'
  const Dentro = dentroTesto ? 'span' : 'div'
  return (
    <Fuori
      inert={!aperto}
      // `inert` gia' lo toglierebbe dall'albero di accessibilita', ma non su
      // tutti i browser in giro: due righe invece di una, e nessun dubbio
      aria-hidden={!aperto || undefined}
      className="grid transition-[grid-template-rows,opacity] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-[1ms]"
      style={{ gridTemplateRows: aperto ? '1fr' : '0fr', opacity: aperto ? 1 : 0 }}
    >
      <Dentro className="block min-h-0 overflow-hidden">{children}</Dentro>
    </Fuori>
  )
}
