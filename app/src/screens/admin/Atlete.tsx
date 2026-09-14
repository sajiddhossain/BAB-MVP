import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { leggiAtlete } from '../../lib/admin'
import type { Atleta, CheckIn } from '../../lib/admin'
import { cancellaAtleta, leggiAmministratori, leggiTutto } from '../../lib/gestione'
import type { Tutto } from '../../lib/gestione'
import { Telaio } from './Telaio'
import { normalizza } from './comune'
import { useVocabolario } from './vocabolario'
import { SERIE } from './grafici'
import {
  BLOCCO,
  CAMPO,
  Chip,
  ConfermaCancella,
  Finestra,
  Iniziale,
  Numero,
  Tasto,
  csv,
  data,
  dataLunga,
  giorniDa,
  giornoFa,
  quando,
  scaricaFile,
} from './pezzi'
import { COLONNE_RISPOSTE, COLONNE_SENSAZIONI, doveCade, rigaRisposta, rigaSensazione } from './risposte'

/**
 * Chi c'e'.
 *
 * Una riga per persona, e in ogni riga le cose che dicono se sta usando BAB
 * davvero: gli ultimi quattordici giorni a colpo d'occhio, quanti check-out
 * sui check-in cominciati, quand'e' l'ultima volta.
 *
 * ── DALL'ALTO IN BASSO ─────────────────────────────────────────────────────
 * I numeri, poi una riga sola di filtri, poi l'elenco. I numeri si calcolano
 * sulle righe filtrate: filtrando «Volley Under 16» dicono come va quella
 * squadra, non tutte. Numeri e righe devono sempre andare d'accordo.
 *
 * I filtri e l'ordine stanno nell'indirizzo, cosi' un elenco filtrato si
 * manda a un'altra persona com'e'.
 *
 * ── SUL TELEFONO ───────────────────────────────────────────────────────────
 * Una tabella da quattordici colonne in 375 pixel si legge solo scorrendo di
 * lato, e scorrendo di lato si perde il nome. Li' ogni atleta e' una scheda,
 * e i filtri — che occuperebbero mezzo schermo — stanno in un foglio dal
 * basso dietro a un bottone che dice quanti sono accesi.
 *
 * ── PERCHE' L'ULTIMA VOLTA E NON IL TOTALE ─────────────────────────────────
 * Perche' un totale alto non dice se e' ancora qui. Una che ha fatto quaranta
 * check-in e l'ultimo tre settimane fa e' un'altra storia da una che ne ha
 * fatti sei, tutti nell'ultima settimana. Quindi si apre sull'ultima volta.
 *
 * ── IL CERCHIO CHIUSO ──────────────────────────────────────────────────────
 * `pre` e `post` stanno in due colonne separate e non sommati. Un check-in
 * senza il suo check-out non produce il confronto fra quello che si aspettava
 * e quello che ha sentito, che e' la cosa che BAB misura.
 */

type Stato = 'tutte' | 'attive' | 'ferme' | 'mai' | 'tutorial'
const STATI: { id: Stato; nome: string; vale: (a: Atleta) => boolean }[] = [
  { id: 'tutte', nome: 'Tutte', vale: () => true },
  { id: 'attive', nome: 'Attive in 7 giorni', vale: (a) => a.days_7d > 0 },
  { id: 'ferme', nome: 'Ferme da 2 settimane', vale: (a) => !!a.last_day && giorniDa(a.last_day) >= 14 },
  { id: 'mai', nome: 'Mai iniziato', vale: (a) => a.checkins === 0 },
  { id: 'tutorial', nome: 'Tutorial non finito', vale: (a) => !a.tutorial_done },
]

const ETA: { id: string; nome: string; vale: (n: number) => boolean }[] = [
  { id: '12-14', nome: '12–14 anni', vale: (n) => n <= 14 },
  { id: '15-17', nome: '15–17 anni', vale: (n) => n >= 15 && n <= 17 },
  { id: '18', nome: '18 e più', vale: (n) => n >= 18 },
]

type Colonna =
  | 'nome'
  | 'eta'
  | 'squadra'
  | 'sport'
  | 'pre'
  | 'post'
  | 'chiusi'
  | 'giorni7'
  | 'giorni30'
  | 'corpo'
  | 'lezioni'
  | 'ultima'

const NOMI_COLONNE: Record<Colonna, string> = {
  nome: 'Chi',
  eta: 'Età',
  squadra: 'Squadra',
  sport: 'Sport',
  pre: 'Pre',
  post: 'Post',
  chiusi: 'Chiusi',
  giorni7: 'Giorni 7',
  giorni30: 'Giorni 30',
  corpo: 'Corpo',
  lezioni: 'Lezioni',
  ultima: 'Ultima volta',
}

const chiusi = (a: Atleta) => (a.checkins_pre > 0 ? a.checkins_post / a.checkins_pre : -1)

const CONFRONTA: Record<Colonna, (x: Atleta, y: Atleta) => number> = {
  nome: (x, y) => x.display_name.localeCompare(y.display_name, 'it'),
  eta: (x, y) => x.age - y.age,
  squadra: (x, y) => (x.team_name ?? '~').localeCompare(y.team_name ?? '~', 'it'),
  sport: (x, y) => (x.sport ?? '~').localeCompare(y.sport ?? '~', 'it'),
  pre: (x, y) => x.checkins_pre - y.checkins_pre,
  post: (x, y) => x.checkins_post - y.checkins_post,
  chiusi: (x, y) => chiusi(x) - chiusi(y),
  giorni7: (x, y) => x.days_7d - y.days_7d,
  giorni30: (x, y) => x.days_30d - y.days_30d,
  corpo: (x, y) => x.signals - y.signals,
  lezioni: (x, y) => x.lessons_done - y.lessons_done,
  // chi non ha mai fatto niente sta in fondo, non in cima
  ultima: (x, y) => (x.last_day ?? '').localeCompare(y.last_day ?? ''),
}

/** le colonne che hanno senso lette dalla piu' alta: si aprono al contrario */
const PRIMA_ALTO = new Set<Colonna>(['pre', 'post', 'chiusi', 'giorni7', 'giorni30', 'corpo', 'lezioni', 'ultima'])

type Striscia = Map<string, { pre: boolean; post: boolean }>

export function Atlete() {
  const v = useVocabolario()
  const [righe, setRighe] = useState<Atleta[] | null>(null)
  const [letto, setLetto] = useState(false)
  const [giro, setGiro] = useState(0)
  const [admin, setAdmin] = useState<Set<string>>(new Set())
  const [strisce, setStrisce] = useState<Map<string, Striscia>>(new Map())
  const [recenti, setRecenti] = useState<Tutto | null>(null)
  const [scelte, setScelte] = useState<Set<string>>(new Set())
  const [cancella, setCancella] = useState<Atleta[] | null>(null)
  const [avviso, setAvviso] = useState<{ testo: string; male?: boolean } | null>(null)
  const [esporto, setEsporto] = useState(false)
  const [foglioFiltri, setFoglioFiltri] = useState(false)

  const [query, setQuery] = useSearchParams()
  const cerca = query.get('cerca') ?? ''
  const stato = (STATI.find((s) => s.id === query.get('stato'))?.id ?? 'tutte') as Stato
  const sport = query.get('sport') ?? ''
  const squadra = query.get('squadra') ?? ''
  const eta = query.get('eta') ?? ''
  const ordine = (query.get('ordine') as Colonna | null) ?? 'ultima'
  const verso = query.get('verso') === 'su' ? 1 : -1
  const imposta = (k: string, valore: string) =>
    setQuery(
      (q) => {
        const n = new URLSearchParams(q)
        if (valore) n.set(k, valore)
        else n.delete(k)
        return n
      },
      { replace: true },
    )

  useEffect(() => {
    let vivo = true
    void (async () => {
      const [a, adm, tutto] = await Promise.all([leggiAtlete(), leggiAmministratori(), leggiTutto(giornoFa(13))])
      if (!vivo) return
      setRighe(a)
      setAdmin(adm)
      const m = new Map<string, Striscia>()
      for (const c of tutto?.checkins ?? []) {
        const di: Striscia = m.get(c.athlete_id) ?? new Map()
        const q = di.get(c.local_date) ?? { pre: false, post: false }
        q[c.kind] = true
        di.set(c.local_date, q)
        m.set(c.athlete_id, di)
      }
      setStrisce(m)
      setRecenti(tutto)
      setLetto(true)
    })()
    return () => {
      vivo = false
    }
  }, [giro])

  useEffect(() => {
    if (!avviso) return
    const t = setTimeout(() => setAvviso(null), 6000)
    return () => clearTimeout(t)
  }, [avviso])

  /* prima i filtri che non sono lo stato, cosi' i contatori dei chip dicono il vero */
  const base = useMemo(() => {
    if (!righe) return []
    const q = normalizza(cerca)
    return righe.filter(
      (a) =>
        (q === '' ||
          normalizza(
            `${a.display_name} ${a.email ?? ''} ${a.athlete_code ?? ''} ${a.sport ?? ''} ${(a.sports ?? []).join(' ')} ${a.team_name ?? ''}`,
          ).includes(q)) &&
        (!sport || (a.sports ?? [a.sport]).includes(sport)) &&
        (!squadra || (squadra === '-' ? !a.team_name : a.team_name === squadra)) &&
        (!eta || !!ETA.find((e) => e.id === eta)?.vale(a.age)),
    )
  }, [righe, cerca, sport, squadra, eta])

  const viste = useMemo(() => {
    const vale = STATI.find((s) => s.id === stato)!.vale
    const f = CONFRONTA[ordine] ?? CONFRONTA.ultima
    return base.filter(vale).sort((x, y) => f(x, y) * verso || x.display_name.localeCompare(y.display_name, 'it'))
  }, [base, stato, ordine, verso])

  const tuttiSport = useMemo(
    () => [...new Set((righe ?? []).flatMap((a) => a.sports ?? [a.sport]).filter((s): s is string => !!s))].sort(),
    [righe],
  )
  const tutteSquadre = useMemo(
    () => [...new Set((righe ?? []).map((a) => a.team_name).filter((s): s is string => !!s))].sort(),
    [righe],
  )

  const scelteViste = viste.filter((a) => scelte.has(a.id))
  const tutteScelte = viste.length > 0 && scelteViste.length === viste.length
  const filtri = !!(cerca || stato !== 'tutte' || sport || squadra || eta)
  /** quanti filtri sono accesi nel foglio: la ricerca sta fuori, e non conta */
  const accesi = [stato !== 'tutte', sport, squadra, eta].filter(Boolean).length

  function ordina(c: Colonna) {
    setQuery(
      (q) => {
        const n = new URLSearchParams(q)
        const giaQui = (n.get('ordine') ?? 'ultima') === c
        const su = giaQui ? n.get('verso') !== 'su' : !PRIMA_ALTO.has(c)
        n.set('ordine', c)
        if (su) n.set('verso', 'su')
        else n.delete('verso')
        return n
      },
      { replace: true },
    )
  }

  /** dal menu del foglio: la colonna scelta, nel suo verso naturale */
  function ordinaPer(c: Colonna) {
    setQuery(
      (q) => {
        const n = new URLSearchParams(q)
        n.set('ordine', c)
        if (PRIMA_ALTO.has(c)) n.delete('verso')
        else n.set('verso', 'su')
        return n
      },
      { replace: true },
    )
  }

  function scegli(id: string) {
    setScelte((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  /* ── i file ── */

  const oggi = giornoFa(0)
  function scaricaElenco(chi: Atleta[]) {
    scaricaFile(
      `bab-atlete-${oggi}.csv`,
      csv(
        ['Nome', 'Mail', 'Codice', 'Età', 'Nata il', 'Sport', 'Squadra', 'Iscritta il', 'Tutorial finito il', 'Check-in', 'Check-out', 'Chiusi %', 'Giorni attivi 7', 'Giorni attivi 30', 'Primo giorno', 'Ultimo giorno', 'Sensazioni', 'Protettive', 'Lezioni su 8', 'Date del ciclo', 'Consenso'],
        chi.map((a) => [
          a.display_name,
          a.email,
          a.athlete_code,
          a.age,
          a.birth_date,
          (a.sports ?? [a.sport]).filter(Boolean).join(', '),
          a.team_name,
          a.created_at.slice(0, 10),
          a.tutorial_done?.slice(0, 10) ?? null,
          a.checkins_pre,
          a.checkins_post,
          a.checkins_pre ? Math.round((a.checkins_post / a.checkins_pre) * 100) : null,
          a.days_7d,
          a.days_30d,
          a.first_day,
          a.last_day,
          a.signals,
          a.signals_flagged,
          a.lessons_done,
          a.cycle_marks,
          a.consent_ok === null ? 'non richiesto' : a.consent_ok,
        ]),
      ),
    )
  }

  async function scaricaRisposte(chi: Atleta[], cosa: 'risposte' | 'sensazioni') {
    setEsporto(true)
    const tutto = await leggiTutto(null)
    setEsporto(false)
    if (!tutto) return setAvviso({ testo: 'Non riesco a leggere le risposte.', male: true })
    const per = new Map(chi.map((a) => [a.id, a]))
    const testa = (id: string) => [per.get(id)!.display_name, per.get(id)!.email]
    if (cosa === 'risposte') {
      const segnaliDi = new Map<string, typeof tutto.segnali>()
      for (const s of tutto.segnali) if (s.check_in_id) segnaliDi.set(s.check_in_id, [...(segnaliDi.get(s.check_in_id) ?? []), s])
      const righe2 = tutto.checkins
        .filter((c) => per.has(c.athlete_id))
        .sort((a, b) => a.local_date.localeCompare(b.local_date) || a.kind.localeCompare(b.kind) * -1)
        .map((c: CheckIn) => [...testa(c.athlete_id), ...rigaRisposta(c, v, segnaliDi.get(c.id) ?? [], tutto.parole?.checkins[c.id])])
      scaricaFile(`bab-risposte-${oggi}.csv`, csv(['Nome', 'Mail', ...COLONNE_RISPOSTE], righe2))
    } else {
      const cade = doveCade(tutto.checkins)
      const righe2 = tutto.segnali
        .filter((s) => per.has(s.athlete_id))
        .map((s) => {
          const q = cade(s)
          return [...testa(s.athlete_id), ...rigaSensazione(s, v, q.giorno, q.momento, tutto.parole?.segnali[s.id])]
        })
      scaricaFile(`bab-sensazioni-${oggi}.csv`, csv(['Nome', 'Mail', ...COLONNE_SENSAZIONI], righe2))
    }
  }

  /* ── i numeri in cima, sulle righe filtrate ── */

  /* gli account di prova si vedono in elenco, ma non contano: ne' nei numeri ne' nei file di tutte */
  const vere = useMemo(() => viste.filter((a) => !a.is_test), [viste])
  const somma = (f: (a: Atleta) => number) => vere.reduce((s, a) => s + f(a), 0)
  const pre = somma((a) => a.checkins_pre)
  const protettive = somma((a) => a.signals_flagged)

  const giorni14 = useMemo(() => Array.from({ length: 14 }, (_, i) => giornoFa(13 - i)), [])

  /*
   * Le lineette sotto ai numeri, sulle stesse righe filtrate dei numeri: se
   * il numero parla di una squadra, anche la sua linea.
   */
  const andamenti = useMemo(() => {
    const ids = new Set(vere.map((a) => a.id))
    const c = (recenti?.checkins ?? []).filter((x) => ids.has(x.athlete_id))
    const s = (recenti?.segnali ?? []).filter((x) => ids.has(x.athlete_id))
    const attive = giorni14.map((g) => new Set(c.filter((x) => x.local_date === g).map((x) => x.athlete_id)).size)
    return {
      atlete: giorni14.map((g) => vere.filter((a) => a.created_at.slice(0, 10) <= g).length),
      attive,
      chiusi: giorni14.map((g) => {
        const quanti = c.filter((x) => x.local_date === g && x.kind === 'pre').length
        return quanti ? Math.round((c.filter((x) => x.local_date === g && x.kind === 'post').length / quanti) * 100) : null
      }),
      protettive: giorni14.map((g) => s.filter((x) => x.is_red_flag && x.created_at.slice(0, 10) === g).length),
    }
  }, [vere, recenti, giorni14])

  /* i filtri: gli stessi nella riga del computer e nel foglio del telefono */
  const controlli = (nelFoglio: boolean) => (
    <>
      <div role="group" aria-label="Stato" className="flex flex-wrap gap-1">
        {STATI.map((s) => (
          <Chip
            key={s.id}
            acceso={stato === s.id}
            onClick={() => imposta('stato', s.id === 'tutte' ? '' : s.id)}
            conta={base.filter(s.vale).length}
          >
            {s.nome}
          </Chip>
        ))}
      </div>
      <select value={sport} onChange={(e) => imposta('sport', e.target.value)} aria-label="Sport" className={`${CAMPO} ${nelFoglio ? 'w-full' : ''}`}>
        <option value="">Ogni sport</option>
        {tuttiSport.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select value={squadra} onChange={(e) => imposta('squadra', e.target.value)} aria-label="Squadra" className={`${CAMPO} ${nelFoglio ? 'w-full' : ''}`}>
        <option value="">Ogni squadra</option>
        {tutteSquadre.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
        <option value="-">Senza squadra</option>
      </select>
      <select value={eta} onChange={(e) => imposta('eta', e.target.value)} aria-label="Età" className={`${CAMPO} ${nelFoglio ? 'w-full' : ''}`}>
        <option value="">Ogni età</option>
        {ETA.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </select>
      {nelFoglio && (
        <select
          value={ordine}
          onChange={(e) => ordinaPer(e.target.value as Colonna)}
          aria-label="Come ordinare l’elenco"
          className={`${CAMPO} w-full`}
        >
          {(Object.keys(NOMI_COLONNE) as Colonna[]).map((c) => (
            <option key={c} value={c}>
              {NOMI_COLONNE[c]}
            </option>
          ))}
        </select>
      )}
    </>
  )

  const togli = () => {
    const n = new URLSearchParams()
    if (query.get('ordine')) n.set('ordine', query.get('ordine')!)
    if (query.get('verso')) n.set('verso', query.get('verso')!)
    setQuery(n, { replace: true })
  }

  return (
    <Telaio
      nome="Le atlete"
      sotto={letto && righe ? `${righe.length} in tutto` : undefined}
      destra={
        letto && righe && righe.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="hidden text-[11.5px] text-ink-mute lg:inline">{filtri ? 'Scarica le filtrate:' : 'Scarica:'}</span>
            <Tasto piccolo onClick={() => scaricaElenco(vere)} disabled={vere.length === 0}>
              Elenco CSV
            </Tasto>
            <Tasto piccolo onClick={() => void scaricaRisposte(vere, 'risposte')} disabled={vere.length === 0 || esporto}>
              Risposte CSV
            </Tasto>
            <Tasto piccolo onClick={() => void scaricaRisposte(vere, 'sensazioni')} disabled={vere.length === 0 || esporto}>
              Sensazioni CSV
            </Tasto>
          </div>
        ) : undefined
      }
    >
      <div className="p-4 md:p-6">
        {!letto && <p className="m-0 text-[13px] text-ink-mute">Leggo…</p>}
        {letto && !righe && <Manca />}
        {letto && righe && righe.length === 0 && (
          <p className="m-0 text-[13px] text-ink-medio">
            Non c’è ancora nessuna. La prima riga comparirà quando qualcuno finirà l’onboarding.
          </p>
        )}
        {letto && righe && righe.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Numero
                quanto={vere.length}
                cosa={filtri ? 'in questo elenco' : 'atlete'}
                nota={filtri ? `su ${righe.filter((a) => !a.is_test).length}` : undefined}
                andamento={andamenti.atlete}
              />
              <Numero quanto={vere.filter((a) => a.days_7d > 0).length} cosa="attive negli ultimi 7 giorni" andamento={andamenti.attive} />
              <Numero quanto={vere.filter((a) => a.last_day === oggi).length} cosa="hanno fatto qualcosa oggi" andamento={andamenti.attive} />
              <Numero
                quanto={pre > 0 ? `${Math.round((somma((a) => a.checkins_post) / pre) * 100)}%` : '—'}
                cosa="check-in chiusi col check-out"
                nota={`${somma((a) => a.checkins_post)} su ${pre}`}
                andamento={andamenti.chiusi}
              />
              <Numero
                quanto={protettive}
                cosa="sensazioni segnate protettive"
                allarme={protettive > 0}
                andamento={andamenti.protettive}
              />
              <Numero quanto={vere.filter((a) => !a.tutorial_done).length} cosa="tutorial non finito" />
            </div>
            {viste.length > vere.length && (
              <p className="m-0 mt-2 text-[11.5px] text-ink-mute">
                {viste.length - vere.length === 1
                  ? '1 account di prova in elenco: non entra nei numeri né nei file.'
                  : `${viste.length - vere.length} account di prova in elenco: non entrano nei numeri né nei file.`}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={cerca}
                onChange={(e) => imposta('cerca', e.target.value)}
                placeholder="Nome, mail, sport…"
                aria-label="Cerca un’atleta"
                className={`${CAMPO} min-w-0 flex-1 md:w-[200px] md:flex-none`}
              />
              <div className="contents max-md:hidden">{controlli(false)}</div>
              <button
                type="button"
                onClick={() => setFoglioFiltri(true)}
                className={`bab-tocco flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-ink px-4 text-[14px] font-bold text-ink md:hidden ${
                  accesi > 0 ? 'bg-lime' : 'bg-surface'
                }`}
              >
                Filtri
                {accesi > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-ink text-[11px] text-lime">{accesi}</span>
                )}
              </button>
              {filtri && (
                <button
                  type="button"
                  onClick={togli}
                  className="h-8 cursor-pointer rounded-pill px-2 text-[12px] font-bold text-ink-medio underline max-md:hidden"
                >
                  Togli i filtri
                </button>
              )}
            </div>

            {avviso && (
              <p role="status" className={`m-0 mt-3 text-[12.5px] font-bold ${avviso.male ? 'text-rosso' : 'text-verde-acceso'}`}>
                {avviso.testo}
              </p>
            )}

            {scelteViste.length > 0 && (
              <div className="sticky top-2 z-20 mt-3 flex flex-wrap items-center gap-2 rounded-[14px] border-[1.5px] border-ink bg-lime px-3 py-2 shadow-[3px_3px_0_rgba(44,44,58,0.9)] md:px-4">
                <span className="mr-1 text-[13px] font-bold">
                  {scelteViste.length} {scelteViste.length === 1 ? 'selezionata' : 'selezionate'}
                </span>
                <Tasto piccolo onClick={() => scaricaElenco(scelteViste)}>
                  Elenco CSV
                </Tasto>
                <Tasto piccolo onClick={() => void scaricaRisposte(scelteViste, 'risposte')} disabled={esporto}>
                  Risposte CSV
                </Tasto>
                <Tasto piccolo onClick={() => void scaricaRisposte(scelteViste, 'sensazioni')} disabled={esporto}>
                  Sensazioni CSV
                </Tasto>
                <Tasto
                  piccolo
                  tipo="pericolo"
                  onClick={() => setCancella(scelteViste.filter((a) => !admin.has(a.id)))}
                  disabled={scelteViste.every((a) => admin.has(a.id))}
                >
                  Cancella
                </Tasto>
                <span className="flex-1" />
                <button type="button" onClick={() => setScelte(new Set())} className="h-9 cursor-pointer text-[12px] font-bold text-ink underline">
                  Deseleziona
                </button>
              </div>
            )}

            {/* dal tablet in su: la tabella */}
            <div className="mt-3 hidden overflow-x-auto rounded-[14px] border-[1.5px] border-line bg-surface md:block">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] tracking-[0.5px] text-ink-mute uppercase">
                    <th className="w-9 border-b border-line py-2 pl-3">
                      <input
                        type="checkbox"
                        checked={tutteScelte}
                        ref={(el) => {
                          if (el) el.indeterminate = scelteViste.length > 0 && !tutteScelte
                        }}
                        onChange={() => setScelte(tutteScelte ? new Set() : new Set(viste.map((a) => a.id)))}
                        aria-label="Seleziona tutte quelle in elenco"
                        className="size-4 cursor-pointer accent-ink"
                      />
                    </th>
                    {(['nome', 'eta', 'squadra', 'sport'] as Colonna[]).map((c) => (
                      <Th key={c} c={c} ordine={ordine} verso={verso} onOrdina={ordina} numero={c === 'eta'}>
                        {NOMI_COLONNE[c]}
                      </Th>
                    ))}
                    <th className="border-b border-line px-2 py-2 font-bold whitespace-nowrap">Ultimi 14 giorni</th>
                    {(['pre', 'post', 'chiusi', 'giorni7', 'giorni30', 'corpo', 'lezioni'] as Colonna[]).map((c) => (
                      <Th key={c} c={c} ordine={ordine} verso={verso} onOrdina={ordina} numero>
                        {NOMI_COLONNE[c]}
                      </Th>
                    ))}
                    <Th c="ultima" ordine={ordine} verso={verso} onOrdina={ordina}>
                      {NOMI_COLONNE.ultima}
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {viste.map((a) => (
                    <Riga
                      key={a.id}
                      a={a}
                      scelta={scelte.has(a.id)}
                      onScegli={() => scegli(a.id)}
                      striscia={strisce.get(a.id)}
                      giorni14={giorni14}
                    />
                  ))}
                </tbody>
              </table>
              {viste.length === 0 && <p className="m-0 p-4 text-[13px] text-ink-medio">Nessuna con questi filtri.</p>}
            </div>

            {/* sul telefono: una scheda per atleta */}
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0 md:hidden">
              {viste.map((a) => (
                <SchedaAtleta
                  key={a.id}
                  a={a}
                  scelta={scelte.has(a.id)}
                  onScegli={() => scegli(a.id)}
                  striscia={strisce.get(a.id)}
                  giorni14={giorni14}
                />
              ))}
              {viste.length === 0 && <li className="text-[13px] text-ink-medio">Nessuna con questi filtri.</li>}
            </ul>

            <p className="m-0 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-mute">
              <span className="inline-flex items-center gap-[6px]">
                <Cella pre post={false} /> check-in
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <Cella pre={false} post /> check-out
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <span className="text-rosso">●</span> sensazioni segnate protettive
              </span>
              <span>Le righe si aprono sul nome.</span>
            </p>
          </>
        )}
      </div>

      {foglioFiltri && (
        <Finestra
          titolo="Filtri"
          sotto={`${viste.length} su ${righe?.length ?? 0}`}
          onChiudi={() => setFoglioFiltri(false)}
          piede={
            <>
              <Tasto onClick={togli} disabled={accesi === 0}>
                Togli i filtri
              </Tasto>
              <Tasto tipo="primo" onClick={() => setFoglioFiltri(false)}>
                Fatto
              </Tasto>
            </>
          }
        >
          <div className="flex flex-col gap-3">{controlli(true)}</div>
        </Finestra>
      )}

      {cancella && (
        <ConfermaCancella
          titolo={cancella.length === 1 ? `Cancellare ${cancella[0].display_name}?` : `Cancellare ${cancella.length} atlete?`}
          chi={cancella.map((a) => `${a.display_name}${a.email ? ` · ${a.email}` : ''}`)}
          parola={cancella.length === 1 ? cancella[0].display_name : `cancella ${cancella.length}`}
          onChiudi={() => setCancella(null)}
          onConferma={async () => {
            const falliti: string[] = []
            // una alla volta: se una non va, le altre non si fermano e si sa quale
            for (const a of cancella) {
              const e = await cancellaAtleta(a.id)
              if (!e.ok) falliti.push(`${a.display_name}: ${e.perche}`)
            }
            const fatte = cancella.length - falliti.length
            if (falliti.length && !fatte) return falliti.join(' · ')
            setCancella(null)
            setScelte(new Set())
            setAvviso(
              falliti.length
                ? { testo: `Cancellate ${fatte}. Non riuscite: ${falliti.join(' · ')}`, male: true }
                : { testo: fatte === 1 ? 'Cancellata.' : `Cancellate ${fatte}.` },
            )
            setGiro((g) => g + 1)
            return null
          }}
        />
      )}
    </Telaio>
  )
}

function Th({
  c,
  ordine,
  verso,
  onOrdina,
  children,
  numero,
}: {
  c: Colonna
  ordine: Colonna
  verso: number
  onOrdina: (c: Colonna) => void
  children: ReactNode
  numero?: boolean
}) {
  const qui = ordine === c
  return (
    <th
      aria-sort={qui ? (verso === 1 ? 'ascending' : 'descending') : 'none'}
      className={`border-b border-line px-2 py-1 font-bold whitespace-nowrap ${numero ? 'text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onOrdina(c)}
        className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-1 uppercase hover:bg-chip ${qui ? 'text-ink' : ''}`}
      >
        {children}
        <span aria-hidden className={qui ? '' : 'opacity-0'}>
          {verso === 1 ? '↑' : '↓'}
        </span>
      </button>
    </th>
  )
}

function Cella({ pre, post }: { pre: boolean; post: boolean }) {
  return (
    <span aria-hidden className="inline-flex h-[18px] w-[9px] flex-col overflow-hidden rounded-[2px]">
      <span className="flex-1" style={{ background: pre ? SERIE.verde : '#e8e5e0' }} />
      <span className="h-px bg-surface" />
      <span className="flex-1" style={{ background: post ? SERIE.verde : '#e8e5e0' }} />
    </span>
  )
}

function Strisciolina({ nome, striscia, giorni14 }: { nome: string; striscia?: Striscia; giorni14: string[] }) {
  const quanti = giorni14.filter((g) => striscia?.has(g)).length
  return (
    <span
      role="img"
      aria-label={`${nome}: ${quanti} giorni su 14 con BAB aperta`}
      title={giorni14
        .map((g) => {
          const q = striscia?.get(g)
          return `${dataLunga(g)}: ${q ? [q.pre && 'check-in', q.post && 'check-out'].filter(Boolean).join(' e ') : '—'}`
        })
        .join('\n')}
      className="inline-flex gap-[2px]"
    >
      {giorni14.map((g) => (
        <Cella key={g} pre={!!striscia?.get(g)?.pre} post={!!striscia?.get(g)?.post} />
      ))}
    </span>
  )
}

function UltimaVolta({ a }: { a: Atleta }) {
  const ferma = a.last_day ? giorniDa(a.last_day) : null
  return (
    <span title={a.last_day ? data(a.last_day) : undefined} className="whitespace-nowrap">
      {a.last_day ? <span className={ferma !== null && ferma > 13 ? 'text-ink-mute' : ''}>{quando(ferma)}</span> : <span className="text-ink-mute">mai</span>}
      {!a.tutorial_done && <span className="ml-2 rounded-pill bg-chip px-[6px] py-[1px] text-[10px] font-bold text-ink-medio">tutorial</span>}
    </span>
  )
}

type PropsRiga = {
  a: Atleta
  scelta: boolean
  onScegli: () => void
  striscia?: Striscia
  giorni14: string[]
}

function Riga({ a, scelta, onScegli, striscia, giorni14 }: PropsRiga) {
  const td = 'px-2 py-[7px]'
  return (
    <tr className={`border-b border-riga align-middle last:border-b-0 hover:bg-chip ${scelta ? 'bg-chip' : ''}`}>
      <td className="py-[7px] pl-3">
        <input
          type="checkbox"
          checked={scelta}
          onChange={onScegli}
          aria-label={`Seleziona ${a.display_name}`}
          className="size-4 cursor-pointer accent-ink"
        />
      </td>
      <td className={td}>
        <Link to={`/admin/atlete/${a.id}`} className="group flex items-center gap-[10px] text-ink no-underline">
          <Iniziale id={a.id} nome={a.display_name} />
          <span className="min-w-0">
            <span className="block font-bold">
              <span className="group-hover:underline">{a.display_name}</span>
              {a.is_test && <Prova />}
            </span>
            <span className="block text-[11px] text-ink-mute">{a.email ?? a.athlete_code ?? a.id.slice(0, 8)}</span>
          </span>
        </Link>
      </td>
      <td className={`${td} text-right tabular-nums`}>{a.age}</td>
      <td className={`${td} whitespace-nowrap text-ink-medio`}>{a.team_name ?? '—'}</td>
      <td className={`${td} text-ink-medio`}>{(a.sports ?? [a.sport]).filter(Boolean).join(', ') || '—'}</td>
      <td className={td}>
        <Strisciolina nome={a.display_name} striscia={striscia} giorni14={giorni14} />
      </td>
      <td className={`${td} text-right tabular-nums`}>{a.checkins_pre}</td>
      {/*
        Il post in grigio quando e' sotto alla meta' dei pre: e' il modo piu'
        corto di far vedere chi comincia e non chiude.
      */}
      <td className={`${td} text-right tabular-nums ${a.checkins_pre > 1 && a.checkins_post * 2 < a.checkins_pre ? 'text-ink-mute' : ''}`}>
        {a.checkins_post}
      </td>
      <td className={`${td} text-right tabular-nums text-ink-medio`}>
        {a.checkins_pre > 0 ? `${Math.round((a.checkins_post / a.checkins_pre) * 100)}%` : '—'}
      </td>
      <td className={`${td} text-right tabular-nums`}>{a.days_7d}</td>
      <td className={`${td} text-right tabular-nums`}>{a.days_30d}</td>
      <td className={`${td} text-right tabular-nums whitespace-nowrap`}>
        <Corpo a={a} />
      </td>
      <td className={`${td} text-right tabular-nums text-ink-medio`}>{a.lessons_done}/8</td>
      <td className={td}>
        <UltimaVolta a={a} />
      </td>
    </tr>
  )
}

function Corpo({ a }: { a: Atleta }) {
  return (
    <>
      {a.signals}
      {a.signals_flagged > 0 && (
        <span className="ml-1 text-rosso" title={`${a.signals_flagged} segnate come dolore protettivo`}>
          ● {a.signals_flagged}
        </span>
      )}
    </>
  )
}

/** la stessa riga, sul telefono: il nome in cima, i numeri sotto in quattro caselle */
function SchedaAtleta({ a, scelta, onScegli, striscia, giorni14 }: PropsRiga) {
  const numeri: [string, ReactNode][] = [
    [NOMI_COLONNE.pre, a.checkins_pre],
    [NOMI_COLONNE.post, a.checkins_post],
    [NOMI_COLONNE.chiusi, a.checkins_pre > 0 ? `${Math.round((a.checkins_post / a.checkins_pre) * 100)}%` : '—'],
    [NOMI_COLONNE.corpo, <Corpo key="corpo" a={a} />],
  ]
  return (
    <li className={`${BLOCCO} p-3 ${scelta ? 'outline-[3px] outline-offset-2 outline-lime' : ''}`}>
      <div className="flex items-start gap-3">
        <Link to={`/admin/atlete/${a.id}`} className="flex min-w-0 flex-1 items-center gap-[10px] text-ink no-underline">
          <Iniziale id={a.id} nome={a.display_name} grande />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold">
              {a.display_name}
              {a.is_test && <Prova />}
            </span>
            <span className="block truncate text-[12px] text-ink-mute">
              {[a.team_name, (a.sports ?? [a.sport]).filter(Boolean).join(', '), `${a.age} anni`].filter(Boolean).join(' · ')}
            </span>
          </span>
        </Link>
        <label className="-m-2 flex size-11 shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={scelta}
            onChange={onScegli}
            aria-label={`Seleziona ${a.display_name}`}
            className="size-5 cursor-pointer accent-ink"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <Strisciolina nome={a.display_name} striscia={striscia} giorni14={giorni14} />
        <UltimaVolta a={a} />
      </div>
      <dl className="m-0 mt-3 grid grid-cols-4 gap-2 border-t border-riga pt-2 text-center">
        {numeri.map(([k, n]) => (
          <div key={k}>
            <dt className="text-[10px] font-bold tracking-[0.4px] text-ink-mute uppercase">{k}</dt>
            <dd className="m-0 mt-[2px] text-[15px] font-bold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>
    </li>
  )
}

/** l'etichetta di un account di prova, accanto al nome */
function Prova() {
  return (
    <span className="ml-[6px] inline-block rounded-pill border border-ink bg-lime px-[6px] py-[1px] align-[2px] text-[9.5px] font-bold tracking-[0.4px] text-ink uppercase">
      prova
    </span>
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
