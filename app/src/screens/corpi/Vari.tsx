import { useState } from 'react'
import type { TESTI } from '../../copy/testi'
import { riempi } from '../../copy/riempi'
import { Schermo } from '../../ui/Schermo'
import { Occhiello, Titolo, Occhio, Gruppo, Etichetta, Errore } from '../../ui/Testo'
import { Campo } from '../../ui/Campo'
import { Bottone } from '../../ui/Bottone'
import { Nota } from '../../ui/Nota'
import { Casella, Rimando } from '../../ui/Scelte'
import { useLingua } from '../../lib/lingua'
import { scrivi, useRisposte } from '../../lib/risposte'
import { mandaCodice, verificaCodice } from '../../lib/conto'
import type { Risposte } from '../../lib/risposte'
import { nomeSport } from '../../data/sport'
import { useLocation } from 'react-router-dom'
import type { PropsSchermo } from '../tipi'
import logo from '../../assets/logo-bab.svg'
import sparkles from '../../assets/icon-sparkles.svg'

/* 01-auth-login — 3771:2 / 3958:461 */
export function CorpoAccesso({ nodo, verso, avanti }: PropsSchermo) {
  const { t } = useLingua()
  const { email } = useRisposte()
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState('')
  // chi arriva qui perche' la sessione e' scaduta merita di sapere perche'
  const scaduta = (useLocation().state as { scaduta?: boolean } | null)?.scaduta === true
  const valida = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())

  async function manda() {
    setInCorso(true)
    setErrore('')
    const esito = await mandaCodice(email)
    setInCorso(false)
    // il messaggio vero di Supabase finisce nella console, non a schermo:
    // a chi legge non dice niente, a noi serve per capire cosa e' successo
    if (!esito.ok) {
      console.error('[accesso]', esito.errore)
      setErrore(
        esito.fraSecondi !== undefined
          ? attesa(t, esito.fraSecondi)
          : esito.lento
            ? t.accesso.troppoLento
            : t.accesso.nonRiuscito,
      )
      return
    }
    avanti()
  }

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      azione={
        <Bottone attivo={valida && !inCorso} onClick={manda}>
          {inCorso ? t.accesso.invio : t.accesso.azione}
        </Bottone>
      }
    >
      <div className="flex h-[220px] items-center justify-center rounded-card border-[1.5px] border-line bg-veil">
        <img src={logo} alt="BAB" className="h-[82px] w-[178px]" />
      </div>

      <div className="mt-4">
        <Occhiello>{t.accesso.occhiello}</Occhiello>
        <Titolo>{t.accesso.titolo}</Titolo>
        <Occhio>{t.accesso.occhio}</Occhio>
      </div>

      <div className="mt-5">
        <Nota icona={sparkles}>{t.accesso.nota}</Nota>
      </div>

      <div className="mt-8">
        <Gruppo etichetta={t.accesso.etichetta}>
          <Campo
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t.accesso.segnaposto}
            value={email}
            onChange={(e) => {
              scrivi({ email: e.target.value })
              setErrore('')
            }}
          />
          {errore && <Errore>{errore}</Errore>}
        </Gruppo>
        {scaduta && !errore && (
          <p className="m-0 mt-[6px] text-[13px] font-bold leading-[1.4] text-violet">
            {t.riepilogo.sessioneScaduta}
          </p>
        )}
      </div>
    </Schermo>
  )
}

/*
 * 02-auth-link-sent — 3771:14 / 3958:486
 *
 * Le sei caselle del codice: si scrive in avanti da sole, e cancellando si
 * torna indietro da sole. Quando sono piene sei si va avanti senza toccare
 * niente — un codice a sei cifre non ha bisogno di un bottone di conferma.
 */
export function CorpoLink({ nodo, verso, avanti }: PropsSchermo) {
  const { t } = useLingua()
  const { email } = useRisposte()
  const [cifre, setCifre] = useState<string[]>(['', '', '', '', '', ''])
  const [errore, setErrore] = useState('')
  const [avviso, setAvviso] = useState('')
  const [rimandando, setRimandando] = useState(false)

  /*
   * Rimandare la mail e' l'unica via d'uscita da questo schermo se la prima
   * non arriva. Prima era scritto e basta: si toccava e non succedeva
   * niente, che e' peggio di non averlo — chi lo tocca resta li' a
   * aspettare una mail che nessuno ha rimandato.
   */
  async function rimanda() {
    if (rimandando) return
    setRimandando(true)
    setErrore('')
    setAvviso('')
    const esito = await mandaCodice(email)
    setRimandando(false)
    if (esito.ok) {
      setAvviso(t.linkMandato.rimandato)
      return
    }
    console.error('[rimando]', esito.errore)
    setErrore(
      esito.fraSecondi !== undefined ? attesa(t, esito.fraSecondi) : t.accesso.nonRiuscito,
    )
  }

  function scriviCifra(i: number, v: string) {
    const tutte = v.replace(/\D/g, '')
    /*
     * Piu' cifre in una casella sola: il codice riempito dal telefono (sopra
     * alla tastiera dell'iPhone compare gia' pronto) o incollato dalla mail.
     * Prima restava solo l'ultima cifra nella prima casella, e il codice
     * giusto sembrava sbagliato. Due cifre in una casella gia' piena invece
     * sono una cifra riscritta, e vale quella nuova.
     */
    if (tutte.length > 2 || (tutte.length === 2 && cifre[i] === '')) {
      distribuisci(i, tutte)
      return
    }
    const c = tutte.slice(-1)
    const copia = [...cifre]
    copia[i] = c
    setCifre(copia)
    setErrore('')
    if (c && i < 5) fuoco(i + 1)
    // sei cifre sono una risposta completa: non serve un bottone di conferma
    if (copia.every((x) => x !== '')) void controlla(copia.join(''))
  }

  /* le cifre una per casella; un codice intero parte sempre dalla prima */
  function distribuisci(da: number, testo: string) {
    const nuove = testo.replace(/\D/g, '')
    if (!nuove) return
    const inizio = nuove.length >= 6 ? 0 : da
    const copia = [...cifre]
    for (let k = 0; k < nuove.length && inizio + k < 6; k++) copia[inizio + k] = nuove[k]
    setCifre(copia)
    setErrore('')
    if (copia.every((x) => x !== '')) {
      void controlla(copia.join(''))
      return
    }
    fuoco(Math.min(inizio + nuove.length, 5))
  }

  async function controlla(codice: string) {
    const esito = await verificaCodice(email, codice)
    if (!esito.ok) {
      console.error('[codice]', esito.errore)
      setErrore(t.linkMandato.codiceSbagliato)
      setCifre(['', '', '', '', '', ''])
      fuoco(0)
      return
    }
    avanti()
  }

  function fuoco(i: number) {
    document.getElementById(`cifra-${i}`)?.focus()
  }

  return (
    <Schermo nodo={nodo} verso={verso}>
      <div className="flex h-[220px] items-center justify-center rounded-card border-[1.5px] border-line bg-veil">
        <img src={logo} alt="BAB" className="h-[82px] w-[178px]" />
      </div>

      <div className="mt-4">
        <Occhiello>{t.linkMandato.occhiello}</Occhiello>
        <Titolo>{t.linkMandato.titolo}</Titolo>
        <Occhio>{riempi(t.linkMandato.occhio, { mail: email || 'demo@babsport.com' })}</Occhio>
      </div>

      <div className="mt-4">
        <Rimando onClick={() => void rimanda()}>
          {rimandando ? t.accesso.invio : t.linkMandato.rimanda}
        </Rimando>
        {avviso && (
          <p className="m-0 mt-[6px] text-center text-[13px] font-bold text-violet">{avviso}</p>
        )}
      </div>

      <p className="m-0 mt-7 text-[13px] leading-[1.5] text-ink-soft">
        {t.linkMandato.spiegaCodice}
      </p>

      <div className="mt-5">
        <Etichetta>{t.linkMandato.etichettaCodice}</Etichetta>
        <div className="mt-[6px] flex gap-2">
          {cifre.map((c, i) => (
            <input
              key={i}
              id={`cifra-${i}`}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`${t.linkMandato.etichettaCodice} ${i + 1}/6`}
              value={c}
              onChange={(e) => scriviCifra(i, e.target.value)}
              onPaste={(e) => {
                e.preventDefault()
                distribuisci(i, e.clipboardData.getData('text'))
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && cifre[i] === '' && i > 0) fuoco(i - 1)
              }}
              className={`h-14 min-w-0 flex-1 rounded-field border-[1.5px] bg-surface text-center text-[20px] font-bold text-ink outline-none focus:border-violet ${
                errore ? 'border-[#ef545e]' : 'border-line'
              }`}
            />
          ))}
        </div>
        {errore && <Errore>{errore}</Errore>}
      </div>
    </Schermo>
  )
}

/*
 * 03-what-is-bab — 3771:39 / 3958:323
 *
 * I due frame non sono lo stesso schermo: l'italiano e' un paragrafo solo,
 * l'inglese e' gia' diviso nei tre passi. Qui c'e' l'inglese, che e' il piu'
 * recente dei due, con il paragrafo italiano tenuto sopra.
 */
export function CorpoIntro({ nodo, verso, avanti }: PropsSchermo) {
  const { t } = useLingua()
  return (
    <Schermo nodo={nodo} verso={verso} azione={<Bottone onClick={avanti}>{t.cosaEBab.azione}</Bottone>}>
      <Occhiello>{t.cosaEBab.occhiello}</Occhiello>
      <Titolo>{t.cosaEBab.titolo}</Titolo>
      <Occhio>{t.cosaEBab.occhio}</Occhio>

      <div className="mt-8 flex flex-col gap-4">
        {t.cosaEBab.passi.map((p, i) => (
          <div
            key={p.titolo}
            className="flex gap-3 rounded-[22px] border-[1.5px] border-line bg-surface p-4"
            style={{ boxShadow: '0px 4px 8px 0px rgba(0,0,0,0.06)' }}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lime text-[13px] font-bold text-ink">
              {i + 1}
            </span>
            <span>
              <span className="block text-[15px] font-bold text-ink">{p.titolo}</span>
              <span className="mt-1 block text-[13px] leading-[1.5] text-ink-soft">{p.testo}</span>
            </span>
          </div>
        ))}
      </div>
    </Schermo>
  )
}

/* 14-summary — 3772:308 / 3958:853 */
export function CorpoRiepilogo({
  nodo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSchermo) {
  const { t } = useLingua()
  const r = useRisposte()

  const listaGiorni = (g: number[]) =>
    g.length ? g.map((i) => t.giorni[i]).join(' · ') : t.riepilogo.vuoto

  const giorniAllenamento = [
    ...new Set(Object.values(r.allenamenti).flatMap((a) => a.giorni)),
  ].sort((a, b) => a - b)

  const voci: [string, string][] = [
    [t.riepilogo.voci.nome, r.nome || t.riepilogo.vuoto],
    [t.riepilogo.voci.sport, r.sportPrincipale ? nomeSport(t.sport.nomi, r.sportPrincipale) : t.riepilogo.vuoto],
    [t.riepilogo.voci.allenamenti, listaGiorni(giorniAllenamento)],
    [t.riepilogo.voci.edFisica, listaGiorni(r.edFisica)],
    [t.riepilogo.voci.ciclo, r.cicliUltimi[0] || t.riepilogo.vuoto],
  ]

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <div>
          <Bottone attivo={!salvando} onClick={avanti}>
            {salvando ? t.riepilogo.salvataggio : t.comune.continua}
          </Bottone>
          {erroreSalvataggio && <Errore>{t.riepilogo.nonSalvato}</Errore>}
        </div>
      }
    >
      <Occhiello>{t.riepilogo.occhiello}</Occhiello>
      <Titolo>{t.riepilogo.titolo}</Titolo>
      <Occhio>{t.riepilogo.occhio}</Occhio>

      <div
        className="mt-8 overflow-hidden rounded-card border-[1.5px] border-line bg-surface"
        style={{ boxShadow: '0px 4px 8px 0px rgba(0,0,0,0.06)' }}
      >
        {voci.map(([et, val]) => (
          <div key={et} className="border-b border-line/50 px-4 py-[14px] last:border-b-0">
            <Etichetta>{et}</Etichetta>
            <p className="m-0 mt-1 text-[15px] font-bold text-ink">{val}</p>
          </div>
        ))}
      </div>
    </Schermo>
  )
}

/* 15-consent — 3771:81 / 3958:538 */
export function CorpoConsenso({
  nodo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSchermo) {
  const { t } = useLingua()
  const { consensi } = useRisposte()

  function spunta(i: number, v: boolean) {
    scrivi((r) => {
      const copia = [...r.consensi] as Risposte['consensi']
      copia[i] = v
      return { consensi: copia }
    })
  }

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <div>
          <Bottone attivo={consensi[0] && consensi[1] && !salvando} onClick={avanti}>
            {salvando ? t.riepilogo.salvataggio : t.comune.continua}
          </Bottone>
          {erroreSalvataggio && <Errore>{t.riepilogo.nonSalvato}</Errore>}
        </div>
      }
    >
      <Occhiello>{t.consenso.occhiello}</Occhiello>
      <Titolo>{t.consenso.titolo}</Titolo>
      <Occhio>{t.consenso.occhio}</Occhio>

      {/* il testo legale vero non c'e' ancora: in Figma e' scritto che e' un segnaposto */}
      <p className="m-0 mt-6 rounded-[18px] border-[1.5px] border-dashed border-line bg-veil p-4 text-[13px] leading-[1.5] text-ink-soft">
        {t.consenso.segnaposto}
      </p>

      <div className="mt-5 flex flex-col gap-[9px]">
        {t.consenso.caselle.map((testo, i) => (
          <Casella key={testo} spuntata={consensi[i]} onChange={(v) => spunta(i, v)}>
            {testo}
          </Casella>
        ))}
      </div>
    </Schermo>
  )
}

/**
 * "Aspetta 12 secondi e riprova."
 *
 * Singolare e plurale sono due modelli separati e non un `?:` dentro alla
 * frase: chi scrive i testi deve poter cambiare tutt'e due, e in una lingua
 * che non sia l'italiano potrebbero non essere nemmeno due.
 */
function attesa(t: (typeof TESTI)['it'], secondi: number): string {
  return riempi(secondi === 1 ? t.accesso.aspetta.uno : t.accesso.aspetta.molti, { secondi })
}
