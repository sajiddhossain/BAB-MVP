import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { leggiAtlete, leggiScheda } from '../../lib/admin'
import type { Atleta as Riga, CheckIn, Scheda, Segnale } from '../../lib/admin'
import { Telaio } from './Telaio'
import { CICLO, CONTRACCETTIVO, GIORNI, IMPEGNO, useVocabolario } from './vocabolario'
import type { Vocabolario } from './vocabolario'

/**
 * La scheda di una persona.
 *
 * ── COME E' ORDINATA ───────────────────────────────────────────────────────
 * Dall'alto: chi e' (l'anagrafica, che non cambia mai), come sta andando
 * (poche cifre), e poi i giorni — uno sotto l'altro, il piu' recente in cima.
 * Un giorno tiene insieme il check-in della mattina, il check-out della sera
 * e le sensazioni sul corpo di tutt'e due, perche' e' cosi' che li ha vissuti
 * lei: separati in tre elenchi diversi non si rimettono piu' insieme.
 *
 * ── I NUMERI HANNO LA LORO SCALA ADDOSSO ───────────────────────────────────
 * Sonno, energia, umore e scuola vanno da 1 a 7; lo sforzo e l'intensita' da
 * 0 a 10. Sono scale diverse, e un «5» stampato da solo si legge male: qui
 * ognuno si porta dietro il suo fondoscala. Chi guarda non deve ricordarsi
 * quale domanda usava quale.
 */
export function Atleta() {
  const { id = '' } = useParams()
  const v = useVocabolario()
  const [chi, setChi] = useState<Riga | null>(null)
  const [scheda, setScheda] = useState<Scheda | null>(null)
  const [letto, setLetto] = useState(false)

  useEffect(() => {
    let vivo = true
    void (async () => {
      const [tutte, s] = await Promise.all([leggiAtlete(), leggiScheda(id)])
      if (!vivo) return
      setChi(tutte?.find((a) => a.id === id) ?? null)
      setScheda(s)
      setLetto(true)
    })()
    return () => {
      vivo = false
    }
  }, [id])

  /* i giorni: un check-in e un check-out per data, con appese le sensazioni */
  const giorni = useMemo(() => raggruppa(scheda), [scheda])

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

  return (
    <Telaio
      nome={chi.display_name}
      sotto={[chi.email, chi.sport, `${chi.age} anni`].filter(Boolean).join(' · ')}
    >
      <div className="mx-auto max-w-[880px] p-6">
        <Anagrafica chi={chi} scheda={scheda} />

        {scheda && (
          <>
            <Settimana chi={chi} scheda={scheda} />
            <Percorso chi={chi} scheda={scheda} />

            <h2 className="m-0 mt-8 text-[15px] font-bold">
              I giorni{giorni.length > 0 && <span className="text-ink-mute"> · {giorni.length}</span>}
            </h2>
            {giorni.length === 0 && (
              <p className="m-0 mt-2 text-[13px] text-ink-medio">
                Non ha ancora finito nessun check-in. Uno cominciato e lasciato a metà non arriva
                al database: l’app scrive solo alla fine.
              </p>
            )}
            <div className="mt-3 flex flex-col gap-3">
              {giorni.map((g) => (
                <Giorno key={g.giorno} g={g} v={v} scheda={scheda} />
              ))}
            </div>
          </>
        )}
      </div>
    </Telaio>
  )
}

/* ── chi e' ───────────────────────────────────────────────────────────────── */

function Anagrafica({ chi, scheda }: { chi: Riga; scheda: Scheda | null }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <Voce
          nome="Segnate protettive"
          v={String(chi.signals_flagged)}
          allarme={chi.signals_flagged > 0}
        />
        <Voce nome="Lezioni finite" v={`${chi.lessons_done} su 8`} />
        <Voce
          nome="Tutorial"
          v={chi.tutorial_done ? `finito il ${data(chi.tutorial_done)}` : 'non finito'}
        />
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
  )
}

/* ── la sua settimana ─────────────────────────────────────────────────────── */

/**
 * Quando dovrebbe allenarsi, e quando ha davvero aperto BAB.
 *
 * L'aderenza — «nei giorni in cui si allena, fa il check-in?» — e' la sola
 * domanda a cui questi due dati insieme rispondono, e nessuno dei due da solo.
 */
function Settimana({ chi, scheda }: { chi: Riga; scheda: Scheda }) {
  if (scheda.settimana.length === 0) return null
  const per = new Map<number, string[]>()
  for (const i of scheda.settimana) {
    const nome = i.kind === 'training' ? (i.sport ?? 'Allenamento') : IMPEGNO[i.kind] || i.kind
    per.set(i.weekday, [...(per.get(i.weekday) ?? []), nome])
  }
  return (
    <div className="mt-4">
      <h2 className="m-0 text-[15px] font-bold">La sua settimana</h2>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((g) => (
          <div
            key={g}
            className={`rounded-[10px] border p-2 text-center ${
              per.has(g) ? 'border-line bg-surface' : 'border-riga bg-transparent'
            }`}
          >
            <p className="m-0 text-[10.5px] font-bold text-ink-mute uppercase">
              {GIORNI[g]?.slice(0, 3)}
            </p>
            <p className="m-0 mt-1 text-[11px] leading-[1.3] text-ink-medio">
              {(per.get(g) ?? []).join(', ') || '—'}
            </p>
          </div>
        ))}
      </div>
      <p className="m-0 mt-2 text-[11px] text-ink-mute">
        Quello che ha dichiarato all’onboarding. L’ora non c’è: l’app la chiede e non la salva.
        {chi.days_30d > 0 && ` Negli ultimi trenta giorni ha aperto BAB ${chi.days_30d} volte.`}
      </p>
    </div>
  )
}

function Percorso({ chi, scheda }: { chi: Riga; scheda: Scheda }) {
  const fatte = new Map(scheda.lezioni.map((l) => [l.lesson, l.completed_at]))
  return (
    <div className="mt-6">
      <h2 className="m-0 text-[15px] font-bold">
        Il percorso <span className="text-ink-mute">· {chi.lessons_done} su 8</span>
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
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
    </div>
  )
}

/* ── un giorno ────────────────────────────────────────────────────────────── */

type Giornata = { giorno: string; pre: CheckIn | null; post: CheckIn | null; segnali: Segnale[] }

function raggruppa(scheda: Scheda | null): Giornata[] {
  if (!scheda) return []
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
  const di = new Map<string, string>()
  for (const c of scheda.checkins) di.set(c.id, c.local_date)
  for (const s of scheda.segnali) {
    const giorno = (s.check_in_id && di.get(s.check_in_id)) || s.created_at.slice(0, 10)
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
    <div className="rounded-[14px] border-[1.5px] border-line bg-surface p-4">
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
                <Dato
                  nome="Ha portato a casa"
                  v={g.post.brought_home.map((b) => v.bottino(b)).join(', ')}
                />
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
          <p className="m-0 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">
            Le sue parole
          </p>
          {note.map((t) => (
            <p key={t} className="m-0 mt-1 text-[13px] leading-[1.5] text-ink">
              «{t}»
            </p>
          ))}
        </div>
      )}

      <p className="m-0 mt-3 text-[10.5px] text-ink-mute">
        {[
          g.pre && `mattina ${ora(g.pre)}${durata(g.pre)}`,
          g.post && `sera ${ora(g.post)}${durata(g.post)}`,
        ]
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
    <div
      className={`rounded-[10px] border px-3 py-2 ${
        s.is_red_flag ? 'border-rosso-bordo bg-allarme-fondo' : 'border-riga bg-chip'
      }`}
    >
      <p className="m-0 text-[12.5px]">
        <b>{dove}</b>
        {s.sensation.length > 0 && <> · {s.sensation.map((p) => v.parola(p)).join(', ')}</>}
        {s.intensity !== null && (
          <span className="text-ink-medio"> · {s.intensity} su 10</span>
        )}
      </p>
      {contorno.length > 0 && (
        <p className="m-0 mt-[3px] text-[11px] text-ink-mute">{contorno.join(' · ')}</p>
      )}
      {parole?.words && (
        <p className="m-0 mt-[5px] text-[12px] leading-[1.45] text-ink">«{parole.words}»</p>
      )}
    </div>
  )
}

/* ── pezzetti ─────────────────────────────────────────────────────────────── */

function Riquadro({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] border-[1.5px] border-line bg-surface p-4">
      <p className="m-0 mb-2 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">
        {titolo}
      </p>
      {children}
    </div>
  )
}

function Voce({ nome, v, allarme }: { nome: string; v: string; allarme?: boolean }) {
  return (
    <p className="m-0 flex items-baseline justify-between gap-3 py-[3px] text-[12px]">
      <span className="shrink-0 text-ink-mute">{nome}</span>
      <span className={`text-right font-bold ${allarme ? 'text-rosso' : ''}`}>{v}</span>
    </p>
  )
}

function Meta({ titolo, c, children }: { titolo: string; c: CheckIn | null; children: ReactNode }) {
  return (
    <div className={`rounded-[10px] p-3 ${c ? 'bg-chip' : 'bg-transparent'}`}>
      <p className="m-0 mb-1 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">
        {titolo}
      </p>
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
          <span
            className="block h-full rounded-pill bg-ink-tenue"
            style={{ width: `${Math.max(4, quanto * 100)}%` }}
          />
        </span>
        <span className="w-[38px] text-right font-bold tabular-nums">
          {n}
          <span className="text-ink-mute">/{su}</span>
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

/* ── date ─────────────────────────────────────────────────────────────────── */

function data(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function dataLunga(giorno: string): string {
  const d = new Date(`${giorno}T12:00:00`)
  const s = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
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
