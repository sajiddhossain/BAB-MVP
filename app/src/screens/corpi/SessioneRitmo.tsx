import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo, Occhio } from '../../ui/Testo'
import { OcchielloSessione } from '../../ui/sessione/Testo'
import { Scheda } from '../../ui/sessione/Scheda'
import { Ritmi } from '../../ui/sessione/Ritmi'
import { Apri } from '../../ui/Apri'
import { testiSessione } from '../../copy/sessione'
import type { TestiSessione } from '../../copy/sessione'
import { useLingua } from '../../lib/lingua'
import { datiSessione, scriviSessione, useDatiSessione } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

/**
 * Il ritmo: lo stesso schermo prima e dopo l'allenamento.
 *
 * Prima e' una previsione e sotto c'e' una scheda che spiega che non esiste
 * un ritmo sbagliato. Dopo e' un esito, e la scheda sotto compare solo quando
 * ha scelto — perche' quello che dice e' il confronto fra le due risposte, e
 * prima della seconda non c'e' niente da confrontare.
 *
 * La scheda si apre invece di comparire di colpo: e' lo stesso gesto della
 * domanda sul ciclo nell'onboarding, e per la stessa ragione — lo schermo non
 * cambia, cambia dentro.
 */
export function CorpoRitmo({ tipo, passo, verso, avanzamento, avanti, indietro }: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const prima = tipo === 'checkin'
  const { lingua } = useLingua()
  const ts = testiSessione(lingua)
  const t = prima ? ts.ritmoPrima : ts.ritmoDopo

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      azione={
        <Bottone attivo={dati.ritmo !== null} onClick={avanti}>
          {t.azione}
        </Bottone>
      }
    >
      <OcchielloSessione icona={prima ? 'stella' : 'rotazione'}>{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>
      <Occhio>{t.occhio}</Occhio>

      {/*
        Lo stacco sopra ai ritmi e' diverso nei due giri perche' lo e' nel
        disegno: 62 nel check-in, 45 nel check-out. Non c'e' una ragione, ma
        seguirlo costa una riga e non seguirlo si vede.
      */}
      <div className={prima ? 'mt-[62px]' : 'mt-11'}>
        <Ritmi scelto={dati.ritmo} onChange={(r) => scriviSessione(tipo, { ritmo: r })} />
      </div>

      <div className="mt-[22px]">
        {prima ? (
          <SchedaSpiega titolo={ts.ritmoPrima.carta.titolo}>
            {ts.ritmoPrima.carta.corpo}
          </SchedaSpiega>
        ) : (
          <Apri aperto={dati.ritmo !== null}>
            <SchedaSpiega titolo={confronto(dati.ritmo, ts)}>
              {ts.ritmoDopo.confronto.corpo}
            </SchedaSpiega>
          </Apri>
        )}
      </div>
    </Schermo>
  )
}

/**
 * La frase del confronto.
 *
 * Tre versioni e non una: il disegno mostra solo il caso di chi si aspettava
 * piu' di quanto il corpo ha dato, ma i casi sono tre e con una sola chi ci
 * prende leggerebbe che si e' sbagliata.
 *
 * L'ordine dei ritmi e' quello di `RITMI`, dal piu' carico al piu' leggero:
 * un indice piu' alto vuol dire un ritmo piu' basso.
 */
function confronto(sentito: string | null, ts: TestiSessione): string {
  const c = ts.ritmoDopo.confronto
  const previsto = datiSessione('checkin').ritmo
  const nomi = ts.comune.ritmi
  if (!sentito) return ''
  const dopo = nomi[sentito as keyof typeof nomi]
  // senza check-in stamattina non c'e' una previsione da confrontare
  if (!previsto) return c.uguale(dopo)
  const ordine = ['carica', 'costante', 'leggero']
  const d = ordine.indexOf(sentito) - ordine.indexOf(previsto)
  if (d === 0) return c.uguale(dopo)
  return d > 0 ? c.piu(nomi[previsto], dopo) : c.meno(nomi[previsto], dopo)
}

function SchedaSpiega({ titolo, children }: { titolo: string; children: string }) {
  return (
    <Scheda className="px-[18px] py-[16px]">
      <p className="m-0 text-[15px] leading-[1.5] font-bold tracking-[-0.3px] text-ink">{titolo}</p>
      <p className="m-0 mt-1 text-[13px] leading-[1.5] tracking-[-0.26px] text-ink-soft">
        {children}
      </p>
    </Scheda>
  )
}
