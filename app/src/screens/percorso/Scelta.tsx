import { useState } from 'react'
import { Badge, CartaRisposta, Esito, Occhiello, Scheda, Testa, Titolo } from '../../ui/percorso/pezzi'
import { Guscio } from '../../ui/percorso/Guscio'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { TINTE_RISPOSTA } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { StatoCarta } from '../../ui/percorso/pezzi'
import type { PropsEsercizio } from './tipi'

const LETTERE = ['A', 'B', 'C', 'D', 'E']

/**
 * Uno scenario e le parole fra cui scegliere.
 *
 * Sono due schermi del disegno — i falsi amici e la storia — e qui sono uno
 * solo, perche' la differenza fra loro e' quanto e' lungo lo scenario e
 * quante risposte ci sono.
 *
 * `forma` dice come si presenta lo scenario, e sono quattro perche' il file
 * ne ha quattro: grosso come un titolo, dentro a una scheda, come testo
 * sciolto, o dentro a una scheda che si porta dentro anche la pastiglia.
 *
 * ── LE RIGHE SOTTO ALLE RISPOSTE ───────────────────────────────────────────
 * Nella prima lezione sono descrizioni ("Leggera, senza attrito") e si vedono
 * da subito. Dalla seconda sono spiegazioni del perche' una risposta e'
 * quella giusta, e si vedono solo dopo aver verificato: nei frame sono
 * disegnate insieme alla spunta, cioe' fanno parte dello stato "gia'
 * risposto". Mostrarle prima vorrebbe dire scrivere la risposta accanto alla
 * domanda.
 */
export function Scelta({
  passo,
  testi,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'storia' | 'gemelle' }>>) {
  const { tpe, ts } = useLingua()
  const gemelle = passo.tipo === 'gemelle'
  const t = gemelle ? testi.gemelle : testi.storia
  const glosse = gemelle ? testi.gemelle.glosse : []
  const buchi = { uno: parole[0], due: parole[1] }
  const conTesta = passo.forma === 'testo' || passo.forma === 'zona'

  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)

  function stato(i: number): StatoCarta {
    if (esito === null) return scelta === i ? 'scelta' : 'ferma'
    if (i !== scelta) return 'ferma'
    return esito ? 'giusta' : 'sbagliata'
  }

  const badge = <Badge>{t.badge}</Badge>
  const scenario = riempi(t.scenario, buchi)

  /*
   * La risposta giusta di solito sta nei dati. Dalla lezione 4 pero' le due
   * lingue raccontano due scene diverse — e la scena decide la risposta —
   * quindi dove i testi ne danno una, vince quella: e' la stessa scritta che
   * l'atleta legge.
   */
  const giusta = t.giusta ?? passo.giusta

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={scelta !== null}
      azione={esito === true ? tpe.comune.continua : t.azione}
      onAzione={() => {
        if (esito === true) {
          avanti()
          return
        }
        setEsito(scelta === giusta)
      }}
      esito={
        <Esito
          aperto={esito !== null}
          giusto={esito === true}
          titolo={esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {esito ? (t.esito ? riempi(t.esito, buchi) : null) : tpe.comune.riprova}
        </Esito>
      }
    >
      {conTesta ? (
        <Testa sopra={t.sopra} occhiello={t.occhiello} titolo={t.titolo ?? ''} />
      ) : (
        <Occhiello nome={gemelle ? 'domanda' : 'libro-aperto'}>{t.occhiello}</Occhiello>
      )}

      {passo.forma === 'zona' ? (
        /* la scheda si porta dentro anche la pastiglia: e' un blocco solo */
        <div className="mt-[30px]">
          <Scheda riga="linear-gradient(to bottom, #ffd1c1, #e9d5ff)">
            <div className="px-4 py-4 pl-[22px]">
              {badge}
              <p className="m-0 mt-[14px] text-[15px] leading-[1.5] text-ink-soft">{scenario}</p>
            </div>
          </Scheda>
        </div>
      ) : (
        <>
          <div className={conTesta ? 'mt-[30px]' : 'mt-[10px]'}>{badge}</div>
          {passo.forma === 'titolo' && (
            <div className="mt-[14px]">
              <Titolo>{scenario}</Titolo>
            </div>
          )}
          {passo.forma === 'carta' && (
            <div className="mt-[19px]">
              <Scheda riga="linear-gradient(to right, #ffd1c1, #ffb8a2)">
                <p className="m-0 px-4 py-5 pl-[22px] text-[13px] leading-[1.4] text-ink-soft">
                  {scenario}
                </p>
              </Scheda>
            </div>
          )}
          {passo.forma === 'testo' && (
            <p className="m-0 mt-[14px] text-[15px] leading-[1.5] text-ink-soft">{scenario}</p>
          )}
        </>
      )}

      {t.domanda && (
        <p
          className={`m-0 ${
            passo.forma === 'carta'
              ? 'mt-[27px] text-center text-[10px] font-bold tracking-[1px] uppercase text-lilla'
              : 'mt-[18px] text-[13px] font-bold text-ink-soft'
          }`}
        >
          {t.domanda}
        </p>
      )}

      <div className={`flex flex-col gap-[10px] ${t.domanda ? 'mt-[10px]' : 'mt-[24px]'}`}>
        {passo.risposte.map((parola, i) => (
          <CartaRisposta
            key={parola}
            lettera={LETTERE[i]}
            tinta={TINTE_RISPOSTA[i % TINTE_RISPOSTA.length]}
            stato={stato(i)}
            titolo={
              t.etichette?.[i]
                ? riempi(t.etichette[i], buchi)
                : (ts.foglio.parole[parola] ?? parola)
            }
            glossa={passo.forma !== 'titolo' && esito === null ? undefined : glosse[i]}
            onClick={() => {
              setScelta(i)
              setEsito(null)
            }}
          />
        ))}
      </div>
    </Guscio>
  )
}
