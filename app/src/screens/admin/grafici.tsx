import { useMemo, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { CheckIn, Impegno, Segnale } from '../../lib/admin'
import { ZONE, codiceZona } from '../../data/sessione'
import { BACK_INK, FRONT_INK, OUTLINE } from '../../ui/bodyZones'
import type { Ink } from '../../ui/bodyZones'
import { BLOCCO, dataBreve, dataLunga, giorniTra, iso } from './pezzi'
import type { Vocabolario } from './vocabolario'

/**
 * I grafici della scheda di un'atleta.
 *
 * SVG scritto a mano e nessuna libreria: sono cinque grafici, e una libreria
 * di grafici pesa piu' di tutto il pannello.
 *
 * ── LE REGOLE ──────────────────────────────────────────────────────────────
 * - Un asse solo per grafico. Sonno, energia, umore e pressione vanno da 1 a
 *   7 e stanno insieme; lo sforzo va da 0 a 10 e ha il suo grafico. Due scale
 *   sullo stesso disegno inventano correlazioni che non ci sono.
 * - I colori delle quattro serie sono controllati per il daltonismo
 *   (lilla, verde, ambra, rosso, in quest'ordine). Verde e ambra sul bianco
 *   hanno poco contrasto: per questo ogni grafico ha la legenda, un valore
 *   scritto passando sopra, e la sua tabella.
 * - Il testo non prende mai il colore della serie: il colore sta nel segno
 *   accanto (la lineetta, il pallino), la parola resta in inchiostro.
 * - La mappa del corpo usa una sola tinta, dal chiaro allo scuro: piu' scuro
 *   vuol dire piu' volte. Mai un arcobaleno.
 */

export const SERIE = { lilla: '#866bf2', verde: '#10b981', ambra: '#f59e0b', rosso: '#c0392b' }
const INK = '#2c2c3a'
const MUTE = '#999691'
const GRIGLIA = '#e8e5e0'
const BASE = '#bcb8b5'
const VUOTO = '#f0ebe6'
/** corallo della mappa, dal chiaro allo scuro: controllata, il primo gradino si vede sul bianco */
const CORALLO = ['#f59a8b', '#f36b5b', '#d9503e', '#ab3a2a', '#782519']

const W = 720

/* ── la cornice di ogni grafico ───────────────────────────────────────────── */

export function Grafico({
  titolo,
  sotto,
  legenda,
  tabella,
  children,
}: {
  titolo: string
  sotto?: ReactNode
  legenda?: ReactNode
  tabella: ReactNode
  children: ReactNode
}) {
  const [vista, setVista] = useState<'grafico' | 'tabella'>('grafico')
  return (
    <section className={`${BLOCCO} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="m-0 text-[14px] font-bold">{titolo}</h3>
          {sotto && <p className="m-0 mt-[2px] text-[11.5px] leading-[1.45] text-ink-medio">{sotto}</p>}
        </div>
        <div role="group" aria-label={`Come vedere: ${titolo}`} className="flex rounded-pill border border-line bg-chip p-[2px]">
          {(['grafico', 'tabella'] as const).map((q) => (
            <button
              key={q}
              type="button"
              aria-pressed={vista === q}
              onClick={() => setVista(q)}
              className={`h-7 cursor-pointer rounded-pill px-3 text-[11.5px] font-bold ${
                vista === q ? 'bg-lime text-ink shadow-[0_0_0_1.5px_#2c2c3a]' : 'text-ink-mute'
              }`}
            >
              {q === 'grafico' ? 'Grafico' : 'Tabella'}
            </button>
          ))}
        </div>
      </div>
      {legenda && vista === 'grafico' && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{legenda}</div>}
      <div className="mt-3">
        {vista === 'grafico' ? children : <div className="max-h-[340px] overflow-auto">{tabella}</div>}
      </div>
    </section>
  )
}

export function Chiave({
  colore,
  forma = 'linea',
  children,
}: {
  colore: string
  forma?: 'linea' | 'punto' | 'anello' | 'meta-su' | 'meta-giu' | 'cornice' | 'quadro'
  children: ReactNode
}) {
  const segno = {
    linea: <span className="inline-block h-[2px] w-4 rounded-pill" style={{ background: colore }} />,
    punto: <span className="inline-block size-[9px] rounded-full" style={{ background: colore }} />,
    anello: <span className="inline-block size-[10px] rounded-full border-2 bg-surface" style={{ borderColor: colore }} />,
    quadro: <span className="inline-block size-[11px] rounded-[3px]" style={{ background: colore }} />,
    'meta-su': (
      <span className="inline-flex size-[12px] flex-col overflow-hidden rounded-[3px]" style={{ background: VUOTO }}>
        <span className="h-1/2" style={{ background: colore }} />
      </span>
    ),
    'meta-giu': (
      <span className="inline-flex size-[12px] flex-col justify-end overflow-hidden rounded-[3px]" style={{ background: VUOTO }}>
        <span className="h-1/2" style={{ background: colore }} />
      </span>
    ),
    cornice: <span className="inline-block size-[12px] rounded-[3px] border-[1.5px]" style={{ borderColor: colore, background: VUOTO }} />,
  }[forma]
  return (
    <span className="inline-flex items-center gap-[6px] text-[11.5px] text-ink-medio">
      <span aria-hidden className="inline-flex">{segno}</span>
      {children}
    </span>
  )
}

export function Tabella({ colonne, righe }: { colonne: string[]; righe: ReactNode[][] }) {
  if (righe.length === 0) return <Vuoto />
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead className="sticky top-0 bg-surface">
        <tr>
          {colonne.map((c, i) => (
            <th key={c} className={`border-b border-line px-2 py-[6px] text-[10.5px] font-bold tracking-[0.4px] text-ink-mute uppercase ${i ? 'text-right' : 'text-left'}`}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {righe.map((r, i) => (
          <tr key={i} className="border-b border-riga">
            {r.map((v, j) => (
              <td key={j} className={`px-2 py-[5px] ${j ? 'text-right tabular-nums' : 'whitespace-nowrap'}`}>
                {v ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Vuoto() {
  return <p className="m-0 py-6 text-center text-[12.5px] text-ink-mute">Niente in questo periodo.</p>
}

/** il fumetto che segue il puntatore: il valore prima, il nome dopo */
function Fumetto({ x, children }: { x: number; children: ReactNode }) {
  const destra = x > W * 0.6
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 min-w-[140px] rounded-[10px] border border-line bg-surface px-3 py-2 text-[11.5px] shadow-[2px_2px_0_rgba(44,44,58,0.18)]"
      style={{ left: `${(x / W) * 100}%`, transform: destra ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)' }}
    >
      {children}
    </div>
  )
}

function RigaFumetto({ colore, forma = 'linea', valore, nome }: { colore: string; forma?: 'linea' | 'punto'; valore: ReactNode; nome: string }) {
  return (
    <p className="m-0 flex items-center gap-2 py-[1px]">
      <span
        aria-hidden
        className={forma === 'linea' ? 'inline-block h-[2px] w-3 rounded-pill' : 'inline-block size-2 rounded-full'}
        style={{ background: colore }}
      />
      <b className="min-w-[34px] text-ink tabular-nums">{valore}</b>
      <span className="text-ink-medio">{nome}</span>
    </p>
  )
}

/** l'indice del giorno piu' vicino al puntatore */
function puntoVicino(e: PointerEvent<SVGSVGElement>, x0: number, passo: number, n: number): number {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * W
  return Math.max(0, Math.min(n - 1, Math.round((x - x0) / (passo || 1))))
}

function tacche(giorni: string[]): number[] {
  const n = giorni.length
  if (n <= 1) return [0]
  const quante = Math.min(6, n)
  return Array.from({ length: quante }, (_, k) => Math.round((k * (n - 1)) / (quante - 1)))
}

/* ── andamento: sonno, energia, umore, pressione ──────────────────────────── */

const SCALE_MATTINA = [
  { k: 'sleep', nome: 'Sonno', colore: SERIE.lilla },
  { k: 'energy', nome: 'Energia', colore: SERIE.verde },
  { k: 'mood', nome: 'Umore', colore: SERIE.ambra },
  { k: 'school_load', nome: 'Pressione', colore: SERIE.rosso },
] as const

export function Andamento({ checkins, dal, al }: { checkins: CheckIn[]; dal: string; al: string }) {
  const giorni = useMemo(() => giorniTra(dal, al), [dal, al])
  const pre = useMemo(() => new Map(checkins.filter((c) => c.kind === 'pre').map((c) => [c.local_date, c])), [checkins])
  const [su, setSu] = useState<number | null>(null)

  const H = 230
  const [l, r, t, b] = [26, 78, 12, 26]
  const passo = giorni.length > 1 ? (W - l - r) / (giorni.length - 1) : 0
  const x = (i: number) => l + i * passo
  const y = (v: number) => t + ((7 - v) / 6) * (H - t - b)
  const conPunti = giorni.length <= 31
  const presenti = giorni.filter((g) => pre.has(g))

  const linee = SCALE_MATTINA.map((s) => {
    let d = ''
    const punti: [number, number, boolean][] = []
    giorni.forEach((g, i) => {
      const v = pre.get(g)?.[s.k]
      if (v == null) return
      const prima = i > 0 && pre.get(giorni[i - 1])?.[s.k] != null
      const dopo = i < giorni.length - 1 && pre.get(giorni[i + 1])?.[s.k] != null
      d += `${prima ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`
      punti.push([i, v, !prima && !dopo])
    })
    return { ...s, d, punti }
  })

  // le etichette in fondo alle linee: solo quelle che non si pestano
  const fondo = linee
    .map((s) => ({ s, ultimo: s.punti.at(-1) }))
    .filter((q): q is { s: (typeof linee)[number]; ultimo: [number, number, boolean] } => !!q.ultimo)
    .sort((a, b2) => y(a.ultimo[1]) - y(b2.ultimo[1]))
  const posate: number[] = []
  const etichette = fondo.filter((q) => {
    const yy = y(q.ultimo[1])
    if (posate.some((p) => Math.abs(p - yy) < 12)) return false
    posate.push(yy)
    return true
  })

  const tabella = (
    <Tabella
      colonne={['Giorno', 'Sonno', 'Energia', 'Umore', 'Pressione']}
      righe={[...presenti].reverse().map((g) => {
        const c = pre.get(g)!
        return [dataLunga(g), c.sleep, c.energy, c.mood, c.school_load]
      })}
    />
  )

  return (
    <Grafico
      titolo="Come arriva la mattina"
      sotto="Dal check-in: da 1 a 7. Più in alto è più sonno, più energia, più umore, più pressione."
      legenda={SCALE_MATTINA.map((s) => (
        <Chiave key={s.k} colore={s.colore}>
          {s.nome}
        </Chiave>
      ))}
      tabella={tabella}
    >
      {presenti.length === 0 ? (
        <Vuoto />
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Sonno, energia, umore e pressione giorno per giorno. La stessa cosa è nella tabella."
            onPointerMove={(e) => setSu(puntoVicino(e, l, passo, giorni.length))}
            onPointerLeave={() => setSu(null)}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((v) => (
              <g key={v}>
                <line x1={l} x2={W - r} y1={y(v)} y2={y(v)} stroke={v === 1 ? BASE : GRIGLIA} strokeWidth={1} />
                <text x={l - 8} y={y(v) + 3.5} textAnchor="end" fontSize={10} fill={MUTE}>
                  {v}
                </text>
              </g>
            ))}
            {tacche(giorni).map((i) => (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={MUTE}>
                {dataBreve(giorni[i])}
              </text>
            ))}
            {su !== null && <line x1={x(su)} x2={x(su)} y1={t} y2={H - b} stroke={INK} strokeOpacity={0.35} strokeWidth={1} />}
            {linee.map((s) => (
              <g key={s.k}>
                <path d={s.d} fill="none" stroke={s.colore} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {s.punti
                  .filter(([i, , solo]) => conPunti || solo || i === su)
                  .map(([i, v]) => (
                    <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={s.colore} stroke="#fff" strokeWidth={2} />
                  ))}
              </g>
            ))}
            {etichette.map(({ s, ultimo }) => (
              <text key={s.k} x={x(ultimo[0]) + 9} y={y(ultimo[1]) + 3.5} fontSize={10.5} fill={INK}>
                {s.nome} {ultimo[1]}
              </text>
            ))}
          </svg>
          {su !== null && (
            <Fumetto x={x(su)}>
              <p className="m-0 mb-1 font-bold text-ink">{dataLunga(giorni[su])}</p>
              {pre.get(giorni[su]) ? (
                SCALE_MATTINA.map((s) => (
                  <RigaFumetto key={s.k} colore={s.colore} valore={pre.get(giorni[su])?.[s.k] ?? '—'} nome={s.nome} />
                ))
              ) : (
                <p className="m-0 text-ink-mute">nessun check-in</p>
              )}
            </Fumetto>
          )}
        </div>
      )}
    </Grafico>
  )
}

/* ── lo sforzo della sera ─────────────────────────────────────────────────── */

export function Sforzo({ checkins, dal, al, v }: { checkins: CheckIn[]; dal: string; al: string; v: Vocabolario }) {
  const giorni = useMemo(() => giorniTra(dal, al), [dal, al])
  const post = useMemo(
    () => new Map(checkins.filter((c) => c.kind === 'post' && c.effort !== null).map((c) => [c.local_date, c])),
    [checkins],
  )
  const [su, setSu] = useState<number | null>(null)

  const H = 190
  const [l, r, t, b] = [26, 12, 12, 26]
  const banda = (W - l - r) / Math.max(1, giorni.length)
  const spessore = Math.max(2, Math.min(24, banda - 2))
  const xc = (i: number) => l + banda * i + banda / 2
  const y = (n: number) => t + ((10 - n) / 10) * (H - t - b)
  const fatti = giorni.filter((g) => post.has(g))
  const media = fatti.length ? fatti.reduce((s, g) => s + (post.get(g)!.effort ?? 0), 0) / fatti.length : 0

  return (
    <Grafico
      titolo="Quanto sforzo la sera"
      sotto={
        fatti.length > 0
          ? `Dal check-out: da 0 a 10. In media ${media.toFixed(1).replace('.', ',')} / 10 su ${fatti.length} ${fatti.length === 1 ? 'sera' : 'sere'}.`
          : 'Dal check-out: da 0 a 10.'
      }
      tabella={
        <Tabella
          colonne={['Giorno', 'Sforzo', 'Soddisfazione']}
          righe={[...fatti].reverse().map((g) => [dataLunga(g), `${post.get(g)!.effort} / 10`, v.faccia(post.get(g)!.satisfaction) || '—'])}
        />
      }
    >
      {fatti.length === 0 ? (
        <Vuoto />
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Lo sforzo di ogni sera. La stessa cosa è nella tabella."
            onPointerMove={(e) => {
              const i = puntoVicino(e, l + banda / 2, banda, giorni.length)
              setSu(post.has(giorni[i]) ? i : null)
            }}
            onPointerLeave={() => setSu(null)}
          >
            {[0, 5, 10].map((n) => (
              <g key={n}>
                <line x1={l} x2={W - r} y1={y(n)} y2={y(n)} stroke={n === 0 ? BASE : GRIGLIA} strokeWidth={1} />
                <text x={l - 8} y={y(n) + 3.5} textAnchor="end" fontSize={10} fill={MUTE}>
                  {n}
                </text>
              </g>
            ))}
            {tacche(giorni).map((i) => (
              <text key={i} x={xc(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={MUTE}>
                {dataBreve(giorni[i])}
              </text>
            ))}
            {giorni.map((g, i) => {
              const c = post.get(g)
              if (!c || c.effort === null) return null
              const alto = y(0) - y(c.effort)
              const x0 = xc(i) - spessore / 2
              const raggio = Math.min(4, spessore / 2, alto)
              const top = y(c.effort)
              const d =
                alto <= 0
                  ? ''
                  : `M${x0} ${y(0)}V${top + raggio}Q${x0} ${top} ${x0 + raggio} ${top}H${x0 + spessore - raggio}Q${x0 + spessore} ${top} ${x0 + spessore} ${top + raggio}V${y(0)}Z`
              return <path key={g} d={d} fill={SERIE.lilla} fillOpacity={su === null || su === i ? 1 : 0.55} />
            })}
          </svg>
          {su !== null && post.get(giorni[su]) && (
            <Fumetto x={xc(su)}>
              <p className="m-0 mb-1 font-bold text-ink">{dataLunga(giorni[su])}</p>
              <RigaFumetto colore={SERIE.lilla} forma="punto" valore={`${post.get(giorni[su])!.effort} / 10`} nome="sforzo" />
              {post.get(giorni[su])!.satisfaction && (
                <p className="m-0 mt-1 text-ink-medio">{v.faccia(post.get(giorni[su])!.satisfaction)}</p>
              )}
            </Fumetto>
          )}
        </div>
      )}
    </Grafico>
  )
}

/* ── previsto e sentito ───────────────────────────────────────────────────── */

const RITMI_ALTO = ['upbeat', 'steady', 'gentle'] as const

export function PrevistoSentito({ checkins, dal, al, v }: { checkins: CheckIn[]; dal: string; al: string; v: Vocabolario }) {
  const giorni = useMemo(() => giorniTra(dal, al), [dal, al])
  const per = useMemo(() => {
    const m = new Map<string, { prev: string | null; sent: string | null }>()
    for (const c of checkins) {
      const q = m.get(c.local_date) ?? { prev: null, sent: null }
      if (c.kind === 'pre') q.prev = c.tempo_predicted
      else q.sent = c.tempo_chosen
      m.set(c.local_date, q)
    }
    return m
  }, [checkins])
  const [su, setSu] = useState<number | null>(null)

  const H = 150
  const [l, r, t, b] = [96, 14, 18, 26]
  const passo = giorni.length > 1 ? (W - l - r) / (giorni.length - 1) : 0
  const x = (i: number) => l + i * passo
  const y = (db: string) => t + (RITMI_ALTO.indexOf(db as (typeof RITMI_ALTO)[number]) * (H - t - b)) / 2
  const conDati = giorni.filter((g) => per.get(g)?.prev || per.get(g)?.sent)
  const tutti2 = conDati.filter((g) => per.get(g)?.prev && per.get(g)?.sent)
  const uguali = tutti2.filter((g) => per.get(g)!.prev === per.get(g)!.sent)

  return (
    <Grafico
      titolo="Previsto e sentito"
      sotto={
        tutti2.length > 0
          ? `Il ritmo che si aspettava la mattina e quello che il corpo ha chiesto la sera: coincidono ${uguali.length} volte su ${tutti2.length}.`
          : 'Il ritmo che si aspettava la mattina e quello che il corpo ha chiesto la sera.'
      }
      legenda={
        <>
          <Chiave colore={SERIE.lilla} forma="anello">
            Previsto la mattina
          </Chiave>
          <Chiave colore={SERIE.lilla} forma="punto">
            Sentito la sera
          </Chiave>
        </>
      }
      tabella={
        <Tabella
          colonne={['Giorno', 'Previsto', 'Sentito', 'Coincide']}
          righe={[...conDati].reverse().map((g) => {
            const q = per.get(g)!
            return [dataLunga(g), v.ritmo(q.prev) || '—', v.ritmo(q.sent) || '—', q.prev && q.sent ? (q.prev === q.sent ? 'sì' : 'no') : '—']
          })}
        />
      }
    >
      {conDati.length === 0 ? (
        <Vuoto />
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Ritmo previsto e ritmo sentito giorno per giorno. La stessa cosa è nella tabella."
            onPointerMove={(e) => setSu(puntoVicino(e, l, passo, giorni.length))}
            onPointerLeave={() => setSu(null)}
          >
            {RITMI_ALTO.map((db) => (
              <g key={db}>
                <line x1={l} x2={W - r} y1={y(db)} y2={y(db)} stroke={GRIGLIA} strokeWidth={1} />
                <text x={l - 10} y={y(db) + 3.5} textAnchor="end" fontSize={10.5} fill={INK}>
                  {v.ritmo(db)}
                </text>
              </g>
            ))}
            {tacche(giorni).map((i) => (
              <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={10} fill={MUTE}>
                {dataBreve(giorni[i])}
              </text>
            ))}
            {su !== null && <line x1={x(su)} x2={x(su)} y1={t - 8} y2={H - b + 6} stroke={INK} strokeOpacity={0.35} strokeWidth={1} />}
            {giorni.map((g, i) => {
              const q = per.get(g)
              if (!q) return null
              return (
                <g key={g}>
                  {q.prev && q.sent && q.prev !== q.sent && (
                    <line x1={x(i)} x2={x(i)} y1={y(q.prev)} y2={y(q.sent)} stroke={SERIE.lilla} strokeOpacity={0.45} strokeWidth={2} />
                  )}
                  {q.sent && <circle cx={x(i)} cy={y(q.sent)} r={4} fill={SERIE.lilla} stroke="#fff" strokeWidth={1.5} />}
                  {q.prev && <circle cx={x(i)} cy={y(q.prev)} r={6} fill="none" stroke={SERIE.lilla} strokeWidth={2} />}
                </g>
              )
            })}
          </svg>
          {su !== null && (
            <Fumetto x={x(su)}>
              <p className="m-0 mb-1 font-bold text-ink">{dataLunga(giorni[su])}</p>
              {per.get(giorni[su]) ? (
                <>
                  <p className="m-0 py-[1px]">
                    <b className="text-ink">{v.ritmo(per.get(giorni[su])!.prev) || '—'}</b>{' '}
                    <span className="text-ink-medio">previsto</span>
                  </p>
                  <p className="m-0 py-[1px]">
                    <b className="text-ink">{v.ritmo(per.get(giorni[su])!.sent) || '—'}</b>{' '}
                    <span className="text-ink-medio">sentito</span>
                  </p>
                </>
              ) : (
                <p className="m-0 text-ink-mute">nessun check-in</p>
              )}
            </Fumetto>
          )}
        </div>
      )}
    </Grafico>
  )
}

/* ── il calendario ────────────────────────────────────────────────────────── */

const GIORNI_CORTI = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export function Calendario({
  checkins,
  settimana,
  dal,
  al,
}: {
  checkins: CheckIn[]
  settimana: Impegno[]
  dal: string
  al: string
}) {
  const fatti = useMemo(() => {
    const m = new Map<string, { pre: boolean; post: boolean }>()
    for (const c of checkins) {
      const q = m.get(c.local_date) ?? { pre: false, post: false }
      if (c.kind === 'pre') q.pre = true
      else q.post = true
      m.set(c.local_date, q)
    }
    return m
  }, [checkins])
  const allena = useMemo(() => new Set(settimana.filter((s) => s.kind !== 'other').map((s) => s.weekday)), [settimana])
  const [su, setSu] = useState<string | null>(null)

  // dal lunedi' della prima settimana alla domenica dell'ultima
  const settimane = useMemo(() => {
    const inizio = new Date(`${dal}T12:00:00`)
    inizio.setDate(inizio.getDate() - ((inizio.getDay() + 6) % 7))
    const fine = new Date(`${al}T12:00:00`)
    const fuori: string[][] = []
    for (const d = new Date(inizio); d <= fine; ) {
      const riga: string[] = []
      for (let k = 0; k < 7; k++) {
        riga.push(iso(d))
        d.setDate(d.getDate() + 1)
      }
      fuori.push(riga)
    }
    return fuori
  }, [dal, al])

  const dentro = (g: string) => g >= dal && g <= al
  const dow = (g: string) => ((new Date(`${g}T12:00:00`).getDay() + 6) % 7) + 1
  const giorniAllena = settimane.flat().filter((g) => dentro(g) && allena.has(dow(g)))
  const conCheckIn = giorniAllena.filter((g) => fatti.get(g)?.pre)

  const leggi = (g: string) => {
    const q = fatti.get(g)
    return [
      dataLunga(g),
      q?.pre ? 'check-in fatto' : 'niente check-in',
      q?.post ? 'check-out fatto' : 'niente check-out',
      allena.has(dow(g)) ? 'giorno di allenamento' : null,
    ]
      .filter(Boolean)
      .join(' · ')
  }

  return (
    <Grafico
      titolo="Quando apre BAB"
      sotto={
        giorniAllena.length > 0
          ? `Nei giorni di allenamento ha fatto il check-in ${conCheckIn.length} volte su ${giorniAllena.length}.`
          : 'Metà in alto la mattina, metà in basso la sera.'
      }
      legenda={
        <>
          <Chiave colore={SERIE.verde} forma="meta-su">
            Check-in
          </Chiave>
          <Chiave colore={SERIE.verde} forma="meta-giu">
            Check-out
          </Chiave>
          <Chiave colore={SERIE.verde} forma="quadro">
            Tutti e due
          </Chiave>
          <Chiave colore={INK} forma="cornice">
            Giorno di allenamento
          </Chiave>
        </>
      }
      tabella={
        <Tabella
          colonne={['Settimana dal', 'Check-in', 'Check-out', 'Allenamenti', 'Con check-in']}
          righe={[...settimane].reverse().map((s) => {
            const d = s.filter(dentro)
            const al2 = d.filter((g) => allena.has(dow(g)))
            return [
              dataBreve(s[0]),
              d.filter((g) => fatti.get(g)?.pre).length,
              d.filter((g) => fatti.get(g)?.post).length,
              al2.length,
              al2.filter((g) => fatti.get(g)?.pre).length,
            ]
          })}
        />
      }
    >
      <div className="overflow-x-auto">
        <div className="inline-grid gap-[4px]" style={{ gridTemplateColumns: `52px repeat(7, 26px)` }}>
          <span />
          {GIORNI_CORTI.map((g, i) => (
            <span key={i} className="text-center text-[10px] font-bold text-ink-mute">
              {g}
            </span>
          ))}
          {settimane.map((s) => (
            <Settimana key={s[0]} s={s}>
              {s.map((g) => {
                const q = fatti.get(g)
                const colore = (acceso?: boolean) => (acceso ? SERIE.verde : VUOTO)
                if (!dentro(g)) return <span key={g} className="size-[26px]" />
                return (
                  <button
                    key={g}
                    type="button"
                    aria-label={leggi(g)}
                    onPointerEnter={() => setSu(g)}
                    onPointerLeave={() => setSu(null)}
                    onFocus={() => setSu(g)}
                    onBlur={() => setSu(null)}
                    className={`flex size-[26px] cursor-default flex-col overflow-hidden rounded-[5px] p-0 ${
                      allena.has(dow(g)) ? 'border-[1.5px] border-ink' : 'border-0'
                    } ${su === g ? 'outline-2 outline-offset-1 outline-ink' : ''}`}
                  >
                    <span className="block w-full flex-1" style={{ background: colore(q?.pre) }} />
                    <span className="block h-[2px] w-full bg-surface" />
                    <span className="block w-full flex-1" style={{ background: colore(q?.post) }} />
                  </button>
                )
              })}
            </Settimana>
          ))}
        </div>
      </div>
      <p className="m-0 mt-2 min-h-[18px] text-[11.5px] text-ink-medio" aria-live="polite">
        {su ? leggi(su) : 'Passa sopra a un giorno per leggerlo.'}
      </p>
    </Grafico>
  )
}

function Settimana({ s, children }: { s: string[]; children: ReactNode }) {
  return (
    <>
      <span className="self-center pr-1 text-right text-[10px] whitespace-nowrap text-ink-mute tabular-nums">{dataBreve(s[0])}</span>
      {children}
    </>
  )
}

/* ── la mappa del corpo ───────────────────────────────────────────────────── */

type Conto = { volte: number; intensita: number[]; protettive: number; parole: Map<string, number> }

export function MappaCorpo({ segnali, v }: { segnali: Segnale[]; v: Vocabolario }) {
  const conti = useMemo(() => {
    const m = new Map<string, Conto>()
    for (const s of segnali) {
      const q: Conto = m.get(s.region) ?? { volte: 0, intensita: [], protettive: 0, parole: new Map<string, number>() }
      q.volte++
      if (s.intensity !== null) q.intensita.push(s.intensity)
      if (s.is_red_flag) q.protettive++
      for (const p of s.sensation) q.parole.set(p, (q.parole.get(p) ?? 0) + 1)
      m.set(s.region, q)
    }
    return m
  }, [segnali])
  const [su, setSu] = useState<string | null>(null)

  const massimo = Math.max(0, ...[...conti.values()].map((q) => q.volte))
  const gradino = (n: number) => (n <= 0 ? -1 : Math.min(4, Math.ceil((n / massimo) * 5) - 1))
  const soglie = CORALLO.map((_, k) => {
    const da = Math.floor((massimo * k) / 5) + 1
    const a = Math.floor((massimo * (k + 1)) / 5)
    return da > a ? null : da === a ? `${a}` : `${da}–${a}`
  })

  const ordinate = [...conti.entries()].sort((a, b) => b[1].volte - a[1].volte)
  const media = (xs: number[]) => (xs.length ? (xs.reduce((s, n) => s + n, 0) / xs.length).toFixed(1).replace('.', ',') : '—')
  const racconta = (codice: string) => {
    const q = conti.get(codice)
    if (!q) return `${v.zona(codice)} · mai`
    const parole = [...q.parole.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([p]) => v.parola(p))
    return [
      v.zona(codice),
      `${q.volte} ${q.volte === 1 ? 'volta' : 'volte'}`,
      q.intensita.length ? `intensità media ${media(q.intensita)} / 10` : null,
      parole.length ? parole.join(', ') : null,
      q.protettive ? `${q.protettive} protettive` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  }

  const lato = (nome: string, piano: 'front' | 'back', ink: Ink) => (
    <figure className="m-0 flex flex-col items-center">
      <svg
        viewBox={`${ink[0] - 8} ${ink[1] - 8} ${ink[2] + 16} ${ink[3] + 16}`}
        className="block h-[300px] w-auto"
        role="group"
        aria-label={nome}
      >
        {ZONE[piano].map((z) => {
          const codice = codiceZona(piano, z.id)
          const q = conti.get(codice)
          const k = gradino(q?.volte ?? 0)
          return (
            <path
              key={z.id}
              d={z.d}
              fill={k < 0 ? VUOTO : CORALLO[k]}
              stroke={su === codice ? INK : 'none'}
              strokeWidth={su === codice ? 6 : 0}
              tabIndex={0}
              role="img"
              aria-label={racconta(codice)}
              onPointerEnter={() => setSu(codice)}
              onPointerLeave={() => setSu(null)}
              onFocus={() => setSu(codice)}
              onBlur={() => setSu(null)}
              className="outline-none"
            />
          )
        })}
        <path d={OUTLINE} fill={INK} fillRule="evenodd" pointerEvents="none" />
      </svg>
      <figcaption className="mt-1 text-[11px] font-bold text-ink-mute uppercase">{nome}</figcaption>
    </figure>
  )

  return (
    <Grafico
      titolo="Dove lo sente"
      sotto={segnali.length > 0 ? `${segnali.length} sensazioni in ${conti.size} zone. Più scuro, più volte.` : undefined}
      legenda={
        massimo > 0 ? (
          <span className="inline-flex flex-wrap items-center gap-[10px] text-[11.5px] text-ink-medio">
            <Chiave colore={VUOTO} forma="quadro">
              mai
            </Chiave>
            {CORALLO.map((c, k) =>
              soglie[k] ? (
                <Chiave key={c} colore={c} forma="quadro">
                  {soglie[k]}
                </Chiave>
              ) : null,
            )}
          </span>
        ) : undefined
      }
      tabella={
        <Tabella
          colonne={['Zona', 'Volte', 'Intensità media', 'Protettive']}
          righe={ordinate.map(([codice, q]) => [v.zona(codice), q.volte, q.intensita.length ? `${media(q.intensita)} / 10` : '—', q.protettive])}
        />
      }
    >
      {segnali.length === 0 ? (
        <Vuoto />
      ) : (
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex gap-4">
            {lato('Davanti', 'front', FRONT_INK)}
            {lato('Dietro', 'back', BACK_INK)}
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="m-0 min-h-[36px] text-[12px] leading-[1.5] text-ink" aria-live="polite">
              {su ? racconta(su) : 'Passa sopra a una zona per leggerla.'}
            </p>
            <p className="m-0 mt-3 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">Le zone più toccate</p>
            <ol className="m-0 mt-1 list-none p-0">
              {ordinate.slice(0, 6).map(([codice, q]) => (
                <li
                  key={codice}
                  className="flex items-center justify-between gap-3 border-b border-riga py-[5px] text-[12px]"
                  onPointerEnter={() => setSu(codice)}
                  onPointerLeave={() => setSu(null)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="size-[10px] shrink-0 rounded-[3px]" style={{ background: CORALLO[gradino(q.volte)] }} />
                    <span className="truncate">{v.zona(codice)}</span>
                  </span>
                  <span className="shrink-0 text-ink-medio tabular-nums">
                    <b className="text-ink">{q.volte}</b>
                    {q.intensita.length > 0 && ` · ${media(q.intensita)} / 10`}
                    {q.protettive > 0 && <span className="ml-1 text-rosso">● {q.protettive}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Grafico>
  )
}
