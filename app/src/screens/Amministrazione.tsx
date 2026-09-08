import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSessione } from '../lib/conto'
import { SENZA_ACCESSO } from '../lib/sviluppo'
import { scrittePartenza } from '../lib/scritte'
import type { Scritte, Valore } from '../lib/scritte'
import type { Lingua } from '../lib/lingua'
import { SCHERMI, ramiConosciuti } from '../data/schermi'
import type { SchermoScritte } from '../data/schermi'

/**
 * Le parole dell'app, per chi le scrive.
 *
 * Il senso di questa pagina e' che una persona che non tocca codice possa
 * cambiare qualunque scritta dell'app e vederla al suo posto, nel suo
 * schermo, mentre la scrive. Il layout non si tocca: si tocca solo cio' che
 * c'e' scritto dentro.
 *
 * ── COME E' FATTA ──────────────────────────────────────────────────────────
 * A sinistra gli schermi, a destra lo schermo vero dentro a una cornice piu'
 * i campi delle sue scritte. La cornice e' un <iframe> con QUESTA STESSA app
 * dentro: non e' una scorciatoia, e' l'anteprima piu' onesta che ci sia —
 * stessi componenti, stesse misure, stesso carattere. Mentre si scrive, le
 * bozze le arrivano per `postMessage`, quindi il testo cambia sotto le dita
 * senza salvare niente.
 *
 * ── CHI PUO' ENTRARE ───────────────────────────────────────────────────────
 * Chi sta in `platform_admins`. Il controllo vero non e' qui: e' nelle regole
 * del database, che rifiutano la scrittura a chiunque altro. Questa pagina
 * chiede al database "sono admin?" solo per non mostrare una scrivania a chi
 * non potra' salvarci niente.
 *
 * ── BOZZA E PUBBLICATO ─────────────────────────────────────────────────────
 * Due colonne. Si salva la bozza quante volte si vuole senza che nessuno se
 * ne accorga; alle atlete arriva solo premendo "pubblica". Durante il pilota
 * un refuso salvato per sbaglio non deve finire sullo schermo di una ragazza
 * di dodici anni.
 */

type Riga = { bozza: Valore | null; vivo: Valore | null }
type Righe = Record<Lingua, Record<string, Riga>>

const VUOTE: Righe = { it: {}, en: {} }

export function Amministrazione() {
  const { sessione, caricata } = useSessione()
  const [ammesso, setAmmesso] = useState<boolean | null>(null)

  useEffect(() => {
    if (!caricata) return
    if (!sessione || !supabase) {
      setAmmesso(false)
      return
    }
    void (async () => {
      // le regole lasciano vedere questa tabella solo a chi ci sta dentro:
      // una riga che torna indietro E' la risposta
      const { data } = await supabase.from('platform_admins').select('user_id').limit(1)
      setAmmesso((data?.length ?? 0) > 0)
    })()
  }, [caricata, sessione])

  // col lasciapassare di sviluppo la scrivania si apre e basta: serve a
  // lavorarci sopra senza essere admin di un database vero
  if (SENZA_ACCESSO) return <Scrivania />
  if (!caricata || ammesso === null) return <Schermata>Un momento…</Schermata>
  if (!sessione) {
    return (
      <Schermata>
        Questa pagina è per chi scrive i testi di BAB.{' '}
        <a className="underline" href="/onboarding/accesso">
          Entra con la tua mail
        </a>
        , poi torna qui.
      </Schermata>
    )
  }
  if (!ammesso) {
    return (
      <Schermata>
        Sei entrata, ma questo indirizzo non è per te. Se dovrebbe esserlo, chiedi a chi
        amministra BAB di aggiungerti.
      </Schermata>
    )
  }
  return <Scrivania />
}

function Schermata({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-8">
      <p className="m-0 max-w-[420px] text-center text-[14px] leading-[1.6] text-ink">{children}</p>
    </div>
  )
}

/* ── la scrivania ─────────────────────────────────────────────────────────── */

function Scrivania() {
  const [lingua, setLingua] = useState<Lingua>('it')
  const [righe, setRighe] = useState<Righe>(VUOTE)
  const [scelto, setScelto] = useState<SchermoScritte>(SCHERMI[3].schermi[0])
  const [cerca, setCerca] = useState('')
  const [stato, setStato] = useState('')
  const cornice = useRef<HTMLIFrameElement>(null)

  const partenza = useMemo(() => ({ it: scrittePartenza('it'), en: scrittePartenza('en') }), [])

  /* le righe del database, bozza compresa */
  const carica = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('copy_overrides').select('chiave,lingua,bozza,vivo')
    if (error || !data) return
    const nuove: Righe = { it: {}, en: {} }
    for (const r of data as { chiave: string; lingua: Lingua; bozza: Valore; vivo: Valore }[]) {
      if (r.lingua !== 'it' && r.lingua !== 'en') continue
      nuove[r.lingua][r.chiave] = { bozza: r.bozza ?? null, vivo: r.vivo ?? null }
    }
    setRighe(nuove)
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  /*
   * Le bozze come le vede la cornice: tutto quello che e' diverso dal codice,
   * in tutt'e due le lingue. Si manda tutto e non solo lo schermo aperto —
   * dentro alla cornice si puo' camminare, e uno schermo vicino con le
   * scritte vecchie sarebbe piu' confusionario che utile.
   */
  const bozze: Scritte = useMemo(() => {
    const fuori: Scritte = { it: {}, en: {} }
    for (const l of ['it', 'en'] as const) {
      for (const [k, r] of Object.entries(righe[l])) {
        const v = r.bozza ?? r.vivo
        if (v !== null) fuori[l][k] = v
      }
    }
    return fuori
  }, [righe])

  const manda = useCallback(() => {
    cornice.current?.contentWindow?.postMessage(
      { tipo: 'bab:scritte', scritte: bozze },
      window.location.origin,
    )
  }, [bozze])

  /* la cornice dice "sono in piedi" a ogni caricamento, anche navigandoci dentro */
  useEffect(() => {
    function ascolta(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if ((e.data as { tipo?: string } | null)?.tipo === 'bab:pronta') manda()
    }
    window.addEventListener('message', ascolta)
    return () => window.removeEventListener('message', ascolta)
  }, [manda])

  useEffect(manda, [manda])

  /* le chiavi di questo schermo, o quelle che rispondono alla ricerca */
  const chiavi = useMemo(() => {
    const tutte = Object.keys(partenza[lingua]).sort()
    if (cerca.trim()) {
      const q = cerca.trim().toLowerCase()
      return tutte.filter((k) => {
        const v = righe[lingua][k]?.bozza ?? righe[lingua][k]?.vivo ?? partenza[lingua][k]
        return k.toLowerCase().includes(q) || testo(v).toLowerCase().includes(q)
      })
    }
    if (scelto.id === 'altre') {
      const noti = ramiConosciuti()
      return tutte.filter((k) => !noti.some((r) => k === r || k.startsWith(`${r}.`)))
    }
    return tutte.filter((k) => scelto.rami.some((r) => k === r || k.startsWith(`${r}.`)))
  }, [partenza, lingua, scelto, cerca, righe])

  function valore(k: string): Valore {
    return righe[lingua][k]?.bozza ?? righe[lingua][k]?.vivo ?? partenza[lingua][k]
  }

  function scrivi(k: string, v: Valore) {
    setRighe((r) => ({
      ...r,
      [lingua]: { ...r[lingua], [k]: { bozza: v, vivo: r[lingua][k]?.vivo ?? null } },
    }))
  }

  async function salva(k: string) {
    if (!supabase) return
    const riga = righe[lingua][k]
    if (!riga) return
    setStato('salvo…')
    const { error } = await supabase
      .from('copy_overrides')
      .upsert(
        { chiave: k, lingua, bozza: riga.bozza, vivo: riga.vivo, aggiornato: new Date().toISOString() },
        { onConflict: 'chiave,lingua' },
      )
    setStato(error ? `non salvato: ${error.message}` : 'bozza salvata')
  }

  /** torna al testo del codice: la riga sparisce, e con lei la sovrascrittura */
  async function ripristina(k: string) {
    if (!supabase) return
    setStato('ripristino…')
    const { error } = await supabase.from('copy_overrides').delete().eq('chiave', k).eq('lingua', lingua)
    if (error) {
      setStato(`non riuscito: ${error.message}`)
      return
    }
    setRighe((r) => {
      const l = { ...r[lingua] }
      delete l[k]
      return { ...r, [lingua]: l }
    })
    setStato('tornata all’originale')
  }

  /** bozza → pubblicato, per le chiavi che si stanno guardando */
  async function pubblica(quali: string[]) {
    if (!supabase) return
    const daFare = quali
      .map((k) => ({ k, r: righe[lingua][k] }))
      .filter(({ r }) => r && r.bozza !== null && testo(r.bozza) !== testo(r.vivo))
    if (daFare.length === 0) {
      setStato('niente da pubblicare')
      return
    }
    setStato(`pubblico ${daFare.length}…`)
    const { error } = await supabase.from('copy_overrides').upsert(
      daFare.map(({ k, r }) => ({
        chiave: k,
        lingua,
        bozza: r!.bozza,
        vivo: r!.bozza,
        aggiornato: new Date().toISOString(),
      })),
      { onConflict: 'chiave,lingua' },
    )
    if (error) {
      setStato(`non pubblicato: ${error.message}`)
      return
    }
    await carica()
    setStato(`pubblicate ${daFare.length}`)
  }

  const daPubblicare = chiavi.filter((k) => {
    const r = righe[lingua][k]
    return r && r.bozza !== null && testo(r.bozza) !== testo(r.vivo)
  }).length

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <aside className="w-[230px] shrink-0 overflow-y-auto border-r border-line bg-surface p-4">
        <p className="m-0 text-[15px] font-bold">Le parole di BAB</p>
        <div className="mt-3 flex gap-1">
          {(['it', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLingua(l)}
              className={`flex-1 rounded-[8px] border px-2 py-1 text-[12px] font-bold ${
                lingua === l ? 'border-verde-acceso bg-verde-chiaro' : 'border-line bg-chip'
              }`}
            >
              {l === 'it' ? 'Italiano' : 'English'}
            </button>
          ))}
        </div>
        <input
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Cerca una scritta…"
          className="mt-3 w-full rounded-[8px] border border-line bg-chip px-2 py-[6px] text-[12px]"
        />
        {SCHERMI.map((g) => (
          <div key={g.nome} className="mt-4">
            <p className="m-0 text-[10px] font-bold tracking-[1px] text-ink-mute uppercase">
              {g.nome}
            </p>
            <ul className="m-0 mt-1 flex list-none flex-col p-0">
              {g.schermi.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCerca('')
                      setScelto(s)
                    }}
                    className={`w-full rounded-[6px] px-2 py-[5px] text-left text-[12.5px] ${
                      scelto.id === s.id && !cerca ? 'bg-verde-chiaro font-bold' : ''
                    }`}
                  >
                    {s.nome}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setCerca('')
              setScelto(ALTRE)
            }}
            className={`w-full rounded-[6px] px-2 py-[5px] text-left text-[12.5px] ${
              scelto.id === 'altre' && !cerca ? 'bg-verde-chiaro font-bold' : ''
            }`}
          >
            Tutte le altre
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 gap-6 overflow-y-auto p-6">
        <div className="shrink-0">
          <div className="overflow-hidden rounded-[28px] border-[1.5px] border-line bg-surface shadow-[6px_6px_0_rgba(0,0,0,0.06)]">
            <iframe
              /*
                La chiave e' la lingua: cambiandola la cornice si ricarica,
                perche' la lingua dell'anteprima sta nell'indirizzo e non
                nella memoria del telefono — se no cambiarla qui cambierebbe
                anche la lingua dell'app di chi sta scrivendo.
              */
              key={lingua}
              ref={cornice}
              title="anteprima"
              src={`${scelto.rotta}?anteprima=1&lingua=${lingua}`}
              className="block h-[874px] w-[402px] border-0"
            />
          </div>
          {scelto.come && (
            <p className="m-0 mt-2 w-[402px] text-[11.5px] text-ink-medio">↑ {scelto.come}</p>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="m-0 text-[17px] font-bold">{cerca ? `“${cerca}”` : scelto.nome}</p>
            <span className="text-[12px] text-ink-medio">{stato}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={daPubblicare === 0}
              onClick={() => void pubblica(chiavi)}
              className="rounded-pill border-[1.5px] border-line bg-lime px-4 py-[6px] text-[12.5px] font-bold disabled:bg-chip disabled:text-ink-mute"
            >
              {daPubblicare === 0
                ? 'Niente da pubblicare'
                : `Pubblica ${daPubblicare} ${daPubblicare === 1 ? 'scritta' : 'scritte'}`}
            </button>
            <span className="text-[11.5px] text-ink-medio">
              finché non pubblichi, le atlete vedono quello di prima
            </span>
          </div>

          <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
            {chiavi.map((k) => (
              <Campo
                key={k}
                chiave={k}
                valore={valore(k)}
                originale={partenza[lingua][k]}
                pubblicato={righe[lingua][k]?.vivo ?? null}
                onCambia={(v) => scrivi(k, v)}
                onEsce={() => void salva(k)}
                onRipristina={() => void ripristina(k)}
              />
            ))}
            {chiavi.length === 0 && (
              <li className="text-[13px] text-ink-medio">Nessuna scritta qui.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}

const ALTRE: SchermoScritte = {
  id: 'altre',
  nome: 'Tutte le altre',
  rotta: '/casa',
  rami: [],
  come: 'Le scritte che nessuno schermo qui accanto rivendica: bottoni comuni, messaggi di errore, i nomi dei giorni.',
}

/* ── un campo ─────────────────────────────────────────────────────────────── */

function Campo({
  chiave,
  valore,
  originale,
  pubblicato,
  onCambia,
  onEsce,
  onRipristina,
}: {
  chiave: string
  valore: Valore
  originale: Valore
  pubblicato: Valore | null
  onCambia: (v: Valore) => void
  onEsce: () => void
  onRipristina: () => void
}) {
  const lista = Array.isArray(originale)
  const cambiata = testo(valore) !== testo(originale)
  const inBozza = cambiata && testo(valore) !== testo(pubblicato)
  const buchi = [...testo(originale).matchAll(/\{(\w+)\}/g)].map((m) => m[1])

  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <code className="text-[11px] text-ink-mute">{chiave}</code>
        <span className="flex items-center gap-2 text-[10.5px]">
          {inBozza && <span className="font-bold text-ambra-testo">bozza</span>}
          {cambiata && !inBozza && <span className="font-bold text-verde-scuro">pubblicata</span>}
          {cambiata && (
            <button type="button" onClick={onRipristina} className="underline">
              originale
            </button>
          )}
        </span>
      </div>
      <textarea
        value={lista ? (valore as string[]).join('\n') : (valore as string)}
        onChange={(e) => onCambia(lista ? e.target.value.split('\n') : e.target.value)}
        onBlur={onEsce}
        rows={Math.min(8, testo(valore).length > 90 || lista ? 4 : 1)}
        className={`mt-1 w-full resize-y rounded-[8px] border bg-surface px-2 py-[6px] text-[13px] leading-[1.5] ${
          cambiata ? 'border-verde-acceso' : 'border-line'
        }`}
      />
      {lista && <p className="m-0 text-[10.5px] text-ink-mute">una riga per voce</p>}
      {buchi.length > 0 && (
        <p className="m-0 text-[10.5px] text-ink-mute">
          buchi da lasciare: {buchi.map((b) => `{${b}}`).join(' ')}
        </p>
      )}
    </li>
  )
}

/** Per confrontare due valori senza pensare se sono stringhe o liste. */
function testo(v: Valore | null): string {
  if (v === null || v === undefined) return ''
  return Array.isArray(v) ? v.join('\n') : v
}
