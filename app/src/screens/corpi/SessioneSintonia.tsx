import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { OcchielloSessione, TitoloScheda } from '../../ui/sessione/Testo'
import { Scheda } from '../../ui/sessione/Scheda'
import { Cursore } from '../../ui/sessione/Cursore'
import { Pastiglia, SiNo } from '../../ui/sessione/Comandi'
import { ORE_SONNO } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'
import { scriviSessione, useDatiSessione } from '../../lib/sessione'
import type { Dati } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

/**
 * I quattro canali del mattino, uno sotto l'altro.
 *
 * E' l'unico schermo di tutto il giro che scorre: nel disegno e' alto 1262
 * invece di 874. Non lo abbiamo spezzato in quattro schermi perche' e' una
 * domanda sola fatta quattro volte, e chi la vede tutta insieme capisce che
 * sono quattro facce della stessa cosa invece di quattro interrogatori.
 *
 * Le quattro scale NON sono la stessa scala. Sonno, energia e umore vanno
 * dal male al bene; la scuola va al contrario, perche' li' il numero alto e'
 * la pressione. Il colore della pista lo dice senza doverlo leggere.
 */
export function CorpoSintonia({ tipo, passo, verso, avanzamento, avanti, indietro }: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const { ts } = useLingua()
  const t = ts.sintonia
  const scrivi = (campi: Partial<Dati>) => scriviSessione(tipo, campi)

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <OcchielloSessione icona="nota">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[22px] flex flex-col gap-[18px]">
        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.sonno.titolo} domanda={t.sonno.domanda} />
          <div className="mt-[18px]">
            <Cursore
              valore={dati.sonno}
              onChange={(v) => scrivi({ sonno: v })}
              sinistra={t.sonno.sinistra}
              destra={t.sonno.destra}
              etichetta={t.sonno.titolo}
            />
          </div>
          <div className="mt-4 h-[1.5px] bg-riga" />
          <p className="mt-4 mb-[10px] text-[14px] font-bold text-ink">{t.sonno.ore}</p>
          <div className="flex flex-wrap gap-2">
            {ORE_SONNO.map((o) => (
              <Pastiglia
                key={o}
                accesa={dati.oreSonno === o}
                onClick={() => scrivi({ oreSonno: dati.oreSonno === o ? null : o })}
              >
                {o}
              </Pastiglia>
            ))}
          </div>
        </Scheda>

        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.energia.titolo} domanda={t.energia.domanda} />
          <div className="mt-[18px]">
            <Cursore
              valore={dati.energia}
              onChange={(v) => scrivi({ energia: v })}
              sinistra={t.energia.sinistra}
              destra={t.energia.destra}
              etichetta={t.energia.titolo}
            />
          </div>
        </Scheda>

        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.umore.titolo} domanda={t.umore.domanda} />
          <div className="mt-[18px]">
            <Cursore
              valore={dati.umore}
              onChange={(v) => scrivi({ umore: v })}
              sinistra={t.umore.sinistra}
              destra={t.umore.destra}
              etichetta={t.umore.titolo}
            />
          </div>
        </Scheda>

        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.scuola.titolo} domanda={t.scuola.domanda} />
          <div className="mt-[18px]">
            <Cursore
              valore={dati.scuola}
              onChange={(v) => scrivi({ scuola: v })}
              verso="carico"
              sinistra={t.scuola.sinistra}
              destra={t.scuola.destra}
              etichetta={t.scuola.titolo}
            />
          </div>
        </Scheda>

        {/*
          Le due domande di contesto stanno affiancate. Non hanno l'ombra:
          nel disegno sono piatte, ed e' giusto — sono le uniche due che si
          rispondono con un sì o un no invece che con una posizione.
        */}
        <div className="flex gap-[10px]">
          <Scheda piatta className="flex min-w-0 flex-1 flex-col justify-between p-[12px]">
            <p className="m-0 text-[13px] leading-[18px] font-bold text-ink">{t.ciclo}</p>
            <SiNo
              className="mt-3"
              scelta={dati.ciclo}
              onChange={(v) => scrivi({ ciclo: v })}
              etichetta={t.ciclo}
            />
          </Scheda>
          <Scheda piatta className="flex min-w-0 flex-1 flex-col justify-between p-[12px]">
            <p className="m-0 text-[13px] leading-[18px] font-bold text-ink">{t.antidolorifici}</p>
            <SiNo
              className="mt-3"
              scelta={dati.antidolorifici}
              onChange={(v) => scrivi({ antidolorifici: v })}
              etichetta={t.antidolorifici}
            />
          </Scheda>
        </div>
      </div>
    </Schermo>
  )
}
