import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useCopy, useLocale, fill as tpl } from '@/copy'
import { REGIONS, regionLabel, type RegionCode } from '@/content/bodymap'
import {
  GEOMETRY, HALF, MIN_HIT, MIRROR, SHADOW, VIEW, area, hitBox, type Shape, type Side,
} from './body-shapes'
import { FlagIcon } from './icons'

/**
 * La mappa corporea. Compare in tre posti — check-in pre, check-in post e
 * segnalazione immediata — quindi vale la pena farne una sola, buona.
 *
 * La geometria sta in `body-shapes.ts`. Qui c'è come si comporta.
 *
 * ── Due strati, e il motivo ─────────────────────────────────────────────────
 *
 * Il disegno e i bersagli dei tocchi sono due gruppi separati:
 *
 *   · lo strato VISIBILE è ritagliato sulla sagoma, così ogni zona finisce
 *     esattamente sul bordo del corpo e il contorno spesso resta uno solo;
 *
 *   · lo strato dei TOCCHI sta sopra, invisibile e NON ritagliato, con ogni
 *     bersaglio allargato ad almeno 44px.
 *
 * Se fossero la stessa cosa bisognerebbe scegliere: o un ginocchio disegnato
 * grande come un bersaglio (e la figura non è più un corpo), o un bersaglio
 * grande come un ginocchio — 20px, che un pollice non prende. Separandoli si
 * ottengono tutt'e due, e il dito che manca il ginocchio di poco prende
 * comunque il ginocchio.
 *
 * 🔴 Convenzione sinistra/destra: **la sua sinistra sta a sinistra dello
 * schermo, in entrambe le viste** (vedi `body-shapes.ts`).
 */

type Props = {
  selected?: RegionCode | null
  /** Zone già registrate in questa sessione: restano marcate. */
  logged?: RegionCode[]
  /** 🚩 Zone con una bandiera rossa: si distinguono, non si confondono. */
  flagged?: RegionCode[]
  onSelect: (code: RegionCode) => void
  /** `care` colora di corallo: si usa nella segnalazione immediata. */
  tone?: 'neutral' | 'care'
  /** Testo per «da un'altra parte»: la colonna `region_free` esiste da sempre. */
  freeText?: string
  onFreeText?: (v: string) => void
  /**
   * Quanto pesa ogni zona, da 0 a 1. È la modalità LETTURA: la stessa figura
   * che serve a raccogliere serve a rileggere, e deve essere la stessa figura
   * o le due cose non si riconoscono come la stessa cosa.
   *
   * Vince su `logged`, che dice solo sì/no.
   */
  heat?: Partial<Record<RegionCode, number>>
  /** Cosa c'è scritto sotto quando non ha ancora toccato niente. */
  hint?: string
  /**
   * La figura prende l'altezza che le resta, invece di averne una sua.
   *
   * 🔴 È la differenza fra una schermata e una pagina. Con una figura di
   * altezza fissa, tutto quello che le sta intorno — il fronte/retro, la
   * scritta di conferma, «da un'altra parte», il ripiego a elenco — spinge il
   * resto sotto la piega, e per indicare il ginocchio bisogna scorrere. Ma
   * scorrere mentre si punta un posto sul proprio corpo è la cosa peggiore che
   * si possa chiedere: la figura si sposta sotto il dito.
   */
  fit?: boolean
}

/**
 * Decorazioni: non si toccano, non salvano niente, e non sono decorazione.
 *
 * Vengono dai prototipi originali, e servono a una cosa sola: far capire in un
 * decimo di secondo se stai guardando il davanti o il dietro. Una faccia
 * davanti, uno chignon e la linea della schiena dietro. Senza, le due viste
 * sono due sagome identiche e l'atleta deve fidarsi dell'etichetta del bottone.
 *
 * `pointer-events: none` è obbligatorio: se intercettassero un tocco, un dito
 * sulla faccia non registrerebbe «testa».
 */
function Decor({ side }: { side: Side }) {
  const ink = 'var(--color-ink-soft)'
  const hair = { fill: ink, opacity: 0.3 }
  /* Il cerchio del ginocchio: la convenzione dei figurini di moda per
     segnare l'articolazione senza disegnarla nel profilo. Il profilo resta
     una gamba liscia, e il cerchio — leggero, non un contorno vero — dice
     dov'è la piega senza tagliarla a fette. */
  const knees = (
    <g opacity={0.4}>
      <ellipse cx={81} cy={311} rx={11} ry={13} fill="none" stroke={ink} strokeWidth={1.3} />
      <ellipse cx={119} cy={311} rx={11} ry={13} fill="none" stroke={ink} strokeWidth={1.3} />
    </g>
  )
  if (side === 'front') {
    return (
      <g pointerEvents="none" aria-hidden>
        {/* La frangia. Serve anche a far leggere la testa come una testa e non
            come un ovale: senza, la faccia galleggia in mezzo al nulla. */}
        <path d="M80.1,36 C80.3,20 89,12 100,12 C111,12 119.7,20 119.9,36
                 C114.5,29 108.5,32 100,32 C91.5,32 85.6,29 80.1,36 Z" {...hair} />
        <circle cx={93.2} cy={41} r={2.4} fill={ink} />
        <circle cx={106.8} cy={41} r={2.4} fill={ink} />
        <path d="M94.5,49 Q100,53.5 105.5,49" fill="none" stroke={ink}
              strokeWidth={1.8} strokeLinecap="round" />
        {knees}
      </g>
    )
  }
  return (
    <g pointerEvents="none" aria-hidden>
      {/* Nuca e coda. Dicono «stai guardando il dietro» senza scrivere una
          parola — che è l'unico modo di dirlo in un decimo di secondo. */}
      <ellipse cx={100} cy={35} rx={19.9} ry={23} {...hair} />
      <path d="M100,52 C106.6,60.3 107.4,76.4 104.1,93.2 C102.5,101.6 97.5,101.6 95.9,93.2
               C92.6,76.4 93.4,60.3 100,52 Z" {...hair} />
      <path d="M100,122.6 L100,175.1" fill="none" stroke={ink} strokeWidth={2.2}
            strokeDasharray="4 6" strokeLinecap="round" opacity={0.4} />
      {knees}
    </g>
  )
}

/** Rettangolo o tracciato, disegnati con gli stessi attributi. */
function Draw({ s, ...attrs }: { s: Shape } & React.SVGProps<SVGPathElement & SVGRectElement>) {
  return s.k === 'rect'
    ? <rect x={s.x} y={s.y} width={s.w} height={s.h} {...attrs} />
    : <path d={s.d} transform={s.mirror ? MIRROR : undefined} {...attrs} />
}

export default function BodyMap({
  selected = null, logged = [], flagged = [], onSelect,
  tone = 'neutral', freeText = '', onFreeText, heat, hint, fit = false,
}: Props) {
  const t = useCopy()
  const locale = useLocale()
  const clipId = useId()
  const svgRef = useRef<SVGSVGElement>(null)

  /**
   * Quanto è larga la figura DAVVERO, in pixel dello schermo.
   *
   * Serve a una cosa sola, e non è cosmetica: il minimo per un bersaglio è
   * 44px CSS, e tradurlo in unità di disegno si può fare solo sapendo quanto
   * misura la figura adesso. Con un'altezza che si adatta, quella misura
   * cambia da telefono a telefono.
   */
  const [px, setPx] = useState(250)
  useEffect(() => {
    const el = svgRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => {
      const w = e?.contentRect.width ?? 0
      if (w > 0) setPx(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  })
  /** Oltre un certo punto allargare i bersagli li fa mangiare a vicenda: lì
   *  la risposta onesta è l'elenco, non un ginocchio grande come una coscia. */
  const minHit = Math.min(48, Math.max(MIN_HIT, (44 * VIEW.w) / px))
  const [side, setSide] = useState<Side>('front')
  const [hover, setHover] = useState<RegionCode | null>(null)
  const [list, setList] = useState(false)
  /** Cambia a ogni scelta: fa ripartire l'animazione anche sulla stessa zona. */
  const [pulse, setPulse] = useState(0)

  const accent = tone === 'care' ? 'var(--care)' : 'var(--color-teal)'
  const tint = tone === 'care' ? 'var(--care-tint)' : 'var(--tempo-steady-tint)'

  /**
   * Se la zona scelta vive solo sull'altra faccia, la mappa gira da sola.
   * Succede scegliendo dall'elenco, o riaprendo un check-in: senza, lei vede
   * una figura dove non è segnato niente e crede di aver perso la scelta.
   */
  useEffect(() => {
    const r = REGIONS.find((x) => x.code === selected)
    if (r && (r.side === 'front' || r.side === 'back')) setSide(r.side)
  }, [selected])

  const shapes = GEOMETRY[side]
  /** Ordine di disegno = ordine di dichiarazione: il tronco prima, le braccia dopo. */
  const drawOrder = useMemo(
    () => (Object.keys(shapes) as RegionCode[]).filter((c) => shapes[c]),
    [shapes],
  )
  /** Ordine dei tocchi: dal più grande al più piccolo, così i piccoli stanno sopra. */
  const hitOrder = useMemo(
    () => [...drawOrder].sort((a, b) => area(shapes[b]!) - area(shapes[a]!)),
    [drawOrder, shapes],
  )
  /**
   * Ordine della TASTIERA: dall'alto in basso, da sinistra a destra.
   *
   * Non può essere l'ordine del DOM, che è quello dei tocchi e va dal più
   * grande al più piccolo: chi naviga col tab si troverebbe a saltare da una
   * spalla a un piede a una mano senza logica. Quindi un solo punto di
   * tabulazione per tutta la figura, e poi le frecce si muovono sul corpo come
   * ci si aspetta che facciano.
   */
  const walkOrder = useMemo(
    () => [...drawOrder].sort((a, b) =>
      shapes[a]!.cy - shapes[b]!.cy || shapes[a]!.cx - shapes[b]!.cx),
    [drawOrder, shapes],
  )
  const [cursor, setCursor] = useState(0)
  useEffect(() => {
    const i = selected ? walkOrder.indexOf(selected) : -1
    if (i >= 0) setCursor(i)
    else setCursor((c) => Math.min(c, walkOrder.length - 1))
  }, [selected, walkOrder])

  const zoneId = (code: RegionCode) => `${clipId}-${code}`

  function walk(e: React.KeyboardEvent, at: number) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    let next: number
    if (step) next = (at + step + walkOrder.length) % walkOrder.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = walkOrder.length - 1
    else return false
    e.preventDefault()
    setCursor(next)
    document.getElementById(zoneId(walkOrder[next]))?.focus()
    return true
  }

  function choose(code: RegionCode) {
    setPulse((p) => p + 1)
    onSelect(code)
  }

  /**
   * Le tinte sono OPACHE, non trasparenze.
   *
   * Il corpo è pieno di sabbia, non di bianco: una tinta al 14% su trasparente
   * ci si mescolava e veniva fuori un colore fangoso che si vedeva appena. Un
   * `color-mix` col bianco dà lo stesso colore chiaro qualunque cosa ci sia
   * sotto, e resta leggibile anche su una gamba larga otto millimetri.
   */
  const soft = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, white)`

  function paint(code: RegionCode) {
    if (code === selected) return { fill: accent, stroke: accent, width: 2.2 }
    /**
     * In lettura la tinta è graduata. Il minimo è 16 e non 0: una zona segnata
     * una volta sola deve comunque VEDERSI, altrimenti l'unica cosa che la
     * distingue dal resto del corpo è il puntino, e il puntino da solo non dice
     * dove finisce la zona.
     */
    const h = heat?.[code]
    if (h !== undefined) {
      const c = flagged.includes(code) ? 'var(--care)' : accent
      return { fill: soft(c, 16 + h * 44), stroke: c, width: 1.8 }
    }
    if (flagged.includes(code)) return { fill: soft('var(--care)', 34), stroke: 'var(--care)', width: 2 }
    if (logged.includes(code)) return { fill: soft(accent, 34), stroke: accent, width: 1.8 }
    if (code === hover) return { fill: soft(accent, 15), stroke: 'var(--color-ink)', width: 1.5 }
    /**
     * A riposo le zone non sono più trasparenti: una tinta appena percettibile
     * dice, prima ancora di toccare, che il corpo è fatto di pezzi premibili
     * e non è un disegno fisso. Su un touch non c'è hover che lo dica prima.
     */
    return { fill: soft(accent, 7), stroke: 'var(--color-ink)', width: 1.5 }
  }

  const heated = Object.keys(heat ?? {}) as RegionCode[]
  const marked = [...new Set([...logged, ...flagged, ...heated])].filter((c) => shapes[c])
  const hasMarks = marked.length > 0

  /** Quello che sta scritto sotto la figura. Non cambia mai altezza: niente salti. */
  const chosenLabel = selected === 'other' && freeText.trim()
    ? freeText.trim()
    : selected ? regionLabel(selected, locale) : null

  /** Scelta ma non disegnata da questa parte: sta sull'altra faccia. */
  const elsewhere = !!selected && !shapes[selected]
    && REGIONS.find((r) => r.code === selected)?.side !== 'none'

  const sideBtn = (s: Side) => (
    <button
      key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)}
      className="bab-pill px-5 py-2 text-[13.5px]"
      style={side === s
        ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
        : undefined}
    >
      {s === 'front' ? t.checkin.pre.pinpoint.front : t.checkin.pre.pinpoint.back}
    </button>
  )

  return (
    <div className={`flex w-full flex-col items-center ${
      fit ? 'min-h-0 flex-1 gap-1.5' : 'gap-3'
    }`}>
      {/* Nell'elenco ci sono già tutt'e due le facce, e «la tua sinistra sta a
          sinistra» non vuol dire niente su una lista di parole. */}
      {/* 🔴 La convenzione dello specchio va DETTA. Un'atleta che indica il
          ginocchio sbagliato manda il fisioterapista dalla parte opposta.
          In `fit` sta di fianco al fronte/retro invece che sotto: ogni riga
          in meno qui è una riga in più di figura. */}
      {!list && (
        <div className={`flex w-full shrink-0 items-center ${
          fit ? 'gap-2.5' : 'flex-col gap-1.5'
        }`}>
          <div className="flex shrink-0 gap-2" role="group" aria-label={t.bodymap.sideLabel}>
            {sideBtn('front')}{sideBtn('back')}
          </div>
          <p className={`text-[var(--color-ink-soft)] ${
            fit ? 'flex-1 text-[11px] leading-[1.25]' : 'text-center text-[12px]'
          }`}>
            {t.bodymap.mirrorHint}
          </p>
        </div>
      )}

      {list ? (
        <div className={`flex w-full max-w-[330px] flex-col gap-3 ${
          fit ? 'min-h-0 flex-1 overflow-y-auto' : ''
        }`}>
          {([['front', t.checkin.pre.pinpoint.front], ['back', t.checkin.pre.pinpoint.back]] as const)
            .map(([s, label]) => (
              <fieldset key={s} className="flex flex-col gap-1.5 border-0 p-0">
                <legend className="bab-label">{label}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS
                    .filter((r) => r.side === s || (s === 'front' && r.side === 'both'))
                    .map((r) => (
                      <button
                        key={r.code} type="button" aria-pressed={selected === r.code}
                        onClick={() => choose(r.code)}
                        className="bab-pill inline-flex items-center gap-1 px-3 py-1.5 text-[12.5px]"
                        style={selected === r.code
                          ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
                          : logged.includes(r.code) ? { background: tint } : undefined}
                      >
                        {flagged.includes(r.code) && (
                          <FlagIcon size={12} color={selected === r.code ? 'var(--color-surface)' : 'var(--care)'} />
                        )}
                        {r.label[locale]}
                      </button>
                    ))}
                </div>
              </fieldset>
            ))}
        </div>
      ) : (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          /* In `fit` è l'ALTEZZA a comandare e la larghezza segue: la figura
             riempie quello che le altre righe le lasciano, su qualsiasi
             telefono, senza che nessuno debba indovinare un numero. */
          className={`touch-manipulation ${
            fit ? 'min-h-0 w-auto flex-1' : 'h-auto w-full max-w-[250px]'
          }`}
          role="group" aria-label={t.checkin.pre.pinpoint.title}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={HALF} />
              <path d={HALF} transform={MIRROR} />
            </clipPath>
          </defs>

          {/* 🔴 L'ombra dura, la stessa di ogni card dell'app: la sagoma
              disegnata una seconda volta, piena d'inchiostro e spostata.
              BAB non sfuma mai un'ombra, e questa figura non fa eccezione —
              prima aveva un'ellisse grigia sfumata sotto i piedi, l'unica
              cosa in tutta l'app che assomigliasse a un'ombra vera. */}
          <g transform={`translate(${SHADOW.dx},${SHADOW.dy})`} fill="var(--color-ink)"
             pointerEvents="none" aria-hidden>
            <path d={HALF} />
            <path d={HALF} transform={MIRROR} />
          </g>

          <g clipPath={`url(#${clipId})`} pointerEvents="none">
            {/* Il corpo è pieno PRIMA delle zone, altrimenti il quadretto della
                carta si vedrebbe attraverso la pancia. Sabbia e non bianco: è
                il colore "carta" del sistema, e stacca dalla tela senza
                bisogno di un bordo in più. */}
            <rect x={0} y={0} width={VIEW.w} height={VIEW.h} fill="var(--color-sand)" />
            {drawOrder.map((code) => {
              const p = paint(code)
              return (
                <Draw key={code} s={shapes[code]!} fill={p.fill} stroke={p.stroke}
                      strokeWidth={p.width} strokeOpacity={code === selected ? 1 : 0.3}
                      strokeLinejoin="round" />
              )
            })}
            {/* L'onda del tocco: parte da dove ha toccato e muore sul bordo del
                corpo, perché è dentro il ritaglio. Con «riduci le animazioni»
                sparisce da sola (index.css). */}
            {pulse > 0 && selected && shapes[selected] && (
              <circle key={pulse} className="bab-pulse"
                      cx={shapes[selected]!.cx} cy={shapes[selected]!.cy}
                      r={4} fill="none" stroke={accent} strokeWidth={2.5} />
            )}
          </g>

          {/* Il contorno: uno solo, spesso, sopra tutto. È quello che fa
              leggere venti zone come un corpo. */}
          <path className="bab-edge" d={HALF} />
          <path className="bab-edge" d={HALF} transform={MIRROR} />
          <Decor side={side} />

          {/* Un punto sulle zone già segnate: la tinta da sola, su una gamba
              larga otto millimetri, non si vede. */}
          <g pointerEvents="none" aria-hidden>
            {marked.filter((c) => c !== selected).map((c) => (
              <circle key={c} cx={shapes[c]!.cx} cy={shapes[c]!.cy} r={3.4}
                      fill={flagged.includes(c) ? 'var(--care)' : accent}
                      stroke="var(--color-surface)" strokeWidth={1.4} />
            ))}
          </g>

          <g>
            {hitOrder.map((code) => {
              const s = shapes[code]!
              const box = hitBox(s, minHit)
              return (
                <g
                  key={code} id={zoneId(code)} className="bab-zone" role="button"
                  // Un solo punto di tabulazione per tutta la figura: dentro ci
                  // si muove con le frecce (vedi `walkOrder`).
                  tabIndex={walkOrder[cursor] === code ? 0 : -1}
                  aria-label={regionLabel(code, locale)}
                  aria-pressed={code === selected}
                  onClick={() => choose(code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(code); return }
                    walk(e, walkOrder.indexOf(code))
                  }}
                  onPointerEnter={() => setHover(code)}
                  onPointerLeave={() => setHover((h) => (h === code ? null : h))}
                  onFocus={() => setHover(code)}
                  onBlur={() => setHover((h) => (h === code ? null : h))}
                  style={{ cursor: 'pointer' }}
                >
                  {box
                    ? <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="transparent" />
                    : <Draw s={s} fill="transparent" />}
                </g>
              )
            })}
          </g>
        </svg>
      )}

      {/* Conferma di quello che ha appena toccato. Altezza fissa: se comparisse
          e sparisse, la figura ballerebbe sotto il dito.

          🔴 `elsewhere` non è un dettaglio: se sceglie la coscia e poi gira la
          figura, la scritta resterebbe vera ma la mappa sarebbe vuota — e lei
          penserebbe di aver perso la scelta. Dirle dov'è costa una riga. */}
      <p className="min-h-[22px] shrink-0 text-center text-[14.5px] font-bold" aria-live="polite">
        {chosenLabel ? (
          <>
            {/* In lettura non ha «scelto» niente: sta guardando. */}
            {heat ? chosenLabel : tpl(t.bodymap.chosen, { region: chosenLabel })}
            {elsewhere && (
              <span className="font-normal text-[var(--color-ink-soft)]">
                {' · '}{side === 'front' ? t.bodymap.onBack : t.bodymap.onFront}
              </span>
            )}
          </>
        ) : (
          <span className="font-normal text-[var(--color-ink-soft)]">{hint ?? t.bodymap.tapHint}</span>
        )}
      </p>

      {/* In `fit` la legenda non c'è: chi chiama la mappa in una schermata sola
          elenca già le zone segnate sopra la figura, con il loro nome scritto.
          Ripeterlo qui costa una riga, e quella riga la paga la figura — che
          rimpicciolendosi fa rimpicciolire i bersagli. */}
      {hasMarks && !fit && (
        <ul className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] text-[var(--color-ink-soft)]">
          {(logged.length > 0 || heated.length > 0) && (
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
              {heat ? t.bodymap.legendHeat : t.bodymap.legendMarked}
            </li>
          )}
          {flagged.length > 0 && (
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--care)' }} />
              {t.bodymap.legendFlag}
            </li>
          )}
        </ul>
      )}

      {/* Le tre vie di fuga della mappa, su una riga sola: le due zone che non
          stanno sulla figura e il ripiego a elenco. In `fit` è l'ultima riga
          della schermata, e deve restare una riga. */}
      <div className="flex w-full shrink-0 flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {REGIONS.filter((r) => r.side === 'none').map((r) => (
            <button
              key={r.code} type="button" onClick={() => choose(r.code)}
              aria-pressed={selected === r.code}
              className={`bab-pill ${fit ? 'px-3.5 py-2 text-[12.5px]' : 'px-4 py-2 text-[13px]'}`}
              style={selected === r.code
                ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
                : undefined}
            >
              {r.code === 'all_over' ? t.checkin.pre.pinpoint.allOver : t.checkin.pre.pinpoint.elsewhere}
            </button>
          ))}
          {/* Non è un ripiego per il lettore di schermo: c'è chi tocca male, chi
              ha le mani fredde, chi è su un pullman. L'elenco funziona sempre —
              e con la figura rimpicciolita per stare in una schermata, funziona
              anche meglio della figura. */}
          {fit && (
            <button type="button" onClick={() => setList((v) => !v)}
                    aria-label={list ? t.bodymap.listClose : t.bodymap.listOpen}
                    className="px-1.5 text-[12.5px] underline text-[var(--color-ink-soft)]">
              {list ? t.bodymap.listCloseShort : t.bodymap.listShort}
            </button>
          )}
        </div>

        {/* «Da un'altra parte» senza un campo dove dirlo è un vicolo cieco:
            polso, mandibola, costole non stanno sulla mappa, e il database ha
            sempre avuto la colonna per accoglierle. */}
        {selected === 'other' && onFreeText && (
          <input
            value={freeText}
            onChange={(e) => onFreeText(e.target.value)}
            maxLength={40}
            placeholder={t.hurt.whereFreeholder}
            aria-label={t.checkin.pre.pinpoint.elsewhere}
            className="bab-card w-full max-w-[300px] px-3 py-2 text-[15px]"
          />
        )}

        {!fit && (
          <button type="button" onClick={() => setList((v) => !v)}
                  className="text-[13px] underline text-[var(--color-ink-soft)]">
            {list ? t.bodymap.listClose : t.bodymap.listOpen}
          </button>
        )}
      </div>
    </div>
  )
}
