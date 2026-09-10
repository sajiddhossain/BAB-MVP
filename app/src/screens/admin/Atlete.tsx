import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { leggiAtlete } from '../../lib/admin'
import type { Atleta } from '../../lib/admin'
import { Telaio } from './Telaio'
import { normalizza } from './comune'

/**
 * Chi c'e'.
 *
 * Una riga per persona, e in ogni riga le tre cose che dicono se sta usando
 * BAB davvero: quanti giorni negli ultimi trenta, quand'e' l'ultima volta,
 * quanti check-out ha fatto sui check-in che ha cominciato.
 *
 * ── PERCHE' L'ULTIMA VOLTA E NON IL TOTALE ─────────────────────────────────
 * Perche' un totale alto non dice se e' ancora qui. Una che ha fatto quaranta
 * check-in e l'ultimo tre settimane fa e' un'altra storia da una che ne ha
 * fatti sei, tutti nell'ultima settimana — e in un elenco ordinato per totale
 * sarebbero nell'ordine sbagliato. Quindi si apre sull'ultima volta.
 *
 * ── IL CERCHIO CHIUSO ──────────────────────────────────────────────────────
 * `pre` e `post` stanno in due colonne separate e non sommati. Un check-in
 * senza il suo check-out non produce il confronto fra quello che si aspettava
 * e quello che ha sentito, che e' la cosa che BAB misura: se questa colonna
 * resta indietro, il pilota misura molto meno di quanto sembra.
 */

type Ordine = 'ultima' | 'nome' | 'iscritta' | 'giorni' | 'segnali'

const ORDINI: { id: Ordine; nome: string }[] = [
  { id: 'ultima', nome: 'Ultima volta' },
  { id: 'giorni', nome: 'Giorni in 30' },
  { id: 'segnali', nome: 'Sensazioni' },
  { id: 'iscritta', nome: 'Iscritta' },
  { id: 'nome', nome: 'Nome' },
]

export function Atlete() {
  const [righe, setRighe] = useState<Atleta[] | null>(null)
  const [letto, setLetto] = useState(false)
  const [cerca, setCerca] = useState('')
  const [ordine, setOrdine] = useState<Ordine>('ultima')

  useEffect(() => {
    void leggiAtlete().then((a) => {
      setRighe(a)
      setLetto(true)
    })
  }, [])

  const viste = useMemo(() => {
    if (!righe) return []
    const q = normalizza(cerca)
    const filtrate =
      q === ''
        ? righe
        : righe.filter((a) =>
            normalizza(
              `${a.display_name} ${a.email ?? ''} ${a.athlete_code ?? ''} ${a.sport ?? ''} ${(a.sports ?? []).join(' ')}`,
            ).includes(q),
          )
    const per = [...filtrate]
    per.sort((x, y) => {
      switch (ordine) {
        case 'nome':
          return x.display_name.localeCompare(y.display_name, 'it')
        case 'iscritta':
          return y.created_at.localeCompare(x.created_at)
        case 'giorni':
          return y.days_30d - x.days_30d || y.checkins - x.checkins
        case 'segnali':
          return y.signals - x.signals
        default:
          // chi non ha mai fatto niente sta in fondo, non in cima
          return (y.last_day ?? '').localeCompare(x.last_day ?? '')
      }
    })
    return per
  }, [righe, cerca, ordine])

  return (
    <Telaio
      nome="Le atlete"
      sotto={letto && righe ? `${righe.length} in tutto` : undefined}
      destra={
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Nome, mail, sport…"
            aria-label="Cerca un’atleta"
            className="h-8 w-[200px] rounded-pill border border-line bg-chip px-3 text-[12px] outline-none placeholder:text-ink-mute focus:border-verde-acceso focus:bg-surface"
          />
          <select
            value={ordine}
            onChange={(e) => setOrdine(e.target.value as Ordine)}
            aria-label="Come ordinare l’elenco"
            className="h-8 rounded-pill border border-line bg-chip px-3 text-[12px] outline-none"
          >
            {ORDINI.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="p-6">
        {!letto && <p className="m-0 text-[13px] text-ink-mute">Leggo…</p>}
        {letto && !righe && <Manca />}
        {letto && righe && righe.length === 0 && (
          <p className="m-0 text-[13px] text-ink-medio">
            Non c’è ancora nessuna. La prima riga comparirà quando qualcuno finirà l’onboarding.
          </p>
        )}
        {letto && righe && righe.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] tracking-[0.5px] text-ink-mute uppercase">
                    <Th>Chi</Th>
                    <Th>Età</Th>
                    <Th>Sport</Th>
                    <Th numero>Pre</Th>
                    <Th numero>Post</Th>
                    <Th numero>Giorni 7</Th>
                    <Th numero>Giorni 30</Th>
                    <Th numero>Corpo</Th>
                    <Th numero>Lezioni</Th>
                    <Th>Ultima volta</Th>
                  </tr>
                </thead>
                <tbody>
                  {viste.map((a) => (
                    <Riga key={a.id} a={a} />
                  ))}
                </tbody>
              </table>
            </div>
            {viste.length === 0 && (
              <p className="m-0 mt-4 text-[13px] text-ink-medio">Nessuna con queste parole.</p>
            )}
          </>
        )}
      </div>
    </Telaio>
  )
}

function Th({ children, numero }: { children: ReactNode; numero?: boolean }) {
  return (
    <th className={`border-b border-line px-2 py-2 font-bold ${numero ? 'text-right' : ''}`}>
      {children}
    </th>
  )
}

function Riga({ a }: { a: Atleta }) {
  const ferma = a.last_day ? giorniDa(a.last_day) : null
  return (
    <tr className="border-b border-riga align-middle hover:bg-chip">
      <td className="px-2 py-[7px]">
        <Link to={`/admin/atlete/${a.id}`} className="text-ink no-underline">
          <span className="block font-bold">{a.display_name}</span>
          <span className="block text-[11px] text-ink-mute">
            {a.email ?? a.athlete_code ?? a.id.slice(0, 8)}
          </span>
        </Link>
      </td>
      <td className="px-2 py-[7px] tabular-nums">{a.age}</td>
      <td className="px-2 py-[7px] text-ink-medio">{a.sport ?? '—'}</td>
      <td className="px-2 py-[7px] text-right tabular-nums">{a.checkins_pre}</td>
      {/*
        Il post in grigio quando e' sotto alla meta' dei pre: e' il modo piu'
        corto di far vedere chi comincia e non chiude, senza una colonna in
        piu' che dica la stessa cosa in percentuale.
      */}
      <td
        className={`px-2 py-[7px] text-right tabular-nums ${
          a.checkins_pre > 1 && a.checkins_post * 2 < a.checkins_pre ? 'text-ink-mute' : ''
        }`}
      >
        {a.checkins_post}
      </td>
      <td className="px-2 py-[7px] text-right tabular-nums">{a.days_7d}</td>
      <td className="px-2 py-[7px] text-right tabular-nums">{a.days_30d}</td>
      <td className="px-2 py-[7px] text-right tabular-nums">
        {a.signals}
        {a.signals_flagged > 0 && (
          <span className="ml-1 text-rosso" title={`${a.signals_flagged} segnate come dolore protettivo`}>
            ●
          </span>
        )}
      </td>
      <td className="px-2 py-[7px] text-right tabular-nums text-ink-medio">{a.lessons_done}/8</td>
      <td className="px-2 py-[7px] whitespace-nowrap">
        {a.last_day ? (
          <span className={ferma !== null && ferma > 13 ? 'text-ink-mute' : ''}>
            {quando(ferma)}
          </span>
        ) : (
          <span className="text-ink-mute">mai</span>
        )}
      </td>
    </tr>
  )
}

function Manca() {
  return (
    <div className="max-w-[560px] rounded-[14px] border-[1.5px] border-line bg-surface p-5">
      <p className="m-0 text-[14px] font-bold">Il database non ha ancora queste viste.</p>
      <p className="m-0 mt-2 text-[12.5px] leading-[1.6] text-ink-medio">
        L’elenco delle atlete vive in <code>admin_athletes</code> e nelle viste che le stanno
        intorno. Finché non le crei, un amministratore non può leggere i check-in di nessuno — è
        così che è fatto lo schema, non è un guasto.
      </p>
      <p className="m-0 mt-3 text-[12.5px] leading-[1.6] text-ink-medio">
        Si aprono lanciando <code>app/supabase/migrazione-pannello.sql</code> nell’editor SQL di
        Supabase, una volta sola.
      </p>
    </div>
  )
}

/** quanti giorni fa, da una data `2026-09-08` */
function giorniDa(giorno: string): number {
  const oggi = new Date()
  const q = new Date(`${giorno}T12:00:00`)
  return Math.round((oggi.getTime() - q.getTime()) / 86_400_000)
}

function quando(giorni: number | null): string {
  if (giorni === null) return 'mai'
  if (giorni <= 0) return 'oggi'
  if (giorni === 1) return 'ieri'
  if (giorni < 14) return `${giorni} giorni fa`
  if (giorni < 60) return `${Math.round(giorni / 7)} settimane fa`
  return `${Math.round(giorni / 30)} mesi fa`
}
