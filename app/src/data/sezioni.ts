/**
 * Le sezioni dell'app che si possono accendere e spegnere.
 *
 * Un'app che cresce ha sempre un pezzo pronto e uno no. Finora la differenza
 * stava nel codice — `Storico` e `Profilo` puntavano a uno schermo "arriva
 * presto" scritto a mano nelle rotte — e spostare quella linea voleva dire
 * ricompilare e ripubblicare. Da qui invece la si sposta dal pannello.
 *
 * ── TRE STATI E NON DUE ────────────────────────────────────────────────────
 * "Acceso" e "spento" non bastano, perche' spegnere una sezione vuol dire due
 * cose diverse:
 *
 *   `aperta`    si usa;
 *   `in-arrivo` si vede, si tocca, e dice che arriva presto — e' una promessa,
 *               e serve: un'atleta che vede "Percorso" nella barra e capisce
 *               che ci sara' qualcosa e' diversa da una che non lo vede mai;
 *   `nascosta`  non esiste. Sparisce dalla barra in fondo, e chi ci arriva a
 *               mano con l'indirizzo torna alla home.
 *
 * ── LA VERITA' DI PARTENZA STA QUI ─────────────────────────────────────────
 * Come per le scritte: questo file dice com'e' l'app appena scaricata, e il
 * database tiene solo cio' che qualcuno ha cambiato dopo. Database vuoto, o
 * spento, o senza rete al primo avvio: l'app si comporta come dice questa
 * lista, e non resta a meta'.
 */
export type StatoSezione = 'aperta' | 'in-arrivo' | 'nascosta'

export type Sezione = {
  id: string
  /** come si chiama nel pannello: e' un nome per chi decide, non per l'atleta */
  nome: string
  /** a che serve, per chi la spegne fra sei mesi e non ricorda cos'era */
  cosa: string
  /** gli indirizzi che questa sezione occupa, primo compreso */
  rotte: string[]
  predefinito: StatoSezione
}

export const SEZIONI: Sezione[] = [
  {
    id: 'percorso',
    nome: 'Body Language',
    cosa: 'Il percorso: la mappa delle quattro unita e le otto lezioni che sbloccano le sedici parole.',
    rotte: ['/percorso'],
    predefinito: 'in-arrivo',
  },
  {
    id: 'parole',
    nome: 'Le sedici parole',
    cosa: 'Il glossario e le sedici schede-parola. Ci si arriva dal foglio del check-in e dal percorso.',
    rotte: ['/parole'],
    predefinito: 'aperta',
  },
  {
    id: 'storico',
    nome: 'Storico',
    cosa: 'I giorni passati. Non e ancora costruito.',
    rotte: ['/storico'],
    predefinito: 'in-arrivo',
  },
  {
    id: 'profilo',
    nome: 'Profilo',
    cosa: 'I dati e le impostazioni. Per ora ci sono solo la lingua e il ricomincia da capo.',
    rotte: ['/profilo'],
    predefinito: 'aperta',
  },
]

/** Lo stato che una sezione ha nel codice, prima di qualunque cambiamento. */
export function predefinitoDi(id: string): StatoSezione {
  return SEZIONI.find((s) => s.id === id)?.predefinito ?? 'aperta'
}

/**
 * Quale sezione occupa un indirizzo.
 *
 * Confronta il pezzo iniziale, cosi' `/percorso/3/abbina` ricade sotto
 * `/percorso`: una lezione non e' una sezione a se', e spegnendo il percorso
 * si spengono anche le sue lezioni.
 */
export function sezioneDi(rotta: string): Sezione | undefined {
  return SEZIONI.find((s) =>
    s.rotte.some((r) => rotta === r || rotta.startsWith(`${r}/`)),
  )
}
