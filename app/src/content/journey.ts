import type { Locale } from '@/copy'

/**
 * Il Percorso — Mesi 1 e 2, le sole 8 settimane richieste dal pilota
 * (`docs/05-roadmap/03-piano-3-settimane.md`). Il contenuto viene da
 * `docs/02-prodotto/04-journey-16-settimane.md`, già tradotto, con
 * un'eccezione:
 *
 * 🔴 Settimana 8 nella fonte parlava di fame e appetito — il §3 del
 * documento sorgente vieta esplicitamente questi temi, e la fonte stessa lo
 * segnalava come "da decidere con la founder + firma clinica". Qui è
 * riscritta sul suggerimento già scritto lì: si parla di energia, mai di
 * cibo o quantità. Va comunque rivista da chi deve firmarla.
 */

/** Come si calcola se la missione della settimana è andata: cosa contare, e quanto. */
export type MissionMetric = 'checkin' | 'body' | 'predicted' | 'schoolload'

export type JourneyWeek = {
  week: number
  month: 1 | 2
  title: Record<Locale, string>
  subtitle: Record<Locale, string>
  body: Record<Locale, string>
  mission: Record<Locale, string>
  missionMetric: MissionMetric
  missionGoal: number
  howBabHelps: Record<Locale, string>
  reflect: Record<Locale, string>
}

export const MONTHS: Record<1 | 2, { emoji: string; name: Record<Locale, string> }> = {
  1: { emoji: '👀', name: { it: 'Riconosci', en: 'Recognise' } },
  2: { emoji: '🧩', name: { it: 'Capisci', en: 'Understand' } },
}

export const WEEKS: JourneyWeek[] = [
  {
    week: 1, month: 1,
    title: { it: 'Conosci i tuoi segnali', en: 'Meet your signals' },
    subtitle: { it: 'Sintonizzati ogni giorno — niente da cambiare ancora.', en: 'Just tune in each day — no changing anything yet.' },
    body: {
      it: 'Fai un Tune-In quotidiano. Conosci i tuoi canali — sonno, energia, umore. L\'obiettivo di questa settimana non è sentirti bene, è solo sentire, onestamente.',
      en: "Do a daily Tune-In. Get to know your channels — sleep, energy, mood. The goal this week isn't to feel good, it's just to feel, honestly.",
    },
    mission: { it: 'Check-in in 5 giorni questa settimana. Non giudicare le risposte — solo notale.', en: "Check in on 5 days this week. Don't judge the answers — just notice them." },
    missionMetric: 'checkin', missionGoal: 5,
    howBabHelps: { it: 'BAB ti dà le parole e la mappa corporea, così "mi sento strana" diventa qualcosa di specifico.', en: "BAB gives you the words and the body map, so 'I feel off' becomes something specific." },
    reflect: { it: 'Quale segnale è stato più facile da sentire? Quale il più difficile da mettere in parole?', en: 'Which signal was easiest to feel? Which was hardest to put into words?' },
  },
  {
    week: 2, month: 1,
    title: { it: 'Nominalo, collocalo', en: 'Name it, place it' },
    subtitle: { it: 'Dai a ogni sensazione una parola e un posto nel corpo.', en: 'Give each sensation a word and a spot in your body.' },
    body: {
      it: 'Dopo l\'allenamento, usa la mappa corporea: tocca dove senti qualcosa e dagli un nome. Nominare e localizzare una sensazione è il cuore di tutta la competenza.',
      en: 'After training, use the body map: tap where you feel something and give it a name. Naming and locating a feeling is the heart of the whole skill.',
    },
    mission: { it: 'Ogni sessione questa settimana, nomina una sensazione e trova esattamente dove vive.', en: 'Every session this week, name one sensation and find exactly where it lives.' },
    missionMetric: 'body', missionGoal: 3,
    howBabHelps: { it: 'La mappa corporea e le parole-sensazione di BAB trasformano una nebbia vaga in segnali chiari e nominabili.', en: "BAB's body map and feeling-words turn a vague fog into clear, nameable signals." },
    reflect: { it: 'Mettere una parola su una sensazione ha cambiato quanto la sentivi forte?', en: 'Did putting a word to a feeling change how strong it felt?' },
  },
  {
    week: 3, month: 1,
    title: { it: 'Una batteria, due consumi', en: 'One battery, two drains' },
    subtitle: { it: 'Nota come scuola e vita si fanno sentire nel corpo.', en: 'Notice how school and life show up in your body.' },
    body: {
      it: 'Il tuo cervello e il tuo corpo funzionano con la stessa batteria. Una giornata stressante a scuola può lasciarti piatta all\'allenamento anche dopo aver dormito bene. Inizia a notare dove lo stress si manifesta fisicamente.',
      en: 'Your brain and body run off the same battery. A stressful day at school can leave you flat at training even after good sleep. Start noticing where stress shows up physically.',
    },
    mission: { it: 'In un giorno pieno o stressante, sintonizzati e guarda cosa sta facendo il tuo corpo.', en: 'On one busy or stressful day, tune in and see what your body is doing.' },
    missionMetric: 'schoolload', missionGoal: 1,
    howBabHelps: { it: 'Il check Headspace di BAB collega come si sente la tua mente a come legge il tuo corpo.', en: "BAB's Headspace check links how your mind feels to how your body reads." },
    reflect: { it: 'Dove sembra vivere lo stress nel tuo corpo — spalle, pancia, mandibola, altrove?', en: 'Where does stress seem to live in your body — shoulders, tummy, jaw, somewhere else?' },
  },
  {
    week: 4, month: 1,
    title: { it: 'Conosci il tuo ritmo', en: 'Meet your rhythm' },
    subtitle: { it: 'Vedi in che fase sei — e cosa può portare.', en: "See which phase you're in — and what it can bring." },
    body: {
      it: 'Il tuo ciclo scorre sotto dal giorno in cui hai configurato BAB. Questa settimana impari a vederlo: conosci le quattro fasi, nota in quale sei adesso, e inizia a leggere il tuo ciclo come lo sfondo sotto tutti gli altri segnali.',
      en: "Your cycle has been running underneath since the day you set up BAB. This week you learn to see it: meet the four phases, notice which one you're in now, and start reading your cycle as the backdrop under every other signal.",
    },
    mission: { it: 'Ogni giorno questa settimana, controlla in quale fase sei e nota come si sentono energia, umore e focus in quella fase.', en: 'Each day this week, check which phase you\'re in and notice how your energy, mood and focus feel in it.' },
    missionMetric: 'checkin', missionGoal: 5,
    howBabHelps: { it: 'BAB trasforma le date che hai inserito nella tua mappa personale delle fasi — così i tuoi segnali iniziano ad avere senso rispetto al tuo ritmo.', en: 'BAB turns the dates you set up into your own phase map — so your signals start to make sense against your rhythm.' },
    reflect: { it: 'Check-in di fine Mese 1: cosa hai imparato su di te — e c\'è qualcosa della tua fase attuale che ti ha sorpresa?', en: 'Month-1 check-in: what did you learn about yourself — and did anything about your current phase surprise you?' },
  },
  {
    week: 5, month: 2,
    title: { it: 'Prevedi, poi verifica', en: 'Predict, then check' },
    subtitle: { it: 'Indovina la tua andatura prima di sintonizzarti.', en: 'Guess your tempo before you tune in.' },
    body: {
      it: 'Ogni mattina, indovina la tua andatura — Upbeat, Steady o Gentle — prima di controllare. Poi sintonizzati e confronta. Le sorprese sono dove la tua lettura interiore si affila.',
      en: 'Each morning, guess your tempo — Upbeat, Steady or Gentle — before you check. Then tune in and compare. The surprises are where your inner read gets sharp.',
    },
    mission: { it: 'Prevedi la tua andatura ogni giorno, e nota ogni volta che il tuo corpo ti sorprende.', en: 'Predict your tempo every day, and notice each time your body surprises you.' },
    missionMetric: 'predicted', missionGoal: 5,
    howBabHelps: { it: 'Il loop Predict → Compare di BAB trasforma ogni giorno in una ripetizione per il tuo senso interiore.', en: "BAB's Predict → Compare loop turns every day into a rep for your inner sense." },
    reflect: { it: 'Le tue previsioni si stanno avvicinando a quello che dice davvero il tuo corpo?', en: "Are your guesses getting closer to what your body actually says?" },
  },
  {
    week: 6, month: 2,
    title: { it: 'Cosa c\'è nel mix?', en: "What's in the mix?" },
    subtitle: { it: 'Rifletti su cosa può aver dato forma a un segnale — raramente è una cosa sola.', en: "Reflect on what might be shaping a signal — it's rarely one thing." },
    body: {
      it: 'Un segnale alto o basso non è quasi mai causato da una cosa sola — è un mix: sonno, cibo, una partita dura, una giornata pesante a scuola, dove sei nel tuo ciclo. Invece di saltare a "X ha causato Y", rifletti su tutto quello che potrebbe essere in gioco.',
      en: 'A high or low signal is almost never caused by just one thing — it\'s a mix: sleep, food, a hard match, a heavy school day, where you are in your cycle. Instead of jumping to "X caused Y", reflect on everything that might be in play.',
    },
    mission: { it: 'Per un segnale basso (o ottimo) questa settimana, annota alcune cose che potrebbero averlo influenzato — resisti alla tentazione di fermarti a una sola.', en: 'For one low (or great) signal this week, jot down a few things that might have shaped it — resist settling on just one.' },
    missionMetric: 'body', missionGoal: 1,
    howBabHelps: { it: 'BAB individua possibili pattern nelle tue settimane e te li mostra — poi chiede: "ti sembra giusto?" Tu resti l\'esperta di te.', en: 'BAB spots possible patterns across your weeks and shows them to you — then asks, "does this feel right?" You stay the expert on you.' },
    reflect: { it: 'Quale dei pattern suggeriti da BAB ti è sembrato vero — e quale non corrispondeva a quello che noti in te?', en: "Which of BAB's suggested patterns felt true to you — and which didn't match what you notice in yourself?" },
  },
  {
    week: 7, month: 2,
    title: { it: 'Leggere il tuo ciclo', en: 'Reading your cycle' },
    subtitle: { it: 'Guarda come si muovono i tuoi segnali lungo le tue fasi.', en: 'See how your signals move across your phases.' },
    body: {
      it: 'Apri la vista Patterns e guarda energia, umore e focus lungo il tuo ciclo. Ricorda: alla tua età i cicli sono irregolari, quindi queste sono tendenze gentili, non regole.',
      en: 'Open your Patterns view and look at energy, mood and focus across your cycle. Remember: at your age cycles are irregular, so these are gentle tendencies, not rules.',
    },
    mission: { it: 'Trova un segnale che sembra spostarsi col tuo ciclo, e scrivilo.', en: 'Find one signal that seems to shift with your cycle, and write it down.' },
    missionMetric: 'body', missionGoal: 1,
    howBabHelps: { it: 'BAB sovrappone i tuoi segnali alle fasi del ciclo, così il pattern diventa visibile.', en: 'BAB overlays your signals on your cycle phases, so the pattern becomes visible.' },
    reflect: { it: 'Qual è il primo pattern ciclico che hai notato in te?', en: "What's the first cycle pattern you spotted in yourself?" },
  },
  {
    week: 8, month: 2,
    // 🔴 Riscritta: niente cibo/appetito, solo energia — vedi nota in cima al file.
    title: { it: 'Ascolta la tua energia', en: 'Listen to your energy' },
    subtitle: { it: 'Dai al tuo corpo quello che ti chiede per avere energia.', en: 'Give your body what it asks for to feel energised.' },
    body: {
      it: 'Il tuo corpo manda segnali su cosa gli serve per avere energia — riposo, ritmo, recupero. Questa settimana è notare cosa ti sta chiedendo, e darglielo, invece di ignorarlo.',
      en: "Your body sends signals about what it needs for energy — rest, rhythm, recovery. This week is about noticing what it's asking for, and giving it, instead of ignoring it.",
    },
    mission: { it: 'Nota cosa ti chiede il tuo corpo ogni giorno, e dagli quello che serve per sentirti energica e concentrata.', en: 'Notice what your body is asking for each day, and give it what it needs to feel energised and focused.' },
    missionMetric: 'checkin', missionGoal: 5,
    howBabHelps: { it: 'BAB ti aiuta a leggere la tua energia onestamente, così puoi notare quando il tuo corpo chiede di essere ascoltato.', en: 'BAB helps you read your energy honestly, so you can notice when your body is asking to be listened to.' },
    reflect: { it: 'Check-in di metà percorso: quali segnali stai iniziando a individuare e capire, che prima ti sfuggivano?', en: 'Mid-journey check-in: which signals are you starting to spot and understand that you used to miss?' },
  },
]
