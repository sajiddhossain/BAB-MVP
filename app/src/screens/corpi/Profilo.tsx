import { useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Occhiello, Titolo, Occhio, Gruppo, Errore } from '../../ui/Testo'
import { Campo, CampoData, dataValida } from '../../ui/Campo'
import { Tendina } from '../../ui/Tendina'
import { Bottone } from '../../ui/Bottone'
import { Giorni } from '../../ui/Giorni'
import { BottoneTocco } from '../../ui/tocco'
import { useLingua } from '../../lib/lingua'
import { scrivi, useRisposte, ORARIO_PREDEFINITO } from '../../lib/risposte'
import type { Allenamento } from '../../lib/risposte'
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

/** L'ultima voce della tendina: non e' uno sport, apre il campo per scriverlo. */
const ALTRO = '__altro'

/* 07-sport — 3771:140 / 3958:616 */
export function CorpoSport({ nodo, verso, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { sport, sportPrincipale } = useRisposte()
  const [suo, setSuo] = useState<string | null>(null)

  /*
   * Nella tendina ci sono gli sport che non ha ancora scelto, e in fondo
   * "Altro". Quelli gia' scelti spariscono: stanno gia' nelle pastiglie qui
   * sotto, e lasciarli nell'elenco vorrebbe dire offrirle di sceglierli due
   * volte per poi non farglielo fare.
   */
  const voci = [
    ...SPORT.filter((id) => !sport.includes(id)).map((id) => ({
      id,
      nome: nomeSport(t.sport.nomi, id),
    })),
    { id: ALTRO, nome: t.sport.altro },
  ]

  function aggiungi(id: string) {
    if (sport.includes(id)) return
    scrivi((r) => ({ sport: [...r.sport, id], sportPrincipale: r.sportPrincipale || id }))
  }

  /*
   * Lo sport scritto a mano.
   *
   * Se quello che ha scritto e' uno dei nostri — "Calcio", "calcio", "Càlcio"
   * — si aggiunge quello, non una copia: due pastiglie con lo stesso sport
   * dentro sarebbero due righe diverse nel database, e da li' in poi due
   * sport diversi per sempre.
   */
  function aggiungiSuo() {
    const scritto = (suo ?? '').trim().slice(0, 40)
    if (!scritto) return
    const q = normalizza(scritto)
    const noto = SPORT.find((id) => normalizza(nomeSport(t.sport.nomi, id)) === q)
    const gia = sport.find((id) => normalizza(nomeSport(t.sport.nomi, id)) === q)
    if (!gia) aggiungi(noto ?? scritto)
    setSuo(null)
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
          <Tendina
            voci={voci}
            segnaposto={t.sport.segnaposto}
            etichetta={t.sport.etichetta}
            onScegli={(id) => (id === ALTRO ? setSuo('') : aggiungi(id))}
          />
        </Gruppo>
      </div>

      {/*
        L'unico posto di questo schermo dove si scrive, e compare solo se l'ha
        chiesto scegliendo "Altro". Prima si scriveva sempre, per cercare: chi
        non azzeccava il nome esatto non trovava il suo sport e non sapeva
        perche'.
      */}
      {suo !== null && (
        <div className="mt-4">
          <Gruppo etichetta={t.sport.altroEtichetta}>
            <div className="flex gap-2">
              <Campo
                autoFocus
                autoComplete="off"
                maxLength={40}
                placeholder={t.sport.altroSegnaposto}
                value={suo}
                onChange={(e) => setSuo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') aggiungiSuo()
                  if (e.key === 'Escape') setSuo(null)
                }}
              />
              <button
                type="button"
                disabled={suo.trim() === ''}
                onClick={aggiungiSuo}
                className="bab-tocco h-12 shrink-0 rounded-field border-[1.5px] border-line bg-lime px-4 text-[15px] font-bold text-ink disabled:opacity-45"
              >
                {t.sport.altroAggiungi}
              </button>
            </div>
          </Gruppo>
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

  function cambia(id: string, campi: Partial<Allenamento>) {
    scrivi((r) => {
      const attuale = r.allenamenti[id] ?? { giorni: [], ...ORARIO_PREDEFINITO }
      return { allenamenti: { ...r.allenamenti, [id]: { ...attuale, ...campi } } }
    })
  }

  /*
   * Cambiando i giorni, gli orari dei giorni spenti se ne vanno con loro: se
   * no chi spegne il giovedi' e lo riaccende dopo si ritrova un orario che
   * non ricorda di aver messo. E sotto ai due giorni il giorno per giorno non
   * ha senso — un giorno solo ha gia' il suo orario — quindi si richiude.
   */
  function cambiaGiorni(id: string, val: Allenamento, giorni: number[]) {
    if (!val.perGiorno || giorni.length < 2) {
      cambia(id, { giorni, perGiorno: undefined })
      return
    }
    const potato: Record<number, { inizio: string; fine: string }> = {}
    for (const g of giorni) if (val.perGiorno[g]) potato[g] = val.perGiorno[g]
    cambia(id, { giorni, perGiorno: potato })
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
          const val: Allenamento = allenamenti[id] ?? { giorni: [], ...ORARIO_PREDEFINITO }
          const perGiorno = val.perGiorno
          return (
            <div key={id}>
              <p className="m-0 mb-3 text-[17px] font-bold text-ink">{nomeSport(t.sport.nomi, id)}</p>
              <Gruppo etichetta={t.allenamenti.giorni}>
                <Giorni
                  scelti={val.giorni}
                  onChange={(g) => cambiaGiorni(id, val, g)}
                />
              </Gruppo>

              <div className="mt-4">
                <Gruppo etichetta={t.allenamenti.orario}>
                  {perGiorno ? (
                    <div className="flex flex-col gap-2">
                      {val.giorni.map((g) => (
                        <div key={g} className="flex items-center gap-[10px]">
                          {/* larghezza fissa: se no le tre lettere di "Mer" e
                              le tre di "Gio" non mettono i campi in colonna */}
                          <span className="w-[30px] shrink-0 text-[13px] font-bold text-ink">
                            {t.giorni[g]}
                          </span>
                          <Orario
                            inizio={perGiorno[g]?.inizio ?? val.inizio}
                            fine={perGiorno[g]?.fine ?? val.fine}
                            onChange={(o) =>
                              cambia(id, {
                                perGiorno: {
                                  ...perGiorno,
                                  [g]: {
                                    inizio: perGiorno[g]?.inizio ?? val.inizio,
                                    fine: perGiorno[g]?.fine ?? val.fine,
                                    ...o,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Orario
                      inizio={val.inizio}
                      fine={val.fine}
                      onChange={(o) => cambia(id, o)}
                    />
                  )}
                </Gruppo>

                {/*
                  La via d'uscita per chi ha orari diversi nei vari giorni, e
                  che chi non ce li ha non vede mai aperta. Compare da due
                  giorni in su: con uno solo non c'e' niente da distinguere.
                */}
                {val.giorni.length >= 2 && (
                  <BottoneTocco
                    onClick={() => cambia(id, { perGiorno: perGiorno ? undefined : {} })}
                    className="mt-[10px] text-left text-[12px] font-bold text-lilla underline underline-offset-2"
                  >
                    {perGiorno ? t.allenamenti.uguali : t.allenamenti.diversi}
                  </BottoneTocco>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Schermo>
  )
}

/**
 * Dalle, alle.
 *
 * Due campi `time` veri e non una lista di pastiglie: sul telefono aprono la
 * rotella dell'orologio, che e' un gesto che sa gia' fare, non si puo'
 * scrivere un orario che non esiste, e la tastiera non compare mai.
 */
function Orario({
  inizio,
  fine,
  onChange,
}: {
  inizio: string
  fine: string
  onChange: (o: Partial<{ inizio: string; fine: string }>) => void
}) {
  const { t } = useLingua()
  return (
    <div className="flex min-w-0 items-center gap-[10px]">
      <CampoOra
        etichetta={t.allenamenti.dalle}
        valore={inizio}
        onChange={(v) => onChange({ inizio: v })}
      />
      <CampoOra
        etichetta={t.allenamenti.alle}
        valore={fine}
        onChange={(v) => onChange({ fine: v })}
      />
    </div>
  )
}

function CampoOra({
  etichetta,
  valore,
  onChange,
}: {
  etichetta: string
  valore: string
  onChange: (v: string) => void
}) {
  return (
    /*
      Tutta la casella e' l'etichetta del campo: cosi' il tocco apre la
      rotella anche se cade sulla parola "Dalle", che e' meta' della casella.
    */
    <label className="flex h-11 min-w-0 flex-1 items-center gap-[6px] rounded-[12px] border-[1.5px] border-line bg-surface px-3">
      <span className="shrink-0 text-[11px] font-bold tracking-[0.5px] text-ink-mute uppercase">
        {etichetta}
      </span>
      <input
        type="time"
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        aria-label={etichetta}
        /*
          Via la lancetta che Chrome mette da solo in fondo al campo: mangia
          lo spazio dell'ora e non somiglia a niente altro nell'app. Toccare
          il campo apre la rotella lo stesso, sul telefono come sul computer.
        */
        className="min-w-0 flex-1 appearance-none bg-transparent text-[13px] font-bold text-ink outline-none [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </label>
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
