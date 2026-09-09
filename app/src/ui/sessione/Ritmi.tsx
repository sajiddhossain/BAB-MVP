import { useState } from 'react'
import type { Tempo } from '../../data/casa'
import { RITMI } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'

const ICONE = import.meta.glob<string>('../../assets/sessione/tempo-*.svg', {
  eager: true,
  import: 'default',
})

/**
 * La fila dei tre ritmi.
 *
 * E' la stessa fila nel check-in, nel check-out e nel tutorial: prima e' una
 * previsione, dopo e' un esito, nel tutorial e' una spiegazione, ma il gesto
 * e' identico apposta — e' quello che rende il confronto fra le due un
 * confronto e non due domande diverse.
 *
 * ── LA RIGA CHE SPIEGA ─────────────────────────────────────────────────────
 * Sotto alla fila c'e' sempre una riga, e dice cosa vuol dire il ritmo che si
 * sta guardando: col mouse quello sotto al puntatore, col dito quello appena
 * scelto. Il passaggio del mouse da solo non bastava — le atlete stanno sul
 * telefono, e li' non esiste — e una ⓘ su una carta larga 110 sarebbe un
 * bersaglio che nessuno centra.
 *
 * La riga c'e' anche quando non si sta guardando niente: e' alta come una
 * riga di testo e vuota, se no scegliendo il primo ritmo tutto lo schermo
 * salterebbe in giu' di venti pixel.
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
  const [sopra, setSopra] = useState<Tempo | null>(null)

  const mostrato = sopra ?? scelto

  /*
   * Dove si sceglie, acceso vuol dire scelto e il bordo da solo vuol dire
   * "questo lo stai guardando": sono due cose diverse e si vedono diverse.
   * Dove si legge e basta non c'e' niente di scelto, e allora acceso torna a
   * voler dire guardato — se no dopo un tocco resterebbero accese in due, e
   * la seconda sembrerebbe una risposta data.
   */
  const sceglibile = onChange !== undefined

  return (
    <div>
      <div className="flex gap-3" role={onChange ? 'radiogroup' : 'group'} aria-label="Ritmo">
        {RITMI.map((r) => {
          const acceso = sceglibile ? scelto === r.id : mostrato === r.id
          const sfiorato = sceglibile && mostrato === r.id && !acceso
          return (
            <button
              key={r.id}
              type="button"
              role={onChange ? 'radio' : undefined}
              aria-checked={onChange ? acceso : undefined}
              aria-describedby={mostrato === r.id ? 'ritmo-spiega' : undefined}
              onClick={() => {
                setSopra(r.id)
                onChange?.(r.id)
              }}
              onPointerEnter={() => setSopra(r.id)}
              onPointerLeave={() => setSopra(null)}
              onFocus={() => setSopra(r.id)}
              onBlur={() => setSopra(null)}
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

      <p
        id="ritmo-spiega"
        aria-live="polite"
        className="m-0 mt-3 min-h-[36px] text-[13px] leading-[18px] text-ink-medio"
      >
        {mostrato ? spiega[mostrato] : ''}
      </p>
    </div>
  )
}
