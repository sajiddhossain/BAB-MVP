import { Guscio } from '../../ui/percorso/Guscio'
import { Esito, Fantasma, Pastiglia, Scheda, TINTE_PASTIGLIA, Testa } from '../../ui/percorso/pezzi'
import { useIncastri } from './incastri'
import { useLingua } from '../../lib/lingua'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Abbina ogni parola alla sua descrizione — la veste delle lezioni 2-8.
 *
 * Righe sottili senza icone: la descrizione a sinistra sopra una linea, e la
 * casella a destra dove cade la parola.
 *
 * ── UNA COSA CHE IL DISEGNO NON DECIDE ─────────────────────────────────────
 * Nei frame la riga ha la parola a sinistra e la descrizione dentro alla
 * casella, ma il cesto in fondo si chiama "banco delle parole" e contiene
 * parole. Le due cose non stanno insieme: qui si trascinano le parole, come
 * nella lezione 1, e a sinistra sta la descrizione.
 *
 * ── E DALLA SECONDA LEZIONE SI RIPASSA ─────────────────────────────────────
 * Le parole nel cesto non sono solo quelle di oggi: ci sono anche quelle
 * delle lezioni prima. E' il disegno a chiederlo, ed e' il primo posto in cui
 * il percorso torna indietro invece di andare solo avanti.
 */
export function AbbinaClassico({
  passo,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'abbina' }>>) {
  const { tpe, ts } = useLingua()
  const t = testi.abbina

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
      <Testa occhiello={t.occhiello ?? ''} titolo={t.titolo} />

      <div className="mt-[30px] flex flex-col gap-3">
        {passo.righe.map((_, i) => {
          const n = g.posato[i]
          const tinta = TINTE_PASTIGLIA[i % TINTE_PASTIGLIA.length]
          return (
            <div
              key={i}
              className="relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface pr-3 pl-[22px] shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[6px]"
                style={{ background: tinta }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-[1.3] font-bold text-ink">
                  {t.righe[i]}
                </span>
                {/* la linea sotto alla descrizione: nel disegno e' quella che
                    fa leggere la riga come una cosa da completare */}
                <span aria-hidden className="mt-[6px] block border-t border-dashed border-line" />
              </span>
              <button
                type="button"
                data-posa={String(i)}
                onClick={() => g.toccaCasella(i)}
                aria-label={t.righe[i]}
                className={`flex h-11 w-[120px] shrink-0 items-center justify-center rounded-pill px-2 ${
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

      {/* nella veste classica il cesto ha la riga di colore e l'aiuto dentro */}
      <div className="mt-[24px]" data-posa="cesto">
        <Scheda riga="linear-gradient(to bottom, #ffd1c1, var(--color-lime))">
          <div className="px-4 py-4 pl-[22px]">
            <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
              {t.cesto}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
            </div>
            <p className="m-0 mt-4 text-[12px] leading-[1.4] text-ink-mute">
              {t.aiuto ?? tpe.comune.aiuto}
            </p>
          </div>
        </Scheda>
      </div>

      <Fantasma presa={g.presa} cesto={cesto} />
    </Guscio>
  )
}
