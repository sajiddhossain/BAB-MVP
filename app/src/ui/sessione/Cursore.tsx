/**
 * Una scala da toccare: sonno, energia, umore, scuola, sforzo, intensita'.
 *
 * `verso` non e' un dettaglio grafico. Il colore della pista dice da che
 * parte sta il bene: sonno ed energia vanno dal corallo al verde, perche' a
 * destra c'e' "sto meglio"; scuola, sforzo e intensita' vanno al contrario,
 * perche' a destra c'e' il carico. Girarne una per sbaglio vorrebbe dire
 * dipingere di verde il massimo dello stress.
 */
export function Cursore({
  valore,
  onChange,
  min = 1,
  max = 7,
  sinistra,
  destra,
  verso = 'bene',
  tacche = true,
  etichetta,
}: {
  valore: number
  onChange: (v: number) => void
  min?: number
  max?: number
  sinistra: string
  destra: string
  verso?: 'bene' | 'carico'
  /** i numeri sotto alla pista. L'intensita' nel foglio non li ha */
  tacche?: boolean
  /** cosa si sta misurando: lo legge chi non vede lo schermo */
  etichetta: string
}) {
  const numeri = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  // dove sta il centro del pallino, in frazione: e' la stessa formula che usa
  // il range di sistema, ed e' quella che tiene i numeri sotto al pallino
  const posizione = (v: number) => (v - min) / (max - min)
  /** quanto spazio c'e' fra un numero e il suo vicino */
  const passo = `calc((100% - 24px) / ${max - min})`
  /**
   * Quanto puo' essere larga una delle due parole agli estremi.
   *
   * Di solito e' il passo: cosi' una parola non finisce sotto al numero del
   * vicino. Ma sulle scale da zero a dieci il passo e' ventotto pixel, e
   * ventotto sono pochi per qualunque parola: li' l'etichetta e' l'unica cosa
   * sulla sua riga e non ha nessuno addosso, mentre stringerla a ventotto la
   * farebbe a pezzi. Sotto ai quarantacinque non si scende — che sono quelli
   * che stanno dentro alla scheda: meta' parola, ventidue, piu' i dodici che
   * il numero ha dal fondo della pista, lasciano ancora nove pixel di bordo.
   */
  const larghezza = `max(${passo}, 45px)`

  return (
    <div>
      <div className="relative h-9">
        <div
          className="pointer-events-none absolute inset-x-0 top-[13px] h-[10px] rounded-pill"
          style={{
            background:
              verso === 'bene' ? 'var(--scala-verso-bene)' : 'var(--scala-verso-carico)',
          }}
        />
        <input
          type="range"
          className="bab-cursore relative"
          min={min}
          max={max}
          step={1}
          value={valore}
          aria-label={etichetta}
          aria-valuetext={`${valore} su ${max}`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>

      {tacche && (
        <div className="relative mt-[2px] h-[15px]">
          {numeri.map((n) => (
            <span
              key={n}
              className={`absolute -translate-x-1/2 text-[11.5px] font-bold tabular-nums ${
                n === valore ? 'text-ink' : 'text-ink-tenue'
              }`}
              style={{ left: `calc(12px + ${posizione(n)} * (100% - 24px))` }}
              aria-hidden
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {/*
        Le due parole agli estremi sono 7px nel disegno — troppo piccole per
        essere lette davvero. Qui sono 9: e' il piu' piccolo che resta
        leggibile su un telefono.
        ── PERCHE' CENTRATE E NON APPOGGIATE AI BORDI ──────────────────────
        Appoggiate al bordo, "Ben riposata" finiva a meta' strada fra il 6 e
        il 7 e sembrava riferirsi al 6. Ognuna delle due sta centrata sotto al
        suo numero — il margine di 12px e' mezzo pallino, la stessa distanza
        che tiene i numeri sotto al cursore — e non e' larga a piacere: oltre
        una certa misura (vedi `larghezza`) va a capo, cosi' "Ben riposata"
        diventa "Ben" e "riposata", una sopra all'altra e tutt'e due centrate
        sul 7.

        ── E PERCHE' VANNO A CAPO ANCHE DENTRO UNA PAROLA ──────────────────
        Restare centrate ha un prezzo: una parola sporge di meta' della sua
        larghezza oltre al numero, e oltre al numero c'e' poco. Chi ha uno
        spazio dentro se la cava andando a capo li'. Ma "Carichissima" e' una
        parola sola e larga cinquantacinque: sporgeva di ventisette e finiva
        appoggiata al bordo della scheda, zero pixel.

        Allora si spezza anche lei. `hyphens` taglia dove si taglierebbe a
        mano, col trattino — "Carichissi-ma" — perche' la lingua del documento
        e' dichiarata: `lingua.tsx` scrive `lang` sull'html a ogni cambio.
        `overflow-wrap` e' la rete sotto: se un giorno arriva una lingua di cui
        il browser non ha le sillabe, la parola va a capo lo stesso invece di
        uscire dalla scheda.
      */}
      <div className="mt-[6px] flex justify-between gap-2 text-[9px] font-bold leading-[1.15] text-ink-mute">
        <span
          className="ml-3 -translate-x-1/2 text-center"
          style={{ maxWidth: larghezza, hyphens: 'auto', overflowWrap: 'break-word' }}
        >
          {sinistra}
        </span>
        <span
          className="mr-3 translate-x-1/2 text-center"
          style={{ maxWidth: larghezza, hyphens: 'auto', overflowWrap: 'break-word' }}
        >
          {destra}
        </span>
      </div>
    </div>
  )
}
