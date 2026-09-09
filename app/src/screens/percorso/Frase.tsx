import { Guscio } from '../../ui/percorso/Guscio'
import {
  Cesto,
  Esito,
  Fantasma,
  Occhiello,
  Pastiglia,
  Riga,
  Scheda,
  TINTE_PASTIGLIA,
  Testa,
  Titolo,
} from '../../ui/percorso/pezzi'
import { useIncastri } from './incastri'
import { segnoDi, vesteDi } from '../../data/percorso'
import { useLingua } from '../../lib/lingua'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Comporre la frase, che e' l'ultimo esercizio e il piu' importante.
 *
 * ── I BUCHI STANNO NELLA FRASE ─────────────────────────────────────────────
 * Il modello si scrive cosi':
 *
 *     'Oggi mi sento {forte} perché ho corso, ma il passo era {leggero}.'
 *     'Sento {0} particolarmente {rigido} stamattina, quindi preferisco {2}.'
 *
 * Dentro alle graffe c'e' il nome della parola giusta, oppure il numero della
 * pastiglia quando la pastiglia non e' una parola ma un pezzo di frase
 * ("entrambe le caviglie"). Quindi quanti buchi ci sono, dove sono, e cosa ci
 * va lo dice il testo — e non serve una seconda tabella da tenere allineata.
 *
 * E' anche l'unico modo in cui la frase italiana puo' avere due buchi e
 * quella inglese uno, come succede davvero: sono due frasi diverse, scritte
 * in due momenti diversi, e nessuna delle due e' la traduzione dell'altra.
 *
 * Un buco che nomina una pastiglia che non c'e' resta scritto com'e' —
 * `{pinco}` — invece di sparire: e' un refuso che si vede, come per tutti gli
 * altri buchi dell'app.
 *
 * ── LA FORMA `schema` ──────────────────────────────────────────────────────
 * Nella sesta lezione non e' una frase ma tre righe intestate: "quando
 * sento", "il mio corpo riferisce", "decido quindi di". I buchi sono gli
 * stessi, il modello e' fatto solo di graffe una dopo l'altra — `{0}{uno}{2}`
 * — e le intestazioni le da `etichette`, una per buco. Il cesto sta sopra
 * invece che sotto, come nel disegno.
 */
export function Frase({
  passo,
  testi,
  lezione,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'frase' }>>) {
  const { tpe, ts } = useLingua()
  const t = testi.frase
  const classico = vesteDi(lezione) === 'classico'
  const schema = passo.forma === 'schema'

  /* le pastiglie nell'ordine del disegno: parole dell'app ed esche dei testi */
  const cesto = passo.cesto.map((c) =>
    'parola' in c ? (ts.foglio.parole[c.parola] ?? c.parola) : (t.esche[c.esca] ?? ''),
  )

  const pezzi = spezza(t.modello, passo.cesto)
  const buchi = pezzi.filter((p) => p.pastiglia >= 0)

  const g = useIncastri(buchi.length)

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
  const giusto = () => buchi.every((b, i) => g.posato[i] === b.pastiglia)

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={g.esito === true || g.pieno}
      azione={g.esito === true ? t.azione : tpe.comune.verifica}
      onAzione={() => {
        if (g.esito === true) {
          avanti()
          return
        }
        g.setEsito(giusto())
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
      {classico ? (
        <Testa sopra={t.sopra} occhiello={t.occhiello} titolo={t.titolo} segno={segnoDi(lezione)} />
      ) : (
        <>
          <Occhiello nome="fumetto">{t.occhiello}</Occhiello>
          <div className="mt-[3px]">
            <Titolo>{t.titolo}</Titolo>
          </div>
        </>
      )}

      {t.intro && (
        <p className="m-0 mt-4 text-[15px] leading-[1.5] text-ink-soft">{t.intro}</p>
      )}

      {schema && (
        <div className="mt-[20px]" data-posa="cesto">
          <Scheda riga="linear-gradient(to bottom, #ffd1c1, var(--color-lime))">
            <div className="px-4 py-4 pl-[22px]">
              <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
                {t.cesto}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {pastiglie}
              </div>
            </div>
          </Scheda>
          <p className="m-0 mt-3 text-center text-[12px] leading-[1.4] text-ink-mute">
            {tpe.comune.aiuto}
          </p>
        </div>
      )}

      {schema ? (
        <div className="mt-[14px]">
          <Scheda riga="linear-gradient(to bottom, #ffd1c1, #e9d5ff)">
            <div className="flex flex-col gap-[22px] px-5 py-5 pl-[26px]">
              {buchi.map((_, i) => (
                <div key={i}>
                  <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
                    {t.etichette?.[i]}
                  </p>
                  <div className="mt-[6px]">
                    <Buco
                      dentro={g.posato[i]}
                      cesto={cesto}
                      numero={i}
                      largo
                      onClick={() => g.toccaCasella(i)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Scheda>
        </div>
      ) : (
      <div className={t.intro ? 'mt-[24px]' : classico ? 'mt-[36px]' : 'mt-[63px]'}>
        <Scheda riga="linear-gradient(to bottom, #ffd1c1, #e9d5ff)">
          <div className="px-4 py-6 pl-[22px]">
            {t.etichetta && (
              <p className="m-0 mb-4 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
                {t.etichetta}
              </p>
            )}
            <p className="m-0 text-[16px] leading-[1.9] text-ink">
              {pezzi.map((p, i) =>
                p.pastiglia < 0 ? (
                  <span key={i}>{p.testo}</span>
                ) : (
                  <Buco
                    key={i}
                    dentro={g.posato[p.numero]}
                    cesto={cesto}
                    onClick={() => g.toccaCasella(p.numero)}
                    numero={p.numero}
                  />
                ),
              )}
            </p>
            {t.nota && (
              <>
                <Riga />
                <p className="m-0 text-[12px] leading-[1.5] text-ink-soft opacity-75">{t.nota}</p>
              </>
            )}
          </div>
        </Scheda>
      </div>
      )}

      {!schema && (
        <>
          <div className="mt-[14px]" data-posa="cesto">
            <Cesto etichetta={t.cesto}>{pastiglie}</Cesto>
          </div>

          <p className="m-0 mt-3 text-center text-[12px] leading-[1.4] text-ink-mute">
            {tpe.comune.aiuto}
          </p>
        </>
      )}

      <Fantasma presa={g.presa} cesto={cesto} />
    </Guscio>
  )
}

/** Un buco nella frase: vuoto e tratteggiato, o con dentro una pastiglia. */
function Buco({
  dentro,
  cesto,
  numero,
  largo,
  onClick,
}: {
  dentro: number | null
  cesto: string[]
  numero: number
  /** una riga intera invece di un buco dentro alla frase: la forma `schema` */
  largo?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-posa={String(numero)}
      onClick={onClick}
      /* la larghezza minima e' quella del buco vuoto: da pieno stringe sulla
         pastiglia, se no una parola corta resta a mezz'aria fra le virgolette */
      className={
        largo
          ? `flex h-[42px] w-full items-center justify-center rounded-[14px] px-2 ${
              dentro === null ? 'border border-dashed border-line bg-[rgba(0,0,0,0.03)]' : 'bg-chip'
            }`
          : `mx-[2px] inline-flex translate-y-[3px] items-center justify-center rounded-pill px-1 align-baseline ${
              dentro === null
                ? 'h-[30px] min-w-[76px] border border-dashed border-line bg-[rgba(0,0,0,0.03)]'
                : ''
            }`
      }
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

type Pezzo = {
  testo: string
  /** l'indice della pastiglia giusta, o -1 se questo pezzo e' testo */
  pastiglia: number
  /** il numero del buco, contando da sinistra */
  numero: number
}

type VoceCesto = { parola: string } | { esca: number }

/**
 * Spezza il modello in testo e buchi.
 *
 * Una graffa diventa un buco solo se dentro c'e' il nome di una parola che
 * sta nel cesto, oppure il numero di una pastiglia. Tutto il resto resta
 * testo, e si vede scritto com'era: cosi' un modello sbagliato si nota
 * subito invece di sparire.
 */
function spezza(modello: string, cesto: VoceCesto[]): Pezzo[] {
  const pezzi: Pezzo[] = []
  let numero = 0
  let da = 0

  for (const trovato of modello.matchAll(/\{(\w+)\}/g)) {
    const dentro = trovato[1]
    const quale = /^\d+$/.test(dentro)
      ? Number(dentro)
      : cesto.findIndex((c) => 'parola' in c && c.parola === dentro)
    if (quale < 0 || quale >= cesto.length) continue

    const i = trovato.index
    if (i > da) pezzi.push({ testo: modello.slice(da, i), pastiglia: -1, numero: -1 })
    pezzi.push({ testo: '', pastiglia: quale, numero: numero++ })
    da = i + trovato[0].length
  }
  if (da < modello.length) pezzi.push({ testo: modello.slice(da), pastiglia: -1, numero: -1 })
  return pezzi
}
