import { useState } from 'react'
import giu from '../../assets/chevron-down.svg'
import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { Errore } from '../../ui/Testo'
import { OcchielloSessione } from '../../ui/sessione/Testo'
import { Scheda, Nota } from '../../ui/sessione/Scheda'
import { Apri } from '../../ui/Apri'
import { PAROLE_DA_GUARDARE } from '../../data/sessione'
import { testiSessione } from '../../copy/sessione'
import type { TestiSessione } from '../../copy/sessione'
import { useLingua } from '../../lib/lingua'
import { datiSessione, useDatiSessione, scriviSessione } from '../../lib/sessione'
import type { Sensazione } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

const ICONE = import.meta.glob<string>('../../assets/sessione/*.svg', {
  eager: true,
  import: 'default',
})
const icona = (n: string) => ICONE[`../../assets/sessione/${n}.svg`]

/**
 * Se fra le parole scelte ce n'e' almeno una di quelle da guardare.
 *
 * Decide QUALE delle due spiegazioni mettere per prima, non se c'e' qualcosa
 * che non va: e' un ordine di lettura, non una diagnosi. Lo schermo dice
 * tutte e due le cose comunque.
 */
function daGuardare(sensazioni: Sensazione[]): boolean {
  return sensazioni.some(
    (s) => s.parole.some((p) => PAROLE_DA_GUARDARE.includes(p)) || s.unLato === true,
  )
}

/** "teso · indolenzito · bruciante  |  un lato  |  4/10" */
function riassunto(s: Sensazione, ts: TestiSessione): string {
  const pezzi: string[] = []
  const parole = s.parole.map((p) => ts.foglio.parole[p])
  if (parole.length) pezzi.push(parole.join(' · '))
  else if (s.sue.trim()) pezzi.push(s.sue.trim())
  if (s.unLato !== null) pezzi.push(s.unLato ? ts.mappa.unLato : ts.mappa.dueLati)
  pezzi.push(`${s.intensita}/10`)
  return pezzi.join('  |  ')
}

/**
 * L'ultimo schermo del check-in: cosa vuol dire quello che ha appena segnato.
 *
 * Non dice cosa ha. Dice come si distinguono due cose che si somigliano, e
 * le mette nell'ordine giusto per lei — e poi rimanda a un adulto, che e' la
 * riga piu' importante di tutto lo schermo.
 */
export function CorpoSegnali({
  passo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSessione) {
  const dati = useDatiSessione('checkin')
  const { lingua } = useLingua()
  const ts = testiSessione(lingua)
  const t = ts.segnali
  const [aperto, setAperto] = useState(false)
  const guardare = daGuardare(dati.sensazioni)
  const consigli = guardare ? t.provaOggi.protettivo : t.provaOggi.affaticamento

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      margini={24}
      azione={
        <>
          <Bottone attivo={!salvando} onClick={avanti}>
            {salvando ? '…' : t.azione}
          </Bottone>
          {erroreSalvataggio && <Errore>Non siamo riusciti a salvare. Riprova.</Errore>}
        </>
      }
    >
      <OcchielloSessione icona="scintilla">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[18px] flex flex-col gap-[10px]">
        {dati.sensazioni.map((s) => (
          <Scheda key={s.id} piatta className="flex items-center gap-3 p-[12px]">
            <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-allarme-fondo">
              <img src={icona('spillo')} alt="" aria-hidden className="size-6" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-bold text-ink">
                {s.zona === 'altrove' ? s.zonaLibera : s.nome}
              </span>
              <span className="block truncate text-[12px] text-ink-mute">{riassunto(s, ts)}</span>
            </span>
          </Scheda>
        ))}
      </div>

      <div className="mt-[10px]">
        <Scheda piatta className="px-[14px] pt-[12px] pb-[16px]">
          <p className="m-0 text-[14px] font-bold text-ink">{t.decifra}</p>
          <div className="mt-[14px] flex flex-col gap-[14px]">
            <Riga
              pallino="pallino-verde"
              titolo={t.affaticamento.titolo}
              corpo={t.affaticamento.corpo}
            />
            <Riga
              pallino="pallino-corallo"
              titolo={t.protettivo.titolo}
              corpo={t.protettivo.corpo}
            />
          </div>
        </Scheda>
      </div>

      <div className="mt-[18px]">
        <Scheda piatta>
          <button
            type="button"
            onClick={() => setAperto((a) => !a)}
            aria-expanded={aperto}
            className="flex h-12 w-full items-center justify-between px-4 text-[14px] font-bold text-ink"
          >
            {t.prova}
            <img
              src={giu}
              alt=""
              aria-hidden
              className="size-[18px] transition-transform duration-200 motion-reduce:transition-none"
              style={{ transform: aperto ? 'rotate(180deg)' : 'none' }}
            />
          </button>
          <Apri aperto={aperto}>
            <ul className="m-0 flex list-none flex-col gap-2 px-4 pb-4">
              {consigli.map((c) => (
                <li key={c} className="text-[12.5px] leading-[1.45] text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          </Apri>
        </Scheda>
      </div>

      <div className="mt-[18px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}

function Riga({ pallino, titolo, corpo }: { pallino: string; titolo: string; corpo: string }) {
  return (
    <div className="flex gap-[10px]">
      <img src={icona(pallino)} alt="" aria-hidden className="mt-[5px] size-2 shrink-0" />
      <div className="min-w-0">
        <p className="m-0 text-[13px] font-bold text-ink">{titolo}</p>
        <p className="m-0 mt-[2px] text-[11.5px] leading-[15px] text-ink-soft">{corpo}</p>
      </div>
    </div>
  )
}

/**
 * L'ultimo schermo del check-out: il confronto fra la previsione e l'esito.
 *
 * E' lo schermo per cui esiste tutto il resto. Le due caselle in cima sono
 * l'unica cosa che il check-in di stamattina e il check-out di adesso hanno
 * da dirsi, e sono affiancate apposta.
 */
export function CorpoRendiconto({
  passo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSessione) {
  const dati = useDatiSessione('checkout')
  const { lingua } = useLingua()
  const ts = testiSessione(lingua)
  const t = ts.rendiconto
  const nomi = ts.comune.ritmi
  const previsto = datiSessione('checkin').ritmo
  const sentito = dati.ritmo

  const ordine = ['carica', 'costante', 'leggero']
  const scarto = previsto && sentito ? ordine.indexOf(sentito) - ordine.indexOf(previsto) : null
  const frase = scarto === null ? null : scarto > 0 ? t.frase.piu : scarto < 0 ? t.frase.meno : t.frase.uguale

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={16}
      margini={24}
      azione={
        <>
          <Bottone attivo={!salvando} onClick={avanti}>
            {salvando ? '…' : t.azione}
          </Bottone>
          {erroreSalvataggio && <Errore>Non siamo riusciti a salvare. Riprova.</Errore>}
        </>
      }
    >
      <OcchielloSessione icona="stella">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      {/*
        Il confronto c'e' solo se stamattina ha fatto il check-in. Senza,
        mostrare una casella "Previsione" vuota direbbe che ha sbagliato
        qualcosa, quando invece semplicemente non c'era.
      */}
      {previsto && sentito && (
        <div className="mt-[22px]">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] rounded-[14px] border-[1.5px] border-[#e8d6bd] bg-ritmo-fondo px-[10px] py-2">
              <span className="text-[9px] font-bold tracking-[1px] text-[#e8a33d] uppercase">
                {t.previsione}
              </span>
              <span className="text-[16px] font-bold text-[#e8a33d]">{nomi[previsto]}</span>
            </div>
            <img src={icona('freccia-destra')} alt="→" className="size-4 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] rounded-[14px] border-[1.5px] border-lilla-bordo bg-lilla-fondo px-[10px] py-2">
              <span className="text-[9px] font-bold tracking-[1px] text-lilla-vivo uppercase">
                {t.richiesta}
              </span>
              <span className="text-[16px] font-bold text-lilla-vivo">{nomi[sentito]}</span>
            </div>
          </div>
          <p className="m-0 mt-5 text-[13px] leading-[1.5] tracking-[-0.13px] text-ink-soft">
            {frase}
            <strong className="font-bold">{t.frase.chiusa}</strong>
          </p>
        </div>
      )}

      <div className="mt-[22px]">
        <Scheda className="p-[12px]">
          <p className="m-0 text-[15px] font-bold text-ink">{t.decodifica.titolo}</p>
          <p className="m-0 mt-2 text-[11.5px] leading-[16px] text-ink-medio">
            {t.decodifica.occhio}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Riga
              pallino="pallino-verde"
              titolo={t.decodifica.affaticamento.titolo}
              corpo={t.decodifica.affaticamento.corpo}
            />
            <Riga
              pallino="pallino-corallo"
              titolo={t.decodifica.protettivo.titolo}
              corpo={t.decodifica.protettivo.corpo}
            />
          </div>
          <div className="mt-2 h-px bg-line" />
          <p className="mt-2 mb-2 text-[12.5px] font-bold text-ink">{t.decodifica.domanda}</p>
          <div className="flex gap-2" role="radiogroup" aria-label={t.decodifica.domanda}>
            {[true, false].map((v) => {
              const acceso = dati.protettivo === v
              return (
                <button
                  key={String(v)}
                  type="button"
                  role="radio"
                  aria-checked={acceso}
                  onClick={() => scriviSessione('checkout', { protettivo: v })}
                  className={`h-7 min-w-0 flex-1 rounded-pill border-[1.5px] text-[12px] font-bold transition-colors duration-150 ${
                    acceso
                      ? 'border-verde-vivo bg-verde-fondo text-verde-scuro'
                      : 'border-line bg-surface text-ink-soft'
                  }`}
                >
                  {v ? ts.comune.si : ts.comune.no}
                </button>
              )
            })}
          </div>
        </Scheda>
      </div>

      <div className="mt-[14px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}
