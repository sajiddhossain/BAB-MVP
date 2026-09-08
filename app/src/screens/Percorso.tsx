import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sfondo } from '../ui/Sfondo'
import { Barra } from '../ui/Barra'
import { Bottone } from '../ui/Bottone'
import { BarraSotto } from '../ui/casa/BarraSotto'
import { riempi } from '../copy/riempi'
import { useLingua } from '../lib/lingua'
import { caricaProgresso, lezioneAperta, useProgresso } from '../lib/percorso'
import { LEZIONI, TINTE_LEZIONE, UNITA } from '../data/percorso'
import type { Unita } from '../data/percorso'

import cervello from '../assets/percorso/cervello.svg'
import info from '../assets/percorso/info.svg'
import frecciaDestra from '../assets/percorso/freccia-destra.svg'
import controllo from '../assets/percorso/controllo.svg'
import scudo from '../assets/percorso/scudo.svg'
import attenzione from '../assets/percorso/attenzione.svg'
import campanello from '../assets/percorso/campanello.svg'

const ICONA = { controllo, scudo, attenzione, campanello } as const

/**
 * La mappa del percorso: `bl-path`.
 *
 * Sedici parole, otto lezioni, quattro unita'. Ogni lezione ne sblocca due, e
 * si apre quando quella prima e' finita.
 *
 * ── DUE COSE CHE NON SEGUONO IL DISEGNO ────────────────────────────────────
 *
 * 1. La barra in fondo. Il frame ne ha una tutta sua con due voci — Percorso
 *    e Mie Parole — ma nell'app la barra in fondo e' una sola e ha quattro
 *    voci, ed e' quella da cui si arriva qui. Due barre diverse a seconda
 *    dello schermo vorrebbero dire non sapere piu' dove si e'. Al vocabolario
 *    si va col bottone in fondo, che nel disegno c'e' gia' e dice proprio
 *    quello.
 *
 * 2. Le quattro parole sotto al nome di ogni unita' non sono scritte: si
 *    costruiscono dalle sedici che l'app ha gia'. Nel disegno sono scritte a
 *    mano, e sarebbero lo stesso testo in due posti — quando qualcuno cambia
 *    "acuto" nel pannello, questa riga deve cambiare con lui.
 */
export function Percorso() {
  const { tpe, ts } = useLingua()
  const vai = useNavigate()
  const progresso = useProgresso()

  useEffect(() => {
    void caricaProgresso()
  }, [])

  const parole = ts.foglio.parole
  const sbloccate = progresso.fatte.length * 2

  return (
    <div className="flex h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        <Sfondo nodo="percorso" />

        <div className="relative flex-1 overflow-y-auto pb-[104px]">
          <div className="pt-[calc(56px+env(safe-area-inset-top))]">
            <Barra avanzamento={progresso.fatte.length / LEZIONI.length} indietro={() => vai('/casa')} />
          </div>

          <div className="px-[30px]">
            <div className="mt-[38px] flex items-center gap-2">
              <img src={cervello} alt="" aria-hidden className="size-4" />
              <span className="text-[11px] font-bold tracking-[1px] text-lilla">
                {tpe.occhiello}
              </span>
            </div>

            <h1 className="bab-display m-0 mt-[6px] text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
              {tpe.titolo}
            </h1>
            <p className="m-0 mt-4 text-[15px] leading-[1.4] text-ink-medio">{tpe.intro}</p>

            {/* il progresso: quante parole ha in mano, e le otto lezioni */}
            <div className="mt-[24px] overflow-hidden rounded-[20px] border border-riga bg-surface shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]">
              <div className="relative px-[21px] py-[15px]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[6px]"
                  style={{ background: 'linear-gradient(to bottom, #ffd1c1, #e9d5ff, #a3e635)' }}
                />
                <p className="m-0 text-[11px] font-bold tracking-[1px] text-ink-medio">
                  {tpe.progresso.etichetta}
                </p>
                <p className="bab-display m-0 mt-[2px] text-[30px] leading-[34px] font-extrabold tracking-[-0.6px] text-ink">
                  {riempi(tpe.progresso.conteggio, { fatte: sbloccate, tutte: LEZIONI.length * 2 })}
                </p>
                <div className="mt-[14px] flex">
                  {LEZIONI.map((l, i) => (
                    <span
                      key={l.numero}
                      className="flex h-4 flex-1 items-center justify-center rounded-[10px] border border-line text-[9px] font-bold text-ink"
                      style={{
                        background: progresso.fatte.includes(l.numero)
                          ? TINTE_LEZIONE[i]
                          : 'transparent',
                      }}
                    >
                      U{l.numero}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* la regola dei tre segnali: sta gia' nel glossario */}
            <button
              type="button"
              onClick={() => vai('/parole')}
              className="relative mt-[16px] flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-[20px] border-[1.5px] px-[14px] py-[10px] text-left"
              style={{
                borderColor: 'rgba(16,185,129,0.25)',
                background:
                  'linear-gradient(to right, rgba(16,185,129,0.08), rgba(16,185,129,0.15))',
              }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[6px]"
                style={{ background: 'linear-gradient(to bottom, #ffd1c1, #e9d5ff, #a3e635)' }}
              />
              <img src={info} alt="" aria-hidden className="size-6 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-ink">{tpe.regola.titolo}</span>
                <span className="block text-[11px] text-ink-medio">{tpe.regola.sotto}</span>
              </span>
              <img src={frecciaDestra} alt="" aria-hidden className="size-6 shrink-0" />
            </button>

            {/* le quattro unita' */}
            <div className="relative mt-[24px] pl-4">
              {/*
                La linea che unisce le unita': nel disegno e' un tratteggio
                verticale dietro alle righe, ed e' quello che le fa leggere
                come un percorso invece che come un elenco.
              */}
              <span
                aria-hidden
                className="absolute top-[22px] bottom-[22px] left-[32px] w-px border-l border-dashed border-line"
              />
              <div className="relative flex flex-col gap-[10px]">
                {UNITA.map((u) => (
                  <RigaUnita key={u.numero} unita={u} parole={parole} />
                ))}
              </div>
            </div>

            <div className="mt-[26px]">
              <Bottone onClick={() => vai('/parole')}>{tpe.azione}</Bottone>
            </div>
          </div>
        </div>

        <BarraSotto />
      </div>
    </div>
  )
}

/**
 * Una riga di unita'.
 *
 * Spenta finche' non e' il suo turno. Non e' un lucchetto per dispetto: le
 * parole della terza unita' parlano di dolore che avvisa, e per leggerle
 * serve gia' sapere che cosa vuol dire "il corpo sta lavorando".
 */
function RigaUnita({ unita, parole }: { unita: Unita; parole: Record<string, string> }) {
  const { tpe } = useLingua()
  const progresso = useProgresso()

  const aperta = lezioneAperta(unita.lezioni[0], progresso)
  const finita = unita.lezioni.every((n) => progresso.fatte.includes(n))
  const nome = tpe.unita[unita.numero as 1 | 2 | 3 | 4]

  // "forte • leggero / indolenzito • affaticato": le due lezioni, due parole
  // ciascuna, prese da dove stanno gia'
  const elenco = unita.lezioni
    .map((n) => {
      const l = LEZIONI.find((x) => x.numero === n)
      return l ? l.parole.map((p) => parole[p]).join(' • ') : ''
    })
    .join(' / ')

  return (
    /*
      TODO(percorso): qui ci va l'apertura della lezione, quando ci sara' il
      riproduttore. Finche' non c'e', la riga non e' un bottone: un bottone
      che porta a un indirizzo che non esiste manda l'atleta alla schermata
      d'accesso, che e' il modo peggiore di dire "non e' ancora pronto".
    */
    <div
      className={`relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-[20px] border-[1.5px] border-line bg-surface px-3 text-left shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)] ${
        aperta ? '' : 'opacity-70'
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[6px]"
        style={{ background: `linear-gradient(to bottom, ${unita.tinta}, #a3e635)` }}
      />
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-[12px]"
        style={{ background: unita.tinta }}
      >
        <img src={ICONA[unita.icona]} alt="" aria-hidden className="size-[14px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13px] font-bold ${finita ? 'text-ink' : 'text-ink-medio'}`}>
          {nome}
        </span>
        {/*
          Le parole si vedono anche quando l'unita' e' ancora chiusa, spente:
          e' quello che fa il disegno, ed e' giusto — sapere cosa arriva dopo
          e' meta' del motivo per cui si va avanti.
        */}
        <span
          className={`block truncate text-[11px] font-bold ${
            aperta ? 'text-ink-soft' : 'text-ink-mute'
          }`}
        >
          {elenco}
        </span>
      </span>
    </div>
  )
}
