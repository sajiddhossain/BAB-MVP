import { useEffect, useState } from 'react'
import { PAROLE } from '../../data/sessione'
import type { Parola } from '../../data/sessione'
import { SESSIONE } from '../../copy/sessione'
import type { Sensazione } from '../../lib/sessione'
import { Cursore } from './Cursore'
import { Pastiglia, SiNo } from './Comandi'
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
  sensazione,
  nuova,
  onSalva,
  onTogli,
  onChiudi,
}: {
  sensazione: Sensazione
  /** falso quando sta correggendo una sensazione gia' messa */
  nuova: boolean
  onSalva: (s: Sensazione) => void
  onTogli: () => void
  onChiudi: () => void
}) {
  const [bozza, setBozza] = useState(sensazione)
  const [aiuto, setAiuto] = useState(true)
  const t = SESSIONE.foglio

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
          aria-label={altrove ? SESSIONE.mappa.altrove : bozza.nome}
          className="bab-sale relative flex max-h-[88dvh] flex-col rounded-t-[20px] bg-surface"
          style={{ boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.15)' }}
        >
          <div className="shrink-0 pt-3">
            <div className="mx-auto h-1 w-9 rounded-sm bg-line/60" aria-hidden />
          </div>

          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-[18px]">
            <h2 className="bab-display m-0 text-[26px] leading-[1.12] font-bold text-ink">
              {altrove ? bozza.zonaLibera.trim() || SESSIONE.mappa.altrove : bozza.nome}
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
                <p className="m-0 text-[15px] font-bold text-ink">{SESSIONE.mappa.altroveDomanda}</p>
                <input
                  value={bozza.zonaLibera}
                  onChange={(e) =>
                    setBozza((b) => ({ ...b, zonaLibera: e.target.value.slice(0, 40) }))
                  }
                  placeholder={SESSIONE.mappa.altroveSegnaposto}
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
              <div className="flex flex-wrap gap-[6px] pt-[10px]">
                {PAROLE.map((p) => (
                  <Pastiglia
                    key={p}
                    accesa={bozza.parole.includes(p)}
                    onClick={() => commuta(p)}
                    icona={ICONE[`../../assets/sessione/p-${p}.svg`]}
                  >
                    {t.parole[p]}
                  </Pastiglia>
                ))}
              </div>
            </Apri>

            <div className="mt-[18px] h-px bg-riga" />

            <p className="mt-[13px] mb-[10px] text-[14px] font-bold text-ink">{t.unLato}</p>
            <SiNo
              scelta={bozza.unLato}
              onChange={(v) => setBozza((b) => ({ ...b, unLato: v }))}
              etichetta={t.unLato}
            />

            <div className="mt-[18px] h-px bg-riga" />

            <p className="mt-[13px] mb-[10px] text-[14px] font-bold text-ink">{t.intensita}</p>
            <Cursore
              valore={bozza.intensita}
              onChange={(v) => setBozza((b) => ({ ...b, intensita: v }))}
              min={0}
              max={10}
              tacche={false}
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
    </div>
  )
}
