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
        leggibile su un telefono, e "Peggio non si puo'" ci sta lo stesso
        perche' va a capo su due righe come nel disegno.
      */}
      <div className="mt-[6px] flex justify-between gap-4 text-[9px] font-bold leading-[1.15] text-ink-mute">
        <span className="max-w-[32%]">{sinistra}</span>
        <span className="max-w-[32%] text-right">{destra}</span>
      </div>
    </div>
  )
}
