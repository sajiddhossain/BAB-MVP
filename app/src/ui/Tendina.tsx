import { useEffect, useRef, useState } from 'react'
import giu from '../assets/chevron-down.svg'

export type VoceTendina = { id: string; nome: string }

/**
 * Il menu a tendina: si sceglie da un elenco, non si scrive.
 *
 * Chiuso e' identico a un campo di testo — stessa altezza, stesso bordo,
 * stesso angolo — perche' nella riga dove sta prende il posto di un campo, e
 * due cose che stanno nello stesso posto devono somigliarsi. Aperto e' un
 * pannello che si appoggia sopra a quello che c'e' sotto invece di spingerlo
 * in giu': aprire una tendina non deve far ballare mezzo schermo.
 *
 * ── PERCHE' NON E' UN <select> ─────────────────────────────────────────────
 * Quello di sistema si comporta benissimo, ma aperto e' la ruota dell'iPhone
 * o la lista di Android: due cose diverse fra loro e tutt'e due diverse dal
 * resto dell'onboarding, che e' disegnato riga per riga. Qui l'elenco e'
 * uguale su tutti i telefoni.
 *
 * Il prezzo di non usarlo e' la tastiera, e si paga qui: frecce per muoversi,
 * Invio per scegliere, Esc per chiudere, e i ruoli che un lettore di schermo
 * si aspetta da un elenco a discesa.
 */
export function Tendina({
  voci,
  segnaposto,
  etichetta,
  onScegli,
}: {
  voci: VoceTendina[]
  /** cosa c'e' scritto quando non si e' ancora scelto niente */
  segnaposto: string
  /** cosa si sta scegliendo: lo legge chi non vede lo schermo */
  etichetta: string
  onScegli: (id: string) => void
}) {
  const [aperta, setAperta] = useState(false)
  /*
   * Su quale voce si sta. Parte da -1, cioe' nessuna: col dito non c'e'
   * niente sopra a niente finche' non si tocca, e la prima voce accesa da
   * sola sembrerebbe una scelta gia' fatta. Si accende con le frecce o col
   * mouse, che sono i due modi in cui "starci sopra" vuol dire qualcosa.
   */
  const [sopra, setSopra] = useState(-1)
  const elenco = useRef<HTMLDivElement>(null)
  const bottone = useRef<HTMLButtonElement>(null)

  /*
   * Chiudendo si torna sul bottone. Senza, chi si muove con la tastiera
   * dopo aver scelto si ritroverebbe a ricominciare dall'inizio della pagina:
   * la voce su cui stava non esiste piu'.
   */
  function chiudi(tornaSuSe = true) {
    setAperta(false)
    if (tornaSuSe) bottone.current?.focus()
  }

  function scegli(id: string) {
    onScegli(id)
    chiudi()
  }

  useEffect(() => {
    if (!aperta) return
    setSopra(-1)
    const tasti = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return chiudi()
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const giu = e.key === 'ArrowDown'
        setSopra((i) => {
          if (i < 0) return giu ? 0 : voci.length - 1
          return (i + (giu ? 1 : -1) + voci.length) % voci.length
        })
      }
      if (e.key === 'Enter' && sopra >= 0 && voci[sopra]) {
        e.preventDefault()
        scegli(voci[sopra].id)
      }
    }
    window.addEventListener('keydown', tasti)
    return () => window.removeEventListener('keydown', tasti)
  })

  /* la voce su cui si sta si porta in vista da sola, se l'elenco e' lungo */
  useEffect(() => {
    if (!aperta) return
    if (sopra < 0) return
    const voce = elenco.current?.children[sopra] as HTMLElement | undefined
    voce?.scrollIntoView({ block: 'nearest' })
  }, [aperta, sopra])

  return (
    <div className="relative">
      <button
        ref={bottone}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aperta}
        aria-label={etichetta}
        onClick={() => setAperta((a) => !a)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-field border-[1.5px] border-line bg-surface px-[14.5px] text-left text-[15px] text-ink-mute outline-none focus-visible:border-violet"
      >
        {segnaposto}
        <img
          src={giu}
          alt=""
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: aperta ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {aperta && (
        <>
          {/*
            Il velo che chiude toccando fuori. E' trasparente e non scurisce
            niente: una tendina non e' un foglio, e oscurare lo schermo per un
            elenco di diciotto voci sarebbe una porta blindata su un cassetto.
          */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => chiudi(false)}
            className="fixed inset-0 z-20 cursor-default"
          />

          <div
            ref={elenco}
            role="listbox"
            aria-label={etichetta}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[264px] overflow-y-auto overscroll-contain rounded-field border-[1.5px] border-line bg-surface shadow-[4px_4px_0_rgba(0,0,0,0.06)]"
          >
            {voci.map((v, i) => (
              <button
                key={v.id}
                type="button"
                role="option"
                aria-selected={i === sopra}
                onClick={() => scegli(v.id)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setSopra(i)}
                className={`block w-full border-b border-line/50 px-[14.5px] py-3 text-left text-[15px] text-ink last:border-b-0 ${
                  i === sopra ? 'bg-chip' : 'bg-surface'
                }`}
              >
                {v.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
