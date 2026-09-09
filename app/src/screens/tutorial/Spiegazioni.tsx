import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Corpo, Nota, Occhiello, Scheda, Titolo, icona } from '../../ui/tutorial/pezzi'
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

  /*
   * Le tre carte non si toccano: qui il ritmo si spiega, non si sceglie —
   * sceglierlo è la prima domanda del check-in, e questo schermo esiste
   * proprio per farle sapere cosa le verrà chiesto. Sono `div`, non bottoni:
   * un bottone che non fa niente resta raggiungibile con la tastiera e col
   * lettore di schermo si annuncia come una cosa da premere.
   */
  const SEGNI = ['fulmine', 'onde', 'foglia']

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

      <div className="mt-[40px] flex gap-3">
        {t.carte.map((nome, i) => (
          <div key={nome} className="relative min-w-0 flex-1">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-[4px] translate-y-[4px] rounded-[16px]"
              style={{ background: i === 0 ? 'rgba(212,178,111,0.12)' : 'rgba(0,0,0,0.04)' }}
            />
            {/*
              La prima carta è accesa nel disegno: è l'esempio, quello che
              fa capire che sono tre pastiglie fra cui si sceglie. Non è una
              risposta già data — qui non si risponde.
            */}
            <div
              className={`relative flex h-[62px] flex-col items-center justify-center gap-1 rounded-[16px] ${
                i === 0
                  ? 'border-2 border-ritmo-bordo bg-ritmo-fondo'
                  : 'border-[1.5px] border-line bg-surface'
              }`}
            >
              <img src={icona(SEGNI[i])} alt="" aria-hidden className="size-4" />
              <span className="text-[13px] font-bold text-ink">{nome}</span>
            </div>
          </div>
        ))}
      </div>
    </Schermo>
  )
}
