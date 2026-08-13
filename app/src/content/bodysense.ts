import type { Locale } from '@/copy'

/**
 * Body-Sense — la libreria di piccoli esercizi di interocezione, fuori
 * dall'onboarding: si fanno quando vuoi, non una volta sola.
 *
 * 🔴 Bilingue e autonomo, come `content/tempo.ts`: il testo vive qui insieme
 * alla struttura del passo, non in `copy/*.ts`. Un esercizio è quasi tutto
 * testo lungo che non si riusa altrove — separarlo in due file lontani
 * avrebbe solo reso più facile disallinearli.
 *
 * L'esercizio "Battito" (`heartbeat`) NON è qui: è lo stesso, identico
 * esercizio già in onboarding (`Onboarding.tsx`, passi `heart*`), richiamato
 * da `BodySense.tsx` invece di essere riscritto due volte.
 */

type L = Record<Locale, string>

export type When = 'before' | 'after' | 'match' | 'anytime'

export type PickOption = { emoji?: string; label: L; value: string }

export type Step =
  | { kind: 'text'; kicker: L; title: L; body: L }
  | { kind: 'pick'; kicker: L; title: L; body?: L; store: string; row?: boolean; options: PickOption[] }
  | { kind: 'scale'; kicker: L; title: L; body?: L; store: string; low: L; high: L }
  | { kind: 'breath'; kicker: L; title: L; body: L }
  | { kind: 'reflect'; kicker: L; title: L; body: L }
  /** Il confronto fra due risposte già date si calcola in `BodySense.tsx` (REVEALS), non qui. */
  | { kind: 'reveal'; kicker: L; title: L }

export type ExerciseId = 'breath' | 'nervous' | 'zone' | 'twosides' | 'hunger' | 'feeling'

export type Exercise = {
  id: ExerciseId
  emoji: string
  name: L
  trains: L
  dur: L
  when: When[]
  steps: Step[]
}

export const WHEN_LABEL: Record<When, L> = {
  before: { it: 'Prima di allenarti', en: 'Before training' },
  after: { it: 'Dopo', en: 'After' },
  match: { it: 'Giorno di gara', en: 'Match day' },
  anytime: { it: 'Quando vuoi', en: 'Anytime' },
}

export const EXERCISES: Record<ExerciseId, Exercise> = {
  breath: {
    id: 'breath', emoji: '🫁',
    name: { it: 'Respiro', en: 'Breath' },
    trains: { it: 'Precisione + calma', en: 'Accuracy + calm' },
    dur: { it: '90 sec', en: '90s' },
    when: ['anytime', 'before', 'match'],
    steps: [
      { kind: 'text',
        kicker: { it: 'Sintonizzati', en: 'Tune in' },
        title: { it: 'Nota il tuo respiro', en: 'Notice your breath' },
        body: { it: 'Respira come al solito — non cambiarlo. Dove si muove? Pancia, petto, spalle?', en: "Breathe like normal — don't change it. Where does it move? Belly, chest, shoulders?" } },
      { kind: 'pick', store: 'guess', row: true,
        kicker: { it: 'Passo 1 · Indovina', en: 'Step 1 · Guess' },
        title: { it: 'Quanti respiri al minuto?', en: 'How many breaths a minute?' },
        body: { it: 'Un respiro = dentro e fuori. Fai una stima.', en: 'One breath = in and out. Take a guess.' },
        options: [
          { emoji: '🌙', label: { it: 'Lento', en: 'Slow' }, value: 'slow' },
          { emoji: '🌤️', label: { it: 'Medio', en: 'Medium' }, value: 'medium' },
          { emoji: '🔥', label: { it: 'Veloce', en: 'Quick' }, value: 'quick' },
        ] },
      { kind: 'reflect',
        kicker: { it: 'Il tuo conto', en: 'Your read' },
        title: { it: 'Contalo per bene', en: 'Now count it' },
        body: { it: 'Conta i respiri completi (dentro + fuori) per una ventina di secondi, poi confrontalo con la tua stima: erano più lenti o più veloci di quello che pensavi?', en: 'Count full breaths (in + out) for about twenty seconds, then compare with your guess: slower or faster than you thought?' } },
      { kind: 'breath',
        kicker: { it: 'Passo 2 · Guidalo', en: 'Step 2 · Steer it' },
        title: { it: 'Ora cambialo apposta', en: 'Now change it on purpose' },
        body: { it: 'Segui il cerchio: respira dentro mentre cresce, fuori mentre si restringe. Il fuori dura più del dentro — è il tuo tasto calma.', en: 'Follow the circle: breathe in as it grows, out as it shrinks. Out is longer than in — that\'s your calm button.' } },
      { kind: 'reflect',
        kicker: { it: 'Bene', en: 'Nice' },
        title: { it: 'Hai fatto tutt\'e due', en: 'You did both' },
        body: { it: 'Respirare fuori più a lungo di quanto respiri dentro è il tuo tasto calma integrato. Usalo prima di un servizio, prima di un punto importante, o prima di dormire. Nessuna app — ce l\'hai sempre addosso.', en: "Breathing out longer than you breathe in is your built-in calm button. Use it before a serve, before a big point, or before sleep. No app needed — it's always with you." } },
    ],
  },

  nervous: {
    id: 'nervous', emoji: '⚡',
    name: { it: 'Nervosa o carica?', en: 'Nervous or Excited?' },
    trains: { it: 'Rileggere il segnale', en: 'Reframing' },
    dur: { it: '60 sec', en: '60s' },
    when: ['match', 'before'],
    steps: [
      { kind: 'text',
        kicker: { it: 'Sintonizzati', en: 'Tune in' },
        title: { it: 'Il momento prima della gara', en: 'The pre-game feeling' },
        body: { it: 'Pensa al momento prima di un punto importante o di una gara. Nota i segnali: cuore veloce, farfalle nello stomaco, mani che formicolano.', en: 'Picture the moment before a big point or a match. Notice the signals: fast heart, butterflies, buzzy hands.' } },
      { kind: 'pick', store: 'before', row: true,
        kicker: { it: 'Passo 1 · Dagli un nome', en: 'Step 1 · Name it' },
        title: { it: 'Come lo chiameresti?', en: 'What would you call that?' },
        options: [
          { emoji: '😰', label: { it: 'Nervosa', en: 'Nervous' }, value: 'nervous' },
          { emoji: '🤩', label: { it: 'Carica', en: 'Excited' }, value: 'excited' },
          { emoji: '🤔', label: { it: 'Non so', en: 'Not sure' }, value: 'unsure' },
        ] },
      { kind: 'reflect',
        kicker: { it: 'Il segreto', en: 'The secret' },
        title: { it: 'Stesso segnale, nome diverso', en: 'Same signal, different name' },
        body: { it: 'Ecco il trucco che usano le atlete più forti: nervosismo e carica sono la stessa cosa, dentro al corpo. Quel cuore veloce non è un allarme — è benzina. Vuol dire che sei pronta.', en: "Here's the trick the best athletes use: nervous and excited are the same thing in your body. That fast heart isn't a warning — it's fuel. It means you're ready." } },
      { kind: 'pick', store: 'after',
        kicker: { it: 'Passo 2 · Provalo', en: 'Step 2 · Try it' },
        title: { it: 'Dillo: "Sono pronta."', en: 'Say it: "I\'m ready."' },
        body: { it: 'Dillo nella tua testa, o a voce. Come ti sta?', en: 'Say it in your head, or out loud. How does it sit?' },
        options: [
          { emoji: '💪', label: { it: 'Meglio', en: 'Feels better' }, value: 'better' },
          { emoji: '➖', label: { it: 'Uguale', en: 'About the same' }, value: 'same' },
          { emoji: '🔁', label: { it: 'Ci vuole pratica', en: 'Takes practice' }, value: 'practice' },
        ] },
      { kind: 'reflect',
        kicker: { it: 'Ecco fatto', en: "That's it" },
        title: { it: 'Trasforma il nervosismo in carica', en: 'Turn nerves into ready' },
        body: { it: 'Questa mossa si chiama rivalutazione — dai un nuovo nome a quella scarica, la chiami "pronta" invece che "nervosa". Fallo a bordocampo prima di entrare. Il tuo corpo ti ha già preparata — tu stai solo leggendolo giusto.', en: "That move is called reappraisal — relabelling the buzz as readiness. Do it on the sideline before you go on. Your body's already prepped you; you're just reading it right." } },
    ],
  },

  zone: {
    id: 'zone', emoji: '🎯',
    name: { it: 'Trova la tua zona', en: 'Find Your Zone' },
    trains: { it: 'Guidare il segnale', en: 'Steering' },
    dur: { it: '90 sec', en: '90s' },
    when: ['match', 'before'],
    steps: [
      { kind: 'scale', store: 'before',
        kicker: { it: 'Passo 1 · Leggi', en: 'Step 1 · Read' },
        title: { it: 'Quanto sei carica?', en: 'How revved are you?' },
        low: { it: '1 · piatta', en: '1 · flat' }, high: { it: '5 · a mille', en: '5 · buzzing' } },
      { kind: 'text',
        kicker: { it: 'Passo 2 · Guida', en: 'Step 2 · Steer' },
        title: { it: 'Muovi la manopola', en: 'Nudge your dial' },
        body: { it: 'Troppo a mille? Segui il cerchio e respira lento (fuori più lungo del dentro). Troppo piatta? Fai 3 respiri veloci e scuoti braccia e gambe.', en: 'Too buzzy? Follow the circle and breathe slow (out longer than in). Too flat? Take 3 quick breaths and shake out your arms and legs.' } },
      { kind: 'breath',
        kicker: { it: 'Passo 2 · Guida', en: 'Step 2 · Steer' },
        title: { it: 'Respira col cerchio', en: 'Breathe with the circle' },
        body: { it: 'Dentro mentre cresce, fuori mentre si restringe. Bastano un paio di giri.', en: 'In as it grows, out as it shrinks. A few rounds is enough.' } },
      { kind: 'scale', store: 'after',
        kicker: { it: 'Passo 3 · Rileggi', en: 'Step 3 · Re-read' },
        title: { it: 'Dove sei adesso?', en: 'Where are you now?' },
        low: { it: '1 · piatta', en: '1 · flat' }, high: { it: '5 · a mille', en: '5 · buzzing' } },
      { kind: 'reveal',
        kicker: { it: 'Il tuo conto', en: 'Your read' },
        title: { it: 'Hai mosso la tua manopola', en: 'You moved your dial' } },
    ],
  },

  twosides: {
    id: 'twosides', emoji: '⚖️',
    name: { it: 'Due lati', en: 'Two Sides' },
    trains: { it: 'Localizzare', en: 'Locating' },
    dur: { it: '60 sec', en: '60s' },
    when: ['after', 'before'],
    steps: [
      { kind: 'text',
        kicker: { it: 'Sintonizzati', en: 'Tune in' },
        title: { it: 'Scegli un muscolo', en: 'Pick a muscle' },
        body: { it: 'Pensa a un muscolo che ha lavorato oggi — gambe, spalle, schiena. Confrontiamo il tuo sinistro e il tuo destro.', en: 'Think of a muscle that worked today — legs, shoulders, back. We\'ll compare your left and right.' } },
      { kind: 'pick', store: 'guess', row: true,
        kicker: { it: 'Passo 1 · Indovina', en: 'Step 1 · Guess' },
        title: { it: 'Quale lato è più teso?', en: 'Which side is tighter?' },
        body: { it: 'Predici prima di controllare.', en: 'Predict before you test it.' },
        options: [
          { emoji: '👈', label: { it: 'Sinistro', en: 'Left' }, value: 'left' },
          { emoji: '⚖️', label: { it: 'Uguale', en: 'Same' }, value: 'same' },
          { emoji: '👉', label: { it: 'Destro', en: 'Right' }, value: 'right' },
        ] },
      { kind: 'text',
        kicker: { it: 'Passo 2 · Controlla', en: 'Step 2 · Check' },
        title: { it: 'Ora provalo', en: 'Now test it' },
        body: { it: 'Allungati lentamente verso i piedi, o fai un affondo leggero su ogni lato. Senti quale dei due è più teso o limitato.', en: 'Reach slowly toward your toes, or do a gentle lunge on each side. Feel which one is tighter or more restricted.' } },
      { kind: 'pick', store: 'actual', row: true,
        kicker: { it: 'Passo 2 · Controlla', en: 'Step 2 · Check' },
        title: { it: 'Quale era davvero più teso?', en: 'Which was actually tighter?' },
        options: [
          { emoji: '👈', label: { it: 'Sinistro', en: 'Left' }, value: 'left' },
          { emoji: '⚖️', label: { it: 'Uguale', en: 'Same' }, value: 'same' },
          { emoji: '👉', label: { it: 'Destro', en: 'Right' }, value: 'right' },
        ] },
      { kind: 'reveal',
        kicker: { it: 'Il tuo conto', en: 'Your read' },
        title: { it: 'Com\'è andata?', en: "How'd it go?" } },
    ],
  },

  hunger: {
    id: 'hunger', emoji: '🫙',
    name: { it: 'Fame o sete?', en: 'Hungry or Thirsty?' },
    trains: { it: 'Distinguere i segnali', en: 'Telling apart' },
    dur: { it: '90 sec', en: '90s' },
    when: ['anytime'],
    steps: [
      { kind: 'text',
        kicker: { it: 'Sintonizzati', en: 'Tune in' },
        title: { it: 'Controlla la tua pancia', en: 'Check your middle' },
        body: { it: 'C\'è un segnale nella tua pancia. È vuoto-e-brontola, o secco-con-bocca-appiccicosa? Possono somigliarsi.', en: "There's a signal in your tummy. Is it empty-and-rumbly, or dry-and-sticky-mouth? They can feel alike." } },
      { kind: 'pick', store: 'guess',
        kicker: { it: 'Passo 1 · Indovina', en: 'Step 1 · Guess' },
        title: { it: 'Cos\'è?', en: 'What is it?' },
        options: [
          { emoji: '🍚', label: { it: 'Fame', en: 'Hungry' }, value: 'hungry' },
          { emoji: '💧', label: { it: 'Sete', en: 'Thirsty' }, value: 'thirsty' },
          { emoji: '🤝', label: { it: 'Tutt\'e due', en: 'Both' }, value: 'both' },
          { emoji: '🌱', label: { it: 'Nessuna', en: 'Neither' }, value: 'neither' },
        ] },
      { kind: 'text',
        kicker: { it: 'Passo 2 · Controlla', en: 'Step 2 · Check' },
        title: { it: 'Bevi un sorso e aspetta', en: 'Sip and wait' },
        body: { it: 'Fai qualche sorso lento d\'acqua. Aspetta un momento, e nota — il segnale è cambiato?', en: 'Take a few slow sips of water. Wait a moment, and notice — did the signal change?' } },
      { kind: 'pick', store: 'after', row: true,
        kicker: { it: 'Passo 2 · Controlla', en: 'Step 2 · Check' },
        title: { it: 'Dopo l\'acqua…', en: 'After the water…' },
        options: [
          { emoji: '🔁', label: { it: 'C\'è ancora', en: 'Still there' }, value: 'still' },
          { emoji: '✨', label: { it: 'Si è calmato', en: 'Eased off' }, value: 'eased' },
        ] },
      { kind: 'reflect',
        kicker: { it: 'Bene', en: 'Nice' },
        title: { it: 'Ora lo sai', en: 'Now you know' },
        body: { it: 'Un sorso prima ti dice qual era davvero il segnale — così dai al tuo corpo quello di cui ha davvero bisogno. Tutto qui: leggerti, e poi prenderti cura di te.', en: "A sip first tells you which signal it really was — so you give your body what it actually needs. That's all this is: reading yourself, then looking after yourself." } },
    ],
  },

  feeling: {
    id: 'feeling', emoji: '💗',
    name: { it: 'Una sensazione nel corpo', en: 'Feeling in the Body' },
    trains: { it: 'Dare un nome', en: 'Naming' },
    dur: { it: '60 sec', en: '60s' },
    when: ['anytime'],
    steps: [
      { kind: 'text',
        kicker: { it: 'Sintonizzati', en: 'Tune in' },
        title: { it: 'Dove la senti?', en: 'Where do you feel it?' },
        body: { it: 'C\'è qualcosa che ti gira in testa, o ti senti in un certo modo. Le sensazioni vivono nel corpo — dov\'è questa?', en: "Something's on your mind, or you feel a certain way. Feelings live in the body — where is this one?" } },
      { kind: 'pick', store: 'where',
        kicker: { it: 'Passo 1 · Localizza', en: 'Step 1 · Locate' },
        title: { it: 'Indicala', en: 'Point to it' },
        options: [
          { emoji: '🫀', label: { it: 'Petto', en: 'Chest' }, value: 'chest' },
          { emoji: '🌀', label: { it: 'Pancia', en: 'Tummy' }, value: 'tummy' },
          { emoji: '😮‍💨', label: { it: 'Gola', en: 'Throat' }, value: 'throat' },
          { emoji: '🧍', label: { it: 'Spalle / mascella', en: 'Shoulders / jaw' }, value: 'shoulders' },
          { emoji: '🤷', label: { it: 'Da un\'altra parte', en: 'Somewhere else' }, value: 'else' },
        ] },
      { kind: 'pick', store: 'word',
        kicker: { it: 'Passo 2 · Dalle un nome', en: 'Step 2 · Name' },
        title: { it: 'Mettici una parola', en: 'Put a word on it' },
        body: { it: 'La più precisa che trovi — precisa batte "bene" o "male".', en: "The most precise one you can find — precise beats 'good' or 'bad'." },
        options: [
          { label: { it: 'Tesa', en: 'Tight' }, value: 'tight' },
          { label: { it: 'Pesante', en: 'Heavy' }, value: 'heavy' },
          { label: { it: 'Sfarfallante', en: 'Fluttery' }, value: 'fluttery' },
          { label: { it: 'Calda', en: 'Warm' }, value: 'warm' },
          { label: { it: 'Agitata', en: 'Jittery' }, value: 'jittery' },
          { label: { it: 'Vuota', en: 'Hollow' }, value: 'hollow' },
          { label: { it: 'Leggera', en: 'Light' }, value: 'light' },
          { label: { it: 'Calma', en: 'Calm' }, value: 'calm' },
        ] },
      { kind: 'reflect',
        kicker: { it: 'Bene', en: 'Nice' },
        title: { it: 'Questa è la vera abilità', en: "That's the skill" },
        body: { it: 'Dare un nome a dove sta esattamente una sensazione e a come sembra trasforma un vago "mi sento strana" in qualcosa con cui puoi davvero lavorare. Più parole raccogli, più controllo hai.', en: "Naming exactly where a feeling sits and what it feels like turns a fuzzy 'I feel off' into something you can actually work with. The more words you collect, the more control you get." } },
    ],
  },
}

/** Ordine fisso in griglia — non l'ordine di dichiarazione dell'oggetto, che JS non garantisce fra chiavi non numeriche in modo leggibile a occhio. */
export const EXERCISE_ORDER: ExerciseId[] = ['breath', 'nervous', 'zone', 'twosides', 'hunger', 'feeling']
