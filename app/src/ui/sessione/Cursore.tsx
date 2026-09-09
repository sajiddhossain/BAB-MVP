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
        che tiene i numeri sotto al cursore — e piu' larga del passo fra due
        numeri non puo' essere: cosi' va a capo prima di finire sotto al
        numero del vicino, e "Ben riposata" diventa "Ben" e "riposata", una
        sopra all'altra e tutt'e due centrate sul 7.

        Che una parola lunghissima sbordi di qualche pixel oltre alla pista va
        bene: la scheda intorno ha diciotto pixel di margine e non taglia.
      */}
      <div className="mt-[6px] flex justify-between gap-2 text-[9px] font-bold leading-[1.15] text-ink-mute">
        <span className="ml-3 -translate-x-1/2 text-center" style={{ maxWidth: passo }}>
          {sinistra}
        </span>
        <span className="mr-3 translate-x-1/2 text-center" style={{ maxWidth: passo }}>
          {destra}
        </span>
      </div>
    </div>
  )
}
