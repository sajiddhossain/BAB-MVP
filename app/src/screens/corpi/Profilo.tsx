import { useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Occhiello, Titolo, Occhio, Gruppo, Errore } from '../../ui/Testo'
import { Campo, CampoData, dataValida } from '../../ui/Campo'
import { Bottone } from '../../ui/Bottone'
import { Giorni } from '../../ui/Giorni'
import { Pillole } from '../../ui/Scelte'
import { useLingua } from '../../lib/lingua'
import { scrivi, useRisposte } from '../../lib/risposte'
import { SPORT, nomeSport, normalizza } from '../../data/sport'
import { abbastanzaGrande } from '../../data/onboarding'
import type { PropsSchermo } from '../tipi'

/** Lo stacco fra il blocco del titolo e il primo campo. */
const STACCO = 'mt-[52px]'

/* 05-name — 3771:104 / 3958:567 */
export function CorpoNome({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { nome } = useRisposte()
  // lo schema accetta da 1 a 40 caratteri: fermarlo qui vuol dire dirglielo
  // adesso invece di farglielo scoprire dall'errore in fondo all'onboarding
  const buono = nome.trim().length > 0 && nome.trim().length <= 40
  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={buono} onClick={avanti}>
          {t.comune.continua}
        </Bottone>
      }
    >
      <Occhiello>{t.nome.occhiello}</Occhiello>
      <Titolo>{t.nome.titolo}</Titolo>
      <Occhio>{t.nome.occhio}</Occhio>
      <div className={STACCO}>
        <Gruppo etichetta={t.nome.etichetta}>
          <Campo
            autoComplete="given-name"
            placeholder={t.nome.segnaposto}
            maxLength={40}
            value={nome}
            onChange={(e) => scrivi({ nome: e.target.value })}
          />
        </Gruppo>
      </div>
    </Schermo>
  )
}

/* 06-birthday — 3771:122 / 3958:592 */
export function CorpoCompleanno({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { nascita } = useRisposte()
  const completa = dataValida(nascita)
  const grande = abbastanzaGrande(nascita)
  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={completa && grande} onClick={avanti}>
          {t.comune.continua}
        </Bottone>
      }
    >
      <Occhiello>{t.compleanno.occhiello}</Occhiello>
      <Titolo>{t.compleanno.titolo}</Titolo>
      <Occhio>{t.compleanno.occhio}</Occhio>
      <div className={STACCO}>
        <Gruppo etichetta={t.compleanno.etichetta}>
          <CampoData
            valore={nascita}
            onChange={(v) => scrivi({ nascita: v })}
            segnaposto={t.compleanno.segnaposto}
          />
          {completa && !grande && <Errore>{t.compleanno.troppoPiccola}</Errore>}
        </Gruppo>
      </div>
    </Schermo>
  )
}

/* 07-sport — 3771:140 / 3958:616 */
export function CorpoSport({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { sport, sportPrincipale } = useRisposte()
  const [cerca, setCerca] = useState('')

  const q = normalizza(cerca)
  const trovati = q
    ? SPORT.filter(
        (id) => normalizza(nomeSport(t.sport.nomi, id)).includes(q) && !sport.includes(id),
      ).slice(0, 6)
    : []

  function aggiungi(id: string) {
    scrivi((r) => ({ sport: [...r.sport, id], sportPrincipale: r.sportPrincipale || id }))
    setCerca('')
  }

  function togli(id: string) {
    scrivi((r) => {
      const resto = r.sport.filter((s) => s !== id)
      return {
        sport: resto,
        // se si toglie il principale, il principale diventa il primo che resta
        sportPrincipale: r.sportPrincipale === id ? (resto[0] ?? '') : r.sportPrincipale,
      }
    })
  }

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={sport.length > 0} onClick={avanti}>
          {t.comune.continua}
        </Bottone>
      }
    >
      <Occhiello>{t.sport.occhiello}</Occhiello>
      <Titolo>{t.sport.titolo}</Titolo>
      <Occhio>{t.sport.occhio}</Occhio>

      <div className={STACCO}>
        <Gruppo etichetta={t.sport.etichetta}>
          <Campo
            autoComplete="off"
            placeholder={t.sport.segnaposto}
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
          />
        </Gruppo>
      </div>

      {/* i risultati: solo mentre si scrive, e mai piu' di sei */}
      {q !== '' && (
        <div className="mt-2 overflow-hidden rounded-field border-[1.5px] border-line bg-surface">
          {trovati.length === 0 ? (
            <p className="m-0 px-[14.5px] py-3 text-[15px] text-ink-mute">{t.sport.nessuno}</p>
          ) : (
            trovati.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => aggiungi(id)}
                className="block w-full border-b border-line/50 px-[14.5px] py-3 text-left text-[15px] text-ink last:border-b-0"
              >
                {nomeSport(t.sport.nomi, id)}
              </button>
            ))
          )}
        </div>
      )}

      {/* quelli scelti: si tocca per farne il principale, la x per toglierlo */}
      {sport.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {sport.map((id) => {
            const principale = id === sportPrincipale
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-2 rounded-chip border-[1.5px] py-2 pl-3 pr-2 text-[14px] font-bold ${
                  principale ? 'border-ink bg-lime text-ink' : 'border-line bg-surface text-ink'
                }`}
              >
                <button type="button" onClick={() => scrivi({ sportPrincipale: id })}>
                  {nomeSport(t.sport.nomi, id)}
                </button>
                {principale && (
                  <span className="text-[10px] tracking-[1px] text-ink-soft">
                    {t.sport.principale}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`${nomeSport(t.sport.nomi, id)} ✕`}
                  onClick={() => togli(id)}
                  className="flex size-5 items-center justify-center rounded-full text-ink-soft"
                >
                  ✕
                </button>
              </span>
            )
          })}
        </div>
      )}
    </Schermo>
  )
}

/* 08-training — 3771:160 / 3958:641 */
export function CorpoAllenamenti({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { sport, allenamenti } = useRisposte()

  function cambia(id: string, campi: Partial<{ giorni: number[]; fascia: number }>) {
    scrivi((r) => {
      const attuale = r.allenamenti[id] ?? { giorni: [], fascia: 1 }
      return { allenamenti: { ...r.allenamenti, [id]: { ...attuale, ...campi } } }
    })
  }

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.comune.continua}</Bottone>}
    >
      <Occhiello>{t.allenamenti.occhiello}</Occhiello>
      <Titolo>{t.allenamenti.titolo}</Titolo>
      <Occhio>{t.allenamenti.occhio}</Occhio>

      {/* un blocco per sport: nel disegno sono due, qui sono quanti ne ha scelti */}
      <div className="mt-9 flex flex-col gap-7">
        {sport.map((id) => {
          const val = allenamenti[id] ?? { giorni: [], fascia: 1 }
          return (
            <div key={id}>
              <p className="m-0 mb-3 text-[17px] font-bold text-ink">{nomeSport(t.sport.nomi, id)}</p>
              <Gruppo etichetta={t.allenamenti.giorni}>
                <Giorni scelti={val.giorni} onChange={(g) => cambia(id, { giorni: g })} />
              </Gruppo>
              <div className="mt-4">
                <Gruppo etichetta={t.allenamenti.orario}>
                  <Pillole
                    voci={t.allenamenti.fasce.map((testo, i) => ({ id: i, testo }))}
                    scelta={val.fascia}
                    onChange={(f) => cambia(id, { fascia: f })}
                  />
                </Gruppo>
              </div>
            </div>
          )
        })}
      </div>
    </Schermo>
  )
}

/* 09-pe — 3772:193 / 3958:709 */
export function CorpoEdFisica({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { edFisica } = useRisposte()
  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.comune.continua}</Bottone>}
    >
      <Occhiello>{t.edFisica.occhiello}</Occhiello>
      <Titolo>{t.edFisica.titolo}</Titolo>
      <Occhio>{t.edFisica.occhio}</Occhio>
      <div className={STACCO}>
        <Gruppo etichetta={t.edFisica.etichetta}>
          <Giorni scelti={edFisica} onChange={(g) => scrivi({ edFisica: g })} />
        </Gruppo>
      </div>
    </Schermo>
  )
}

/* 10-competitions — 3772:223 / 3958:745 */
export function CorpoGare({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { prossimaGara } = useRisposte()
  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.comune.continua}</Bottone>}
    >
      <Occhiello>{t.gare.occhiello}</Occhiello>
      <Titolo>{t.gare.titolo}</Titolo>
      <Occhio>{t.gare.occhio}</Occhio>
      <div className={STACCO}>
        <Gruppo etichetta={t.gare.etichetta}>
          <CampoData
            valore={prossimaGara}
            onChange={(v) => scrivi({ prossimaGara: v })}
            segnaposto={t.gare.segnaposto}
          />
        </Gruppo>
      </div>
    </Schermo>
  )
}
