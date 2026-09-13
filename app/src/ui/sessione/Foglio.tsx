import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { COMPARSA, EFFETTO, PAROLE, QUANDO, nomeCodice } from '../../data/sessione'
import type { Parola, Tipo } from '../../data/sessione'
import type { Sensazione } from '../../lib/sessione'
import { Cursore } from './Cursore'
import { SchedaParola } from './SchedaParola'
import { Parole } from '../../screens/Parole'
import { useLingua } from '../../lib/lingua'
import { Pastiglia, Scelta, SiNo } from './Comandi'
import { Apri } from '../Apri'
import giu from '../../assets/chevron-down.svg'

const ICONE = import.meta.glob<string>('../../assets/sessione/p-*.svg', {
  eager: true,
  import: 'default',
})

/**
 * Il foglio che sale quando tocca un punto del corpo.
 *
 * Nel disegno questo schermo usa una famiglia di grigi tutta sua (#111827,
 * #6b7280, #d1d5db) invece di quella del resto della app: e' l'unico frame
 * fatto con la tavolozza di default. Qui usiamo i colori nostri — a occhio
 * non si distinguono, e due tavolozze per la stessa app si distinguono
 * eccome appena qualcuno cambia un token.
 */
export function Foglio({
  tipo,
  sensazione,
  nuova,
  onSalva,
  onTogli,
  onChiudi,
}: {
  /** quale giro: decide quali delle tre domande "when" compaiono */
  tipo: Tipo
  sensazione: Sensazione
  /** falso quando sta correggendo una sensazione gia' messa */
  nuova: boolean
  onSalva: (s: Sensazione) => void
  onTogli: () => void
  onChiudi: () => void
}) {
  const [bozza, setBozza] = useState(sensazione)
  const [aiuto, setAiuto] = useState(true)
  /* la parola di cui sta leggendo la scheda, se ne sta leggendo una */
  const [spiega, setSpiega] = useState<Parola | null>(null)
  const [elenco, setElenco] = useState(false)
  const { ts, tp } = useLingua()
  const t = ts.foglio

  // Esc chiude, come ogni cosa che sta sopra a un'altra
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi])

  function commuta(p: Parola) {
    setBozza((b) => {
      if (b.parole.includes(p)) return { ...b, parole: b.parole.filter((x) => x !== p) }
      // quattro e' il tetto anche nel database: oltre, non e' piu' una
      // sensazione, e' un elenco
      if (b.parole.length >= 4) return b
      return { ...b, parole: [...b.parole, p] }
    })
  }

  /* dalla scheda si accende soltanto: toccare "usala" su una gia' accesa non la spegne */
  function usa(p: Parola) {
    if (!bozza.parole.includes(p)) commuta(p)
  }

  const altrove = bozza.zona === 'altrove'
  /*
   * Per salvare serve almeno un modo di dire cosa si sente — una pastiglia o
   * le sue parole — e, se ha scelto "Altrove", anche dove. Un segnale senza
   * posto e senza parola sarebbe una riga che dice solo "qualcosa".
   */
  const puoSalvare =
    (bozza.parole.length > 0 || bozza.sue.trim().length > 0) &&
    (!altrove || bozza.zonaLibera.trim().length > 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="relative flex w-full max-w-[402px] flex-col justify-end">
        <button
          type="button"
          aria-label={t.chiudi}
          onClick={onChiudi}
          className="bab-affiora absolute inset-0 bg-black/40"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={altrove ? ts.mappa.altrove : nomeCodice(bozza.zona, ts.zone)}
          className="bab-sale relative flex max-h-[88dvh] flex-col rounded-t-[20px] bg-surface"
          style={{ boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.15)' }}
        >
          <div className="shrink-0 pt-3">
            <div className="mx-auto h-1 w-9 rounded-sm bg-line/60" aria-hidden />
          </div>

          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-[18px]">
            <h2 className="bab-display m-0 text-[26px] leading-[1.12] font-bold text-ink">
              {altrove ? bozza.zonaLibera.trim() || ts.mappa.altrove : nomeCodice(bozza.zona, ts.zone)}
            </h2>
            <button
              type="button"
              onClick={onChiudi}
              aria-label={t.chiudi}
              className="mt-1 flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-line text-[16px] leading-none text-ink-soft"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-[18px] pb-4">
            {/*
              "Altrove" e' la via d'uscita della mappa: testa, stomaco, gola —
              posti che sulla figura non ci sono. Qui il posto lo scrive lei,
              e va nel database come testo libero accanto al codice `altrove`.
            */}
            {altrove && (
              <div className="mb-[18px]">
                <p className="m-0 text-[15px] font-bold text-ink">{ts.mappa.altroveDomanda}</p>
                <input
                  value={bozza.zonaLibera}
                  onChange={(e) =>
                    setBozza((b) => ({ ...b, zonaLibera: e.target.value.slice(0, 40) }))
                  }
                  placeholder={ts.mappa.altroveSegnaposto}
                  className="mt-[10px] block h-12 w-full rounded-chip border-[1.5px] border-line bg-surface px-[12px] text-[14px] text-ink outline-none placeholder:text-ink-soft focus:border-verde-tenue"
                />
              </div>
            )}

            <p className="m-0 text-[15px] font-bold text-ink">{t.come}</p>
            <textarea
              value={bozza.sue}
              onChange={(e) => setBozza((b) => ({ ...b, sue: e.target.value.slice(0, 200) }))}
              placeholder={t.segnaposto}
              rows={2}
              className="mt-[10px] block h-14 w-full resize-none rounded-chip border-[1.5px] border-line bg-surface px-[12px] py-[9px] text-[14px] leading-[1.35] text-ink outline-none placeholder:text-ink-soft focus:border-verde-tenue"
            />

            <button
              type="button"
              onClick={() => setAiuto((a) => !a)}
              aria-expanded={aiuto}
              className="mt-[18px] flex w-full items-center justify-between text-[14px] font-bold text-verde-testo"
            >
              {t.aiuto}
              <img
                src={giu}
                alt=""
                aria-hidden
                className="size-4 transition-transform duration-200 motion-reduce:transition-none"
                style={{ transform: aiuto ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            <Apri aperto={aiuto}>
              {/*
                La riga che spiega la ⓘ. E' il modo in cui una ragazza scopre
                che le pastiglie si aprono: senza, nessuna toccherebbe mai una
                ⓘ grande ventidue pixel in mezzo a sedici parole.
                ── PERCHE' QUI E NON SOPRA AL TITOLO ────────────────────────
                Perche' parla delle ⓘ, e le ⓘ sono qui dentro. Sopra al titolo
                stava appiccicata al campo di testo, che con le ⓘ non c'entra,
                e a sezione chiusa avrebbe indicato una cosa che sullo schermo
                non c'era.

                Resta lilla e in grassetto com'era: e' l'unica riga del foglio
                che spiega come si usa il foglio, e il lilla qui dentro vuol
                dire esattamente quello — informazione, non domanda.
              */}
              <p className="mt-[10px] mb-0 flex items-baseline gap-[6px] text-[12.5px] leading-[1.35] font-bold text-lilla-vivo">
                <span aria-hidden className="shrink-0 text-[13px] leading-none">
                  ⓘ
                </span>
                {tp.aiuto}
              </p>

              <div className="flex flex-wrap gap-[6px] pt-[10px]">
                {PAROLE.map((p) => (
                  <Pastiglia
                    key={p}
                    accesa={bozza.parole.includes(p)}
                    onClick={() => commuta(p)}
                    onInfo={() => setSpiega(p)}
                    etichettaInfo={t.cosaVuolDire}
                    icona={ICONE[`../../assets/sessione/p-${p}.svg`]}
                  >
                    {t.parole[p]}
                  </Pastiglia>
                ))}
              </div>
              {/*
                Il rimando all'elenco intero. Si chiama come lo schermo a cui
                porta — "Le sedici parole" — cosi' non c'e' un'etichetta in
                piu' da tradurre e da mantenere.
              */}
              <button
                type="button"
                onClick={() => setElenco(true)}
                className="mt-3 block text-[12.5px] font-bold text-lilla-vivo underline underline-offset-[3px]"
              >
                {tp.schermo.titolo}
              </button>
            </Apri>

            {tipo === 'checkout' && (
              <>
                <Domanda testo={t.comparsa.domanda}>
                  {COMPARSA.map((c) => (
                    <Scelta
                      key={c}
                      accesa={bozza.comparsa === c}
                      onClick={() =>
                        setBozza((b) => ({ ...b, comparsa: b.comparsa === c ? null : c }))
                      }
                    >
                      {t.comparsa.voci[c]}
                    </Scelta>
                  ))}
                </Domanda>

                <Domanda testo={t.effetto.domanda}>
                  {EFFETTO.map((e) => (
                    <Scelta
                      key={e}
                      accesa={bozza.effetto === e}
                      onClick={() =>
                        setBozza((b) => ({ ...b, effetto: b.effetto === e ? null : e }))
                      }
                    >
                      {t.effetto.voci[e]}
                    </Scelta>
                  ))}
                </Domanda>
              </>
            )}

            <div className="mt-[18px] h-px bg-riga" />

            <p className="mt-[13px] mb-[10px] text-[14px] font-bold text-ink">{t.unLato}</p>
            <SiNo
              scelta={bozza.unLato}
              onChange={(v) => setBozza((b) => ({ ...b, unLato: v }))}
              etichetta={t.unLato}
            />

            {tipo === 'checkin' && (
              <Domanda testo={t.quando.domanda}>
                {QUANDO.map((q) => (
                  <Scelta
                    key={q}
                    accesa={bozza.quando === q}
                    onClick={() => setBozza((b) => ({ ...b, quando: b.quando === q ? null : q }))}
                  >
                    {t.quando.voci[q]}
                  </Scelta>
                ))}
              </Domanda>
            )}

            <div className="mt-[18px] h-px bg-riga" />

            <p className="mt-[13px] mb-[10px] text-[14px] font-bold text-ink">{t.intensita}</p>
            <Cursore
              valore={bozza.intensita}
              onChange={(v) => setBozza((b) => ({ ...b, intensita: v }))}
              min={0}
              max={10}
              parolaPerRiga
              verso="carico"
              sinistra={t.lieve}
              destra={t.atroce}
              etichetta={t.intensita}
            />
          </div>

          <div className="shrink-0 px-6 pt-2 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="relative h-[62px] w-full">
              <div className="absolute inset-x-0 top-[6px] h-14 rounded-pill bg-black/8" />
              <button
                type="button"
                disabled={!puoSalvare}
                onClick={() => onSalva(bozza)}
                className="absolute inset-x-0 top-0 h-14 rounded-pill border-[1.5px] border-line bg-lime text-[16px] font-bold text-ink disabled:bg-surface disabled:text-ink-mute"
              >
                {t.aggiungi}
              </button>
            </div>
            {/*
              Un bottone spento senza una ragione scritta e' un bottone rotto,
              per chi lo guarda. Qui la ragione c'e' sempre e sola: manca il
              come, e con "Altrove" anche il dove.
            */}
            {!puoSalvare && (
              <p className="m-0 mt-2 text-center text-[12.5px] leading-[1.4] text-ink-medio">
                {altrove && bozza.zonaLibera.trim().length === 0 ? t.mancaDove : t.manca}
              </p>
            )}
            {!nuova && (
              <button
                type="button"
                onClick={onTogli}
                className="mx-auto mt-3 block text-[14px] font-bold text-ink-soft underline underline-offset-[3px]"
              >
                {t.togli}
              </button>
            )}
          </div>
        </div>
      </div>

      {/*
        La scheda della parola sta SOPRA al foglio, non al posto suo: chi la
        chiude ritrova il foglio com'era, con quello che aveva gia' scelto.
        "Usa questa parola" la accende e torna al foglio in un gesto solo —
        anche dall'elenco intero, che si chiude insieme alla scheda. Una
        parola gia' accesa resta accesa: il bottone dice "usala", non
        "cambiala".
      */}
      {elenco && (
        <Parole
          onChiudi={() => setElenco(false)}
          onUsa={(p) => {
            usa(p)
            setElenco(false)
          }}
        />
      )}

      {spiega && (
        <SchedaParola
          parola={spiega}
          onChiudi={() => setSpiega(null)}
          onUsa={() => {
            usa(spiega)
            setSpiega(null)
          }}
        />
      )}
    </div>
  )
}

/**
 * Una domanda con le sue tre risposte: riga sopra, titolo, e le scelte che
 * vanno a capo da sole se non ci stanno.
 *
 * Sta qui e non in `Comandi` perche' e' la spaziatura di questo foglio, non
 * un comando: le stesse `Scelta` altrove staranno dentro a un'altra misura.
 */
function Domanda({ testo, children }: { testo: string; children: ReactNode }) {
  return (
    <>
      <div className="mt-[18px] h-px bg-riga" />
      <p className="mt-[13px] mb-[10px] text-[14px] font-bold text-ink">{testo}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={testo}>
        {children}
      </div>
    </>
  )
}
