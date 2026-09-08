/**
 * Gli schermi dell'app, per chi ne scrive le parole.
 *
 * E' l'unica lista in tutto il progetto che esiste per un essere umano e non
 * per il codice: dice "questo schermo si chiama cosi', sta a quest'indirizzo,
 * e le parole che ci si leggono sopra sono queste". Serve a chi scrive i
 * testi per andare da uno schermo all'altro senza sapere niente di come e'
 * fatto dentro.
 *
 * `rami` sono i pezzi dell'albero delle scritte che si vedono su quello
 * schermo. Non e' un elenco esatto — `comune` compare quasi ovunque — ma e'
 * quello che serve per non far cercare una scritta in mezzo a ottocento.
 *
 * Quello che nessuno schermo rivendica non si perde: l'amministrazione ha in
 * fondo "Tutte le altre", che mostra proprio le chiavi rimaste fuori di qui.
 */
export type SchermoScritte = {
  id: string
  nome: string
  /** dove va l'anteprima */
  rotta: string
  rami: string[]
  /** cosa fare dentro alla cornice per vedere questo schermo, se non basta aprirlo */
  come?: string
}

export type GruppoScritte = { nome: string; schermi: SchermoScritte[] }

export const SCHERMI: GruppoScritte[] = [
  {
    nome: 'Accesso',
    schermi: [
      { id: 'accesso', nome: 'Entra in BAB', rotta: '/onboarding/accesso', rami: ['testi.accesso'] },
      {
        id: 'link',
        nome: 'Guarda la posta',
        rotta: '/onboarding/link',
        rami: ['testi.linkMandato'],
      },
    ],
  },
  {
    nome: 'Onboarding',
    schermi: [
      { id: 'intro', nome: "Cos'è BAB", rotta: '/onboarding/intro', rami: ['testi.cosaEBab'] },
      { id: 'nome', nome: 'Il nome', rotta: '/onboarding/nome', rami: ['testi.nome'] },
      {
        id: 'compleanno',
        nome: 'Il compleanno',
        rotta: '/onboarding/compleanno',
        rami: ['testi.compleanno'],
      },
      { id: 'sport', nome: 'Gli sport', rotta: '/onboarding/sport', rami: ['testi.sport'] },
      {
        id: 'allenamenti',
        nome: 'Gli allenamenti',
        rotta: '/onboarding/allenamenti',
        rami: ['testi.allenamenti'],
      },
      {
        id: 'ed-fisica',
        nome: 'Educazione fisica',
        rotta: '/onboarding/ed-fisica',
        rami: ['testi.edFisica'],
      },
      { id: 'gare', nome: 'Le gare', rotta: '/onboarding/gare', rami: ['testi.gare'] },
      {
        id: 'ciclo',
        nome: 'Il ciclo',
        rotta: '/onboarding/ciclo',
        rami: ['testi.cicloSiNo', 'testi.primoCiclo'],
        come: 'Tocca “Sì” per aprire il modulo del primo ciclo.',
      },
      {
        id: 'ciclo-date',
        nome: 'Le date del ciclo',
        rotta: '/onboarding/ciclo-date',
        rami: ['testi.cicloDate'],
      },
      {
        id: 'contraccettivo',
        nome: 'Il contraccettivo',
        rotta: '/onboarding/contraccettivo',
        rami: ['testi.contraccettivo'],
      },
      {
        id: 'riepilogo',
        nome: 'Il riepilogo',
        rotta: '/onboarding/riepilogo',
        rami: ['testi.riepilogo'],
      },
      {
        id: 'consenso',
        nome: 'Il consenso',
        rotta: '/onboarding/consenso',
        rami: ['testi.consenso'],
      },
    ],
  },
  {
    nome: 'Home',
    schermi: [
      {
        id: 'casa',
        nome: 'La home',
        rotta: '/casa',
        rami: ['testi.casa', 'testi.ritmi', 'testi.indovina', 'testi.conta', 'testi.confronto'],
      },
    ],
  },
  {
    nome: 'Check-in',
    schermi: [
      {
        id: 'ci-ritmo',
        nome: '1 · Il ritmo',
        rotta: '/sessione/checkin/ritmo',
        rami: ['sessione.ritmoPrima', 'sessione.comune'],
      },
      {
        id: 'ci-sintonia',
        nome: '2 · Sintonizzati',
        rotta: '/sessione/checkin/sintonia',
        rami: ['sessione.sintonia'],
      },
      {
        id: 'ci-mappa',
        nome: '3 · Dove lo senti',
        rotta: '/sessione/checkin/mappa',
        rami: ['sessione.mappa'],
      },
      {
        id: 'ci-foglio',
        nome: '3b · Il foglio',
        rotta: '/sessione/checkin/mappa',
        rami: ['sessione.foglio', 'sessione.zone'],
        come: 'Tocca un punto del corpo per far salire il foglio.',
      },
      {
        id: 'ci-senso',
        nome: '4 · Dagli un senso',
        rotta: '/sessione/checkin/segnali',
        rami: ['sessione.segnali'],
      },
    ],
  },
  {
    nome: 'Check-out',
    schermi: [
      {
        id: 'co-ritmo',
        nome: '1 · Il confronto',
        rotta: '/sessione/checkout/ritmo',
        rami: ['sessione.ritmoDopo'],
      },
      {
        id: 'co-sforzo',
        nome: '2 · Lo sforzo',
        rotta: '/sessione/checkout/sforzo',
        rami: ['sessione.sforzo'],
      },
      {
        id: 'co-soddisfazione',
        nome: '3 · La soddisfazione',
        rotta: '/sessione/checkout/soddisfazione',
        rami: ['sessione.soddisfazione'],
      },
      {
        id: 'co-energia',
        nome: "4 · L'energia",
        rotta: '/sessione/checkout/energia',
        rami: ['sessione.energia'],
      },
      {
        id: 'co-mappa',
        nome: '5 · Dove lo senti',
        rotta: '/sessione/checkout/mappa',
        rami: ['sessione.mappa'],
      },
      {
        id: 'co-foglio',
        nome: '5b · Il foglio',
        rotta: '/sessione/checkout/mappa',
        rami: ['sessione.foglio', 'sessione.zone'],
        come: 'Tocca un punto del corpo per far salire il foglio.',
      },
      {
        id: 'co-rendiconto',
        nome: '6 · Chiudi il cerchio',
        rotta: '/sessione/checkout/rendiconto',
        rami: ['sessione.rendiconto', 'sessione.giorno'],
      },
    ],
  },
  {
    nome: 'Le sedici parole',
    schermi: [
      {
        id: 'parole',
        nome: 'Il glossario',
        rotta: '/parole',
        rami: ['parole.schermo', 'parole.livelli', 'parole.segnali', 'parole.comeLeggere', 'parole.oggi'],
      },
      {
        id: 'schede',
        nome: 'Le schede',
        rotta: '/parole',
        rami: ['parole.schede', 'parole.usa', 'parole.aiuto'],
        come: 'Tocca una parola nell’elenco per aprirne la scheda.',
      },
    ],
  },
]

/** Tutti i rami rivendicati da qualche schermo. */
export function ramiConosciuti(): string[] {
  return SCHERMI.flatMap((g) => g.schermi.flatMap((s) => s.rami))
}
