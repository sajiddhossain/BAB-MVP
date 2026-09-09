import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as EventoPuntatore } from 'react'
import type { Tempo } from '../../data/casa'
import { RITMI } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'

const ICONE = import.meta.glob<string>('../../assets/sessione/tempo-*.svg', {
  eager: true,
  import: 'default',
})

/** Quanto resta aperta la nuvoletta dopo un tocco. */
const RESPIRO = 6000

/** Lo stacco fra una carta e l'altra, che serve per puntare la nuvoletta. */
const STACCO = 12

/**
 * La fila dei tre ritmi.
 *
 * E' la stessa fila nel check-in, nel check-out e nel tutorial: prima e' una
 * previsione, dopo e' un esito, nel tutorial e' una spiegazione, ma il gesto
 * e' identico apposta — e' quello che rende il confronto fra le due un
 * confronto e non due domande diverse.
 *
 * ── LA NUVOLETTA ───────────────────────────────────────────────────────────
 * Toccando una carta compare sotto una nuvoletta che dice cosa vuol dire quel
 * ritmo, con la punta rivolta alla carta toccata. Dopo sei secondi se ne va
 * da sola: non e' una cosa da chiudere, e' una cosa da leggere, e un pulsante
 * per chiuderla sarebbe un secondo bersaglio da centrare su una carta larga
 * cento pixel.
 *
 * Col mouse compare anche solo passandoci sopra. Ma il tocco non e' un
 * ripiego del passaggio del mouse: sul telefono il passaggio del mouse non
 * esiste, e senza il tocco i tre nomi resterebbero tre nomi.
 *
 * Il posto sotto alla fila e' sempre alto uguale, anche quando la nuvoletta
 * non c'e': se no al primo tocco tutto lo schermo salterebbe in giu'.
 */
export function Ritmi({
  scelto,
  onChange,
}: {
  scelto: Tempo | null
  /**
   * Manca dove la fila spiega e basta, come nel tutorial: li' toccare una
   * carta ne mostra il significato senza scegliere niente, perche' non c'e'
   * ancora niente da scegliere.
   */
  onChange?: (t: Tempo) => void
}) {
  const { ts } = useLingua()
  const nomi = ts.comune.ritmi
  const spiega = ts.comune.spiegaRitmi
  const sceglibile = onChange !== undefined

  /*
   * Dove si legge e basta la nuvoletta non se ne va: quello schermo esiste
   * per spiegare, e una spiegazione che sparisce da sola dopo sei secondi
   * lascerebbe mezzo schermo vuoto. Dove si sceglie invece se ne va, perche'
   * li' la cosa da fare e' scegliere, non leggere.
   */
  const [mostrato, setMostrato] = useState<Tempo | null>(sceglibile ? null : scelto)
  const orologio = useRef<number | null>(null)

  function ferma() {
    if (orologio.current !== null) {
      clearTimeout(orologio.current)
      orologio.current = null
    }
  }

  function mostra(t: Tempo, aTempo: boolean) {
    ferma()
    setMostrato(t)
    if (aTempo) orologio.current = window.setTimeout(() => setMostrato(null), RESPIRO)
  }

  function nascondi() {
    ferma()
    setMostrato(sceglibile ? null : scelto)
  }

  useEffect(() => ferma, [])

  /* col dito il passaggio sopra non esiste: se ne occupa il tocco */
  const colMouse = (e: EventoPuntatore<HTMLButtonElement>) => e.pointerType === 'mouse'

  const dove = RITMI.findIndex((r) => r.id === mostrato)

  return (
    <div>
      <div className="flex gap-3" role={sceglibile ? 'radiogroup' : 'group'} aria-label="Ritmo">
        {RITMI.map((r) => {
          /*
           * Dove si sceglie, acceso vuol dire scelto e il bordo da solo vuol
           * dire "questo lo stai guardando": sono due cose diverse e si
           * vedono diverse. Dove si legge e basta non c'e' niente di scelto,
           * e allora acceso torna a voler dire guardato.
           */
          const acceso = sceglibile ? scelto === r.id : mostrato === r.id
          const sfiorato = sceglibile && mostrato === r.id && !acceso
          return (
            <button
              key={r.id}
              type="button"
              role={sceglibile ? 'radio' : undefined}
              aria-checked={sceglibile ? acceso : undefined}
              onClick={() => {
                mostra(r.id, sceglibile)
                onChange?.(r.id)
              }}
              onPointerEnter={(e) => {
                if (colMouse(e)) mostra(r.id, false)
              }}
              onPointerLeave={(e) => {
                if (colMouse(e)) nascondi()
              }}
              onFocus={() => mostra(r.id, false)}
              onBlur={nascondi}
              className="relative h-[62px] min-w-0 flex-1"
            >
              {/* l'ombra dura, 4px in giu' e a destra come sulle schede */}
              <span
                className="absolute inset-0 translate-x-1 translate-y-1 rounded-chip"
                style={{ background: acceso ? 'rgba(212,178,111,0.12)' : 'rgba(0,0,0,0.04)' }}
              />
              <span
                className={`absolute inset-0 flex flex-col items-center justify-center gap-[3px] rounded-chip border-[1.5px] transition-colors duration-150 motion-reduce:transition-none ${
                  acceso
                    ? 'border-ritmo-bordo bg-ritmo-fondo'
                    : sfiorato
                      ? 'border-ritmo-bordo bg-surface'
                      : 'border-line bg-surface'
                }`}
              >
                <img
                  src={ICONE[`../../assets/sessione/${r.icona}.svg`]}
                  alt=""
                  aria-hidden
                  className="size-[17px]"
                />
                <span className="text-[13px] font-bold text-ink">{nomi[r.id]}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/*
        Il posto della nuvoletta: c'e' sempre, alto uguale, anche da vuoto.
        `aria-live` sta qui e non dentro alla nuvoletta perche' un elemento
        che nasce gia' col testo dentro non viene annunciato.
      */}
      <div aria-live="polite" className="relative mt-[14px] min-h-[58px]">
        {mostrato && (
          <div
            key={mostrato}
            className="bab-nuvoletta relative rounded-[14px] border-[1.5px] border-line bg-surface px-3 py-[9px] shadow-[3px_3px_0_rgba(0,0,0,0.05)]"
          >
            {/*
              La punta: un quadrato girato di 45 gradi con due lati soli, che
              scavalca il bordo di sopra. Sta al centro della carta toccata —
              le tre carte sono larghe uguali, quindi il centro si sa
              contando, senza doverle misurare.
            */}
            <span
              aria-hidden
              className="absolute -top-[6px] size-[10px] -translate-x-1/2 rotate-45 rounded-[2px] border-t-[1.5px] border-l-[1.5px] border-line bg-surface"
              style={{
                left: `calc((100% - ${STACCO * 2}px) / 3 * ${dove + 0.5} + ${dove * STACCO}px)`,
              }}
            />
            <p className="m-0 text-[13px] leading-[1.35] text-ink-medio">
              <span className="font-bold text-ink">{nomi[mostrato]}</span> · {spiega[mostrato]}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
