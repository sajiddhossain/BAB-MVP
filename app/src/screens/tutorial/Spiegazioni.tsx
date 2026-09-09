import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Corpo, Nota, Occhiello, Scheda, Titolo } from '../../ui/tutorial/pezzi'
import { Ritmi as FilaRitmi } from '../../ui/sessione/Ritmi'
import { RITMI } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'
import type { PropsTutorial } from './tipi'

/* 16-how-it-works — 3772:338 / 3958:323 */
export function ComeFunziona({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.comeFunziona

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <Corpo>{t.occhio}</Corpo>

      <div className="mt-[26px]">
        <Scheda>
          <div className="flex flex-col gap-5 px-5 py-6">
            {t.passi.map((p, i) => (
              <div key={p.titolo} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lime text-[13px] font-bold text-ink">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">{p.titolo}</span>
                  <span className="mt-1 block text-[13px] leading-[1.5] text-ink-soft">
                    {p.testo}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Scheda>
      </div>

      <p className="m-0 mt-5 text-[13px] leading-[20px] tracking-[-0.26px] font-medium text-[#8980ae]">
        {t.chiusa}
      </p>
    </Schermo>
  )
}

/* 17-first-rep — 3772:361 / 3958:364 */
export function PrimaRep({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.primaRep

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <Corpo>{t.corpo}</Corpo>
      <div className="mt-[36px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}

/* training-overview — 3950:2 / 3958:242 */
export function Ritmi({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.ritmi

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <p className="m-0 mt-4 text-[15px] leading-[1.5] tracking-[-0.3px] text-ink">
        <span className="font-bold">{t.forte}</span> {t.corpo}
      </p>

      {/*
        La stessa fila del check-in, ma qui non si sceglie: si legge. Toccare
        una carta ne mostra il significato sotto, e basta — il ritmo di oggi
        si sceglie al check-in, non qui.

        E' lo stesso componente e non una copia: i tre nomi e le tre
        spiegazioni sono scritti una volta sola, e una seconda fila fatta qui
        vorrebbe dire poterli cambiare in un posto e non nell'altro.

        Il primo e' acceso in partenza come nel disegno: e' l'esempio, e serve
        a due cose insieme — far vedere che sono tre pastiglie fra cui si
        sceglie, e non lasciare vuota la riga che spiega, che vuota non
        direbbe a nessuno che le carte si toccano.
      */}
      <div className="mt-[40px]">
        <FilaRitmi scelto={RITMI[0].id} />
      </div>
    </Schermo>
  )
}
