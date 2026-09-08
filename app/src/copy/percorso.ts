/**
 * Le parole del percorso.
 *
 * ── L'INGLESE VIENE DAL DISEGNO, L'ITALIANO ANCHE ──────────────────────────
 * Questa e' la prima parte dell'app disegnata in tutte e due le lingue: i 69
 * frame esistono due volte, una volta in italiano e una in inglese. Quindi
 * qui non c'e' niente di tradotto da noi — c'e' quello che c'e' scritto in
 * Figma, da una parte e dall'altra.
 *
 * ── I NOMI DELLE UNITA' NON DICONO LE PAROLE ───────────────────────────────
 * Sotto a ogni unita' il disegno elenca le sue quattro parole
 * ("forte • leggero / indolenzito • affaticato"). Quelle NON stanno qui: si
 * costruiscono dalle sedici parole che l'app ha gia', cosi' cambiandone una
 * cambia in tutti e due i posti invece che in uno solo.
 */

const it = {
  occhiello: 'BODY LANGUAGE',
  titolo: '16 parole per descrivere cosa senti.',
  intro: 'Ogni parola sbloccata si aggiunge al tuo check-in quotidiano. 8 lezioni da 3 minuti.',

  progresso: {
    etichetta: 'IL TUO PROGRESSO',
    /* `{fatte}` e `{tutte}` li mette l'app: non si scrivono a mano */
    conteggio: '{fatte} / {tutte} sbloccate',
  },

  regola: {
    titolo: 'La regola dei 3 segnali corporei',
    sotto: 'Scopri come classificare quello che provi',
  },

  unita: {
    1: 'Unità 1: Funziona',
    2: 'Unità 2: Resiste',
    3: 'Unità 3: Ti avvisa',
    4: 'Unità 4: È un allarme',
  },

  azione: 'Vai al vocabolario',
  nav: { percorso: 'Percorso', parole: 'Mie Parole' },
}

const en: typeof it = {
  occhiello: 'BODY LANGUAGE',
  titolo: '16 words for what you feel.',
  intro:
    'Every word you learn unlocks in your check-in. 8 lessons. Two words each. About three minutes a go.',

  progresso: {
    etichetta: 'words unlocked',
    conteggio: '{fatte} / {tutte}',
  },

  regola: {
    titolo: 'The only rule you memorise',
    sotto: 'Fades · Nags · Flags — two minutes',
  },

  unita: {
    1: "Unit 1: It's working",
    2: "Unit 2: It's holding on",
    3: "Unit 3: It's warning you",
    4: "Unit 4: It's an alarm",
  },

  azione: 'Go to vocabulary',
  nav: { percorso: 'Path', parole: 'My words' },
}

export const TESTI_PERCORSO = { it, en }
export type TestiPercorso = typeof it
