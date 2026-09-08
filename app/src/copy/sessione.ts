import type { Tempo } from '../data/casa'

/**
 * I testi del check-in e del check-out.
 *
 * Sono in un file a parte da `testi.ts` per una ragione sola: li' `en` e'
 * tipato come `typeof it`, quindi ogni chiave italiana pretende subito la sua
 * inglese. Di questi schermi l'inglese non c'e' ancora — i frame in Figma
 * sono solo italiani — e mettere traduzioni inventate dentro al file dei
 * testi le farebbe sembrare approvate. Quando arriveranno, questo file
 * diventa `{ it, en }` e `testiSessione` smette di ignorare la lingua.
 *
 * ── COSA NON VIENE DAL DISEGNO ──────────────────────────────────────────────
 * Tre cose qui sotto le abbiamo scritte noi, e vanno riviste da chi scrive i
 * testi prima di considerarle finite:
 *
 * 1. `confronto` e `rendiconto.frase` hanno tre versioni. Il disegno ne mostra
 *    una sola — quella di chi si aspettava piu' di quanto il corpo ha dato —
 *    ma i casi sono tre, e con una versione sola chi ci prende si sentirebbe
 *    dire che si era sbagliata.
 * 2. `provaOggi`: nel disegno la scheda "Prova questo oggi" e' chiusa, quindi
 *    dentro non c'e' niente da leggere.
 * 3. Tre refusi corretti: "Zoombie" -> "Zombie", "Alcune segnali" -> "Alcuni
 *    segnali", e i toggle italiani che nel frame dicono ancora "Yes".
 */

export const SESSIONE = {
  comune: {
    si: 'Sì',
    no: 'No',
    avanti: 'Avanti',
    ritmi: { carica: 'Carica', costante: 'Costante', leggero: 'Leggero' } as Record<Tempo, string>,
  },

  // ── CHECK-IN ──────────────────────────────────────────────────────────────

  ritmoPrima: {
    occhiello: 'PASSO 1 · INDOVINA',
    titolo: 'Qual è il ritmo di oggi?',
    occhio:
      "Il tuo ritmo è quanto il tuo corpo ha da dare oggi. Fai una stima ora e confrontala dopo l'allenamento per affinare la tua percezione interiore.",
    carta: {
      titolo: "Non c'è un ritmo giusto o sbagliato",
      corpo:
        'È un messaggio speciale che il tuo corpo ti manda: ascoltalo, rispettalo e allenati a lavorarci insieme, un check-in alla volta.',
    },
    azione: 'Ora sintonizziamoci',
  },

  sintonia: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Cosa ti sta dicendo il corpo?',
    sonno: {
      titolo: 'Sonno',
      domanda: 'Quanto ti senti riposata dalla notte scorsa?',
      sinistra: 'Zombie',
      destra: 'Ben riposata',
      ore: 'Circa quanto hai dormito?',
    },
    energia: {
      titolo: 'Energia',
      domanda: 'Quanto sono cariche le batterie?',
      sinistra: 'Svuotata',
      destra: 'Carichissima',
    },
    umore: {
      titolo: 'Umore',
      domanda: 'Come va emotivamente?',
      sinistra: 'Peggio non si può',
      destra: 'Al top',
    },
    scuola: {
      titolo: 'Scuola',
      domanda: 'Come va la pressione in questo momento?',
      sinistra: 'Relax',
      destra: 'Massimo stress',
    },
    ciclo: 'Hai il ciclo?',
    antidolorifici: 'Preso antidolorifici?',
    azione: 'Individua ciò che senti',
  },

  segnali: {
    occhiello: 'PRIMA DI INIZIARE',
    titolo: 'Considera questi segnali',
    decifra: 'Decifriamo la sensazione',
    affaticamento: {
      titolo: 'Dolore da affaticamento',
      corpo: 'Si allevia mentre ti riscaldi. Presente in entrambi i lati.',
    },
    protettivo: {
      titolo: 'Dolore protettivo',
      corpo:
        "Acuto, improvviso o profondo in un'articolazione. Solo da un lato. Peggiora muovendolo.",
    },
    prova: 'Prova questo oggi',
    /*
     * Quello che c'e' dentro alla scheda quando si apre. Due liste, non una:
     * il consiglio cambia se le parole che ha scelto assomigliano a un dolore
     * che protegge o a uno che ha solo lavorato.
     */
    provaOggi: {
      affaticamento: [
        'Allunga il riscaldamento di cinque minuti e parti piano: questo tipo di dolore di solito si scioglie mentre ti muovi.',
        'Se a metà sessione è ancora lì uguale, dillo a chi ti allena — non aspettare la fine.',
      ],
      protettivo: [
        'Oggi evita il gesto che lo fa peggiorare. Il resto dell’allenamento puoi farlo.',
        'Dillo a chi ti allena PRIMA di cominciare, e a un genitore o al medico se stasera è ancora lì.',
      ],
    },
    nota: 'BAB ti aiuta a tradurre i segnali del corpo in informazioni chiare, senza sostituire il tuo sistema di supporto. Rivolgiti sempre al tuo allenatore, medico o un genitore se qualcosa non va.',
    azione: 'Capito! Iniziamo',
  },

  // ── CHECK-OUT ─────────────────────────────────────────────────────────────

  ritmoDopo: {
    occhiello: 'PASSO 1 · CONFRONTATI',
    titolo: 'Come si sentiva il tuo corpo?',
    occhio:
      "Ripensando all'allenamento, scegli il ritmo che il tuo corpo ha effettivamente seguito.",
    /*
     * Il disegno ha solo il primo caso. Gli altri due li abbiamo scritti noi:
     * senza, chi ci prende leggerebbe che si e' sbagliata.
     */
    confronto: {
      piu: (previsto: string, sentito: string) =>
        `Pensavi che il ritmo del tuo corpo fosse ${previsto}, ma si è rivelato ${sentito}.`,
      meno: (previsto: string, sentito: string) =>
        `Pensavi che il ritmo del tuo corpo fosse ${previsto}, e ne aveva da dare di più: si è rivelato ${sentito}.`,
      uguale: (previsto: string) => `L'avevi indovinato: il ritmo era ${previsto}.`,
      corpo:
        'Confrontare la tua stima con quanto il tuo corpo aveva da dare oggi ti aiuta a decifrare i suoi segnali più in fretta.',
    },
    azione: 'Avanti',
  },

  sforzo: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Quanto è stato intenso per il tuo corpo?',
    carta: 'Sforzo',
    sinistra: 'Niente affatto',
    destra: 'Massimo',
    nota: {
      titolo: 'Solo tu puoi rispondere a questa.',
      corpo:
        'Due persone possono fare esattamente la stessa sessione e sentirla in modo completamente diverso — e entrambe hanno ragione perché ogni corpo è unico.',
    },
    azione: 'Avanti',
  },

  soddisfazione: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'E come ti senti a riguardo?',
    domanda: 'Quanto sei soddisfatta?',
    facce: {
      disappointed: 'Delusa',
      frustrated: 'Frustrata',
      satisfied: 'Soddisfatta',
      confident: 'Fiera',
      proud: 'Orgogliosa',
    },
    bottino: {
      titolo: 'Cosa hai portato a casa?',
      aiuto: 'Puoi selezionarne più di una',
      voci: {
        imparato: 'Ho imparato qualcosa di nuovo',
        ascoltato: 'Ho ascoltato il mio corpo',
        aiutato: 'Ho aiutato una compagna di squadra',
        gentile: 'Sono stata gentile con me stessa',
        eseguito: 'Ho eseguito un esercizio molto bene',
      },
      tua: 'Aggiungi tu...',
      segnaposto: 'Cosa ti porti a casa?',
    },
    azione: 'Avanti',
  },

  energia: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Quanta energia hai ora?',
    carta: 'Energia',
    sinistra: 'Sfinita',
    destra: 'Ancora carica',
    nota: {
      titolo: (prima: number) => `Questa mattina eri a ${prima}.`,
      corpo: "L'energia che diminuisce dopo una sessione è normale.",
      /* quando non ha fatto il check-in, un confronto non c'e' */
      senzaPrima:
        'Non hai fatto il check-in stamattina, quindi oggi non c’è un prima da confrontare.',
    },
    azione: 'Individua come ti senti',
  },

  rendiconto: {
    occhiello: 'PASSO 4 · IL TUO RENDICONTO',
    titolo: "Ecco cos'hai imparato oggi.",
    previsione: 'Previsione',
    richiesta: 'richiesta del corpo',
    frase: {
      piu: 'Ti aspettavi di più di quanto il tuo corpo potesse dare oggi e lo hai notato: ben fatto! ',
      meno: 'Il tuo corpo aveva più da dare di quanto pensassi, e te ne sei accorta: ben fatto! ',
      uguale: 'Avevi previsto esattamente il ritmo che il tuo corpo ha seguito. ',
      chiusa: 'Stai allenando la tua consapevolezza corporea.',
    },
    decodifica: {
      titolo: 'Decodifica il dolore',
      occhio: 'Alcuni segnali si manifestano solo quando ti fermi.',
      affaticamento: {
        titolo: 'Dolore da affaticamento',
        corpo:
          'Bruciore o stanchezza nei muscoli che hanno lavorato, abbastanza uniforme su entrambi i lati, che diminuisce mentre ti raffreddi.',
      },
      protettivo: {
        titolo: 'Dolore protettivo',
        corpo:
          "Acuto o improvviso, all'interno di un'articolazione, solo da un lato, che non ti fa dormire.",
      },
      domanda: 'Senti un dolore di tipo protettivo?',
    },
    nota: "Il recupero non è la parte noiosa dopo l'allenamento, ma dove l'allenamento si trasforma in progresso. Per dolore protettivo o qualsiasi cosa che sembri insolita, coinvolgi il tuo allenatore, medico o un genitore.",
    azione: 'Fatto per oggi',
  },

  // ── LA MAPPA E IL FOGLIO ──────────────────────────────────────────────────

  mappa: {
    occhiello: 'PASSO 3 · INDIVIDUA LE SENSAZIONI',
    titolo: 'Dove lo senti?',
    occhio: 'Tocca un punto, poi indica cosa senti.',
    davanti: 'Davanti',
    dietro: 'Dietro',
    altrove: 'Altrove',
    altroveDomanda: 'Dove, allora?',
    altroveSegnaposto: 'Testa, stomaco, gola…',
    nota: 'Fermarsi a localizzare una sensazione e descriverla ti aiuta a capire, gestire e comunicare meglio ciò che senti.',
    conteggio: (n: number) => (n === 1 ? '1 sensazione aggiunta' : `${n} sensazioni aggiunte`),
    azionePrima: 'Quasi fatto',
    azioneDopo: 'Quasi finito',
    /* si puo' anche non sentire niente, e non e' un fallimento */
    salta: 'Oggi non sento niente di particolare',
  },

  foglio: {
    come: 'Come la senti?',
    segnaposto: 'Descrivilo con parole tue...',
    aiuto: 'Un piccolo aiuto ✨',
    parole: {
      forte: 'forte',
      leggero: 'leggero',
      indolenzito: 'indolenzito',
      sordo: 'dolore sordo',
      teso: 'teso',
      rigido: 'rigido',
      pungente: 'pungente',
      trafittivo: 'trafittivo (fitta)',
      crampo: 'crampo',
      morsa: 'a morsa',
      bruciante: 'bruciante',
      formicolante: 'formicolante',
      intorpidito: 'intorpidito',
      instabile: 'instabile',
      gonfio: 'gonfio',
      caldo: 'caldo',
    },
    unLato: 'Solo da un lato?',
    intensita: 'Intensità:',
    lieve: 'Lieve',
    atroce: 'Atroce',
    aggiungi: 'Aggiungi questa sensazione',
    chiudi: 'Chiudi',
    togli: 'Togli questa sensazione',
  },
} as const

/**
 * I testi della sessione. La lingua per ora non cambia niente: gli schermi
 * inglesi non esistono ancora, e mostrare mezza traduzione sarebbe peggio che
 * mostrarne nessuna.
 */
export function testiSessione(_lingua: 'it' | 'en') {
  return SESSIONE
}
