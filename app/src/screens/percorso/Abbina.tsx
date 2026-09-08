import { useState } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import {
  Cesto,
  Esito,
  Pastiglia,
  TINTE_PASTIGLIA,
  Titolo,
  icona,
} from '../../ui/percorso/pezzi'
import { useTrascina } from '../../lib/trascina'
import { useLingua } from '../../lib/lingua'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Abbina ogni parola alla sua immagine.
 *
 * ── DUE RIGHE NON HANNO RISPOSTA, ED E' IL PUNTO ───────────────────────────
 * Nella prima lezione le parole sono due e le righe sono quattro: la scarica
 * elettrica e il battito calmo appartengono a lezioni che non ha ancora
 * fatto, e nel cesto c'e' una pastiglia ("pesante") che non va da nessuna
 * parte. Lasciarle vuote e' la risposta giusta.
 *
 * Non e' un tranello. Il check-in chiede ogni giorno di scegliere fra sedici
 * parole, e la cosa piu' dannosa che possa imparare qui e' che una parola va
 * sempre messa da qualche parte. Se non c'e' la parola, non c'e'.
 */
export function Abbina({
  passo,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'abbina' }>>) {
  const { tpe, ts } = useLingua()
  const t = testi.abbina

  /* il cesto: prima le parole vere dell'app, poi le esche dei testi */
  const cesto = [
    ...passo.parole.map((p) => ts.foglio.parole[p] ?? p),
    ...t.esche.slice(0, passo.esche),
  ]

  /** per ogni riga, quale pastiglia c'e' sopra */
  const [posato, setPosato] = useState<(number | null)[]>(() => passo.righe.map(() => null))
  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)

  const dove = (n: number) => posato.findIndex((p) => p === n)

  function metti(n: number, riga: number | null) {
    setPosato((prima) => {
      const dopo = prima.map((p) => (p === n ? null : p))
      if (riga !== null) dopo[riga] = n
      return dopo
    })
    setScelta(null)
    setEsito(null)
  }

  const { presa, pastiglia } = useTrascina({
    onPosa(id, bersaglio) {
      const n = Number(id)
      if (bersaglio === null) return
      metti(n, bersaglio === 'cesto' ? null : Number(bersaglio))
    },
    onTocco(id) {
      const n = Number(id)
      /* una gia' posata torna in mano invece di non fare niente */
      if (dove(n) >= 0) {
        metti(n, null)
        setScelta(n)
        return
      }
      setScelta((s) => (s === n ? null : n))
      setEsito(null)
    },
  })

  function toccaRiga(riga: number) {
    if (scelta !== null) {
      metti(scelta, riga)
      return
    }
    const n = posato[riga]
    if (n !== null) metti(n, null)
  }

  const qualcosa = posato.some((p) => p !== null)

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={esito === true || qualcosa}
      azione={esito === true ? tpe.comune.continua : tpe.comune.verifica}
      onAzione={() => {
        if (esito === true) {
          avanti()
          return
        }
        setEsito(passo.righe.every((r, i) => posato[i] === r.giusta))
      }}
      esito={
        <Esito
          aperto={esito !== null}
          giusto={esito === true}
          titolo={esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {esito ? null : tpe.comune.riprova}
        </Esito>
      }
    >
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[21px] flex flex-col gap-3">
        {passo.righe.map((riga, i) => {
          const n = posato[i]
          const tinta = TINTE_PASTIGLIA[i % TINTE_PASTIGLIA.length]
          return (
            <div
              key={i}
              className="relative flex min-h-[74px] items-center gap-3 overflow-hidden rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface pr-4 pl-[22px] shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[6px]"
                style={{ background: tinta }}
              />
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: tinta }}
              >
                <img src={icona(riga.icona)} alt="" aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-[1.4] text-ink">
                {t.righe[i]}
              </span>
              <button
                type="button"
                data-posa={String(i)}
                onClick={() => toccaRiga(i)}
                aria-label={t.righe[i]}
                className={`flex h-11 min-w-[98px] items-center justify-center rounded-pill px-2 ${
                  n === null
                    ? 'border border-dashed border-line bg-[rgba(0,0,0,0.02)] text-[12px] text-ink-mute'
                    : ''
                }`}
              >
                {n === null ? (
                  tpe.comune.posa
                ) : (
                  <Pastiglia
                    testo={cesto[n]}
                    tinta={TINTE_PASTIGLIA[n % TINTE_PASTIGLIA.length]}
                    inerte
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-4" data-posa="cesto">
        <Cesto etichetta={t.cesto}>
          {cesto.map((testo, n) => (
            <Pastiglia
              key={n}
              testo={testo}
              tinta={TINTE_PASTIGLIA[n % TINTE_PASTIGLIA.length]}
              presa={scelta === n}
              spenta={dove(n) >= 0}
              gesti={pastiglia(String(n))}
              onTocco={() => {
                if (dove(n) >= 0) {
                  metti(n, null)
                  setScelta(n)
                } else {
                  setScelta((s) => (s === n ? null : n))
                }
              }}
            />
          ))}
        </Cesto>
      </div>

      <p className="m-0 mt-3 text-center text-[12px] leading-[1.4] text-ink-mute">
        {tpe.comune.aiuto}
      </p>

      {presa && (
        <span
          aria-hidden
          className="pointer-events-none fixed z-50"
          style={{ left: presa.x, top: presa.y }}
        >
          <Pastiglia
            testo={cesto[Number(presa.id)]}
            tinta={TINTE_PASTIGLIA[Number(presa.id) % TINTE_PASTIGLIA.length]}
            fantasma
          />
        </span>
      )}
    </Guscio>
  )
}
