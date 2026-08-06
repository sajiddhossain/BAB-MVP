import type { Locale } from '@/copy'

/**
 * I tre tempi.
 *
 * 🔵 Restano in inglese anche nella versione italiana: sono un VOCABOLARIO
 * CONDIVISO fra atleta e coach (Settimana 10 del percorso — "il tempo di BAB vi
 * dà una parola condivisa, così 'Gentle oggi' significa qualcosa che capite
 * entrambi"). Tre parole brevi che restano identiche fra mercati.
 * Se la decisione cambia, si cambia QUI e in nessun altro posto.
 */
export type TempoCode = 'upbeat' | 'steady' | 'gentle'

export type Tempo = {
  code: TempoCode
  name: string
  emoji: string
  cssVar: string
  tag: Record<Locale, string>
  meaning: Record<Locale, string>
  plan: Record<Locale, string[]>
}

export const TEMPOS: Record<TempoCode, Tempo> = {
  upbeat: {
    code: 'upbeat', name: 'Upbeat', emoji: '⚡', cssVar: '--tempo-upbeat',
    tag: {
      it: 'Un giorno da costruire — vai a prendertelo',
      en: 'A build day — go get it',
    },
    meaning: {
      it: 'Il tuo serbatoio legge pieno e niente sta facendo la guardia. Questo è un giorno in cui il tuo corpo può prendere carico vero e trasformarlo in forza. Spingi dentro il bruciore onesto — muscoli che lavorano, polmoni che vanno, fatica che è guadagnata. È qui che sali di livello.',
      en: "Your tank reads full and nothing's guarding. This is a day your body can take real load and turn it into strength. Push into the honest burn — muscles working, lungs going, effort that's earned. This is where you level up.",
    },
    plan: {
      it: [
        'Allenati a piena intensità — cerca le ripetute e i salti duri.',
        'Il "dolore che lavora" (muscoli che bruciano, fiatone, anche indolenzimento) è esattamente giusto — appoggiati.',
        'Scaldati come si deve e mangia bene prima e dopo.',
        'Nota come si sente questo — è il tuo riferimento per leggere i giorni storti.',
      ],
      en: [
        'Train at full intensity — chase the hard reps and jumps.',
        '"Working pain" (burning muscles, heavy breathing, even soreness) is exactly right — lean in.',
        'Warm up properly and fuel well before and after.',
        "Notice how this feels — it's your reference for reading off days.",
      ],
    },
  },
  steady: {
    code: 'steady', name: 'Steady', emoji: '🌊', cssVar: '--tempo-steady',
    tag: {
      it: 'Un giorno di qualità — mettilo a fuoco',
      en: 'A quality day — dial it in',
    },
    meaning: {
      it: 'Hai qualcosa nel serbatoio, ma non tutto. Questo non è un giorno di riposo e non è un fallimento — è un giorno di qualità invece che quantità. Allenati in modo intelligente e preciso, e spesso migliorerai più che in una macinata.',
      en: "You've got something in the tank, but not everything. This isn't a rest day and it isn't a fail — it's a quality-over-quantity day. Train smart and precise, and you'll often improve more than on a grind.",
    },
    plan: {
      it: [
        'Abbassa l\'intensità intorno al 7/10 — niente massimali.',
        'Fanne un giorno di tecnica: piedi, battuta, ricezione, gesto.',
        'Scaldati più a lungo del solito; bevi e mangia bene.',
        'Resta sintonizzata — se un canale cala a metà sessione, scendi di tempo.',
      ],
      en: [
        'Ease intensity to around 7/10 — skip all-out max efforts.',
        'Make it a skill day: footwork, serving accuracy, passing, technique.',
        'Warm up longer than usual; hydrate and eat well.',
        'Stay tuned in — if a channel drops mid-session, ease your tempo down.',
      ],
    },
  },
  gentle: {
    code: 'gentle', name: 'Gentle', emoji: '🍃', cssVar: '--tempo-gentle',
    tag: {
      it: 'Un giorno da ricostruire — è qui che cresci',
      en: 'A rebuild day — this is where you grow',
    },
    meaning: {
      it: 'I tuoi segnali leggono bassi su tutta la linea — ed ecco il segreto che le migliori atlete conoscono: non diventi più forte durante l\'allenamento duro, diventi più forte mentre recuperi da esso. Oggi, andarci piano è l\'allenamento. Scegliere questo tempo è una mossa di potere, non un passo indietro.',
      en: "Your signals read low across the board — and here's the secret the best athletes know: you don't get stronger during hard training, you get stronger while you recover from it. Today, taking it gentle is the training. Choosing this tempo is a power move, not a step back.",
    },
    plan: {
      it: [
        'Riposa, o fai recupero attivo gentile: camminata facile, mobilità leggera, stretching.',
        'Metti energia nel sonno e in pasti come si deve — è quello che riempie il serbatoio.',
        'Di\' al tuo coach che vai in Gentle così può adattare — le atlete forti comunicano.',
        'Torna domani e sintonizzati di nuovo; un giorno Gentle protegge una settimana di Upbeat.',
      ],
      en: [
        'Rest, or do gentle active recovery: easy walk, light mobility, stretching.',
        "Pour energy into sleep and proper meals — that's what refills the tank.",
        'Tell your coach you\'re going Gentle so they can adjust — strong athletes communicate.',
        'Come back tomorrow and tune in again; one Gentle day protects a week of Upbeat ones.',
      ],
    },
  },
}

export const TEMPO_ORDER: TempoCode[] = ['upbeat', 'steady', 'gentle']
