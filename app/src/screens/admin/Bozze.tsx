import { useEffect } from 'react'
import type { Lingua } from '../../lib/lingua'
import type { SchermoScritte } from '../../data/schermi'
import { gruppoDi, schermoDi } from './comune'

export type Bozza = {
  chiave: string
  lingua: Lingua
  /** quello che le atlete leggono adesso */
  prima: string
  /** quello che leggerebbero pubblicando */
  dopo: string
}

const NOME: Record<Lingua, string> = { it: 'Italiano', en: 'English' }

/**
 * Il cassetto delle bozze: tutto quello che hai cambiato e non pubblicato.
 *
 * Prima non esisteva. Le bozze in attesa erano un numero su un bottone —
 * «Pubblica le 3 in italiano» — e per rileggerle prima di mandarle alle
 * atlete bisognava ricordarsi su quali schermi si era passati. Chi correggeva
 * sei frasi in mezz'ora pubblicava alla cieca, o non pubblicava.
 *
 * Qui ci sono tutte, in tutt'e due le lingue, con quello che si legge adesso
 * e quello che si leggerebbe dopo. Da ognuna si va allo schermo dove sta.
 */
export function Bozze({
  bozze,
  onVai,
  onPubblica,
  onScarta,
  onChiudi,
}: {
  bozze: Bozza[]
  onVai: (b: Bozza, schermo: SchermoScritte | null) => void
  onPubblica: (chiavi: string[], lingua: Lingua) => void
  onScarta: (b: Bozza) => void
  onChiudi: () => void
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi])

  const lingue = (['it', 'en'] as const).filter((l) => bozze.some((b) => b.lingua === l))

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onChiudi}
        className="bab-affiora absolute inset-0 bg-black/30"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Da pubblicare"
        className="bab-entra-avanti relative flex h-full w-full max-w-[520px] flex-col border-l-[1.5px] border-line bg-paper"
      >
        <header className="flex shrink-0 items-baseline justify-between gap-3 border-b border-line bg-surface px-5 py-4">
          <div>
            <p className="m-0 text-[15px] font-bold">Da pubblicare</p>
            <p className="m-0 mt-[2px] text-[12px] text-ink-medio">
              {bozze.length === 0
                ? 'Niente in attesa: tutto quello che hai scritto è già online.'
                : 'Finché non pubblichi, le atlete vedono quello di prima.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            className="bab-tocco shrink-0 rounded-pill border border-line bg-chip px-3 py-1 text-[12px] font-bold"
          >
            chiudi
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {bozze.length === 0 && (
            <p className="m-0 rounded-[14px] border border-line bg-surface p-4 text-[13px] leading-[1.6] text-ink-medio">
              Quando cambi una scritta finisce qui, e ci resta finché non la pubblichi. Così puoi
              correggere dieci frasi di fila e rileggerle tutte insieme prima di mandarle.
            </p>
          )}

          {lingue.map((l) => {
            const sue = bozze.filter((b) => b.lingua === l)
            return (
              <section key={l} className="mb-6 last:mb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="m-0 text-[11px] font-bold tracking-[1px] text-ink-mute uppercase">
                    {NOME[l]} · {sue.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => onPubblica(sue.map((b) => b.chiave), l)}
                    className="bab-tocco rounded-pill border-[1.5px] border-line bg-lime px-3 py-[5px] text-[12px] font-bold"
                  >
                    {sue.length === 1 ? 'Pubblica' : `Pubblica tutte e ${sue.length}`}
                  </button>
                </div>

                <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
                  {sue.map((b) => {
                    const schermo = schermoDi(b.chiave)
                    return (
                      <li
                        key={b.chiave}
                        className="rounded-[14px] border border-line bg-surface p-3"
                      >
                        <p className="m-0 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">
                          {schermo ? `${gruppoDi(schermo)} · ${schermo.nome}` : 'Tutte le altre'}
                        </p>

                        {/*
                          Prima e dopo, una sopra all'altra. Il prima e'
                          barrato e grigio: si legge come "questo sparisce", e
                          non serve una legenda per capirlo.
                        */}
                        <p className="m-0 mt-2 text-[12.5px] leading-[1.45] text-ink-mute line-through">
                          {b.prima || '—'}
                        </p>
                        <p className="m-0 mt-1 text-[13px] leading-[1.45] font-bold text-ink">
                          {b.dopo || '—'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onVai(b, schermo)}
                            className="bab-tocco rounded-pill border border-line bg-chip px-3 py-1 text-[11.5px] font-bold"
                          >
                            Vai e guarda
                          </button>
                          <button
                            type="button"
                            onClick={() => onPubblica([b.chiave], b.lingua)}
                            className="bab-tocco rounded-pill border-[1.5px] border-line bg-lime px-3 py-1 text-[11.5px] font-bold"
                          >
                            Pubblica questa
                          </button>
                          <button
                            type="button"
                            onClick={() => onScarta(b)}
                            className="bab-tocco rounded-pill border border-line bg-surface px-3 py-1 text-[11.5px] font-bold text-ink-medio"
                          >
                            Scarta
                          </button>
                          <code className="ml-auto text-[10px] text-ink-mute">{b.chiave}</code>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
