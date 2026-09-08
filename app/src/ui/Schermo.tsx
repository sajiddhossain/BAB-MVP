import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sfondo } from './Sfondo'
import { Barra } from './Barra'

/**
 * Il guscio di uno schermo dell'onboarding.
 *
 * Le misure vengono dal frame da 402x874: barra a 56, contenuto a 170,
 * bottone a 778. Qui pero' non sono coordinate assolute ma distanze in un
 * flusso: 56 di margine sopra, la barra alta 44, 70 di stacco, il contenuto,
 * e in fondo il bottone con 34 sotto — che nel disegno e' lo spazio lasciato
 * alla barra di sistema del telefono.
 *
 * Cosi' un titolo su tre righe invece che su due spinge in giu' quello che
 * segue, invece di finirci sopra.
 */
export function Schermo({
  nodo,
  verso = 'niente',
  avanzamento,
  indietro,
  azione,
  children,
}: {
  /** il node-id Figma: serve a ritrovare le macchie di sfondo di questo schermo */
  nodo: string
  /**
   * Da che parte e' arrivato questo schermo. `niente` quando lo schermo non
   * e' cambiato ma e' cambiato dentro — la domanda sul ciclo che si apre: li'
   * il movimento e' quello, e un'entrata gli passerebbe sopra.
   */
  verso?: 'avanti' | 'indietro' | 'niente'
  avanzamento?: number
  indietro?: () => void
  azione?: ReactNode
  children: ReactNode
}) {
  /*
   * Il verso si prende una volta sola, quando lo schermo nasce, e non cambia
   * piu' finche' vive.
   *
   * Se lo leggessimo a ogni render, la domanda sul ciclo che si apre — dove
   * lo schermo NON rinasce, cambia solo l'indirizzo — si vedrebbe cambiare la
   * classe da `indietro` ad `avanti`, e cambiare nome a un'animazione la fa
   * ripartire: l'entrata passerebbe sopra all'apertura, e si muoverebbero
   * tutte e due insieme.
   *
   * Chi deve rinascere lo decide il motore con la chiave, non questo file.
   */
  const [entrataIniziale] = useState(verso)
  const entrata = entrataIniziale === 'niente' ? '' : `bab-entra-${entrataIniziale}`

  return (
    <div className="flex min-h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        <Sfondo nodo={nodo} />
        {/*
          La fascia in cima e' alta 44 sempre, anche dove la barra non c'e':
          e' quello che fa cominciare il contenuto a 170 su ogni schermo. Senza
          questa riserva gli schermi senza barra salgono di 44 e non sono piu'
          allineati agli altri.
        */}
        <div className="relative h-11 pt-[calc(56px+env(safe-area-inset-top))] box-content">
          {avanzamento !== undefined && <Barra avanzamento={avanzamento} indietro={indietro} />}
        </div>
        <div className={`relative flex flex-1 flex-col ${entrata}`}>
          <div className="flex flex-1 flex-col px-[30px] pt-[70px] pb-6">{children}</div>
          {azione && (
            <div className="px-6 pb-[calc(34px+env(safe-area-inset-bottom))]">{azione}</div>
          )}
        </div>
      </div>
    </div>
  )
}
