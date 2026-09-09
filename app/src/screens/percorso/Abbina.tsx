import { BottoneTocco } from '../../ui/tocco'
import { Guscio } from '../../ui/percorso/Guscio'
import {
  Cesto,
  Esito,
  Fantasma,
  Pastiglia,
  Scheda,
  TINTE_PASTIGLIA,
  Testa,
  Titolo,
  icona,
} from '../../ui/percorso/pezzi'
import { useIncastri } from './incastri'
import { useLingua } from '../../lib/lingua'
import { segnoDi } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Abbina ogni parola alla sua descrizione.
 *
 * Tre forme, dai tre modi in cui il disegno lo impagina: con i cerchi delle
 * icone e il cesto in una scheda semplice (lezione 1), a righe con la casella
 * larga e il cesto in una scheda con la riga di colore (lezione 2), a righe
 * con la casella piccola e il cesto nudo sotto a un'etichetta (lezione 3).
 * Quello che si fa e' lo stesso in tutte e tre.
 *
 * ── DUE RIGHE SENZA RISPOSTA, NELLA PRIMA LEZIONE ──────────────────────────
 * Li' le parole sono due e le righe quattro, e nel cesto c'e' una pastiglia
 * che non va da nessuna parte. Lasciarle vuote e' la risposta giusta: il
 * check-in chiede ogni giorno di scegliere fra sedici parole, e la cosa
 * peggiore che si possa imparare qui e' che una parola va sempre messa da
 * qualche parte.
 *
 * ── DALLA SECONDA LEZIONE SI RIPASSA ───────────────────────────────────────
 * Nel cesto non ci sono solo le parole di oggi: ci sono anche quelle delle
 * lezioni prima. E' il disegno a chiederlo, ed e' il primo posto in cui il
 * percorso torna indietro invece di andare solo avanti.
 */
export function Abbina({
  passo,
  lezione,

  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'abbina' }>>) {
  const { tpe, ts } = useLingua()
  const t = testi.abbina
  const icone = passo.forma === 'icone'
  const stretto = passo.forma === 'stretto'

  const cesto = [
    ...passo.parole.map((p) => ts.foglio.parole[p] ?? p),
    ...t.esche.slice(0, passo.esche),
  ]

  const g = useIncastri(passo.righe.length)

  const pastiglie = cesto.map((testo, n) => (
    <Pastiglia
      key={n}
      testo={testo}
      tinta={TINTE_PASTIGLIA[n % TINTE_PASTIGLIA.length]}
      presa={g.scelta === n}
      spenta={g.dove(n) >= 0}
      gesti={g.pastiglia(String(n))}
      onTocco={() => g.toccaPastiglia(n)}
    />
  ))

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
      {/* la lezione 1 ha il titolo e basta; dalla quarta l'occhiello torna */}
      {icone && !t.occhiello ? (
        <Titolo>{t.titolo}</Titolo>
      ) : (
        <Testa sopra={t.sopra} occhiello={t.occhiello ?? ''} titolo={t.titolo} segno={segnoDi(lezione)} />
      )}

      {t.intro && (
        <p className="m-0 mt-4 text-[15px] leading-[1.4] text-ink-soft">{t.intro}</p>
      )}

      <div className={`flex flex-col gap-3 ${t.intro ? 'mt-[22px]' : icone ? 'mt-[21px]' : 'mt-[30px]'}`}>
        {passo.righe.map((riga, i) => {
          const n = g.posato[i]
          const tinta = TINTE_PASTIGLIA[i % TINTE_PASTIGLIA.length]
          return (
            <div
              key={i}
              className={`relative flex items-center gap-3 overflow-hidden rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface pr-3 pl-[22px] shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)] ${
                icone ? 'min-h-[74px]' : 'min-h-[72px]'
              }`}
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
              <span className="min-w-0 flex-1">
                <span
                  className={
                    icone
                      ? 'block text-[14px] leading-[1.4] text-ink'
                      : 'block text-[15px] leading-[1.3] font-bold text-ink'
                  }
                >
                  {t.righe[i]}
                </span>
                {/* la linea sotto alla descrizione: nel disegno e' quella che
                    fa leggere la riga come una cosa da completare */}
                {!icone && (
                  <span aria-hidden className="mt-[6px] block border-t border-dashed border-line" />
                )}
              </span>
              <BottoneTocco
                data-posa={String(i)}
                onClick={() => g.toccaCasella(i)}
                aria-label={t.righe[i]}
                /*
                  La casella vuota ha la misura del disegno; piena prende
                  quella della pastiglia. Tenendo la misura fissa anche da
                  piena, una parola lunga — "indolenzito" — usciva dalla riga
                  e la riga la tagliava.
                */
                className={`flex shrink-0 items-center justify-center rounded-pill px-2 ${
                  n === null
                    ? `border border-dashed border-line bg-[rgba(0,0,0,0.02)] text-[11px] text-ink-mute ${
                        stretto ? 'h-[38px] w-[76px]' : 'h-11 w-[110px]'
                      }`
                    : stretto
                      ? 'h-[38px]'
                      : 'h-11'
                }`}
              >
                {n === null ? (
                  stretto ? (
                    '—'
                  ) : (
                    tpe.comune.posa
                  )
                ) : (
                  <Pastiglia
                    testo={cesto[n]}
                    tinta={TINTE_PASTIGLIA[n % TINTE_PASTIGLIA.length]}
                    inerte
                  />
                )}
              </BottoneTocco>
            </div>
          )
        })}
      </div>

      {/* il cesto: nudo, in una scheda semplice, o in una scheda con la riga */}
      <div className={stretto ? 'mt-[26px]' : 'mt-4'} data-posa="cesto">
        {stretto ? (
          <>
            <p className="m-0 text-[11px] font-bold tracking-[1px] uppercase text-lilla">
              {t.cesto}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">{pastiglie}</div>
          </>
        ) : icone ? (
          <Cesto etichetta={t.cesto}>{pastiglie}</Cesto>
        ) : (
          <Scheda riga="linear-gradient(to bottom, #ffd1c1, var(--color-lime))">
            <div className="px-4 py-4 pl-[22px]">
              <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
                {t.cesto}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">{pastiglie}</div>
              <p className="m-0 mt-4 text-[12px] leading-[1.4] text-ink-mute">
                {t.aiuto ?? tpe.comune.aiuto}
              </p>
            </div>
          </Scheda>
        )}
      </div>

      {passo.forma !== 'largo' && (
        <p className="m-0 mt-3 text-center text-[12px] leading-[1.4] text-ink-mute">
          {t.aiuto ?? tpe.comune.aiuto}
        </p>
      )}

      <Fantasma presa={g.presa} cesto={cesto} />
    </Guscio>
  )
}
