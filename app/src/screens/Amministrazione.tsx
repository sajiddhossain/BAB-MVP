import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Apri } from '../ui/Apri'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useSessione } from '../lib/conto'
import { SENZA_ACCESSO } from '../lib/sviluppo'
import { elencoChiavi, scrittePartenza } from '../lib/scritte'
import type { Scritte, Valore } from '../lib/scritte'
import type { Lingua } from '../lib/lingua'
import { GRUPPI, ramiConosciuti } from '../data/schermi'
import type { SchermoScritte } from '../data/schermi'
import { SEZIONI } from '../data/sezioni'
import type { StatoSezione } from '../data/sezioni'
import { cambiaSezione, caricaSezioni, statiDiAdesso } from '../lib/sezioni'

/**
 * Le parole dell'app, per chi le scrive.
 *
 * Il senso di questa pagina e' che una persona che non tocca codice possa
 * cambiare qualunque scritta dell'app e vederla al suo posto, nel suo
 * schermo, mentre la scrive. Il layout non si tocca: si tocca solo cio' che
 * c'e' scritto dentro.
 *
 * ── COME SI USA ────────────────────────────────────────────────────────────
 * Si tocca la scritta dentro allo schermo. Non c'e' da cercarla in un elenco
 * e non c'e' da sapere come si chiama: si punta il dito su quello che si
 * vuole cambiare, si apre, si riscrive. Un elenco di tutte le scritte c'e'
 * ancora, chiuso in fondo, ma serve solo a chi cerca una frase di cui non
 * ricorda lo schermo.
 *
 * Come faccia a sapere quale scritta e' stata toccata sta in `scritte.ts`:
 * dentro alla cornice ogni scritta si porta dietro il proprio numero scritto
 * in caratteri a larghezza zero. Nell'app che usano le atlete non c'e'
 * niente di tutto questo.
 *
 * ── I DUE MODI ─────────────────────────────────────────────────────────────
 * `correggi` ogni tocco apre la scritta invece di premere il bottone;
 * `prova` lo schermo funziona e ci si cammina dentro. Servono tutt'e due:
 * meta' delle scritte stanno dentro ai bottoni, ma al foglio delle
 * sensazioni ci si arriva solo toccando il corpo.
 *
 * ── CHI PUO' ENTRARE ───────────────────────────────────────────────────────
 * Chi sta in `platform_admins`. Il controllo vero non e' qui: e' nelle regole
 * del database, che rifiutano la scrittura a chiunque altro. Questa pagina
 * chiede al database "sono admin?" solo per non mostrare una scrivania a chi
 * non potra' salvarci niente.
 *
 * La porta e' `/admin/login`, ed e' diversa da quella dell'app: di la' si
 * crea un account, di qua si entra e basta. Chi scrive i testi e' passato
 * prima dall'app vera, come tutti.
 *
 * ── BOZZA E PUBBLICATO ─────────────────────────────────────────────────────
 * Due colonne. Si salva la bozza quante volte si vuole senza che nessuno se
 * ne accorga; alle atlete arriva solo premendo "pubblica". Durante il pilota
 * un refuso salvato per sbaglio non deve finire sullo schermo di una ragazza
 * di dodici anni.
 */

type Riga = { bozza: Valore | null; vivo: Valore | null }
type Righe = Record<Lingua, Record<string, Riga>>
type Modo = 'correggi' | 'prova'

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
        <a className="underline" href="/admin/login">
          Entra da qui
        </a>
        .
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

function Schermata({ children }: { children: ReactNode }) {
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
  const [scelto, setScelto] = useState<SchermoScritte>(GRUPPI[3].schermi[0])
  const [modo, setModo] = useState<Modo>('correggi')
  const [aperta, setAperta] = useState<string | null>(null)
  /* quando un tocco prende una frase composta da piu' scritte, si sceglie */
  const [fraQuali, setFraQuali] = useState<string[]>([])
  const [cerca, setCerca] = useState('')
  const [stato, setStato] = useState('')
  const [pannello, setPannello] = useState<'scritte' | 'sezioni'>('scritte')
  const [apertiGruppi, setApertiGruppi] = useState<Record<string, boolean>>({})
  const cornice = useRef<HTMLIFrameElement>(null)

  const partenza = useMemo(() => ({ it: scrittePartenza('it'), en: scrittePartenza('en') }), [])
  /* lo stesso ordine che la cornice usa per numerare: e' il ponte fra i due */
  const perNumero = useMemo(() => elencoChiavi(lingua), [lingua])

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
    const f = cornice.current?.contentWindow
    if (!f) return
    f.postMessage({ tipo: 'bab:scritte', scritte: bozze }, window.location.origin)
    f.postMessage({ tipo: 'bab:modo', modo }, window.location.origin)
  }, [bozze, modo])

  useEffect(manda, [manda])

  /* la cornice dice "sono in piedi", e dice cosa e' stato toccato */
  useEffect(() => {
    function ascolta(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      const m = e.data as { tipo?: string; numeri?: number[] } | null
      if (m?.tipo === 'bab:pronta') {
        manda()
        return
      }
      if (m?.tipo !== 'bab:tocca' || !m.numeri) return
      const chiavi = m.numeri.map((n) => perNumero[n]).filter(Boolean)
      if (chiavi.length === 0) return
      setCerca('')
      /*
       * Una sola scritta si apre; se il tocco ne prende piu' d'una — una frase
       * cucita insieme da pezzi diversi — si chiede quale, perche' indovinare
       * vorrebbe dire far correggere la parola sbagliata.
       */
      if (chiavi.length === 1) {
        setAperta(chiavi[0])
        setFraQuali([])
      } else {
        setFraQuali(chiavi)
        setAperta(null)
      }
    }
    window.addEventListener('message', ascolta)
    return () => window.removeEventListener('message', ascolta)
  }, [manda, perNumero])

  /* le chiavi dell'elenco in fondo: quelle di questo schermo, o la ricerca */
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

  /** Quello che le atlete leggono adesso: la riga pubblicata, o il codice. */
  function pubblicato(k: string): Valore {
    return righe[lingua][k]?.vivo ?? partenza[lingua][k]
  }

  /*
   * Le scritture vanno in fila indiana. Toccare "Rimetti l'originale" prima
   * toglie il cursore dal campo, e togliere il cursore salva la bozza: sono
   * due chiamate che partono insieme, e se la cancellazione arrivasse per
   * prima il salvataggio rimetterebbe al mondo la riga appena tolta.
   */
  const coda = useRef<Promise<unknown>>(Promise.resolve())
  function inFila(fn: () => Promise<void>): void {
    coda.current = coda.current.then(fn, fn).catch(() => {})
  }

  function scrivi(k: string, v: Valore) {
    setRighe((r) => ({
      ...r,
      [lingua]: { ...r[lingua], [k]: { bozza: v, vivo: r[lingua][k]?.vivo ?? null } },
    }))
  }

  function salva(k: string) {
    if (!supabase) return
    inFila(async () => {
      const riga = righe[lingua][k]
      if (!riga) return
      /*
       * Aprire una scritta e chiuderla senza toccarla non deve lasciare una
       * riga: il campo si chiude anche solo cliccando altrove, e senza questo
       * la tabella si riempirebbe di righe che dicono quello che il codice
       * dice gia'.
       */
      if (riga.vivo === null && testo(riga.bozza) === testo(partenza[lingua][k])) return
      setStato('salvo…')
      const { error } = await supabase!.from('copy_overrides').upsert(
        {
          chiave: k,
          lingua,
          bozza: riga.bozza,
          vivo: riga.vivo,
          aggiornato: new Date().toISOString(),
        },
        { onConflict: 'chiave,lingua' },
      )
      setStato(error ? `non salvato: ${error.message}` : 'bozza salvata')
    })
  }

  /** torna al testo del codice: la riga sparisce, e con lei la sovrascrittura */
  function ripristina(k: string) {
    if (!supabase) return
    inFila(async () => {
      setStato('ripristino…')
      const { error } = await supabase!
        .from('copy_overrides')
        .delete()
        .eq('chiave', k)
        .eq('lingua', lingua)
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
    })
  }

  /** bozza → pubblicato: da qui in poi la scritta e' quella che leggono loro */
  function pubblica(quali: string[]) {
    if (!supabase) return
    inFila(async () => {
      const daFare = quali
        .map((k) => ({ k, r: righe[lingua][k] }))
        .filter(({ k, r }) => r && r.bozza !== null && testo(r.bozza) !== testo(pubblicato(k)))
      if (daFare.length === 0) {
        setStato('niente da pubblicare')
        return
      }
      setStato(`pubblico ${daFare.length}…`)
      const { error } = await supabase!.from('copy_overrides').upsert(
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
      setStato(daFare.length === 1 ? 'pubblicata' : `pubblicate ${daFare.length}`)
    })
  }

  /*
   * Le bozze in attesa si contano su TUTTE le scritte, non su quelle dello
   * schermo aperto: correggendo si cammina, e una bozza lasciata indietro
   * tre schermi fa non deve sparire dal conto.
   */
  const daPubblicare = useMemo(
    () =>
      Object.keys(partenza[lingua]).filter((k) => {
        const r = righe[lingua][k]
        return r && r.bozza !== null && testo(r.bozza) !== testo(r.vivo ?? partenza[lingua][k])
      }),
    [partenza, lingua, righe],
  )

  function apri(k: string) {
    setAperta(k)
    setFraQuali([])
  }

  function vaiA(s: SchermoScritte) {
    setPannello('scritte')
    setCerca('')
    setAperta(null)
    setFraQuali([])
    setScelto(s)
  }

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <aside className="w-[210px] shrink-0 overflow-y-auto border-r border-line bg-surface p-4">
        <p className="m-0 text-[15px] font-bold">Le parole di BAB</p>
        <div className="mt-3 flex gap-1">
          {(['it', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLingua(l)
                setAperta(null)
                setFraQuali([])
              }}
              className={`bab-tocco flex-1 rounded-[8px] border px-2 py-1 text-[12px] font-bold ${
                lingua === l ? 'border-verde-acceso bg-verde-chiaro' : 'border-line bg-chip'
              }`}
            >
              {l === 'it' ? 'Italiano' : 'English'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPannello(pannello === 'sezioni' ? 'scritte' : 'sezioni')}
          className={`mt-3 w-full rounded-[8px] border px-2 py-[6px] text-left text-[12.5px] font-bold transition-colors duration-150 motion-reduce:transition-none ${
            pannello === 'sezioni'
              ? 'border-verde-acceso bg-verde-chiaro'
              : 'border-line bg-chip hover:bg-surface'
          }`}
        >
          Sezioni dell’app
        </button>

        {/*
          I gruppi si aprono e si chiudono. Con le otto lezioni del percorso
          le voci sono novanta, e novanta voci tutte aperte non sono un elenco:
          sono un muro. Aperto resta quello dove si sta.
        */}
        {GRUPPI.map((g) => {
          const dentro = g.schermi.some((s) => s.id === scelto.id)
          const apertoQui = apertiGruppi[g.nome] ?? dentro
          return (
            <div key={g.nome} className="mt-3">
              <button
                type="button"
                onClick={() =>
                  setApertiGruppi((a) => ({ ...a, [g.nome]: !(a[g.nome] ?? dentro) }))
                }
                className="flex w-full items-center gap-1 rounded-[6px] px-1 py-[3px] text-left text-[10px] font-bold tracking-[1px] text-ink-mute uppercase transition-colors duration-150 hover:text-ink motion-reduce:transition-none"
              >
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-200 motion-reduce:transition-none"
                  style={{ transform: apertoQui ? 'rotate(90deg)' : 'none' }}
                >
                  ›
                </span>
                {g.nome}
              </button>
              <Apri aperto={apertoQui}>
                <ul className="m-0 mt-1 flex list-none flex-col p-0">
                  {g.schermi.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => vaiA(s)}
                        className={`w-full rounded-[6px] px-2 py-[5px] text-left text-[12.5px] transition-colors duration-150 hover:bg-chip motion-reduce:transition-none ${
                          scelto.id === s.id && pannello === 'scritte'
                            ? 'bg-verde-chiaro font-bold'
                            : ''
                        }`}
                      >
                        {s.nome}
                      </button>
                    </li>
                  ))}
                </ul>
              </Apri>
            </div>
          )
        })}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => vaiA(ALTRE)}
            className={`w-full rounded-[6px] px-2 py-[5px] text-left text-[12.5px] transition-colors duration-150 hover:bg-chip motion-reduce:transition-none ${
              scelto.id === 'altre' && pannello === 'scritte' ? 'bg-verde-chiaro font-bold' : ''
            }`}
          >
            Tutte le altre
          </button>
        </div>
      </aside>

      {pannello === 'sezioni' ? (
        <Sezioni />
      ) : (
      <main className="flex min-w-0 flex-1 gap-6 overflow-y-auto p-6">
        <div className="shrink-0">
          <div className="mb-3 flex w-[402px] gap-1 rounded-pill bg-chip p-1">
            {(
              [
                ['correggi', 'Correggi le scritte'],
                ['prova', 'Prova lo schermo'],
              ] as const
            ).map(([m, etichetta]) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={`bab-tocco flex-1 rounded-pill px-3 py-[6px] text-[12.5px] font-bold ${
                  modo === m ? 'bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.10)]' : 'text-ink-medio'
                }`}
              >
                {etichetta}
              </button>
            ))}
          </div>
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
              src={`${scelto.rotta}${scelto.rotta.includes('?') ? '&' : '?'}anteprima=1&lingua=${lingua}`}
              className="block h-[874px] w-[402px] border-0"
            />
          </div>
          <p className="m-0 mt-2 w-[402px] text-[11.5px] leading-[1.5] text-ink-medio">
            {modo === 'correggi'
              ? 'Passa sopra a una scritta e toccala: si apre qui a destra. Così i bottoni non partono, e non cambi schermo mentre correggi.'
              : `Adesso lo schermo funziona davvero e ci puoi camminare dentro. ${scelto.come ?? ''}`}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="m-0 text-[17px] font-bold">{scelto.nome}</p>
            <span className="text-[12px] text-ink-medio">{stato}</span>
          </div>

          {daPubblicare.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => pubblica(daPubblicare)}
                className="bab-tocco rounded-pill border-[1.5px] border-line bg-lime px-4 py-[6px] text-[12.5px] font-bold"
              >
                Pubblica tutte le modifiche ({daPubblicare.length})
              </button>
              <span className="text-[11.5px] text-ink-medio">
                finché non pubblichi, le atlete vedono quello di prima
              </span>
            </div>
          )}

          <div className="mt-4">
            {fraQuali.length > 0 && (
              <Riquadro>
                <p className="m-0 text-[13.5px] font-bold">Lì ci sono più scritte insieme.</p>
                <p className="m-0 mt-1 text-[12px] text-ink-medio">Quale vuoi cambiare?</p>
                <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
                  {fraQuali.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        onClick={() => apri(k)}
                        className="bab-tocco w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-left"
                      >
                        <span className="block truncate text-[13px]">{testo(valore(k))}</span>
                        <code className="block text-[10.5px] text-ink-mute">{k}</code>
                      </button>
                    </li>
                  ))}
                </ul>
              </Riquadro>
            )}

            {aperta && (
              <Campo
                key={aperta}
                chiave={aperta}
                valore={valore(aperta)}
                originale={partenza[lingua][aperta]}
                pubblicato={pubblicato(aperta)}
                onCambia={(v) => scrivi(aperta, v)}
                onEsce={() => salva(aperta)}
                onRipristina={() => ripristina(aperta)}
                onPubblica={() => pubblica([aperta])}
                onChiudi={() => setAperta(null)}
              />
            )}

            {!aperta && fraQuali.length === 0 && (
              <Riquadro>
                <p className="m-0 text-[14px] leading-[1.6]">
                  Tocca una scritta nello schermo qui accanto per cambiarla.
                </p>
                <p className="m-0 mt-2 text-[12px] leading-[1.6] text-ink-medio">
                  Vale per tutto quello che si legge: titoli, bottoni, etichette, il grigino dentro
                  ai campi da riempire. Non serve sapere come si chiama.
                </p>
              </Riquadro>
            )}
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-[12.5px] font-bold text-ink-medio">
              Tutte le scritte, in elenco
            </summary>
            <input
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca una parola o una frase, in tutta l’app…"
              className="mt-3 w-full rounded-[8px] border border-line bg-surface px-2 py-[6px] text-[12.5px]"
            />
            <ul className="m-0 mt-3 flex list-none flex-col gap-1 p-0">
              {chiavi.map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => apri(k)}
                    className={`bab-tocco w-full rounded-[8px] border px-3 py-2 text-left ${
                      aperta === k
                        ? 'border-verde-acceso bg-verde-chiaro'
                        : 'border-line bg-surface'
                    }`}
                  >
                    <span className="block truncate text-[13px]">{testo(valore(k))}</span>
                    <code className="block text-[10.5px] text-ink-mute">{k}</code>
                  </button>
                </li>
              ))}
              {chiavi.length === 0 && (
                <li className="mt-2 text-[13px] text-ink-medio">Nessuna scritta qui.</li>
              )}
            </ul>
          </details>
        </div>
      </main>
      )}
    </div>
  )
}

/* ── le sezioni dell'app ──────────────────────────────────────────────────── */

/**
 * Accendere e spegnere i pezzi dell'app.
 *
 * Tre stati e non due, per il motivo scritto in `data/sezioni.ts`: fra
 * "si usa" e "non esiste" c'e' "arriva presto", ed e' quello che serve quasi
 * sempre — un'atleta che vede il nome di una cosa che sta arrivando e' in un
 * posto diverso da una che non lo vede mai.
 *
 * Qui non c'e' la bozza. Le scritte hanno bozza e pubblicato perche' un
 * refuso non deve arrivare a una ragazza di dodici anni; spegnere una sezione
 * invece e' una decisione, e quando la si prende la si vuole subito.
 */
const STATI: { id: StatoSezione; nome: string; cosa: string }[] = [
  { id: 'aperta', nome: 'Aperta', cosa: 'Si usa.' },
  {
    id: 'in-arrivo',
    nome: 'In arrivo',
    cosa: 'Si vede nella barra in fondo, si tocca, e dice che arriva presto.',
  },
  {
    id: 'nascosta',
    nome: 'Nascosta',
    cosa: 'Sparisce dalla barra. Chi ci arriva scrivendo l’indirizzo torna alla home.',
  },
]

function Sezioni() {
  const [stati, setStati] = useState(statiDiAdesso)
  const [stato, setStato] = useState('')

  useEffect(() => {
    void caricaSezioni().then(() => setStati(statiDiAdesso()))
  }, [])

  async function cambia(id: string, nuovo: StatoSezione) {
    const prima = stati[id]
    setStati((s) => ({ ...s, [id]: nuovo }))
    setStato('salvo…')
    const errore = await cambiaSezione(id, nuovo)
    if (errore) {
      setStati((s) => ({ ...s, [id]: prima }))
      setStato(`non salvato: ${errore}`)
      return
    }
    setStato('fatto — le atlete lo vedono al prossimo giro')
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto p-6">
      <div className="max-w-[640px]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="m-0 text-[17px] font-bold">Sezioni dell’app</p>
          <span className="text-[12px] text-ink-medio">{stato}</span>
        </div>
        <p className="m-0 mt-2 text-[13px] leading-[1.6] text-ink-medio">
          Cosa è acceso e cosa no. Non è una bozza: quello che scegli qui vale subito, senza
          pubblicare. Nell’anteprima qui accanto le sezioni restano sempre aperte, se no
          spegnendone una non potresti più correggerne le parole.
        </p>

        <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
          {SEZIONI.map((s) => (
            <li key={s.id} className="rounded-[14px] border border-line bg-surface p-4">
              <p className="m-0 text-[14px] font-bold">{s.nome}</p>
              <p className="m-0 mt-1 text-[12px] leading-[1.5] text-ink-medio">{s.cosa}</p>
              <div className="mt-3 flex flex-wrap gap-1 rounded-pill bg-chip p-1">
                {STATI.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => void cambia(s.id, v.id)}
                    title={v.cosa}
                    className={`bab-tocco flex-1 rounded-pill px-3 py-[6px] text-[12.5px] font-bold ${
                      stati[s.id] === v.id
                        ? 'bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.10)]'
                        : 'text-ink-medio hover:text-ink'
                    }`}
                  >
                    {v.nome}
                  </button>
                ))}
              </div>
              <p className="m-0 mt-2 text-[11.5px] leading-[1.5] text-ink-mute">
                {STATI.find((v) => v.id === stati[s.id])?.cosa}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

const ALTRE: SchermoScritte = {
  id: 'altre',
  nome: 'Tutte le altre',
  rotta: '/casa',
  rami: [],
  come: 'Le scritte che nessuno schermo qui accanto rivendica: bottoni comuni, messaggi di errore, i nomi dei giorni.',
}

function Riquadro({ children }: { children: ReactNode }) {
  return <div className="rounded-[14px] border border-line bg-surface p-4">{children}</div>
}

/* ── la scritta aperta ────────────────────────────────────────────────────── */

function Campo({
  chiave,
  valore,
  originale,
  pubblicato,
  onCambia,
  onEsce,
  onRipristina,
  onPubblica,
  onChiudi,
}: {
  chiave: string
  valore: Valore
  originale: Valore
  pubblicato: Valore
  onCambia: (v: Valore) => void
  onEsce: () => void
  onRipristina: () => void
  onPubblica: () => void
  onChiudi: () => void
}) {
  const lista = Array.isArray(originale)
  const cambiata = testo(valore) !== testo(originale)
  const inBozza = cambiata && testo(valore) !== testo(pubblicato)
  const buchi = [...testo(originale).matchAll(/\{(\w+)\}/g)].map((m) => m[1])

  return (
    <Riquadro>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px]">
          {inBozza && <span className="font-bold text-ambra-testo">bozza non pubblicata</span>}
          {cambiata && !inBozza && <span className="font-bold text-verde-scuro">pubblicata</span>}
          {!cambiata && <span className="text-ink-mute">com’è nel disegno</span>}
        </span>
        <button type="button" onClick={onChiudi} className="text-[14px] text-ink-mute">
          chiudi
        </button>
      </div>

      <textarea
        // e' l'unico campo della pagina, e ci si arriva toccando: il cursore
        // deve essere gia' dentro, se no si tocca due volte per scrivere
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        value={lista ? (valore as string[]).join('\n') : (valore as string)}
        onChange={(e) => onCambia(lista ? e.target.value.split('\n') : e.target.value)}
        onBlur={onEsce}
        rows={lista ? Math.max(3, (valore as string[]).length + 1) : testo(valore).length > 70 ? 4 : 2}
        className="mt-2 w-full resize-y rounded-[10px] border-[1.5px] border-verde-acceso bg-surface px-3 py-2 text-[14px] leading-[1.55]"
      />

      {lista && (
        <p className="m-0 text-[11px] text-ink-medio">
          È un elenco: una riga per voce. Togliendo una riga si toglie una voce.
        </p>
      )}
      {buchi.length > 0 && (
        <p className="m-0 text-[11px] text-ink-medio">
          Lascia dove sono i buchi {buchi.map((b) => `{${b}}`).join(' ')} — è lì che l’app mette il
          nome, il numero o il ritmo.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!inBozza}
          onClick={onPubblica}
          className="bab-tocco rounded-pill border-[1.5px] border-line bg-lime px-4 py-[6px] text-[12.5px] font-bold disabled:bg-chip disabled:text-ink-mute"
        >
          {inBozza ? 'Pubblica questa' : 'Niente da pubblicare'}
        </button>
        {cambiata && (
          <button
            type="button"
            onClick={onRipristina}
            className="bab-tocco rounded-pill border-[1.5px] border-line bg-surface px-4 py-[6px] text-[12.5px] font-bold"
          >
            Rimetti l’originale
          </button>
        )}
        <code className="ml-auto text-[10.5px] text-ink-mute">{chiave}</code>
      </div>
    </Riquadro>
  )
}

/** Per confrontare due valori senza pensare se sono stringhe o liste. */
function testo(v: Valore | null): string {
  if (v === null || v === undefined) return ''
  return Array.isArray(v) ? v.join('\n') : v
}
