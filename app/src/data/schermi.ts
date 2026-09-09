import { LEZIONI, chiaviDi, passiDi } from './percorso'
import { SEZIONI } from './sezioni'
import { PASSI as PASSI_TUTORIAL } from './tutorial'
import type { Passo } from './percorso'

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

/** L'id dello schermo come si chiama dentro a `copy/tutorial.ts`. */
function ramoDi(id: string): string {
  return id.replace(/-(.)/g, (_, c: string) => c.toUpperCase())
}

const NOMI_TUTORIAL: Record<string, string> = {
  'come-funziona': 'Come funziona',
  'prima-rep': 'La prima rep',
  indovina: '1 · Indovina',
  conta: '2 · Conta i battiti',
  confronto: '3 · Il confronto',
  ritmi: 'I tre ritmi',
  andiamo: 'Andiamo!',
}

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
    /*
     * Il tutorial subito dopo l'onboarding. Le chiavi dei testi seguono l'id
     * dello schermo, tranne due che nel file dei testi si chiamano in
     * italiano corrente invece che con l'id: `comeFunziona` e `primaRep`.
     */
    nome: 'Tutorial',
    schermi: PASSI_TUTORIAL.map((p) => ({
      id: `tut-${p.id}`,
      nome: NOMI_TUTORIAL[p.id] ?? p.id,
      rotta: `/tutorial/${p.id}`,
      rami: [`tutorial.${ramoDi(p.id)}`],
    })),
  },
  {
    nome: 'Home',
    schermi: [
      {
        id: 'casa',
        nome: 'La home',
        rotta: '/casa',
        rami: ['testi.casa'],
      },
    ],
  },
  {
    /*
     * Le sezioni spente.
     *
     * L'indirizzo porta con se' `arrivo=<sezione>`: dentro alla cornice le
     * sezioni sono tutte accese — se no chi scrive non potrebbe piu' correggere
     * le parole di quella che ha appena spento — e senza quella richiesta
     * esplicita questo schermo non si vedrebbe mai.
     */
    nome: 'In arrivo',
    schermi: SEZIONI.map((sez) => ({
      id: `arrivo-${sez.id}`,
      nome: sez.nome,
      rotta: `${sez.rotte[0]}?arrivo=${sez.id}`,
      rami: [
        `testi.prossimamente.sezioni.${sez.id}`,
        'testi.prossimamente.occhiello',
        'testi.prossimamente.etichettaCosa',
        'testi.prossimamente.etichettaQuando',
        'testi.prossimamente.azione',
      ],
    })),
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

/**
 * Gli schermi del percorso, uno per esercizio.
 *
 * Non sono scritti a mano come tutti gli altri: sono sessantasei, e una lista
 * scritta a mano di sessantasei voci sarebbe sbagliata il giorno dopo — basta
 * aggiungere un esercizio a una lezione. Qui si costruiscono dagli stessi
 * dati con cui l'app costruisce le lezioni, quindi non possono divergere.
 *
 * Un gruppo per lezione, e dentro un esercizio per volta: e' il "pezzetto per
 * pezzetto" che serve a chi scrive: si apre la lezione 5, si va sul suo
 * scenario, e nell'anteprima c'e' proprio quello schermo.
 */
const NOMI_PASSO: Record<Passo['tipo'], string> = {
  incontra: 'Incontra la parola',
  abbina: 'Abbina',
  gemelle: 'Falsi amici',
  storia: 'Storia vera',
  mossa: 'La mossa',
  allarme: 'Bandiera rossa',
  frase: 'Componi la frase',
  fatto: 'Fine lezione',
}

function gruppiDelPercorso(): GruppoScritte[] {
  const gruppi: GruppoScritte[] = [
    {
      nome: 'Percorso',
      schermi: [
        {
          id: 'pe-mappa',
          nome: 'La mappa',
          rotta: '/percorso',
          rami: [
            'percorso.occhiello',
            'percorso.titolo',
            'percorso.intro',
            'percorso.progresso',
            'percorso.regola',
            'percorso.unita',
            'percorso.azione',
            'percorso.nav',
            'percorso.comune',
          ],
        },
      ],
    },
  ]

  for (const l of LEZIONI) {
    const passi = passiDi(l.numero)
    if (!passi) continue
    const chiavi = chiaviDi(passi)
    /* quale delle due schede-parola e': serve solo dove ce ne sono due */
    let incontrati = 0
    gruppi.push({
      nome: `Lezione ${l.numero}`,
      schermi: passi.map((passo, i) => {
        const dentro = passo.tipo === 'incontra' ? incontrati++ : -1
        return {
          id: `pe-${l.numero}-${chiavi[i]}`,
          nome:
            passo.tipo === 'incontra'
              ? `${NOMI_PASSO.incontra} ${dentro + 1}`
              : NOMI_PASSO[passo.tipo],
          rotta: `/percorso/${l.numero}/${chiavi[i]}`,
          rami: [
            passo.tipo === 'incontra'
              ? `percorso.lezioni.${l.numero}.incontra.${dentro}`
              : `percorso.lezioni.${l.numero}.${passo.tipo}`,
            'percorso.comune',
          ],
        }
      }),
    })
  }
  return gruppi
}

/**
 * Tutti i gruppi, quelli scritti a mano piu' quelli del percorso.
 *
 * Il percorso sta in fondo perche' e' il pezzo piu' lungo: chi cerca la home
 * o il check-in non deve scorrere ottanta voci per arrivarci.
 */
export const GRUPPI: GruppoScritte[] = [...SCHERMI, ...gruppiDelPercorso()]

/** Tutti i rami rivendicati da qualche schermo. */
export function ramiConosciuti(): string[] {
  return GRUPPI.flatMap((g) => g.schermi.flatMap((s) => s.rami))
}
