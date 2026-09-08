import { useState } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { Cesto, Esito, Pastiglia, Riga, Scheda, TINTE_PASTIGLIA, Occhiello, Titolo } from '../../ui/percorso/pezzi'
import { useTrascina } from '../../lib/trascina'
import { useLingua } from '../../lib/lingua'
import type { Parola } from '../../data/sessione'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Comporre la frase, che e' l'ultimo esercizio e il piu' importante.
 *
 * ── I BUCHI STANNO NELLA FRASE ─────────────────────────────────────────────
 * Il modello si scrive cosi':
 *
 *     'Oggi mi sento {forte} perché ho corso, ma le gambe erano {leggero}.'
 *
 * Dentro alle graffe c'e' l'identificativo della parola giusta. Quindi quanti
 * buchi ci sono, dove sono, e cosa ci va lo dice il testo — e non serve una
 * seconda tabella da tenere allineata. E' anche l'unico modo in cui la frase
 * italiana puo' avere due buchi e quella inglese uno, come succede davvero:
 * sono due frasi diverse, scritte in due momenti diversi, e nessuna delle due
 * e' la traduzione dell'altra.
 *
 * Un buco che nomina una parola che non e' nel cesto resta scritto com'e' —
 * `{pinco}` — invece di sparire: e' un refuso che si vede, come per tutti gli
 * altri buchi dell'app.
 */
export function Frase({
  passo,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'frase' }>>) {
  const { tpe, ts } = useLingua()
  const t = testi.frase

  const cesto = [
    ...passo.parole.map((p) => ts.foglio.parole[p] ?? p),
    ...t.esche.slice(0, passo.esche),
  ]

  /* la frase spezzata: pezzi di testo e buchi, nell'ordine in cui si leggono */
  const pezzi = spezza(t.modello, passo.parole)
  const buchi = pezzi.filter((p) => p.buco !== null)

  const [messo, setMesso] = useState<(number | null)[]>(() => buchi.map(() => null))
  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)

  const dove = (n: number) => messo.findIndex((m) => m === n)

  function metti(n: number, buco: number | null) {
    setMesso((prima) => {
      const dopo = prima.map((m) => (m === n ? null : m))
      if (buco !== null) dopo[buco] = n
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
      if (dove(n) >= 0) {
        metti(n, null)
        setScelta(n)
        return
      }
      setScelta((s) => (s === n ? null : n))
      setEsito(null)
    },
  })

  function toccaBuco(i: number) {
    if (scelta !== null) {
      metti(scelta, i)
      return
    }
    const n = messo[i]
    if (n !== null) metti(n, null)
  }

  const pieni = messo.every((m) => m !== null)
  const giusto = () => buchi.every((b, i) => messo[i] === passo.parole.indexOf(b.buco as Parola))

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={esito === true || pieni}
      azione={esito === true ? t.azione : tpe.comune.verifica}
      onAzione={() => {
        if (esito === true) {
          avanti()
          return
        }
        setEsito(giusto())
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
      <Occhiello nome="fumetto">{t.occhiello}</Occhiello>

      <div className="mt-[3px]">
        <Titolo>{t.titolo}</Titolo>
      </div>

      <div className="mt-[63px]">
        <Scheda riga="linear-gradient(to bottom, #ffd1c1, #e9d5ff)">
          <div className="px-4 py-6 pl-[22px]">
            <p className="m-0 text-[16px] leading-[1.9] text-ink">
              {pezzi.map((p, i) =>
                p.buco === null ? (
                  <span key={i}>{p.testo}</span>
                ) : (
                  <Buco
                    key={i}
                    dentro={messo[p.numero]}
                    cesto={cesto}
                    onClick={() => toccaBuco(p.numero)}
                    numero={p.numero}
                  />
                ),
              )}
            </p>
            <Riga />
            <p className="m-0 text-[12px] leading-[1.5] text-ink-soft opacity-75">{t.nota}</p>
          </div>
        </Scheda>
      </div>

      <div className="mt-[14px]" data-posa="cesto">
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

/** Un buco nella frase: vuoto e tratteggiato, o con dentro una pastiglia. */
function Buco({
  dentro,
  cesto,
  numero,
  onClick,
}: {
  dentro: number | null
  cesto: string[]
  numero: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-posa={String(numero)}
      onClick={onClick}
      className={`mx-[2px] inline-flex min-w-[76px] translate-y-[3px] items-center justify-center rounded-pill px-1 align-baseline ${
        dentro === null ? 'h-[30px] border border-dashed border-line bg-[rgba(0,0,0,0.03)]' : ''
      }`}
    >
      {dentro !== null && (
        <Pastiglia
          testo={cesto[dentro]}
          tinta={TINTE_PASTIGLIA[dentro % TINTE_PASTIGLIA.length]}
          inerte
        />
      )}
    </button>
  )
}

type Pezzo = { testo: string; buco: string | null; numero: number }

/**
 * Spezza il modello in testo e buchi.
 *
 * Solo le graffe che nominano una parola di QUESTA lezione diventano buchi:
 * tutte le altre restano testo, e si vedono scritte com'erano. Cosi' un
 * modello sbagliato si nota subito invece di sparire.
 */
function spezza(modello: string, parole: Parola[]): Pezzo[] {
  const pezzi: Pezzo[] = []
  let numero = 0
  let da = 0
  for (const trovato of modello.matchAll(/\{(\w+)\}/g)) {
    const nome = trovato[1] as Parola
    if (!parole.includes(nome)) continue
    const i = trovato.index
    if (i > da) pezzi.push({ testo: modello.slice(da, i), buco: null, numero: -1 })
    pezzi.push({ testo: '', buco: nome, numero: numero++ })
    da = i + trovato[0].length
  }
  if (da < modello.length) pezzi.push({ testo: modello.slice(da), buco: null, numero: -1 })
  return pezzi
}
