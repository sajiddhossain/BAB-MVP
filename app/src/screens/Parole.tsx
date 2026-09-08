import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Schermo } from '../ui/Schermo'
import { Bottone } from '../ui/Bottone'
import { Titolo } from '../ui/Testo'
import { OcchielloSessione } from '../ui/sessione/Testo'
import { Nota } from '../ui/sessione/Scheda'
import { SchedaParola, TINTA_LIVELLO } from '../ui/sessione/SchedaParola'
import { LIVELLI, paroleDi } from '../data/sessione'
import type { Parola } from '../data/sessione'
import { testiParole } from '../copy/parole'
import { testiSessione } from '../copy/sessione'
import { useLingua } from '../lib/lingua'

/**
 * L'elenco delle sedici parole, raggruppate per livello.
 *
 * E' un glossario, non un passo del check-in: si arriva da qui e si torna
 * dov'eravamo. Per questo il bottone in fondo dice "torna al mio check-in" e
 * non "avanti", e per questo la barra in cima e' piena — non si sta avanzando
 * in niente, si sta leggendo.
 *
 * Le tre fasce sono la cosa importante di questo schermo. Non e' un elenco
 * alfabetico di sedici sinonimi: e' la stessa tassonomia che poi decide quale
 * spiegazione vede alla fine del check-in, scritta in chiaro. Quello che BAB
 * mostra e quello che BAB sa sono la stessa cosa.
 */
export function Parole({ onChiudi }: { onChiudi?: () => void } = {}) {
  const vai = useNavigate()
  const { lingua } = useLingua()
  const t = testiParole(lingua)
  const parole = testiSessione(lingua).foglio.parole
  const [spiega, setSpiega] = useState<Parola | null>(null)
  /*
   * Con `onChiudi` questo schermo e' uno strato sopra a quello che c'era —
   * si arriva qui dal foglio delle sensazioni, e tornare indietro davvero
   * smonterebbe il foglio con dentro la sensazione a meta'. Senza, e' uno
   * schermo normale raggiunto dal suo indirizzo.
   */
  const chiudi = onChiudi ?? (() => vai(-1))

  const dentro = (
    <>
      <Schermo
        nodo="4108:2"
        verso="avanti"
        avanzamento={1}
        indietro={chiudi}
        stacco={30}
        margini={24}
        azione={<Bottone onClick={chiudi}>{t.schermo.azione}</Bottone>}
      >
        <OcchielloSessione icona="scintilla">{t.schermo.occhiello}</OcchielloSessione>
        <Titolo>{t.schermo.titolo}</Titolo>
        <p className="m-0 mt-3 text-[14px] leading-[1.4] text-ink-mute">{t.schermo.intro}</p>

        <div className="mt-6 flex flex-col gap-5">
          {LIVELLI.map((livello) => {
            const tinta = TINTA_LIVELLO[livello]
            return (
              <section key={livello}>
                {/*
                  La fascia: pastiglia col nome del livello, una riga che la
                  allunga fino alla spiegazione, e la spiegazione a destra.
                  La riga non e' decorazione — e' quello che lega il nome del
                  livello alla frase che lo spiega, che altrimenti sembrano
                  due cose diverse messe sulla stessa altezza.
                */}
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex shrink-0 items-center gap-[6px] rounded-[12px] px-[10px] py-[4px] text-[11px] font-bold"
                    style={{ background: tinta.fondo, color: tinta.testo }}
                  >
                    <span
                      aria-hidden
                      className="size-[6px] rounded-full"
                      style={{ background: 'currentColor' }}
                    />
                    {t.livelli[livello].nome}
                  </span>
                  <span className="h-px min-w-[10px] flex-1 bg-riga" aria-hidden />
                  <span className="max-w-[58%] shrink-0 text-right text-[11px] leading-[1.25] text-ink-mute">
                    {t.livelli[livello].spiega}
                  </span>
                </div>

                <ul className="m-0 mt-[10px] flex list-none flex-col gap-[6px] p-0">
                  {paroleDi(livello).map((p) => (
                    <li key={p}>
                      <button
                        type="button"
                        onClick={() => setSpiega(p)}
                        className="flex w-full items-center gap-[10px] rounded-[10px] border border-nebbia-bordo bg-nebbia py-[3px] pr-3 pl-[14px] text-left"
                      >
                        <span
                          aria-hidden
                          className="size-[7px] shrink-0 rounded-full"
                          style={{ background: tinta.testo }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold text-ink">
                            {parole[p]}
                          </span>
                          <span className="block truncate text-[11px] text-ink-mute">
                            {t.schede[p].riga}
                          </span>
                        </span>
                        <span aria-hidden className="text-[16px] font-bold text-ink-tenue">
                          ›
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <div className="mt-6">
          <Nota>{t.schermo.nota}</Nota>
        </div>
      </Schermo>

      {spiega && (
        /*
          Da qui "usa questa parola" non ha niente da accendere: si sta
          leggendo il glossario, non compilando un check-in. Chiude e basta.
        */
        <SchedaParola
          parola={spiega}
          onUsa={() => setSpiega(null)}
          onChiudi={() => setSpiega(null)}
        />
      )}
    </>
  )

  if (!onChiudi) return dentro
  return (
    <div className="bab-sale fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-paper">
      {dentro}
    </div>
  )
}
