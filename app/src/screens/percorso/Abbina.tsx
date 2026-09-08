import { Guscio } from '../../ui/percorso/Guscio'
import { Cesto, Esito, Fantasma, Pastiglia, TINTE_PASTIGLIA, Titolo, icona } from '../../ui/percorso/pezzi'
import { useIncastri } from './incastri'
import { useLingua } from '../../lib/lingua'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Abbina ogni parola alla sua immagine — la veste della lezione 1.
 *
 * ── DUE RIGHE NON HANNO RISPOSTA, ED E' IL PUNTO ───────────────────────────
 * Nella prima lezione le parole sono due e le righe sono quattro: la scarica
 * elettrica e il battito calmo appartengono a lezioni che non ha ancora
 * fatto, e nel cesto c'e' una pastiglia ("pesante") che non va da nessuna
 * parte. Lasciarle vuote e' la risposta giusta.
 *
 * Non e' un tranello. Il check-in chiede ogni giorno di scegliere fra sedici
 * parole, e la cosa peggiore che si possa imparare qui e' che una parola va
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

  const g = useIncastri(passo.righe.length)

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={g.esito === true || g.qualcosa}
      azione={g.esito === true ? tpe.comune.continua : t.azione}
      onAzione={() => {
        if (g.esito === true) {
          avanti()
          return
        }
        g.setEsito(passo.righe.every((r, i) => g.posato[i] === r.giusta))
      }}
      esito={
        <Esito
          aperto={g.esito !== null}
          giusto={g.esito === true}
          titolo={g.esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {g.esito ? null : tpe.comune.riprova}
        </Esito>
      }
    >
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[21px] flex flex-col gap-3">
        {passo.righe.map((riga, i) => {
          const n = g.posato[i]
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
              {riga.icona && (
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: tinta }}
                >
                  <img src={icona(riga.icona)} alt="" aria-hidden className="size-5" />
                </span>
              )}
              <span className="min-w-0 flex-1 text-[14px] leading-[1.4] text-ink">
                {t.righe[i]}
              </span>
              <button
                type="button"
                data-posa={String(i)}
                onClick={() => g.toccaCasella(i)}
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
              presa={g.scelta === n}
              spenta={g.dove(n) >= 0}
              gesti={g.pastiglia(String(n))}
              onTocco={() => g.toccaPastiglia(n)}
            />
          ))}
        </Cesto>
      </div>

      <p className="m-0 mt-3 text-center text-[12px] leading-[1.4] text-ink-mute">
        {t.aiuto ?? tpe.comune.aiuto}
      </p>

      <Fantasma presa={g.presa} cesto={cesto} />
    </Guscio>
  )
}
