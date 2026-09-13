import { useEffect, useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { Errore } from '../../ui/Testo'
import { OcchielloSessione } from '../../ui/sessione/Testo'
import { Scheda, Nota } from '../../ui/sessione/Scheda'
import { nomeCodice, zonaGemella } from '../../data/sessione'
import type { Parola } from '../../data/sessione'
import { riempi } from '../../copy/riempi'
import type { TestiSessione } from '../../copy/sessione'
import { useLingua } from '../../lib/lingua'
import { sensazioniCheckinDalDatabase, useDatiSessione } from '../../lib/sessione'
import type { Sensazione } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

/** Il nome che si vede: la zona, o quello che ha scritto lei per "Altrove". */
function nome(s: Sensazione, ts: TestiSessione): string {
  if (s.zona === 'altrove') return s.zonaLibera.trim() || ts.mappa.altrove
  return nomeCodice(s.zona, ts.zone)
}

/** Due sensazioni dicono la stessa cosa: stesse parole, stesse sue parole, stessa intensita'. */
function stessiValori(a: Sensazione, b: Sensazione): boolean {
  return (
    [...a.parole].sort().join() === [...b.parole].sort().join() &&
    a.sue.trim() === b.sue.trim() &&
    a.intensita === b.intensita
  )
}

/** "Quadricipiti", dal codice di uno dei due: `front_quad_r` -> `quad`. */
function nomeEntrambe(s: Sensazione, ts: TestiSessione): string {
  const base = s.zona.split('_').slice(1, -1).join('-')
  return ts.zoneEntrambe[base] ?? nome(s, ts)
}

/**
 * I due buchi del nome della zona.
 *
 * Uno com'e' scritto e uno tutto minuscolo, perche' in italiano la zona apre
 * la frase e in inglese sta in mezzo ("About that right quad"): quale delle
 * due serve lo decide il testo, non il codice.
 */
function zone(nome: string): Record<string, string> {
  return { zona: nome, zonaMinuscola: nome.toLowerCase() }
}

/**
 * Le parole di un punto: le pastiglie di quelle scelte, oppure le sue parole
 * fra virgolette se non ne ha scelta nessuna. E' la stessa nei due schermi,
 * cosi' il prima e il dopo si leggono come la fine del check-in.
 */
function ParoleScelte({ parole, sue }: { parole: Parola[]; sue: string }) {
  const { ts } = useLingua()
  if (parole.length > 0) {
    return (
      <div className="flex flex-wrap gap-[6px]">
        {parole.map((p) => (
          <span
            key={p}
            className="rounded-[10px] bg-lilla-fondo px-2 py-[3px] text-[11px] font-bold text-lilla-testo"
          >
            {ts.foglio.parole[p]}
          </span>
        ))}
      </div>
    )
  }
  if (sue.trim()) {
    return <p className="m-0 text-[12px] leading-[1.45] text-ink-medio">“{sue.trim()}”</p>
  }
  return null
}

/* ── la fine del check-in ─────────────────────────────────────────────────── */

/** Una riga di "Cosa comunica il tuo corpo": un punto, o due gemelli uguali. */
type RigaCorpo = {
  chiave: string
  nome: string
  parole: Parola[]
  sue: string
  intensita: number
}

/**
 * I punti segnati, pronti per la scheda.
 *
 * Due zone gemelle con gli stessi valori diventano una riga sola col nome al
 * plurale: capita quando a "Solo da un lato?" ha risposto di no, e il corpo le
 * ha segnate da solo tutte e due. Se ne ha cambiata una, restano due righe —
 * unirle vorrebbe dire far sparire quello che ha cambiato.
 */
function righeDelCorpo(sensazioni: Sensazione[], ts: TestiSessione): RigaCorpo[] {
  const unite = new Set<string>()
  const righe: RigaCorpo[] = []
  for (const s of sensazioni) {
    if (unite.has(s.id)) continue
    const gemella = zonaGemella(s.zona)
    const altra = gemella
      ? sensazioni.find((x) => x.zona === gemella && !unite.has(x.id) && stessiValori(s, x))
      : undefined
    if (altra) unite.add(altra.id)
    righe.push({
      chiave: s.id,
      nome: altra ? nomeEntrambe(s, ts) : nome(s, ts),
      parole: s.parole,
      sue: s.sue.trim(),
      intensita: s.intensita,
    })
  }
  return righe
}

/**
 * L'ultimo schermo del check-in: quello che ha appena segnato, in chiaro.
 *
 * Due schede sole. Prima cosa comunica il corpo — ogni punto segnato, con le
 * sue parole e quanto forte — e poi cosa provare oggi. Il resto che c'era (la
 * frase da dire a chi la allena, cosa dice ogni parola, come si legge un
 * segnale, il "quando") e' stato tolto per semplificare: a fine check-in,
 * appena prima dell'allenamento, serve poco e chiaro.
 *
 * Non dice cosa ha: le rimanda indietro quello che ha scritto. La nota in
 * fondo resta, perche' e' quella che dice che BAB non da' nomi alle malattie
 * e non decide se allenarsi.
 *
 * Tutti i punti segnati ci sono, uno per riga: mostrarne uno e nascondere gli
 * altri vorrebbe dire far sparire proprio la cosa che le abbiamo chiesto di
 * segnare.
 */
export function CorpoSegnali({
  passo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSessione) {
  const dati = useDatiSessione('checkin')
  const { ts } = useLingua()
  const t = ts.segnali
  const sensazioni = dati.sensazioni
  const righe = righeDelCorpo(sensazioni, ts)

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      margini={24}
      azione={
        <>
          <Bottone attivo={!salvando} onClick={avanti}>
            {salvando ? '…' : t.azione}
          </Bottone>
          {erroreSalvataggio && <Errore>Non siamo riusciti a salvare. Riprova.</Errore>}
        </>
      }
    >
      <OcchielloSessione icona="scintilla">{t.occhiello}</OcchielloSessione>
      <Titolo>
        {sensazioni.length === 1
          ? riempi(t.titolo, zone(nome(sensazioni[0], ts)))
          : t.titoloPiu}
      </Titolo>

      <div className="mt-[18px]">
        <Scheda piatta className="px-[15px] py-[13px]">
          <p className="m-0 text-[13px] font-bold text-ink">{t.corpo.titolo}</p>
          <ul className="m-0 mt-1 list-none p-0">
            {righe.map((r, i) => (
              <li key={r.chiave} className={`py-[10px] ${i > 0 ? 'border-t border-riga' : ''}`}>
                {/*
                  "INTENSITÀ" sta sulla riga del nome, piccola come PRIMA e
                  DOPO nel check-out, e il numero subito sotto: "4 / 10" da
                  solo non diceva di cosa fosse il quattro.
                */}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-[14px] font-bold text-ink">{r.nome}</span>
                  <span className="shrink-0 text-[10px] font-bold tracking-[1px] text-ink-medio">
                    {t.corpo.etichettaIntensita}
                  </span>
                </div>
                <p className="m-0 mt-[2px] text-right text-[12px] font-bold text-ink-medio">
                  {riempi(t.corpo.intensita, { intensita: r.intensita })}
                </p>
                <div className="mt-[6px]">
                  <ParoleScelte parole={r.parole} sue={r.sue} />
                </div>
              </li>
            ))}
          </ul>
        </Scheda>
      </div>

      <div className="mt-[18px]">
        <Scheda piatta className="px-[15px] py-[13px]">
          <p className="m-0 text-[13px] font-bold text-ink">{t.prova.titolo}</p>
          <ol className="m-0 mt-3 flex list-none flex-col gap-[10px] p-0">
            {t.prova.passi.map((passoTesto, i) => (
              <li key={passoTesto} className="flex gap-[8px]">
                <span className="mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-full bg-chip text-[11px] font-bold text-ink">
                  {i + 1}
                </span>
                <p className="m-0 text-[12px] leading-[1.5] text-ink">{passoTesto}</p>
              </li>
            ))}
          </ol>
        </Scheda>
      </div>

      <div className="mt-[18px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}

/* ── la fine del check-out ────────────────────────────────────────────────── */

/** Una riga del prima e dopo: lo stesso punto al check-in e al check-out. */
type RigaPrimaDopo = {
  chiave: string
  nome: string
  prima: Sensazione | null
  dopo: Sensazione | null
}

/**
 * Cosa fa incontrare lo stesso punto prima e dopo: il codice della zona.
 *
 * "Altrove" ha lo stesso codice per qualunque posto, quindi li' si incontra
 * col nome che ha scritto lei — "testa" al check-in e "Testa" al check-out
 * sono lo stesso punto, "testa" e "stomaco" no.
 */
function chiaveDi(s: Sensazione): string {
  return s.zona === 'altrove' ? `altrove:${s.zonaLibera.trim().toLowerCase()}` : s.zona
}

/** Uguali anche quando mancano tutt'e due: nessun prima e nessun prima sono la stessa cosa. */
function uguali(a: Sensazione | null, b: Sensazione | null): boolean {
  if (!a || !b) return a === b
  return stessiValori(a, b)
}

/**
 * I punti del check-in e del check-out, uno per riga.
 *
 * Ci sono tutti: quelli segnati solo prima (il dopo dice "non segnata", e
 * quel "non c'e' piu'" e' un'informazione), quelli nuovi del check-out, e
 * quelli segnati tutte e due le volte. L'ordine e' quello della giornata:
 * prima i punti del check-in, poi i nuovi.
 *
 * Due gemelle si uniscono al plurale solo se sono uguali sia prima sia dopo:
 * se una delle due e' cambiata, unirle nasconderebbe proprio il cambiamento.
 */
function righePrimaDopo(
  prima: Sensazione[],
  dopo: Sensazione[],
  ts: TestiSessione,
): RigaPrimaDopo[] {
  const chiavi: string[] = []
  for (const s of [...prima, ...dopo]) {
    const k = chiaveDi(s)
    if (!chiavi.includes(k)) chiavi.push(k)
  }
  const trova = (lista: Sensazione[], k: string) => lista.find((s) => chiaveDi(s) === k) ?? null

  const unite = new Set<string>()
  const righe: RigaPrimaDopo[] = []
  for (const k of chiavi) {
    if (unite.has(k)) continue
    const p = trova(prima, k)
    const d = trova(dopo, k)
    const s = (p ?? d) as Sensazione
    const g = zonaGemella(k)
    const unisci =
      !!g &&
      chiavi.includes(g) &&
      !unite.has(g) &&
      uguali(p, trova(prima, g)) &&
      uguali(d, trova(dopo, g))
    if (unisci && g) unite.add(g)
    righe.push({ chiave: k, nome: unisci ? nomeEntrambe(s, ts) : nome(s, ts), prima: p, dopo: d })
  }
  return righe
}

/**
 * L'ultimo schermo del check-out: il confronto fra la previsione e l'esito.
 *
 * In cima le due caselle del ritmo, previsto e sentito. Sotto una scheda
 * sola, fatta come quella della fine del check-in, con ogni punto segnato e
 * il suo prima e dopo: stesse sedici parole, ed e' quello che le rende
 * confrontabili. "Come si legge un segnale" e la domanda sulla colonna rossa
 * sono state tolte per semplificare lo schermo.
 */
export function CorpoRendiconto({
  passo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
  erroreSalvataggio,
}: PropsSessione) {
  const dati = useDatiSessione('checkout')
  const mattina = useDatiSessione('checkin')
  const { ts } = useLingua()
  const t = ts.rendiconto
  const nomi = ts.comune.ritmi
  const previsto = mattina.ritmo
  const sentito = dati.ritmo

  /*
   * Il prima puo' non essere su questo telefono: check-in fatto su un altro,
   * o memoria del browser svuotata. Allora si chiede al database, come fa la
   * mappa del check-out. Se il telefono le ha, vincono le sue.
   */
  const [primaDalDatabase, setPrimaDalDatabase] = useState<Sensazione[]>([])
  useEffect(() => {
    let viva = true
    void sensazioniCheckinDalDatabase().then((s) => {
      if (viva) setPrimaDalDatabase(s)
    })
    return () => {
      viva = false
    }
  }, [])
  const prima = mattina.sensazioni.length > 0 ? mattina.sensazioni : primaDalDatabase
  const righe = righePrimaDopo(prima, dati.sensazioni, ts)

  const ordine = ['carica', 'costante', 'leggero']
  const scarto = previsto && sentito ? ordine.indexOf(sentito) - ordine.indexOf(previsto) : null
  const frase =
    scarto === null ? null : scarto > 0 ? t.frase.piu : scarto < 0 ? t.frase.meno : t.frase.uguale

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={16}
      margini={24}
      azione={
        <>
          <Bottone attivo={!salvando} onClick={avanti}>
            {salvando ? '…' : t.azione}
          </Bottone>
          {erroreSalvataggio && <Errore>Non siamo riusciti a salvare. Riprova.</Errore>}
        </>
      }
    >
      <OcchielloSessione icona="stella">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      {/*
        Il confronto c'e' solo se prima dell'allenamento ha fatto il check-in.
        Senza, una casella del prima vuota direbbe che ha sbagliato qualcosa,
        quando invece semplicemente non c'era.
      */}
      {previsto && sentito && (
        <div className="mt-[22px]">
          <div className="flex items-center gap-2 rounded-[16px] border border-riga bg-surface p-[7px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] rounded-[12px] border-[1.5px] border-ambra-testo bg-ritmo-fondo px-[10px] py-[5px]">
              <span className="text-[9px] font-bold tracking-[1px] text-ambra-testo uppercase">
                {t.prima}
              </span>
              <span className="text-[16px] font-bold text-ink">{nomi[previsto]}</span>
            </div>
            <span aria-hidden className="shrink-0 text-[16px] font-bold text-ink-tenue">
              →
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px] rounded-[12px] border-[1.5px] border-lilla-cupo bg-lilla-fondo px-[10px] py-[5px]">
              <span className="text-[9px] font-bold tracking-[1px] text-lilla-cupo uppercase">
                {t.dopo}
              </span>
              <span className="text-[16px] font-bold text-ink">{nomi[sentito]}</span>
            </div>
          </div>
          <p className="m-0 mt-4 text-[13px] leading-[1.5] text-ink-medio">{frase}</p>
        </div>
      )}

      {righe.length > 0 && (
        <div className="mt-[18px]">
          <Scheda piatta className="px-[15px] py-[13px]">
            <p className="m-0 text-[13px] font-bold text-ink">{t.confronto.titolo}</p>
            <ul className="m-0 mt-1 list-none p-0">
              {righe.map((r, i) => (
                <li key={r.chiave} className={`py-[10px] ${i > 0 ? 'border-t border-riga' : ''}`}>
                  {/* la scritta piccola sta sopra alla colonna dei numeri di PRIMA e DOPO */}
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="m-0 min-w-0 text-[14px] font-bold text-ink">{r.nome}</p>
                    <span className="shrink-0 text-[10px] font-bold tracking-[1px] text-ink-medio">
                      {t.confronto.etichettaIntensita}
                    </span>
                  </div>
                  <RigaMomento etichetta={t.confronto.prima} s={r.prima} />
                  <RigaMomento etichetta={t.confronto.dopo} s={r.dopo} />
                </li>
              ))}
            </ul>
          </Scheda>
        </div>
      )}

      <div className="mt-[18px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}

/** "PRIMA   [teso] [indolenzito]        4 / 10", oppure "DOPO   non segnata". */
function RigaMomento({ etichetta, s }: { etichetta: string; s: Sensazione | null }) {
  const { ts } = useLingua()
  const t = ts.rendiconto.confronto
  return (
    <div className="mt-[6px] flex items-center gap-2">
      <span className="w-[52px] shrink-0 text-[10px] font-bold tracking-[1px] text-ink-medio">
        {etichetta}
      </span>
      {s ? (
        <>
          <div className="min-w-0 flex-1">
            <ParoleScelte parole={s.parole} sue={s.sue} />
          </div>
          <span className="shrink-0 text-[12px] font-bold text-ink-medio">
            {riempi(t.intensita, { intensita: s.intensita })}
          </span>
        </>
      ) : (
        <span className="min-w-0 flex-1 text-[12px] text-ink-tenue">{t.nonSegnata}</span>
      )}
    </div>
  )
}
