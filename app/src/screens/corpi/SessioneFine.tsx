import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { Errore } from '../../ui/Testo'
import { OcchielloSessione } from '../../ui/sessione/Testo'
import { Scheda, Nota } from '../../ui/sessione/Scheda'
import { Scelta } from '../../ui/sessione/Comandi'
import { TINTA_LIVELLO } from '../../ui/sessione/SchedaParola'
import { LIVELLI, LIVELLO_DI, nomeCodice, zonaGemella } from '../../data/sessione'
import type { Livello, Parola } from '../../data/sessione'
import { riempi } from '../../copy/riempi'
import type { TestiSessione } from '../../copy/sessione'
import { useLingua } from '../../lib/lingua'
import { datiSessione, useDatiSessione, scriviSessione } from '../../lib/sessione'
import type { Sensazione } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

/**
 * Il livello che decide la mossa del punto: il piu' alto fra quelli delle
 * parole scelte.
 *
 * "Il piu' alto" e non "il piu' frequente": una parola che chiede una mano
 * non si annulla perche' accanto ce ne sono due che dicono di spingere. E'
 * la stessa regola che la scheda-parola usa per il colore del badge.
 */
function livelloDi(parole: Parola[]): Livello | null {
  let peggiore: Livello | null = null
  for (const p of parole) {
    const l = LIVELLO_DI[p]
    if (peggiore === null || LIVELLI.indexOf(l) > LIVELLI.indexOf(peggiore)) peggiore = l
  }
  return peggiore
}

/** Il nome che si vede: la zona, o quello che ha scritto lei per "Altrove". */
function nome(s: Sensazione, ts: TestiSessione): string {
  if (s.zona === 'altrove') return s.zonaLibera.trim() || ts.mappa.altrove
  return nomeCodice(s.zona, ts.zone)
}

/** Una riga di "Cosa comunica il tuo corpo": un punto, o due gemelli uguali. */
type RigaCorpo = {
  chiave: string
  nome: string
  parole: Parola[]
  sue: string
  intensita: number
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
 * I due buchi del nome della zona.
 *
 * Uno com'e' scritto e uno tutto minuscolo, perche' in italiano la zona apre
 * la frase ("Quadricipite destro: teso…") e in inglese sta in mezzo ("About
 * that right quad"): quale delle due serve lo decide il testo, non il codice.
 */
function zone(nome: string): Record<string, string> {
  return { zona: nome, zonaMinuscola: nome.toLowerCase() }
}

/** "teso · indolenzito · bruciante", oppure le sue parole se non ne ha scelte. */
function paroleViste(s: Sensazione, ts: TestiSessione): string {
  const p = s.parole.map((x) => ts.foglio.parole[x])
  if (p.length) return p.join(' · ')
  return s.sue.trim()
}

/**
 * La scheda "come si legge un segnale".
 *
 * E' la stessa nei due schermi, e non e' un caso: e' la tabella che dice
 * cosa fa un segnale, e cambiarla fra il prima e il dopo vorrebbe dire
 * insegnare due cose diverse nello stesso giorno.
 */
function ComeLeggere() {
  const { tp } = useLingua()
  return (
    <Scheda piatta className="px-[15px] py-[13px]">
      <p className="m-0 text-[13px] font-bold text-ink">{tp.comeLeggere}</p>
      <div className="mt-3 flex flex-col gap-[10px]">
        {LIVELLI.map((l) => {
          const tinta = TINTA_LIVELLO[l]
          return (
            <div key={l} className="flex gap-[10px]">
              <span
                className="w-[52px] shrink-0 self-start rounded-[6px] px-2 py-[3px] text-center text-[11px] font-bold"
                style={{ background: tinta.fondo, color: tinta.testo }}
              >
                {tp.segnali[l].nome}
              </span>
              <p className="m-0 text-[12px] leading-[1.45] text-ink-medio">{tp.segnali[l].testo}</p>
            </div>
          )
        })}
      </div>
    </Scheda>
  )
}

/** La pastiglia "La mossa di oggi · Spingi", col colore del livello. */
function MossaDiOggi({ livello }: { livello: Livello }) {
  const { tp } = useLingua()
  const tinta = TINTA_LIVELLO[livello]
  return (
    <div className="flex flex-wrap items-center gap-x-[10px] gap-y-1">
      <span
        className="inline-flex items-center gap-[8px] rounded-[12px] px-3 py-[6px] text-[12px] font-bold"
        style={{ background: tinta.fondo, color: tinta.testo }}
      >
        <span
          aria-hidden
          className="size-[6px] shrink-0 rounded-full"
          style={{ background: tinta.testo }}
        />
        {tp.oggi} · {tp.livelli[livello].nome}
      </span>
      <span className="text-[11px] text-ink-medio">{tp.livelli[livello].spiega}</span>
    </div>
  )
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
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-[14px] font-bold text-ink">{r.nome}</span>
                  <span className="shrink-0 text-[12px] font-bold text-ink-medio">
                    {riempi(t.corpo.intensita, { intensita: r.intensita })}
                  </span>
                </div>
                {/* le sue parole contano come le pastiglie: se ha scritto e basta, si legge quello */}
                {r.parole.length > 0 ? (
                  <div className="mt-[6px] flex flex-wrap gap-[6px]">
                    {r.parole.map((p) => (
                      <span
                        key={p}
                        className="rounded-[10px] bg-lilla-fondo px-2 py-[3px] text-[11px] font-bold text-lilla-testo"
                      >
                        {ts.foglio.parole[p]}
                      </span>
                    ))}
                  </div>
                ) : (
                  r.sue && (
                    <p className="m-0 mt-1 text-[12px] leading-[1.45] text-ink-medio">“{r.sue}”</p>
                  )
                )}
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

/**
 * L'ultimo schermo del check-out: il confronto fra la previsione e l'esito.
 *
 * E' lo schermo per cui esiste tutto il resto. Le due caselle in cima sono
 * l'unica cosa che il check-in di stamattina e il check-out di adesso hanno
 * da dirsi, e sono affiancate apposta.
 *
 * Sotto, lo stesso confronto punto per punto: prima e dopo, con le stesse
 * sedici parole. E' quello che le rende confrontabili, ed e' anche il motivo
 * per cui le parole sono sedici e non "descrivilo come vuoi".
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
  const { ts } = useLingua()
  const t = ts.rendiconto
  const nomi = ts.comune.ritmi
  const mattina = datiSessione('checkin')
  const previsto = mattina.ritmo
  const sentito = dati.ritmo

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
        Il confronto c'e' solo se stamattina ha fatto il check-in. Senza,
        mostrare una casella "Stamattina" vuota direbbe che ha sbagliato
        qualcosa, quando invece semplicemente non c'era.
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

      {dati.sensazioni.map((s) => {
        const prima = mattina.sensazioni.find((x) => x.zona === s.zona)
        const livello = livelloDi(s.parole)
        return (
          <div key={s.id} className="mt-[18px]">
            <Scheda piatta className="px-[15px] py-[13px]">
              <p className="m-0 text-[13px] font-bold text-ink">{riempi(t.confronto.titolo, zone(nome(s, ts)))}</p>
              <p className="m-0 mt-2 text-[12px] leading-[1.4] text-ink-medio">
                {t.confronto.occhio}
              </p>

              <div className="mt-3 flex flex-col gap-2">
                {prima ? (
                  <RigaConfronto
                    etichetta={t.confronto.prima}
                    parole={paroleViste(prima, ts)}
                    intensita={prima.intensita}
                  />
                ) : (
                  <p className="m-0 text-[11px] text-ink-medio">{t.confronto.senzaPrima}</p>
                )}
                <RigaConfronto
                  etichetta={t.confronto.dopo}
                  parole={paroleViste(s, ts)}
                  intensita={s.intensita}
                />
              </div>

              {livello && (
                <>
                  <div className="mt-3 h-px bg-riga" />
                  <div className="mt-[10px]">
                    <MossaDiOggi livello={livello} />
                  </div>
                </>
              )}

              {/*
                Cosa le ha fatto la sessione lo ha detto lei nel foglio: qui
                si rimette la sua risposta, non una frase nostra su cosa
                quella risposta vorrebbe dire.
              */}
              {s.effetto && (
                <p className="m-0 mt-[10px] text-[11px] leading-[1.45] text-ink-medio">
                  {ts.foglio.effetto.voci[s.effetto]}
                </p>
              )}
            </Scheda>
          </div>
        )
      })}

      <div className="mt-[18px]">
        <ComeLeggere />
      </div>

      <div className="mt-[18px]">
        <Scheda piatta className="px-[15px] py-[13px]">
          <p className="m-0 text-[14px] font-bold text-ink">{t.domanda}</p>
          <div className="mt-[10px] flex gap-2" role="radiogroup" aria-label={t.domanda}>
            {[true, false].map((v) => (
              <Scelta
                key={String(v)}
                accesa={dati.protettivo === v}
                onClick={() => scriviSessione('checkout', { protettivo: v })}
              >
                <span className="block w-[130px] text-center">
                  {v ? ts.comune.si : ts.comune.no}
                </span>
              </Scelta>
            ))}
          </div>
        </Scheda>
      </div>

      <div className="mt-[18px]">
        <Nota>{t.nota}</Nota>
      </div>
    </Schermo>
  )
}

/** "PRIMA   teso · indolenzito · bruciante        4/10" */
function RigaConfronto({
  etichetta,
  parole,
  intensita,
}: {
  etichetta: string
  parole: string
  intensita: number
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-[60px] shrink-0 text-[10px] font-bold tracking-[1px] text-ink-medio">
        {etichetta}
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-bold text-ink">{parole}</span>
      <span className="shrink-0 text-[11px] font-bold text-ink-medio">{intensita}/10</span>
    </div>
  )
}
