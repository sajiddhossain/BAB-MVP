import type { Livello, Parola } from '../data/sessione'

/**
 * Le schede delle sedici parole.
 *
 * Sono il cuore editoriale del check-in: ogni parola ha una metafora, una
 * descrizione, e da uno a tre riquadri — la prova che puoi fare adesso, quando
 * la cosa diventa rossa, e con cosa e' facile confonderla.
 *
 * ── DUE COSE DA SAPERE ──────────────────────────────────────────────────────
 *
 * 1. L'INGLESE VIENE DAL DISEGNO, parola per parola: i sedici frame
 *    `checkin-5-word-card-*` sono la fonte, e quello che c'e' scritto qui e'
 *    quello che c'e' scritto li'.
 *
 * 2. L'ITALIANO L'ABBIAMO TRADOTTO NOI. In Figma le schede esistono solo in
 *    inglese. Sono testi che parlano di dolore a ragazze di dodici anni: la
 *    traduzione funziona, ma NON e' passata da chi scrive i testi ne' da chi
 *    di mestiere guarda i corpi. Va riletta prima del pilota.
 *
 * `riga` e' quello che compare nell'elenco delle sedici parole, e a volte NON
 * e' la stessa metafora della scheda — nel disegno "strong" in elenco e' "the
 * engine sound" e sulla scheda e' "your body has power to give". Sono due
 * frasi diverse apposta: una serve a farti scorrere l'elenco, l'altra a farti
 * capire la parola.
 */

/** Il tono di un riquadro: la prova da fare, la bandiera rossa, il confronto. */
export type Tono = 'prova' | 'rosso' | 'viola'

export type Riquadro = { etichetta: string; testo: string; tono: Tono }

export type SchedaParola = {
  /** la pastiglia in cima: il colore lo da' il livello, non questo testo */
  badge: string
  /** la metafora sulla scheda */
  metafora: string
  /** la riga nell'elenco delle sedici parole */
  riga: string
  descrizione: string
  riquadri: Riquadro[]
  /*
   * La riga corta e la mossa sullo schermo "cosa dicono le tue parole".
   *
   * Il disegno le da' per TRE parole su sedici, e sono queste: dove mancano
   * si usa `riga` per la prima e il nome del livello per la seconda. Non le
   * abbiamo inventate per le altre tredici — inventare tredici consigli su
   * cosa fare con un dolore non e' una cosa da fare di sfuggita.
   */
  glossa?: string
  mossa?: string
}

type Lingua = {
  livelli: Record<Livello, { nome: string; spiega: string }>
  /*
   * Gli stessi tre livelli visti da fuori: non "cosa fai" ma "cosa fa il
   * segnale". Passa, insiste, segnala. Vengono dai frame nuovi del check-in
   * e del check-out, dove stanno in cima con questi nomi.
   */
  segnali: Record<Livello, { nome: string; testo: string }>
  comeLeggere: string
  oggi: string
  etichette: Record<Tono | 'sente', string>
  schermo: {
    occhiello: string
    titolo: string
    intro: string
    nota: string
    azione: string
  }
  usa: string
  aiuto: string
  schede: Record<Parola, SchedaParola>
}

const ET_IT = {
    prova: "La prova",
    rosso: "Diventa rosso quando",
    viola: "Facile confonderla",
    sente: "Si sente come",
} as const

const it: Lingua = {
  livelli: {
    push: { nome: "Spingi", spiega: "Il tuo corpo sta lavorando" },
    calibra: { nome: "Calibra", spiega: "Il tuo corpo chiede un aggiustamento" },
    sostegno: { nome: "Sostegno", spiega: "Il tuo corpo chiede una mano in più" },
  },
  segnali: {
    push: {
      nome: "Passa",
      testo: "Va via se ti riposi, o si scioglie mentre ti muovi. Il tuo corpo sta lavorando.",
    },
    calibra: {
      nome: "Insiste",
      testo:
        "Resta, non cresce, e ha un motivo che sai dire. Il tuo corpo chiede un aggiustamento.",
    },
    sostegno: {
      nome: "Segnala",
      testo:
        "Improvviso, largo come un dito, da un lato solo, che cresce, o che non sembra proprio muscolo. Il tuo corpo chiede un'altra persona.",
    },
  },
  comeLeggere: "Come si legge un segnale",
  oggi: "La mossa di oggi",
  etichette: ET_IT,
  schermo: {
    occhiello:
      "LE TUE SENSAZIONI",
    titolo:
      "Le sedici parole.",
    intro:
      "Ogni parola ha una metafora, una prova che puoi fare adesso, e una mossa. Tocca una parola per la scheda intera.",
    nota:
      "Sostegno vuol dire: dirlo a un allenatore, a un fisioterapista, a un genitore, a un medico. BAB ti aiuta a trovare la parola giusta per farti dare il sostegno migliore, ma non li sostituirà mai.",
    azione:
      "Torna al mio check-in",
  },
  usa: "Usa questa parola",
  aiuto: "Non sai quale parola? Tocca una i.",
  schede: {
    forte: {
      badge: "Nota quanto ti senti pronta",
      metafora: "Il tuo corpo ha forza da dare.",
      riga: "Il rumore del motore.",
      descrizione:
        "Sentirsi forte può voler dire che i muscoli si sentono potenti, capaci e pronti a lavorare.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Le gambe prima di uno scatto, quando le senti solide, potenti e pronte a spingerti avanti.", tono: 'viola' },
      ],
    },
    leggero: {
      badge: "Nota quanto sei elastica",
      metafora: "Come se il corpo avesse le molle.",
      riga: "Una piuma.",
      descrizione:
        "Il corpo si sente libero, fresco e pronto a muoversi quasi senza sforzo.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Rimbalzare sulle punte e sentire che il corpo ha voglia di muoversi — leggero, rapido, elastico.", tono: 'viola' },
      ],
    },
    indolenzito: {
      badge: "Controlla se è dolente al tatto",
      metafora: "Il conto del giorno dopo.",
      riga: "Il conto del giorno dopo.",
      glossa: "il conto del giorno dopo",
      mossa: "Spingi piano",
      descrizione:
        "Il conto che i muscoli ti mandano 24-48 ore dopo un lavoro nuovo o più duro. Sparso su tutto un muscolo, di solito da tutti e due i lati, peggio al primo movimento, meglio quando ti sei scaldata.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Una zona indolenzita è dolente o sensibile quando la tocchi, la muovi o la usi.", tono: 'viola' },
      ],
    },
    teso: {
      badge: "Nota cosa succede quando ti muovi",
      metafora: "Come se un muscolo venisse tirato più corto.",
      riga: "Una corda di chitarra accordata troppo alta.",
      glossa: "si scioglie quando ti scaldi",
      mossa: "Spingi dopo il riscaldamento",
      descrizione:
        "Sentirsi tesa può far sembrare una parte del corpo bloccata, stirata, o come se non avesse la solita libertà di movimento.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Tirare l’elastico di un paio di leggings un po’ troppo. La sensazione di qualcosa che ti trattiene appena.", tono: 'viola' },
      ],
    },
    bruciante: {
      badge: "Nota se si spegne",
      metafora: "Un fiammifero, non un incendio.",
      riga: "Un fiammifero, non un incendio.",
      glossa: "un fiammifero, non un incendio",
      mossa: "Spingi se si spegne",
      descrizione:
        "Una sensazione calda e pungente dentro a un muscolo, che può crescere durante uno sforzo intenso. Quando viene dal lavoro duro, di solito passa poco dopo che rallenti o ti fermi.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Le cosce su una rampa di scale lunga. Cresce mentre sali e passa dopo che sei arrivata in cima.", tono: 'viola' },
      ],
    },
    sordo: {
      badge: "Nota se si allarga",
      metafora: "Un ronzio della radio che non riesci a spegnere.",
      riga: "Un ronzio della radio che non riesci a spegnere.",
      descrizione:
        "Una sensazione sorda, vaga e profonda, senza bordi chiari. Spesso in più punti insieme.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Qualcosa dentro al corpo è stanco, dolente o consumato. Un muscolo che dice: «oggi ho lavorato tanto e voglio che tu lo sappia».", tono: 'viola' },
      ],
    },
    rigido: {
      badge: "Calibra",
      metafora: "Una cerniera inceppata.",
      riga: "Una cerniera inceppata.",
      descrizione:
        "È l’articolazione che non arriva in fondo, non il muscolo che non si allunga. Peggio nei primi minuti della mattina o dopo essere stata ferma, meglio più la muovi. Muovila piano e spesso — non forzarla.",
      riquadri: [
        { etichetta: ET_IT.prova, testo: "Muovila piano, dieci volte. Alla decima arriva più in là che alla prima? Allora è rigidità.", tono: 'prova' },
        { etichetta: ET_IT.rosso, testo: "Più di 30-45 minuti ogni mattina · oppure rigida, gonfia e calda.", tono: 'rosso' },
        { etichetta: ET_IT.viola, testo: "teso è un tiro, e molla quando ti scaldi. rigido è un blocco, e si apre più lo muovi.", tono: 'viola' },
      ],
    },
    crampo: {
      badge: "Nota il ritmo",
      metafora: "Come se dentro qualcosa si stringesse e si mollasse.",
      riga: "Un pugno che si stringe e si apre.",
      descrizione:
        "Il crampo di solito arriva a ondate: una stretta che cresce, tiene per un paio di secondi, molla, e può tornare.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Stringere il pugno, tenerlo un attimo, poi lasciarlo aprire — solo che la stretta è dentro al corpo.", tono: 'viola' },
      ],
    },
    morsa: {
      badge: "Calibra",
      metafora: "Una mano che non molla.",
      riga: "Una mano che non molla.",
      descrizione:
        "La stessa stretta, ma continua, e in un punto solo. Ti tiene in una posizione e ti accorgi di proteggerla. Spesso è un muscolo che protegge qualcos’altro — la guardia, non il problema. Il crampo è una luce che lampeggia; la morsa è la luce rimasta accesa.",
      riquadri: [
        { etichetta: ET_IT.prova, testo: "Ha mollato anche una volta sola nell’ultimo minuto? Se no, è una morsa.", tono: 'prova' },
        { etichetta: ET_IT.rosso, testo: "Blocca un’articolazione · non riesci a scioglierla · è arrivata dopo un momento preciso che sai dire.", tono: 'rosso' },
        { etichetta: ET_IT.viola, testo: "il crampo pulsa. la morsa tiene.", tono: 'viola' },
      ],
    },
    pungente: {
      badge: "Calibra",
      metafora: "Un taglio di carta, non un livido.",
      riga: "Un taglio di carta.",
      descrizione:
        "Improvvisa, precisa, e la puoi indicare con un dito solo. Arriva in un momento preciso di un movimento. Di solito è una struttura — tendine, bordo dell’articolazione, osso — più che la pancia di un muscolo. Cambia il movimento, cambia il carico, ricontrolla.",
      riquadri: [
        { etichetta: ET_IT.prova, testo: "Un dito o tutta la mano? Un dito = pungente.", tono: 'prova' },
        { etichetta: ET_IT.rosso, testo: "Lo stesso movimento dà la stessa fitta nello stesso punto tutte le volte.", tono: 'rosso' },
        { etichetta: ET_IT.viola, testo: "pungente ti fa cambiare quello che stai facendo. trafittivo te lo fa smettere.", tono: 'viola' },
      ],
    },
    trafittivo: {
      badge: "Fermati · Sostegno",
      metafora: "Pungente, ma con la forza dietro.",
      riga: "Pungente, ma con la forza dietro.",
      descrizione:
        "Ti fa trattenere il fiato, sussultare, o fermarti a metà ripetizione prima di averlo deciso. Pungente dice «non così». Trafittivo dice «non del tutto». Se il corpo si ferma da solo, è un’informazione importante.",
      riquadri: [
        { etichetta: ET_IT.prova, testo: "Il corpo si è fermato prima della testa?", tono: 'prova' },
        { etichetta: ET_IT.rosso, testo: "Sempre, e lo stesso giorno.", tono: 'rosso' },
        { etichetta: ET_IT.viola, testo: "pungente ti fa cambiare quello che stai facendo. trafittivo te lo fa smettere.", tono: 'viola' },
      ],
    },
    formicolante: {
      badge: "Sostegno",
      metafora: "Una bibita gassata sotto la pelle.",
      riga: "Una bibita gassata sotto la pelle.",
      descrizione:
        "Spesso è un nervo schiacciato o irritato. Ad alcune ragazze capita di sentire formicolio a mani o piedi prima del ciclo.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Il piede dopo che ci sei stata seduta sopra troppo. Una sensazione frizzante che corre lungo una linea.", tono: 'viola' },
      ],
    },
    intorpidito: {
      badge: "Nota cos’è cambiato",
      metafora: "Il volume abbassato a zero.",
      riga: "Il volume abbassato a zero.",
      descrizione:
        "Intorpidito vuol dire che senti meno del solito, o quasi niente. Tatto, pressione o temperatura possono sembrare attutiti o lontani.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Come se una parte del corpo fosse diventata silenziosa. Ti accorgi di toccarla, ma appena — come la pelle attraverso un guanto o uno strato di vestiti.", tono: 'viola' },
      ],
    },
    instabile: {
      badge: "Calibra + Sostegno",
      metafora: "La gamba di un tavolo che balla.",
      riga: "La gamba di un tavolo che balla.",
      descrizione:
        "L’articolazione sembra che possa cedere, e non è affidabile sotto carico. I muscoli che la tengono ferma non stanno reggendo quello che le chiedi — di solito quando sei stanca, quando atterri o quando cambi direzione.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Salire su una sedia con una gamba lenta. Non si è rotto ancora niente. È che non ti fidi.", tono: 'viola' },
      ],
    },
    gonfio: {
      badge: "Nota il cambiamento",
      metafora: "Un palloncino d’acqua sotto la pelle.",
      riga: "Un palloncino d’acqua sotto la pelle.",
      descrizione:
        "Come se ci fosse dello spazio in più occupato. Una zona gonfia può sembrare più piena, più tonda, più tesa o più pesante del solito. A volte la differenza si vede; a volte si sente e basta.",
      riquadri: [
        { etichetta: ET_IT.sente, testo: "Un dito dopo aver portato un anello diventato all’improvviso troppo stretto.", tono: 'viola' },
      ],
    },
    caldo: {
      badge: "Un punto solo → Sostegno",
      metafora: "Il retro di un portatile acceso da troppo tempo.",
      riga: "Il retro di un portatile acceso da troppo tempo.",
      descrizione:
        "Il caldo è una sensazione di calore insolito in una parte del corpo. Nota se è caldo sulla pelle, più in profondità, o tutti e due.",
      riquadri: [
        { etichetta: ET_IT.rosso, testo: "Caldo + rosso + gonfio + peggiora = oggi.", tono: 'rosso' },
        { etichetta: ET_IT.sente, testo: "Il retro di un portatile acceso da troppo tempo.", tono: 'viola' },
      ],
    },
  },
}

const ET_EN = {
    prova: "The test",
    rosso: "It turns red when",
    viola: "Easy to mix up",
    sente: "It feels like",
} as const

const en: Lingua = {
  livelli: {
    push: { nome: "Push", spiega: "Your body is working" },
    calibra: { nome: "Calibrate", spiega: "Your body is asking for an adjustment" },
    sostegno: { nome: "Support", spiega: "Your body is asking for additional help" },
  },
  segnali: {
    push: {
      nome: "Fades",
      testo: "Goes when you rest, or warms out as you move. Your body is working.",
    },
    calibra: {
      nome: "Nags",
      testo:
        "Stays, doesn’t grow, has a reason you can name. Your body is asking for an adjustment.",
    },
    sostegno: {
      nome: "Flags",
      testo:
        "Sudden, one-finger wide, one side only, growing, or it doesn’t feel like muscle at all. Your body is asking for another person.",
    },
  },
  comeLeggere: "How to read any signal",
  oggi: "Today’s call",
  etichette: ET_EN,
  schermo: {
    occhiello:
      "YOUR SENSATIONS",
    titolo:
      "The 16 words.",
    intro:
      "Every word has a metaphor, a test you can do right now, and a move. Tap any word for the full card.",
    nota:
      "Support means: tell a coach, a physio, a parent, a doctor. BAB helps you find the word to help you get the best support, but will never replace them.",
    azione:
      "Back to my check-in",
  },
  usa: "Use this word",
  aiuto: "Not sure which word? Tap any i.",
  schede: {
    forte: {
      badge: "Notice how ready you feel",
      metafora: "Your body has power to give.",
      riga: "The engine sound.",
      descrizione:
        "A strong feeling can mean your muscles feel powerful, capable and ready to put in work.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Your legs before a sprint when they feel solid, powerful and ready to drive you forward.", tono: 'viola' },
      ],
    },
    leggero: {
      badge: "Notice how springy",
      metafora: "Like your body has springs.",
      riga: "A feather.",
      descrizione:
        "Your body feels free, fresh and ready to move almost effortlessly.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Bouncing on your toes and feeling like your body wants to move — light, quick and springy.", tono: 'viola' },
      ],
    },
    indolenzito: {
      badge: "Check if it feels tender",
      metafora: "The day-after receipt.",
      riga: "The day-after receipt.",
      glossa: "the day-after receipt",
      mossa: "Push lightly",
      descrizione:
        "The bill your muscles send 24–48 hours after new or harder work. Spread across a whole muscle, usually both sides, worse on the first move, better once you’re warm.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "A sore area feels tender or sensitive when you touch it, move it or use it.", tono: 'viola' },
      ],
    },
    teso: {
      badge: "Notice what happens when you move",
      metafora: "Like a muscle is being pulled shorter.",
      riga: "A guitar string tuned too high.",
      glossa: "loosens as you warm up",
      mossa: "Push after warm-up",
      descrizione:
        "A tight feeling can make a body part feel restricted, stretched or as though it doesn’t have its usual freedom to move.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Pulling the waistband of a pair of leggings a little too far. The feeling of something gently holding you back.", tono: 'viola' },
      ],
    },
    bruciante: {
      badge: "Notice if it fades",
      metafora: "A match, not a fire.",
      riga: "A match, not a fire.",
      glossa: "a match, not a fire",
      mossa: "Push if it fades",
      descrizione:
        "A hot, stinging feeling inside a muscle that can build during hard exercise. When it’s from working hard, it usually eases soon after you slow down or stop.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Your thighs on a long flight of stairs. It builds while you’re climbing and eases after you reach the top.", tono: 'viola' },
      ],
    },
    sordo: {
      badge: "Notice if it spreads",
      metafora: "A radio hum you can’t turn off.",
      riga: "A radio hum you can’t turn off.",
      descrizione:
        "Dull, vague and deep feeling, without clear edges. Often several places at once.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Something is tired, tender or worn out inside your body. A muscle saying, “I’ve done a lot today and I want you to know.”", tono: 'viola' },
      ],
    },
    rigido: {
      badge: "Calibrate",
      metafora: "A stuck zip.",
      riga: "A stuck zip.",
      descrizione:
        "It’s the joint that won’t move all the way, not the muscle that won’t stretch. Worst in the first minutes of the morning or after sitting still, easier the more you move it. Move it gently and often — don’t force it.",
      riquadri: [
        { etichetta: ET_EN.prova, testo: "Move it slowly, ten times. Does it go further on the tenth than the first? That’s stiff.", tono: 'prova' },
        { etichetta: ET_EN.rosso, testo: "More than 30–45 minutes every morning · or stiff and swollen and warm.", tono: 'rosso' },
        { etichetta: ET_EN.viola, testo: "tight feels like a pull and lets go once you’re warm. stiff feels like a block and opens up the more you move it.", tono: 'viola' },
      ],
    },
    crampo: {
      badge: "Notice the rhythm",
      metafora: "Like something inside is tightening and relaxing.",
      riga: "A fist clenching and unclenching.",
      descrizione:
        "A crampy feeling often comes in waves, with a squeezing or tightening sensation that builds, holds for a couple of second, eases, and may come back again.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Making a fist, holding it tight for a moment, then letting it open, except the squeezing is happening inside your body.", tono: 'viola' },
      ],
    },
    morsa: {
      badge: "Calibrate",
      metafora: "A hand that won’t let go.",
      riga: "A hand that won’t let go.",
      descrizione:
        "The same clench, but constant, and in one spot. It holds you in a position and you find yourself guarding it. Often a muscle protecting something — the guard, not the problem. A cramp is a strobe light; gripping is the light left on.",
      riquadri: [
        { etichetta: ET_EN.prova, testo: "Has it let go even once in the last minute? If no, it’s gripping.", tono: 'prova' },
        { etichetta: ET_EN.rosso, testo: "Locks a joint · you can’t release it · it followed one moment you can name.", tono: 'rosso' },
        { etichetta: ET_EN.viola, testo: "crampy pulses. gripping holds.", tono: 'viola' },
      ],
    },
    pungente: {
      badge: "Calibrate",
      metafora: "A paper cut, not a bruise.",
      riga: "A paper cut.",
      descrizione:
        "Sudden, precise, and you can point at it with one finger. It arrives at a specific moment in a movement. Usually a structure — tendon, joint edge, bone — rather than a muscle belly. Change the movement, change the load, check it again.",
      riquadri: [
        { etichetta: ET_EN.prova, testo: "One finger or a whole hand? One finger = sharp.", tono: 'prova' },
        { etichetta: ET_EN.rosso, testo: "The same movement gives the same sharp thing in the same spot every single time.", tono: 'rosso' },
        { etichetta: ET_EN.viola, testo: "sharp makes you change what you’re doing. stabbing makes you stop doing it.", tono: 'viola' },
      ],
    },
    trafittivo: {
      badge: "Stop · Support",
      metafora: "Sharp with force behind it.",
      riga: "Sharp with force behind it.",
      descrizione:
        "It makes you catch your breath, flinch, or stop mid-rep before you’ve decided to. Sharp says “not like that.” Stabbing says “not at all.” Treat an involuntary stop as important information.",
      riquadri: [
        { etichetta: ET_EN.prova, testo: "Did your body stop before your brain did?", tono: 'prova' },
        { etichetta: ET_EN.rosso, testo: "Always, and the same day.", tono: 'rosso' },
        { etichetta: ET_EN.viola, testo: "sharp makes you change what you’re doing. stabbing makes you stop doing it.", tono: 'viola' },
      ],
    },
    formicolante: {
      badge: "Support",
      metafora: "Fizzy drink under the skin.",
      riga: "Fizzy drink under the skin.",
      descrizione:
        "Often a nerve being squeezed or irritated. Some girls may experience tingling in their hands or feet before their period.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Your foot after you’ve sat on it too long. A fizzy sensation that travels along a line.", tono: 'viola' },
      ],
    },
    intorpidito: {
      badge: "Notice what’s changed",
      metafora: "The volume turned to zero.",
      riga: "The volume turned to zero.",
      descrizione:
        "Numbness means you feel less sensation than usual, or almost none. Touch, pressure or temperature might feel muted or distant.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Like a body part has gone quiet. You can tell you are touching it, but only faintly, such as the skin when behind a glove or a layer of clothing.", tono: 'viola' },
      ],
    },
    instabile: {
      badge: "Calibrate + Support",
      metafora: "A wobbly table leg.",
      riga: "A wobbly table leg.",
      descrizione:
        "The joint feels like it might give way and unreliable under load. The muscles that hold it steady aren’t keeping up with your asks, usually when you’re tired, landing or changing direction.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "Stepping onto a chair with one loose leg. Nothing has broken yet. You just don’t trust it.", tono: 'viola' },
      ],
    },
    gonfio: {
      badge: "Notice the change",
      metafora: "A water balloon under the skin.",
      riga: "A water balloon under the skin.",
      descrizione:
        "Like there’s extra space being taken up. A swollen area can feel fuller, puffier, tighter or heavier than usual. Sometimes you can see the difference; sometimes you mainly feel it.",
      riquadri: [
        { etichetta: ET_EN.sente, testo: "A finger after you’ve worn a ring that’s suddenly become too tight.", tono: 'viola' },
      ],
    },
    caldo: {
      badge: "One spot → Support",
      metafora: "The back of a laptop that’s been running too long.",
      riga: "The back of a laptop that’s been running too long.",
      descrizione:
        "A hot sensation is a feeling of unusual warmth in one part of your body. Notice whether it feels warm on the skin, deeper inside, or both.",
      riquadri: [
        { etichetta: ET_EN.rosso, testo: "Hot + red + swollen + getting worse = today.", tono: 'rosso' },
        { etichetta: ET_EN.sente, testo: "The back of a laptop that’s been running too long.", tono: 'viola' },
      ],
    },
  },
}

export const TESTI_PAROLE = { it, en }

/** Le schede nella lingua giusta. Qui l'inglese c'e' davvero: viene dai frame. */
export function testiParole(lingua: 'it' | 'en'): Lingua {
  return lingua === 'en' ? en : it
}
