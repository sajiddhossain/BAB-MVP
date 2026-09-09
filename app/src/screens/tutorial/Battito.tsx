import { useEffect, useRef, useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { BottoneTocco } from '../../ui/tocco'
import { Corpo, Occhiello, Titolo } from '../../ui/tutorial/pezzi'
import { useLingua } from '../../lib/lingua'
import { riempi } from '../../copy/riempi'
import { BANDE, MOLTIPLICATORE, SECONDI, battitoValido } from '../../data/tutorial'
import { scriviBattito, scriviIpotesi, useTutorial } from '../../lib/tutorial'
import type { PropsTutorial } from './tipi'

/* 18-guess — 3908:2 / 3958:381 */
export function Indovina({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.indovina
  const { ipotesi } = useTutorial()

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={ipotesi !== null} onClick={avanti}>
          {t.azione}
        </Bottone>
      }
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <Corpo>{t.corpo}</Corpo>

      <div className="mt-[26px] flex gap-3">
        {t.carte.map((c, i) => {
          const scelta = ipotesi === BANDE[i]
          return (
            <BottoneTocco
              key={c.nome}
              aria-pressed={scelta}
              onClick={() => scriviIpotesi(BANDE[i])}
              className={`flex min-h-[140px] min-w-0 flex-1 flex-col items-center justify-center gap-[6px] rounded-[16px] px-1 ${
                scelta
                  ? 'border-2 border-verde-acceso bg-verde-chiaro'
                  : 'border-[1.5px] border-line bg-surface'
              }`}
            >
              <span aria-hidden className="text-[28px] leading-none">
                {c.emoji}
              </span>
              <span className="mt-2 text-[14px] font-medium text-ink">{c.nome}</span>
              <span className="text-[11px] text-ink-mute">{c.sotto}</span>
            </BottoneTocco>
          )
        })}
      </div>

      <p className="m-0 mt-6 text-center text-[13px] leading-[1.4] font-bold text-lilla-cupo">
        {t.nota}
      </p>
    </Schermo>
  )
}

/* 19-count — 3908:33 / 3958:412 */
export function Conta({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.conta

  /*
   * Tre stati e non due: `ferma` prima di cominciare, `conta` mentre scorrono
   * i quindici secondi, `finita` dopo. Serve il terzo perché il conteggio
   * finito e il conteggio mai cominciato hanno lo stesso numero di battiti —
   * zero — e non sono la stessa cosa: dal primo si va avanti, dal secondo no.
   */
  const [fase, setFase] = useState<'ferma' | 'conta' | 'finita'>('ferma')
  const [battiti, setBattiti] = useState(0)
  const [restano, setRestano] = useState(SECONDI)
  const scadenza = useRef(0)

  useEffect(() => {
    if (fase !== 'conta') return
    scadenza.current = Date.now() + SECONDI * 1000
    const orologio = setInterval(() => {
      const manca = Math.max(0, Math.ceil((scadenza.current - Date.now()) / 1000))
      setRestano(manca)
      if (manca === 0) {
        clearInterval(orologio)
        setFase('finita')
      }
    }, 200)
    return () => clearInterval(orologio)
  }, [fase])

  /*
   * Il battito si scrive quando il conteggio finisce, non a ogni tocco: a
   * ogni tocco vorrebbe dire scrivere quindici volte in `localStorage` per
   * un numero che conta solo alla fine.
   */
  useEffect(() => {
    if (fase === 'finita') scriviBattito(battiti * MOLTIPLICATORE)
  }, [fase, battiti])

  const bpm = battiti * MOLTIPLICATORE
  const buono = fase === 'finita' && battitoValido(bpm)

  function tocca() {
    if (fase === 'ferma') {
      setBattiti(1)
      setRestano(SECONDI)
      setFase('conta')
      return
    }
    if (fase === 'conta') setBattiti((n) => n + 1)
  }

  function daccapo() {
    setBattiti(0)
    setRestano(SECONDI)
    setFase('ferma')
  }

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={buono} onClick={avanti}>
          {t.azione}
        </Bottone>
      }
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <Corpo>{riempi(t.corpo, { secondi: SECONDI })}</Corpo>

      <p
        aria-live="polite"
        className="m-0 mt-8 text-center text-[15px] font-bold text-lilla-cupo"
      >
        {fase === 'ferma'
          ? t.pronta
          : fase === 'conta'
            ? riempi(t.inCorso, { secondi: restano })
            : t.finito}
      </p>

      {/*
        Il cerchio è un bottone vero e non un `div` con un `onClick`: si tocca
        ventiquattro volte di fila, e deve rispondere anche a chi lo raggiunge
        con la tastiera o con un lettore di schermo.
      */}
      <div className="mt-5 flex justify-center">
        <BottoneTocco
          onClick={tocca}
          disabled={fase === 'finita'}
          aria-label={t.via}
          className="flex size-[190px] items-center justify-center rounded-full text-[32px] font-extrabold text-white select-none disabled:opacity-45"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #ff8aa3, #e0405e)',
            boxShadow: '0px 12px 20px rgba(224,64,94,0.25)',
          }}
        >
          <span className="bab-display">{fase === 'conta' ? restano : t.via}</span>
        </BottoneTocco>
      </div>

      <p
        aria-live="polite"
        className="m-0 mt-6 text-center text-[16px] font-bold text-ink"
      >
        {riempi(t.conteggio, { battiti })}
      </p>

      {/*
        Il conteggio che non sta in piedi non si nasconde e non si corregge:
        si dice, e si rifà. Dedurre un battito da due tocchi vorrebbe dire
        inventarle un numero e poi mostrarglielo come suo.
      */}
      {fase === 'finita' && !buono && (
        <div className="mt-4 text-center">
          <p className="m-0 text-[13px] leading-[1.4] text-ink-soft">{t.riprova}</p>
          <button
            type="button"
            onClick={daccapo}
            className="bab-tocco mt-2 rounded-pill border-[1.5px] border-line bg-surface px-4 py-2 text-[13px] font-bold text-ink"
          >
            {t.daccapo}
          </button>
        </div>
      )}
    </Schermo>
  )
}
