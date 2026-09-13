import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { leggiAtlete, leggiScheda } from '../../lib/admin'
import type { Atleta as Riga, CheckIn, Scheda, Segnale } from '../../lib/admin'
import {
  cancellaAtleta,
  cancellaNota,
  esportaAtleta,
  leggiAmministratori,
  leggiNote,
  leggiSquadre,
  modificaAtleta,
  rifaiTutorial,
  scriviNota,
  squadraDi,
} from '../../lib/gestione'
import type { Nota, Squadra } from '../../lib/gestione'
import { SPORT, nomeSport } from '../../data/sport'
import { useLingua } from '../../lib/lingua'
import { Telaio } from './Telaio'
import { CICLO, CONTRACCETTIVO, GIORNI, IMPEGNO, useVocabolario } from './vocabolario'
import type { Vocabolario } from './vocabolario'
import { Andamento, Calendario, MappaCorpo, PrevistoSentito, Sforzo } from './grafici'
import {
  BLOCCO,
  CAMPO,
  Chip,
  ConfermaCancella,
  Iniziale,
  Finestra,
  Numero,
  Riquadro,
  Tasto,
  Voce,
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
 * La scheda di una persona.
 *
 * ── COME E' ORDINATA ───────────────────────────────────────────────────────
 * In cima i gesti (modificare, rifare il tutorial, scaricare, cancellare),
 * sotto cinque viste: il colpo d'occhio, i grafici, le risposte riga per
 * riga, i giorni come li ha vissuti lei, le note di chi amministra.
 *
 * La vista e il periodo stanno nell'indirizzo (`?vista=grafici&periodo=90`):
 * una scheda si manda a un'altra persona aperta esattamente dove la si
 * guardava, e il tasto indietro del browser torna dove si era.
 *
 * ── UN PERIODO SOLO ────────────────────────────────────────────────────────
 * Il periodo sta in una riga sola sopra a tutto, e vale per ogni grafico,
 * per la tabella e per i giorni. Un periodo per grafico farebbe confrontare
 * trenta giorni di sforzo con novanta di sonno senza accorgersene.
 *
 * ── I NUMERI HANNO LA LORO SCALA ADDOSSO ───────────────────────────────────
 * Sonno, energia, umore e scuola vanno da 1 a 7; lo sforzo e l'intensita' da
 * 0 a 10. Un «5» stampato da solo si legge male: qui ognuno si porta dietro
 * il suo fondoscala.
 */

type Vista = 'panoramica' | 'grafici' | 'risposte' | 'giorni' | 'note'
const VISTE: { id: Vista; nome: string }[] = [
  { id: 'panoramica', nome: 'Panoramica' },
  { id: 'grafici', nome: 'Grafici' },
  { id: 'risposte', nome: 'Risposte' },
  { id: 'giorni', nome: 'Giorni' },
  { id: 'note', nome: 'Note' },
]

type Periodo = '30' | '90' | 'tutto'
const PERIODI: { id: Periodo; nome: string }[] = [
  { id: '30', nome: '30 giorni' },
  { id: '90', nome: '90 giorni' },
  { id: 'tutto', nome: 'Da sempre' },
]

type Aperta = null | 'modifica' | 'tutorial' | 'cancella'

export function Atleta() {
  const { id = '' } = useParams()
  const v = useVocabolario()
  const vai = useNavigate()
  const [query, setQuery] = useSearchParams()
  const vista = (VISTE.find((x) => x.id === query.get('vista'))?.id ?? 'panoramica') as Vista
  const periodo = (PERIODI.find((x) => x.id === query.get('periodo'))?.id ?? '30') as Periodo
  const cambia = (k: string, valore: string) =>
    setQuery(
      (q) => {
        const n = new URLSearchParams(q)
        n.set(k, valore)
        return n
      },
      { replace: true },
    )

  const [chi, setChi] = useState<Riga | null>(null)
  const [scheda, setScheda] = useState<Scheda | null>(null)
  const [squadra, setSquadra] = useState<string | null>(null)
  const [squadre, setSquadre] = useState<Squadra[]>([])
  const [amministra, setAmministra] = useState(false)
  const [letto, setLetto] = useState(false)
  const [giro, setGiro] = useState(0)
  const [aperta, setAperta] = useState<Aperta>(null)
  const [avviso, setAvviso] = useState<{ testo: string; male?: boolean } | null>(null)

  useEffect(() => {
    let vivo = true
    void (async () => {
      const [tutte, s, sq, lista, admin] = await Promise.all([
        leggiAtlete(),
        leggiScheda(id),
        squadraDi(id),
        leggiSquadre(),
        leggiAmministratori(),
      ])
      if (!vivo) return
      setChi(tutte?.find((a) => a.id === id) ?? null)
      setScheda(s)
      setSquadra(sq)
      setSquadre(lista)
      setAmministra(admin.has(id))
      setLetto(true)
    })()
    return () => {
      vivo = false
    }
  }, [id, giro])

  useEffect(() => {
    if (!avviso) return
    const t = setTimeout(() => setAvviso(null), 5000)
    return () => clearTimeout(t)
  }, [avviso])

  const oggi = giornoFa(0)
  const dal =
    periodo === 'tutto'
      ? (chi?.first_day ?? chi?.created_at.slice(0, 10) ?? oggi)
      : giornoFa(periodo === '30' ? 29 : 89)

  /* la scheda tagliata sul periodo: la usano grafici, risposte e giorni */
  const tagliata = useMemo<Scheda | null>(() => {
    if (!scheda) return null
    const cade = doveCade(scheda.checkins)
    return {
      ...scheda,
      checkins: scheda.checkins.filter((c) => c.local_date >= dal && c.local_date <= oggi),
      segnali: scheda.segnali.filter((s) => cade(s).giorno >= dal),
    }
  }, [scheda, dal, oggi])

  if (!letto) {
    return (
      <Telaio nome="Un momento…">
        <p className="m-0 p-6 text-[13px] text-ink-mute">Leggo.</p>
      </Telaio>
    )
  }
  if (!chi) {
    return (
      <Telaio nome="Non la trovo">
        <p className="m-0 max-w-[520px] p-6 text-[13px] leading-[1.6] text-ink-medio">
          Nessuna atleta con questo indirizzo. O non esiste, o il database non ha ancora le viste
          del pannello — si aprono lanciando <code>app/supabase/migrazione-pannello.sql</code>.
        </p>
      </Telaio>
    )
  }

  const nomeFile = chi.display_name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'atleta'

  async function scarica() {
    const e = await esportaAtleta(id)
    if (!e.ok) return setAvviso({ testo: e.perche, male: true })
    scaricaFile(`bab-${nomeFile}-${oggi}.json`, JSON.stringify(e.dato, null, 2), 'application/json')
    setAvviso({ testo: 'Dati scaricati.' })
  }

  return (
    <Telaio
      nome={chi.display_name}
      segno={<Iniziale id={chi.id} nome={chi.display_name} grande />}
      sotto={[chi.email, chi.team_name, chi.sport, `${chi.age} anni`].filter(Boolean).join(' · ')}
      destra={
        <div className="flex shrink-0 items-center gap-2">
          <Tasto piccolo onClick={() => setAperta('modifica')}>
            Modifica
          </Tasto>
          <Tasto piccolo onClick={() => setAperta('tutorial')} disabled={!chi.tutorial_done}>
            Rifai tutorial
          </Tasto>
          <Tasto piccolo onClick={() => void scarica()}>
            Scarica dati
          </Tasto>
          <Tasto piccolo tipo="pericolo" onClick={() => setAperta('cancella')} disabled={amministra}>
            Cancella
          </Tasto>
        </div>
      }
    >
      <div className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-2 px-6 py-2">
          <div role="tablist" aria-label="Viste della scheda" className="flex flex-wrap gap-1">
            {VISTE.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={vista === x.id}
                onClick={() => cambia('vista', x.id)}
                className={`h-8 cursor-pointer rounded-pill border-[1.5px] px-3 text-[12.5px] font-bold ${
                  vista === x.id
                    ? 'border-ink bg-lime text-ink shadow-[2px_2px_0_rgba(44,44,58,0.9)]'
                    : 'border-transparent text-ink-medio hover:bg-chip'
                }`}
              >
                {x.nome}
              </button>
            ))}
          </div>
          {(vista === 'grafici' || vista === 'risposte' || vista === 'giorni') && (
            <div role="group" aria-label="Periodo" className="flex flex-wrap items-center gap-1">
              {PERIODI.map((p) => (
                <Chip key={p.id} acceso={periodo === p.id} onClick={() => cambia('periodo', p.id)}>
                  {p.nome}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      {avviso && (
        <div
          role="status"
          className={`mx-auto mt-3 max-w-[1080px] px-6 text-[12.5px] font-bold ${avviso.male ? 'text-rosso' : 'text-verde-acceso'}`}
        >
          {avviso.testo}
        </div>
      )}

      <div className="mx-auto max-w-[1080px] p-6">
        {!scheda && vista !== 'panoramica' && vista !== 'note' && (
          <p className="m-0 text-[13px] text-ink-medio">Non riesco a leggere le sue risposte.</p>
        )}

        {vista === 'panoramica' && <Panoramica chi={chi} scheda={scheda} />}

        {vista === 'grafici' && tagliata && (
          <div className="flex flex-col gap-4">
            <Andamento checkins={tagliata.checkins} dal={dal} al={oggi} />
            <PrevistoSentito checkins={tagliata.checkins} dal={dal} al={oggi} v={v} />
            <Sforzo checkins={tagliata.checkins} dal={dal} al={oggi} v={v} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
              <Calendario checkins={tagliata.checkins} settimana={tagliata.settimana} dal={dal} al={oggi} />
              <MappaCorpo segnali={tagliata.segnali} v={v} />
            </div>
          </div>
        )}

        {vista === 'risposte' && tagliata && <Risposte scheda={tagliata} v={v} nomeFile={`${nomeFile}-${dal}-${oggi}`} />}

        {vista === 'giorni' && tagliata && <Giorni scheda={tagliata} v={v} />}

        {vista === 'note' && <Note id={id} />}
      </div>

      {aperta === 'modifica' && (
        <Modifica
          chi={chi}
          squadra={squadra}
          squadre={squadre}
          onChiudi={() => setAperta(null)}
          onFatto={() => {
            setAperta(null)
            setAvviso({ testo: 'Dati aggiornati.' })
            setGiro((g) => g + 1)
          }}
        />
      )}
      {aperta === 'tutorial' && (
        <RifaiTutorial
          chi={chi}
          onChiudi={() => setAperta(null)}
          onFatto={() => {
            setAperta(null)
            setAvviso({ testo: 'Il tutorial le ricomparirà al prossimo accesso.' })
            setGiro((g) => g + 1)
          }}
        />
      )}
      {aperta === 'cancella' && (
        <ConfermaCancella
          titolo={`Cancellare ${chi.display_name}?`}
          chi={[`${chi.display_name}${chi.email ? ` · ${chi.email}` : ''}`]}
          parola={chi.display_name}
          onChiudi={() => setAperta(null)}
          onConferma={async () => {
            const e = await cancellaAtleta(id)
            if (!e.ok) return e.perche
            vai('/admin/atlete', { replace: true })
            return null
          }}
        />
      )}
    </Telaio>
  )
}

/* ── panoramica ───────────────────────────────────────────────────────────── */

function percento(parte: number, tutto: number): string {
  return tutto > 0 ? `${Math.round((parte / tutto) * 100)}%` : '—'
}

function Panoramica({ chi, scheda }: { chi: Riga; scheda: Scheda | null }) {
  const confronto = useMemo(() => {
    if (!scheda) return null
    const per = new Map<string, { p?: string | null; s?: string | null }>()
    for (const c of scheda.checkins) {
      const q = per.get(c.local_date) ?? {}
      if (c.kind === 'pre') q.p = c.tempo_predicted
      else q.s = c.tempo_chosen
      per.set(c.local_date, q)
    }
    const due = [...per.values()].filter((q) => q.p && q.s)
    return { uguali: due.filter((q) => q.p === q.s).length, su: due.length }
  }, [scheda])

  /* le lineette dei numeri: gli ultimi quattordici giorni, un punto al giorno */
  const serie = useMemo(() => {
    if (!scheda) return null
    const giorni = Array.from({ length: 14 }, (_, i) => giornoFa(13 - i))
    const cade = doveCade(scheda.checkins)
    return {
      attiva: giorni.map((g) => (scheda.checkins.some((c) => c.local_date === g) ? 1 : 0)),
      checkin: giorni.map((g) => scheda.checkins.filter((c) => c.local_date === g && c.kind === 'pre').length),
      segnali: giorni.map((g) => scheda.segnali.filter((s) => cade(s).giorno === g).length),
    }
  }, [scheda])

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Numero
          quanto={chi.days_7d}
          cosa="giorni attivi negli ultimi 7"
          nota={`${chi.days_30d} negli ultimi 30`}
          andamento={serie?.attiva}
        />
        <Numero quanto={chi.checkins_pre} cosa="check-in" nota={`${chi.checkins_post} check-out`} andamento={serie?.checkin} />
        <Numero quanto={percento(chi.checkins_post, chi.checkins_pre)} cosa="check-in chiusi col check-out" />
        <Numero
          quanto={confronto ? percento(confronto.uguali, confronto.su) : '—'}
          cosa="previsto uguale a sentito"
          nota={confronto && confronto.su > 0 ? `${confronto.uguali} su ${confronto.su} giorni` : undefined}
        />
        <Numero
          quanto={chi.signals}
          cosa="sensazioni sul corpo"
          andamento={serie?.segnali}
          nota={`${chi.signals_flagged} protettive`}
          allarme={chi.signals_flagged > 0}
        />
        <Numero quanto={chi.last_day ? quando(giorniDa(chi.last_day)) : 'mai'} cosa="l’ultima volta" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Riquadro titolo="Anagrafica">
          <Voce nome="Nome scelto" v={chi.display_name} />
          <Voce nome="Mail" v={chi.email ?? '—'} />
          <Voce nome="Nata il" v={`${data(chi.birth_date)} · ${chi.age} anni`} />
          <Voce nome="Sport" v={(chi.sports ?? [chi.sport]).filter(Boolean).join(', ') || '—'} />
          <Voce nome="Squadra" v={chi.team_name ?? 'nessuna'} />
          <Voce nome="Iscritta il" v={data(chi.created_at)} />
          <Voce nome="Lingua" v={chi.locale} />
        </Riquadro>

        <Riquadro titolo="Come sta andando">
          <Voce nome="Check-in" v={`${chi.checkins_pre} la mattina · ${chi.checkins_post} la sera`} />
          <Voce nome="Giorni attivi" v={`${chi.days_7d} negli ultimi 7 · ${chi.days_30d} in 30`} />
          <Voce nome="Dal" v={chi.first_day ? `${data(chi.first_day)} a ${data(chi.last_day)}` : 'mai'} />
          <Voce nome="Sensazioni sul corpo" v={String(chi.signals)} />
          <Voce nome="Segnate protettive" v={String(chi.signals_flagged)} allarme={chi.signals_flagged > 0} />
          <Voce nome="Lezioni finite" v={`${chi.lessons_done} su 8`} />
          <Voce nome="Tutorial" v={chi.tutorial_done ? `finito il ${data(chi.tutorial_done)}` : 'non finito'} />
          <Voce nome="Battito contato" v={chi.first_bpm ? `${chi.first_bpm} bpm` : '—'} />
        </Riquadro>

        {/*
          Il ciclo sta in un riquadro suo, e sono solo date dichiarate: mai una
          fase. La fase e' un'inferenza, e stampata qui in mezzo ai fatti
          sembrerebbe un fatto.
        */}
        <Riquadro titolo="Il ciclo">
          <Voce nome="Stato" v={CICLO[chi.cycle_status] ?? chi.cycle_status} />
          <Voce nome="Primo ciclo" v={chi.first_period_age ? `a ${chi.first_period_age} anni` : '—'} />
          <Voce nome="Contraccettivo" v={CONTRACCETTIVO[chi.contraception] ?? chi.contraception} />
          <Voce nome="Date segnate" v={String(chi.cycle_marks)} />
          {scheda && scheda.ciclo.length > 0 && (
            <p className="m-0 mt-2 text-[11.5px] leading-[1.5] text-ink-medio">
              {scheda.ciclo.slice(0, 6).map((c) => data(c.event_date)).join(' · ')}
            </p>
          )}
          <p className="m-0 mt-2 border-t border-riga pt-2 text-[11px] leading-[1.4] text-ink-mute">
            Consenso:{' '}
            {chi.consent_ok === null
              ? 'non richiesto (maggiorenne)'
              : chi.consent_ok
                ? 'dato, suo e di chi la segue'
                : 'rifiutato'}
          </p>
        </Riquadro>
      </div>

      {scheda && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <Settimana chi={chi} scheda={scheda} />
          <Percorso chi={chi} scheda={scheda} />
        </div>
      )}
    </>
  )
}

/**
 * Quando dovrebbe allenarsi, e quando ha davvero aperto BAB.
 *
 * L'aderenza — «nei giorni in cui si allena, fa il check-in?» — e' la sola
 * domanda a cui questi due dati insieme rispondono, e nessuno dei due da solo.
 */
function Settimana({ chi, scheda }: { chi: Riga; scheda: Scheda }) {
  const per = new Map<number, string[]>()
  for (const i of scheda.settimana) {
    const nome = i.kind === 'training' ? (i.sport ?? 'Allenamento') : IMPEGNO[i.kind] || i.kind
    per.set(i.weekday, [...(per.get(i.weekday) ?? []), nome])
  }
  return (
    <Riquadro titolo="La sua settimana">
      {scheda.settimana.length === 0 ? (
        <p className="m-0 text-[12px] text-ink-mute">Non l’ha dichiarata.</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <div
              key={g}
              className={`rounded-[10px] border p-2 text-center ${per.has(g) ? 'border-line bg-chip' : 'border-riga'}`}
            >
              <p className="m-0 text-[10.5px] font-bold text-ink-mute uppercase">{GIORNI[g]?.slice(0, 3)}</p>
              <p className="m-0 mt-1 text-[11px] leading-[1.3] break-words text-ink-medio">
                {(per.get(g) ?? []).join(', ') || '—'}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="m-0 mt-2 text-[11px] text-ink-mute">
        Quello che ha dichiarato all’onboarding. L’ora non c’è: l’app la chiede e non la salva.
        {chi.days_30d > 0 && ` Negli ultimi trenta giorni ha aperto BAB ${chi.days_30d} volte.`}
      </p>
    </Riquadro>
  )
}

function Percorso({ chi, scheda }: { chi: Riga; scheda: Scheda }) {
  const fatte = new Map(scheda.lezioni.map((l) => [l.lesson, l.completed_at]))
  return (
    <Riquadro titolo={`Il percorso · ${chi.lessons_done} su 8`}>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <span
            key={n}
            title={fatte.has(n) ? `Finita il ${data(fatte.get(n)!)}` : 'Non ancora'}
            className={`flex size-8 items-center justify-center rounded-[9px] border-[1.5px] text-[12px] font-bold ${
              fatte.has(n) ? 'border-line bg-lime' : 'border-riga text-ink-mute'
            }`}
          >
            {n}
          </span>
        ))}
      </div>
    </Riquadro>
  )
}

/* ── risposte ─────────────────────────────────────────────────────────────── */

/** sonno, energia, umore, pressione, sforzo, durata: a destra anche quando sono vuoti */
const COLONNE_NUMERI = new Set([4, 6, 7, 8, 9, 16])

function Risposte({ scheda, v, nomeFile }: { scheda: Scheda; v: Vocabolario; nomeFile: string }) {
  const [tipo, setTipo] = useState<'tutte' | 'pre' | 'post'>('tutte')

  const perCheckIn = useMemo(() => {
    const m = new Map<string, Segnale[]>()
    for (const s of scheda.segnali) if (s.check_in_id) m.set(s.check_in_id, [...(m.get(s.check_in_id) ?? []), s])
    return m
  }, [scheda])

  const ordinate = useMemo(
    () =>
      [...scheda.checkins]
        .filter((c) => tipo === 'tutte' || c.kind === tipo)
        .sort((a, b) => b.local_date.localeCompare(a.local_date) || (a.kind === 'post' ? -1 : 1)),
    [scheda, tipo],
  )
  const righe = ordinate.map((c) => rigaRisposta(c, v, perCheckIn.get(c.id) ?? [], scheda.parole?.checkins[c.id]))

  function scaricaRisposte() {
    scaricaFile(`bab-risposte-${nomeFile}.csv`, csv(COLONNE_RISPOSTE, righe))
  }
  function scaricaSensazioni() {
    const cade = doveCade(scheda.checkins)
    scaricaFile(
      `bab-sensazioni-${nomeFile}.csv`,
      csv(
        COLONNE_SENSAZIONI,
        scheda.segnali.map((s) => {
          const q = cade(s)
          return rigaSensazione(s, v, q.giorno, q.momento, scheda.parole?.segnali[s.id])
        }),
      ),
    )
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Quali risposte" className="flex flex-wrap gap-1">
          <Chip acceso={tipo === 'tutte'} onClick={() => setTipo('tutte')} conta={scheda.checkins.length}>
            Tutte
          </Chip>
          <Chip acceso={tipo === 'pre'} onClick={() => setTipo('pre')} conta={scheda.checkins.filter((c) => c.kind === 'pre').length}>
            Check-in
          </Chip>
          <Chip acceso={tipo === 'post'} onClick={() => setTipo('post')} conta={scheda.checkins.filter((c) => c.kind === 'post').length}>
            Check-out
          </Chip>
        </div>
        <div className="flex gap-2">
          <Tasto piccolo onClick={scaricaRisposte} disabled={righe.length === 0}>
            Risposte CSV
          </Tasto>
          <Tasto piccolo onClick={scaricaSensazioni} disabled={scheda.segnali.length === 0}>
            Sensazioni CSV
          </Tasto>
        </div>
      </div>

      {righe.length === 0 ? (
        <p className="m-0 text-[13px] text-ink-medio">Nessuna risposta in questo periodo.</p>
      ) : (
        <div className="max-h-[calc(100dvh-220px)] overflow-auto rounded-[14px] border-[1.5px] border-line bg-surface">
          <table className="w-full border-collapse text-[12px]">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr>
                {COLONNE_RISPOSTE.map((c) => (
                  <th
                    key={c}
                    className="border-b border-line px-2 py-2 text-left text-[10.5px] font-bold tracking-[0.4px] whitespace-nowrap text-ink-mute uppercase"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {righe.map((r, i) => (
                <tr
                  key={ordinate[i].id}
                  className={`border-b border-riga align-top hover:bg-chip ${ordinate[i].protective_pain ? 'bg-allarme-fondo' : ''}`}
                >
                  {r.map((cella, j) => (
                    <td
                      key={j}
                      className={`px-2 py-[6px] ${COLONNE_NUMERI.has(j) ? 'text-right tabular-nums' : ''} ${
                        j === 0 || j === 2 ? 'font-bold whitespace-nowrap' : ''
                      } ${j === 15 || j === 17 ? 'min-w-[200px]' : 'whitespace-nowrap'}`}
                    >
                      {j === 0 ? dataLunga(String(cella)) : cella === null ? <span className="text-ink-tenue">—</span> : typeof cella === 'boolean' ? (cella ? 'sì' : 'no') : cella}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/* ── giorni ───────────────────────────────────────────────────────────────── */

function Giorni({ scheda, v }: { scheda: Scheda; v: Vocabolario }) {
  const giorni = useMemo(() => raggruppa(scheda), [scheda])
  if (giorni.length === 0) {
    return (
      <p className="m-0 text-[13px] text-ink-medio">
        Nessun check-in finito in questo periodo. Uno cominciato e lasciato a metà non arriva al
        database: l’app scrive solo alla fine.
      </p>
    )
  }
  return (
    <div className="mx-auto flex max-w-[880px] flex-col gap-3">
      {giorni.map((g) => (
        <Giorno key={g.giorno} g={g} v={v} scheda={scheda} />
      ))}
    </div>
  )
}

type Giornata = { giorno: string; pre: CheckIn | null; post: CheckIn | null; segnali: Segnale[] }

function raggruppa(scheda: Scheda): Giornata[] {
  const per = new Map<string, Giornata>()
  for (const c of scheda.checkins) {
    const g = per.get(c.local_date) ?? { giorno: c.local_date, pre: null, post: null, segnali: [] }
    if (c.kind === 'pre') g.pre = c
    else g.post = c
    per.set(c.local_date, g)
  }
  /*
   * Le sensazioni si appendono al loro check-in. Quelle senza (`check_in_id`
   * nullo) oggi non le scrive nessuno, ma lo schema le prevede: se un giorno
   * arrivassero, finirebbero nel giorno in cui sono state segnate e non in un
   * elenco a parte che nessuno guarda.
   */
  const cade = doveCade(scheda.checkins)
  for (const s of scheda.segnali) {
    const { giorno } = cade(s)
    const g = per.get(giorno) ?? { giorno, pre: null, post: null, segnali: [] }
    g.segnali.push(s)
    per.set(giorno, g)
  }
  return [...per.values()].sort((a, b) => b.giorno.localeCompare(a.giorno))
}

function Giorno({ g, v, scheda }: { g: Giornata; v: Vocabolario; scheda: Scheda }) {
  const note = [g.pre, g.post]
    .filter((c): c is CheckIn => c !== null)
    .map((c) => scheda.parole?.checkins[c.id]?.note)
    .filter((t): t is string => !!t && t.trim() !== '')

  return (
    <div className={`${BLOCCO} p-4`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="m-0 text-[14px] font-bold">{dataLunga(g.giorno)}</p>
        {g.pre?.on_period && <Pillola>ciclo</Pillola>}
        {g.pre?.painkillers && <Pillola>antidolorifici</Pillola>}
        {g.post?.protective_pain && <Pillola allarme>dolore protettivo</Pillola>}
        {!g.post && g.pre && <span className="text-[11px] text-ink-mute">nessun check-out</span>}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Meta titolo="La mattina" c={g.pre}>
          {g.pre && (
            <>
              <Dato nome="Ritmo previsto" v={v.ritmo(g.pre.tempo_predicted)} forte />
              <Scala nome="Sonno" n={g.pre.sleep} su={7} coda={g.pre.sleep_hours ?? undefined} />
              <Scala nome="Energia" n={g.pre.energy} su={7} />
              <Scala nome="Umore" n={g.pre.mood} su={7} />
              <Scala nome="Pressione" n={g.pre.school_load} su={7} />
            </>
          )}
        </Meta>

        <Meta titolo="La sera" c={g.post}>
          {g.post && (
            <>
              <Dato nome="Ritmo sentito" v={v.ritmo(g.post.tempo_chosen)} forte />
              <Scala nome="Sforzo" n={g.post.effort} su={10} />
              <Scala nome="Energia" n={g.post.energy} su={7} />
              <Dato nome="Soddisfazione" v={v.faccia(g.post.satisfaction)} />
              {g.post.brought_home && g.post.brought_home.length > 0 && (
                <Dato nome="Ha portato a casa" v={g.post.brought_home.map((b) => v.bottino(b)).join(', ')} />
              )}
            </>
          )}
        </Meta>
      </div>

      {/*
        Previsto contro sentito: e' la cosa che BAB misura, e a leggerla
        saltando fra due colonne si perde. Quando le due parole sono diverse
        lo dico qui, in chiaro.
      */}
      {g.pre?.tempo_predicted && g.post?.tempo_chosen && g.pre.tempo_predicted !== g.post.tempo_chosen && (
        <p className="m-0 mt-3 rounded-[10px] bg-chip px-3 py-2 text-[12px] text-ink-medio">
          Aveva previsto <b className="text-ink">{v.ritmo(g.pre.tempo_predicted)}</b>, il corpo ha
          chiesto <b className="text-ink">{v.ritmo(g.post.tempo_chosen)}</b>.
        </p>
      )}

      {g.segnali.length > 0 && (
        <div className="mt-3 border-t border-riga pt-3">
          <p className="m-0 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">
            Il corpo · {g.segnali.length}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {g.segnali.map((s) => (
              <Sensazione key={s.id} s={s} v={v} parole={scheda.parole?.segnali[s.id]} />
            ))}
          </div>
        </div>
      )}

      {note.length > 0 && (
        <div className="mt-3 border-t border-riga pt-3">
          <p className="m-0 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">Le sue parole</p>
          {note.map((t) => (
            <p key={t} className="m-0 mt-1 text-[13px] leading-[1.5] text-ink">
              «{t}»
            </p>
          ))}
        </div>
      )}

      <p className="m-0 mt-3 text-[10.5px] text-ink-mute">
        {[g.pre && `mattina ${ora(g.pre)}${durata(g.pre)}`, g.post && `sera ${ora(g.post)}${durata(g.post)}`]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </div>
  )
}

function Sensazione({
  s,
  v,
  parole,
}: {
  s: Segnale
  v: Vocabolario
  parole?: { region_free: string | null; words: string | null }
}) {
  const dove = s.region === 'altrove' ? (parole?.region_free ?? 'Altrove') : v.zona(s.region)
  const contorno = [
    s.plane === 'back' ? 'dietro' : null,
    s.one_side === true ? 'solo da un lato' : null,
    v.quando(s.when_noticed) || null,
    v.comparsa(s.onset) || null,
    v.effetto(s.session_effect) || null,
  ].filter(Boolean)

  return (
    <div className={`rounded-[10px] border px-3 py-2 ${s.is_red_flag ? 'border-rosso-bordo bg-allarme-fondo' : 'border-riga bg-chip'}`}>
      <p className="m-0 text-[12.5px]">
        <b>{dove}</b>
        {s.sensation.length > 0 && <> · {s.sensation.map((p) => v.parola(p)).join(', ')}</>}
        {s.intensity !== null && <span className="text-ink-medio"> · {s.intensity} / 10</span>}
      </p>
      {contorno.length > 0 && <p className="m-0 mt-[3px] text-[11px] text-ink-mute">{contorno.join(' · ')}</p>}
      {parole?.words && <p className="m-0 mt-[5px] text-[12px] leading-[1.45] text-ink">«{parole.words}»</p>}
    </div>
  )
}

/* ── note ─────────────────────────────────────────────────────────────────── */

/**
 * Le note di chi amministra.
 *
 * Non si modificano: si scrive una nota nuova. Una nota corretta a
 * posteriori non dice piu' cosa si sapeva quel giorno, e in una storia di
 * assistenza e' proprio quello che serve sapere.
 */
function Note({ id }: { id: string }) {
  const [note, setNote] = useState<Nota[] | null>(null)
  const [errore, setErrore] = useState<string | null>(null)
  const [testo, setTesto] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [giro, setGiro] = useState(0)
  const [daCancellare, setDaCancellare] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    void leggiNote(id).then((e) => {
      if (!vivo) return
      if (e.ok) {
        setNote(e.dato)
        setErrore(null)
      } else setErrore(e.perche)
    })
    return () => {
      vivo = false
    }
  }, [id, giro])

  async function salva() {
    const t = testo.trim()
    if (!t || salvo) return
    setSalvo(true)
    const e = await scriviNota(id, t)
    setSalvo(false)
    if (!e.ok) return setErrore(e.perche)
    setTesto('')
    setGiro((g) => g + 1)
  }

  async function cancella(nota: string) {
    if (daCancellare !== nota) return setDaCancellare(nota)
    const e = await cancellaNota(nota)
    setDaCancellare(null)
    if (!e.ok) return setErrore(e.perche)
    setGiro((g) => g + 1)
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Riquadro titolo="Nuova nota">
        <textarea
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          maxLength={2000}
          rows={4}
          aria-label="Testo della nota"
          placeholder="Solo chi amministra la vede. Lei no."
          className="block w-full resize-y rounded-[10px] border border-line bg-chip p-3 text-[13px] leading-[1.5] text-ink outline-none placeholder:text-ink-mute focus:border-verde-acceso focus:bg-surface"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-ink-mute tabular-nums">{testo.length} / 2000</span>
          <Tasto tipo="primo" piccolo onClick={() => void salva()} disabled={!testo.trim() || salvo}>
            {salvo ? 'Salvo…' : 'Salva nota'}
          </Tasto>
        </div>
      </Riquadro>

      {errore && <p className="m-0 mt-3 text-[12.5px] font-bold text-rosso">{errore}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {note?.length === 0 && <p className="m-0 text-[13px] text-ink-medio">Ancora nessuna nota.</p>}
        {note?.map((n) => (
          <article key={n.id} className={`${BLOCCO} p-4`}>
            <p className="m-0 text-[13px] leading-[1.55] whitespace-pre-wrap text-ink">{n.body}</p>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-riga pt-2">
              <span className="text-[11px] text-ink-mute">
                {new Date(n.created_at).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}
                {n.author_email && ` · ${n.author_email}`}
              </span>
              <button
                type="button"
                onClick={() => void cancella(n.id)}
                onBlur={() => setDaCancellare(null)}
                className={`cursor-pointer rounded-pill px-2 py-1 text-[11.5px] font-bold ${
                  daCancellare === n.id ? 'bg-rosso text-white' : 'text-ink-mute hover:text-rosso'
                }`}
              >
                {daCancellare === n.id ? 'Sicura? Cancella' : 'Cancella'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ── le finestre dei gesti ────────────────────────────────────────────────── */

function Modifica({
  chi,
  squadra,
  squadre,
  onChiudi,
  onFatto,
}: {
  chi: Riga
  squadra: string | null
  squadre: Squadra[]
  onChiudi: () => void
  onFatto: () => void
}) {
  const { t } = useLingua()
  const [nome, setNome] = useState(chi.display_name)
  const [nascita, setNascita] = useState(chi.birth_date)
  const [sport, setSport] = useState<string[]>(chi.sports?.length ? chi.sports : chi.sport ? [chi.sport] : [])
  const [sq, setSq] = useState(squadra ?? '')
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const limite = new Date()
  limite.setFullYear(limite.getFullYear() - 12)
  const massimo = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, '0')}-${String(limite.getDate()).padStart(2, '0')}`
  const nomeOk = nome.trim().length >= 1 && nome.trim().length <= 40
  const nascitaOk = nascita > '1950-01-01' && nascita <= massimo
  const tutti = [...new Set([...sport, ...SPORT])]

  const accendi = (s: string) => setSport((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]))

  async function salva() {
    if (!nomeOk || !nascitaOk || inCorso) return
    setInCorso(true)
    setErrore(null)
    const e = await modificaAtleta(chi.id, { nome: nome.trim(), nascita, sport, squadra: sq || null }, squadra)
    setInCorso(false)
    if (!e.ok) return setErrore(e.perche)
    onFatto()
  }

  return (
    <Finestra
      titolo="Modifica i dati"
      sotto={chi.email ?? undefined}
      onChiudi={onChiudi}
      bloccata={inCorso}
      piede={
        <>
          <Tasto onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Tasto>
          <Tasto tipo="primo" onClick={() => void salva()} disabled={!nomeOk || !nascitaOk || inCorso}>
            {inCorso ? 'Salvo…' : 'Salva'}
          </Tasto>
        </>
      }
    >
      <Campo nome="Nome scelto" errore={nomeOk ? null : 'Da 1 a 40 caratteri.'}>
        {(idCampo) => (
          <input id={idCampo} value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} className={`${CAMPO} w-full`} />
        )}
      </Campo>
      <Campo nome="Data di nascita" errore={nascitaOk ? null : 'Deve avere almeno 12 anni.'}>
        {(idCampo) => (
          <input
            id={idCampo}
            type="date"
            value={nascita}
            min="1950-01-02"
            max={massimo}
            onChange={(e) => setNascita(e.target.value)}
            className={`${CAMPO} w-full`}
          />
        )}
      </Campo>
      <Campo nome="Squadra">
        {(idCampo) => (
          <select id={idCampo} value={sq} onChange={(e) => setSq(e.target.value)} className={`${CAMPO} w-full`}>
            <option value="">Nessuna</option>
            {squadre.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <fieldset className="m-0 mt-4 border-0 p-0">
        <legend className="p-0 text-[12px] font-bold text-ink">Sport</legend>
        <p className="m-0 mt-[2px] text-[11.5px] text-ink-mute">Il primo acceso è quello principale.</p>
        <div className="mt-2 flex flex-wrap gap-[6px]">
          {tutti.map((s) => (
            <Chip key={s} acceso={sport.includes(s)} onClick={() => accendi(s)}>
              {sport[0] === s ? '★ ' : ''}
              {nomeSport(t.sport.nomi, s)}
            </Chip>
          ))}
        </div>
      </fieldset>
      {errore && <p className="m-0 mt-3 text-[12.5px] font-bold text-rosso">{errore}</p>}
    </Finestra>
  )
}

function Campo({
  nome,
  errore,
  children,
}: {
  nome: string
  errore?: string | null
  children: (id: string) => ReactNode
}) {
  const id = `campo-${nome.toLowerCase().replace(/\W+/g, '-')}`
  return (
    <div className="mt-3 first:mt-0">
      <label htmlFor={id} className="mb-1 block text-[12px] font-bold text-ink">
        {nome}
      </label>
      {children(id)}
      {errore && <p className="m-0 mt-1 text-[11.5px] text-rosso">{errore}</p>}
    </div>
  )
}

function RifaiTutorial({ chi, onChiudi, onFatto }: { chi: Riga; onChiudi: () => void; onFatto: () => void }) {
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  async function vai() {
    setInCorso(true)
    const e = await rifaiTutorial(chi.id)
    setInCorso(false)
    if (!e.ok) return setErrore(e.perche)
    onFatto()
  }

  return (
    <Finestra
      titolo={`Far rifare il tutorial a ${chi.display_name}?`}
      sotto="La prossima volta che apre BAB le ricompare il tutorial. Le risposte e i check-in restano come sono."
      onChiudi={onChiudi}
      bloccata={inCorso}
      piede={
        <>
          <Tasto onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Tasto>
          <Tasto tipo="primo" onClick={() => void vai()} disabled={inCorso}>
            {inCorso ? 'Un momento…' : 'Sì, da rifare'}
          </Tasto>
        </>
      }
    >
      <p className="m-0 text-[12.5px] text-ink-medio">
        L’aveva finito il {data(chi.tutorial_done)}.
      </p>
      {errore && <p className="m-0 mt-3 text-[12.5px] font-bold text-rosso">{errore}</p>}
    </Finestra>
  )
}

/* ── pezzetti ─────────────────────────────────────────────────────────────── */

function Meta({ titolo, c, children }: { titolo: string; c: CheckIn | null; children: ReactNode }) {
  return (
    <div className={`rounded-[10px] p-3 ${c ? 'bg-chip' : 'bg-transparent'}`}>
      <p className="m-0 mb-1 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">{titolo}</p>
      {c ? children : <p className="m-0 text-[12px] text-ink-mute">non l’ha fatto</p>}
    </div>
  )
}

function Dato({ nome, v, forte }: { nome: string; v: string; forte?: boolean }) {
  if (!v) return null
  return (
    <p className="m-0 flex items-baseline justify-between gap-3 py-[2px] text-[12px]">
      <span className="shrink-0 text-ink-mute">{nome}</span>
      <span className={`text-right ${forte ? 'font-bold' : ''}`}>{v}</span>
    </p>
  )
}

/**
 * Un numero con la sua scala addosso.
 *
 * «Sforzo 5» non vuol dire niente da solo: 5 su 7 e' tanto, 5 su 10 e' meta'.
 * La barretta la fa vedere senza doverla leggere.
 */
function Scala({ nome, n, su, coda }: { nome: string; n: number | null; su: number; coda?: string }) {
  if (n === null) return null
  const quanto = su === 7 ? (n - 1) / 6 : n / 10
  return (
    <p className="m-0 flex items-center justify-between gap-3 py-[2px] text-[12px]">
      <span className="shrink-0 text-ink-mute">{nome}</span>
      <span className="flex min-w-0 items-center gap-2">
        {coda && <span className="text-[11px] text-ink-mute">{coda}</span>}
        <span aria-hidden className="h-[6px] w-[52px] overflow-hidden rounded-pill bg-riga">
          <span className="block h-full rounded-pill bg-ink-tenue" style={{ width: `${Math.max(4, quanto * 100)}%` }} />
        </span>
        <span className="w-[42px] text-right font-bold tabular-nums">
          {n}
          <span className="text-ink-mute"> / {su}</span>
        </span>
      </span>
    </p>
  )
}

function Pillola({ children, allarme }: { children: ReactNode; allarme?: boolean }) {
  return (
    <span
      className={`rounded-pill px-2 py-[2px] text-[10.5px] font-bold ${
        allarme ? 'bg-allarme-fondo text-rosso' : 'bg-chip text-ink-medio'
      }`}
    >
      {children}
    </span>
  )
}

/** l'ora sull'orologio di lei, che e' l'unica vera: il fuso non lo salviamo */
function ora(c: CheckIn): string {
  return c.local_time ? c.local_time.slice(0, 5) : '—'
}

function durata(c: CheckIn): string {
  if (c.seconds === null) return ''
  if (c.seconds < 90) return `, ${c.seconds}s`
  return `, ${Math.round(c.seconds / 60)} min`
}
