import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Apri } from '../../ui/Apri'
import type { ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { elencoChiavi, scrittePartenza } from '../../lib/scritte'
import type { Scritte, Valore } from '../../lib/scritte'
import type { Lingua } from '../../lib/lingua'
import { GRUPPI, ramiConosciuti } from '../../data/schermi'
import type { SchermoScritte } from '../../data/schermi'
import { Barra } from './Barra'
import { Bozze } from './Bozze'
import type { Bozza } from './Bozze'
import { normalizza, schermoDi, testo } from './comune'


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
 * ── BOZZA E PUBBLICATO ─────────────────────────────────────────────────────
 * Due colonne. Si salva la bozza quante volte si vuole senza che nessuno se
 * ne accorga; alle atlete arriva solo premendo "pubblica". Durante il pilota
 * un refuso salvato per sbaglio non deve finire sullo schermo di una ragazza
 * di dodici anni.
 */

type Riga = { bozza: Valore | null; vivo: Valore | null }
type Righe = Record<Lingua, Record<string, Riga>>
type Modo = 'correggi' | 'prova'
/** Cosa sta succedendo, e di che tono: sta in cima alla colonna destra. */
type Avviso = { tono: 'lavoro' | 'fatto' | 'male'; testo: string }

const VUOTE: Righe = { it: {}, en: {} }


export function Scritte() {
  const [lingua, setLingua] = useState<Lingua>('it')
  const [righe, setRighe] = useState<Righe>(VUOTE)
  const [scelto, setScelto] = useState<SchermoScritte>(GRUPPI[3].schermi[0])
  const [modo, setModo] = useState<Modo>('correggi')
  const [aperta, setAperta] = useState<string | null>(null)
  /* quando un tocco prende una frase composta da piu' scritte, si sceglie */
  const [fraQuali, setFraQuali] = useState<string[]>([])
  const [cerca, setCerca] = useState('')
  /* il filtro dell'elenco a sinistra: novanta schermi non si scorrono a mano */
  const [filtro, setFiltro] = useState('')
  const [avviso, setAvviso] = useState<Avviso | null>(null)
  const [cassetto, setCassetto] = useState(false)
  /* i numeri delle scritte che l'anteprima ha addosso adesso: li manda lei */
  const [sopra, setSopra] = useState<number[]>([])
  const [apertiGruppi, setApertiGruppi] = useState<Record<string, boolean>>({})
  const cornice = useRef<HTMLIFrameElement>(null)

  const partenza = useMemo(() => ({ it: scrittePartenza('it'), en: scrittePartenza('en') }), [])
  /* lo stesso ordine che la cornice usa per numerare: e' il ponte fra i due */
  const perNumero = useMemo(() => elencoChiavi(lingua), [lingua])

  /*
   * Quello che il pannello ha da dire, e per quanto.
   *
   * Prima era una stringa che compariva in un angolo e non se ne andava piu':
   * dopo dieci minuti diceva ancora «bozza salvata» di dieci minuti prima, e
   * uno non sapeva se stesse parlando dell'ultima cosa fatta o della prima.
   * Adesso quello che e' andato bene sparisce da solo; quello che e' andato
   * male resta, perche' quello va letto.
   */
  const dillo = useCallback((tono: Avviso['tono'], testo: string) => {
    setAvviso({ tono, testo })
  }, [])

  useEffect(() => {
    if (avviso?.tono !== 'fatto') return
    const t = setTimeout(() => setAvviso(null), 2600)
    return () => clearTimeout(t)
  }, [avviso])

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

  /*
   * I numeri delle scritte da sottolineare nell'anteprima: ambra quelle con
   * una bozza in attesa, verde quelle gia' pubblicate e diverse dal disegno.
   */
  const segni = useMemo(() => {
    const posto = new Map(perNumero.map((k, i) => [k, i]))
    const bozza: number[] = []
    const viva: number[] = []
    for (const [k, r] of Object.entries(righe[lingua])) {
      const n = posto.get(k)
      if (n === undefined) continue
      const base = testo(partenza[lingua][k])
      const online = testo(r.vivo ?? partenza[lingua][k])
      if (r.bozza !== null && testo(r.bozza) !== online) bozza.push(n)
      else if (r.vivo !== null && online !== base) viva.push(n)
    }
    return { bozza, viva }
  }, [righe, lingua, partenza, perNumero])

  const manda = useCallback(() => {
    const f = cornice.current?.contentWindow
    if (!f) return
    f.postMessage({ tipo: 'bab:scritte', scritte: bozze }, window.location.origin)
    f.postMessage({ tipo: 'bab:modo', modo }, window.location.origin)
    f.postMessage({ tipo: 'bab:segna', ...segni }, window.location.origin)
  }, [bozze, modo, segni])

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
      if (m?.tipo === 'bab:visibili') {
        setSopra(m.numeri ?? [])
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

  /**
   * Le chiavi da mostrare: quelle cercate, o quelle di questo schermo.
   *
   * "Di questo schermo" sono due cose messe insieme, e ci vogliono tutt'e due.
   *
   * I RAMI (`data/schermi.ts`) dicono cosa appartiene a questo schermo: ci
   * stanno dentro anche le scritte che adesso non si vedono — quelle di un
   * pannello chiuso, di un messaggio d'errore, di un caso che oggi non
   * capita. Senza, si potrebbe correggere solo quello che e' sotto gli occhi.
   *
   * QUELLO CHE L'ANTEPRIMA HA ADDOSSO (`bab:visibili`) dice cosa si legge
   * davvero li' dentro, e prende le scritte che stanno sullo schermo senza
   * appartenergli. E' il caso delle sedici parole: i loro nomi vivono sotto
   * al check-in, dove si scelgono, ma si leggono anche nel glossario, dove
   * sono l'unica cosa che c'e'. Con i soli rami, in quello schermo l'elenco
   * non aveva nemmeno una delle sedici parole che l'atleta ci legge.
   */
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
    const inVista = new Set(sopra.map((n) => perNumero[n]).filter(Boolean))
    return tutte.filter(
      (k) => inVista.has(k) || scelto.rami.some((r) => k === r || k.startsWith(`${r}.`)),
    )
  }, [partenza, lingua, scelto, cerca, righe, sopra, perNumero])

  function valore(k: string, l: Lingua = lingua): Valore {
    return righe[l][k]?.bozza ?? righe[l][k]?.vivo ?? partenza[l][k]
  }

  /** Quello che le atlete leggono adesso: la riga pubblicata, o il codice. */
  function pubblicato(k: string, l: Lingua = lingua): Valore {
    return righe[l][k]?.vivo ?? partenza[l][k]
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

  /**
   * Il pannello senza database.
   *
   * Capita nel banco di prova, che gira apposta senza chiavi per non poter
   * scrivere sulle scritte vere. Senza questo, «Pubblica» sembrava rotto: il
   * bottone si premeva e non succedeva niente, senza una riga che lo dicesse.
   */
  function staccato() {
    if (supabase) return false
    dillo('male', 'non collegato al database: qui si guarda e basta')
    return true
  }

  function salva(k: string) {
    // questo non passa da `staccato()`: parte da solo quando il campo si
    // chiude, e un cartello rosso a ogni click fuori sarebbe solo rumore
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
      dillo('lavoro', 'salvo…')
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
      if (error) dillo('male', `non salvato: ${error.message}`)
      else dillo('fatto', 'bozza salvata')
    })
  }

  /** torna al testo del codice: la riga sparisce, e con lei la sovrascrittura */
  function ripristina(k: string, l: Lingua = lingua) {
    if (staccato()) return
    inFila(async () => {
      dillo('lavoro', 'ripristino…')
      const { error } = await supabase!
        .from('copy_overrides')
        .delete()
        .eq('chiave', k)
        .eq('lingua', l)
      if (error) {
        dillo('male', `non riuscito: ${error.message}`)
        return
      }
      setRighe((r) => {
        const dentro = { ...r[l] }
        delete dentro[k]
        return { ...r, [l]: dentro }
      })
      dillo('fatto', 'tornata all’originale')
    })
  }

  /**
   * Butta la bozza e torna a quello che si legge adesso.
   *
   * Non e' «rimetti l'originale», che torna al disegno e cancella anche
   * quello che era gia' stato pubblicato mesi fa. Questo annulla solo l'ultima
   * scrittura, ed e' quello che serve quando una correzione non convince
   * piu': senza, l'unico modo di disfarla era riscrivere a mano quella di
   * prima, cercando di ricordarsela.
   */
  function scarta(k: string, l: Lingua = lingua) {
    if (staccato()) return
    const riga = righe[l][k]
    if (!riga) return
    if (riga.vivo === null) {
      ripristina(k, l)
      return
    }
    inFila(async () => {
      dillo('lavoro', 'scarto…')
      const { error } = await supabase!
        .from('copy_overrides')
        .update({ bozza: riga.vivo, aggiornato: new Date().toISOString() })
        .eq('chiave', k)
        .eq('lingua', l)
      if (error) {
        dillo('male', `non riuscito: ${error.message}`)
        return
      }
      setRighe((r) => ({ ...r, [l]: { ...r[l], [k]: { bozza: riga.vivo, vivo: riga.vivo } } }))
      dillo('fatto', 'bozza scartata')
    })
  }

  /*
   * bozza → pubblicato: da qui in poi la scritta e' quella che leggono loro.
   *
   * La lingua e' un argomento e non `lingua` di fuori: le bozze in attesa
   * si pubblicano anche dal cassetto, dove le due lingue stanno insieme.
   */
  function pubblica(quali: string[], qualeLingua: Lingua = lingua) {
    if (staccato() || quali.length === 0) return
    inFila(async () => {
      const daFare = quali.filter((k) => righe[qualeLingua][k]?.bozza !== undefined)
      if (daFare.length === 0) return
      dillo('lavoro', 'pubblico…')
      const { error } = await supabase!.from('copy_overrides').upsert(
        daFare.map((k) => ({
          chiave: k,
          lingua: qualeLingua,
          bozza: righe[qualeLingua][k]!.bozza,
          vivo: righe[qualeLingua][k]!.bozza,
          aggiornato: new Date().toISOString(),
        })),
        { onConflict: 'chiave,lingua' },
      )
      if (error) {
        dillo('male', `non pubblicato: ${error.message}`)
        return
      }
      await carica()
      dillo('fatto', daFare.length === 1 ? 'pubblicata' : `pubblicate ${daFare.length}`)
    })
  }

  /*
   * Le bozze in attesa, per lingua.
   *
   * Si contano su TUTTE le scritte e non su quelle dello schermo aperto:
   * correggendo si cammina, e una bozza lasciata indietro tre schermi fa non
   * deve sparire dal conto.
   *
   * E si contano in tutt'e due le lingue, non solo in quella aperta. Prima
   * guardavano solo quella: si correggevano tre scritte in italiano e una in
   * inglese, il bottone diceva «3», e la quarta restava bozza per sempre senza
   * che nessuno lo dicesse. Il conto che non vedi e' quello che ti frega.
   */
  const sospese = useMemo(() => {
    const conta = (l: Lingua) =>
      Object.keys(partenza[l]).filter((k) => {
        const r = righe[l][k]
        return r && r.bozza !== null && testo(r.bozza) !== testo(r.vivo ?? partenza[l][k])
      })
    return { it: conta('it'), en: conta('en') } as Record<Lingua, string[]>
  }, [partenza, righe])

  /* le stesse bozze, pronte da leggere: dove stanno, prima e dopo */
  const inAttesa: Bozza[] = useMemo(
    () =>
      (['it', 'en'] as const).flatMap((l) =>
        sospese[l].map((k) => ({
          chiave: k,
          lingua: l,
          prima: testo(righe[l][k]?.vivo ?? partenza[l][k]),
          dopo: testo(righe[l][k]?.bozza ?? null),
        })),
      ),
    [sospese, righe, partenza],
  )

  /**
   * Apre una scritta, e ci porta lo schermo dietro se non e' quello.
   *
   * Toccandola nell'anteprima o nell'elenco dello schermo aperto lo spostamento
   * non c'e', perche' lo schermo e' gia' quello. Serve alla ricerca, che pesca
   * in tutta la app: senza, si sceglieva «Preso antidolorifici?» e a sinistra
   * restava la home, e la si correggeva senza vederla.
   */
  function apri(k: string) {
    const dove = schermoDi(k)
    if (dove && dove.id !== scelto.id) setScelto(dove)
    setAperta(k)
    setFraQuali([])
  }

  function vaiA(s: SchermoScritte) {
    setCerca('')
    setAperta(null)
    setFraQuali([])
    setScelto(s)
  }

  /* gli schermi che il filtro lascia passare, gruppo per gruppo */
  const q = normalizza(filtro)
  const gruppiVisti = GRUPPI.map((g) => ({
    nome: g.nome,
    schermi: q === '' ? g.schermi : g.schermi.filter((s) => normalizza(`${g.nome} ${s.nome}`).includes(q)),
  })).filter((g) => g.schermi.length > 0)

  return (
    <div className="flex h-full flex-col bg-paper text-ink max-md:[&>*:not([data-telefono])]:hidden">
      {/*
        Sul telefono la scrivania non ci sta: tre colonne affiancate in 375
        pixel diventano tre colonne da cui non si legge niente. Al suo posto
        un avviso, e la scrivania resta intera per chi apre da un computer.
      */}
      <div data-telefono className="flex flex-1 flex-col items-center justify-center p-6 text-center md:hidden">
        <p className="bab-display m-0 max-w-[320px] text-[24px] leading-[1.15] font-bold">
          Le parole si correggono dal computer
        </p>
        <p className="m-0 mt-3 max-w-[300px] text-[14px] leading-[1.5] text-ink-medio">
          Qui ci sono tre colonne insieme — gli schermi, l’anteprima e i testi — e sul telefono non
          ci stanno. Apri questa stanza da un computer o da un tablet.
        </p>
      </div>
      <Barra
        lingua={lingua}
        onLingua={(l) => {
          setLingua(l)
          setAperta(null)
          setFraQuali([])
        }}
        cerca={cerca}
        onCerca={setCerca}
        quanteBozze={inAttesa.length}
        onBozze={() => setCassetto(true)}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[214px] shrink-0 flex-col border-r border-line bg-surface">
          <div className="shrink-0 p-3">
            <input
              type="search"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtra gli schermi…"
              aria-label="Filtra gli schermi"
              className="h-8 w-full rounded-[8px] border border-line bg-chip px-3 text-[12px] outline-none placeholder:text-ink-mute focus:border-verde-acceso focus:bg-surface"
            />
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            {/*
              I gruppi si aprono e si chiudono. Con le otto lezioni del percorso
              le voci sono novanta, e novanta voci tutte aperte non sono un elenco:
              sono un muro. Aperto resta quello dove si sta — e mentre si filtra
              sono aperti tutti, perche' li' l'elenco e' gia' corto.
            */}
            {gruppiVisti.map((g) => {
              const dentro = g.schermi.some((s) => s.id === scelto.id)
              const apertoQui = q !== '' || (apertiGruppi[g.nome] ?? dentro)
              return (
                <div key={g.nome} className="mt-3 first:mt-0">
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
                              scelto.id === s.id
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

            {q === '' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => vaiA(ALTRE)}
                  className={`w-full rounded-[6px] px-2 py-[5px] text-left text-[12.5px] transition-colors duration-150 hover:bg-chip motion-reduce:transition-none ${
                    scelto.id === 'altre'
                      ? 'bg-verde-chiaro font-bold'
                      : ''
                  }`}
                >
                  Tutte le altre
                </button>
              </div>
            )}
            {gruppiVisti.length === 0 && (
              <p className="m-0 mt-3 text-[12px] text-ink-medio">Nessuno schermo con questo nome.</p>
            )}
          </nav>
        </aside>

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
                    modo === m
                      ? 'bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.10)]'
                      : 'text-ink-medio'
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
            <Legenda />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-baseline justify-between gap-3">
              <p className="m-0 text-[17px] font-bold">
                {cerca.trim() ? `Cerchi «${cerca.trim()}»` : scelto.nome}
              </p>
              {avviso && (
                <span
                  role="status"
                  className={`shrink-0 text-[12px] font-bold ${
                    avviso.tono === 'male'
                      ? 'text-[#ef545e]'
                      : avviso.tono === 'fatto'
                        ? 'text-verde-scuro'
                        : 'text-ink-medio'
                  }`}
                >
                  {avviso.testo}
                </span>
              )}
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
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
                <div className={fraQuali.length > 0 ? 'mt-3' : ''}>
                  <Campo
                    key={aperta}
                    chiave={aperta}
                    valore={valore(aperta)}
                    originale={partenza[lingua][aperta]}
                    pubblicato={pubblicato(aperta)}
                    onCambia={(v) => scrivi(aperta, v)}
                    onEsce={() => salva(aperta)}
                    onRipristina={() => ripristina(aperta)}
                    onScarta={() => scarta(aperta)}
                    onPubblica={() => pubblica([aperta])}
                    onChiudi={() => setAperta(null)}
                  />
                </div>
              )}

              {!aperta && fraQuali.length === 0 && !cerca.trim() && (
                <Riquadro>
                  <p className="m-0 text-[13.5px] leading-[1.6]">
                    Tocca una scritta nello schermo qui accanto per cambiarla.
                  </p>
                  <p className="m-0 mt-2 text-[12px] leading-[1.6] text-ink-medio">
                    Vale per tutto quello che si legge: titoli, bottoni, etichette, il grigino
                    dentro ai campi da riempire. Non serve sapere come si chiama.
                  </p>
                </Riquadro>
              )}

              {/*
                L'elenco delle scritte di questo schermo. Prima era chiuso in
                fondo dentro a un "dettaglio" da aprire, insieme alla ricerca:
                cioe' la mezza pagina vuota qui accanto stava sopra a tutto
                quello che si poteva fare.
              */}
              <div className="mt-5">
                <p className="m-0 mb-2 text-[11px] font-bold tracking-[1px] text-ink-mute uppercase">
                  {cerca.trim()
                    ? `${chiavi.length} ${chiavi.length === 1 ? 'scritta trovata' : 'scritte trovate'}`
                    : `Le scritte di questo schermo · ${chiavi.length}`}
                </p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {chiavi.map((k) => {
                    const r = righe[lingua][k]
                    const online = testo(r?.vivo ?? partenza[lingua][k])
                    const segno =
                      r?.bozza != null && testo(r.bozza) !== online
                        ? 'bozza'
                        : online !== testo(partenza[lingua][k])
                          ? 'pubblicata'
                          : null
                    return (
                      <li key={k}>
                        <button
                          type="button"
                          onClick={() => apri(k)}
                          className={`bab-tocco flex w-full items-start gap-2 rounded-[8px] border px-3 py-2 text-left ${
                            aperta === k
                              ? 'border-verde-acceso bg-verde-chiaro'
                              : 'border-line bg-surface'
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`mt-[6px] size-[7px] shrink-0 rounded-full ${
                              segno === 'bozza'
                                ? 'bg-ritmo-bordo'
                                : segno === 'pubblicata'
                                  ? 'bg-verde-acceso'
                                  : 'bg-transparent'
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px]">{testo(valore(k))}</span>
                            <code className="block text-[10.5px] text-ink-mute">{k}</code>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                  {chiavi.length === 0 && (
                    <li className="text-[13px] text-ink-medio">
                      {cerca.trim() ? 'Nessuna scritta con queste parole.' : 'Nessuna scritta qui.'}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {cassetto && (
        <Bozze
          bozze={inAttesa}
          onVai={(b, schermo) => {
            setCassetto(false)
            setLingua(b.lingua)
            if (schermo) setScelto(schermo)
            setCerca('')
            setFraQuali([])
            setAperta(b.chiave)
          }}
          onPubblica={(quali, l) => pubblica(quali, l)}
          onScarta={(b) => scarta(b.chiave, b.lingua)}
          onChiudi={() => setCassetto(false)}
        />
      )}
    </div>
  )
}

/** Cosa vogliono dire le due sottolineature dentro all'anteprima. */
function Legenda() {
  return (
    <p className="m-0 mt-2 flex w-[402px] flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-medio">
      <span className="flex items-center gap-[6px]">
        <span aria-hidden className="size-[7px] rounded-full bg-ritmo-bordo" />
        bozza, non ancora pubblicata
      </span>
      <span className="flex items-center gap-[6px]">
        <span aria-hidden className="size-[7px] rounded-full bg-verde-acceso" />
        cambiata e pubblicata
      </span>
    </p>
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
  onScarta,
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
  onScarta: () => void
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
        {/*
          Due modi di tornare indietro, e non sono lo stesso.
          «Scarta» butta solo l'ultima scrittura e rimette quello che le
          atlete leggono adesso; «rimetti l'originale» torna al disegno e
          cancella anche quello che era stato pubblicato mesi fa. Prima c'era
          solo il secondo, e per disfare una correzione appena fatta bisognava
          riscrivere a mano quella di prima.
        */}
        {inBozza && (
          <button
            type="button"
            onClick={onScarta}
            className="bab-tocco rounded-pill border-[1.5px] border-line bg-surface px-4 py-[6px] text-[12.5px] font-bold"
          >
            Scarta la bozza
          </button>
        )}
        {cambiata && (
          <button
            type="button"
            onClick={onRipristina}
            className="bab-tocco rounded-pill border-[1.5px] border-line bg-surface px-4 py-[6px] text-[12.5px] font-bold text-ink-medio"
          >
            Rimetti l’originale
          </button>
        )}
        <code className="ml-auto text-[10.5px] text-ink-mute">{chiave}</code>
      </div>
    </Riquadro>
  )
}
