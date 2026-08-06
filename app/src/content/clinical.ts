import type { Locale } from '@/copy'

/**
 * TESTI CLINICI — registro di revisione.
 *
 * R6: la firma di un medico dello sport **non è un blocco di rilascio per
 * l'MVP**, perché si passa dalle squadre. Questo file non ferma più la
 * spedizione; tiene traccia di chi ha guardato cosa.
 *
 * Resta separato dal resto del copy, e la ragione non è cambiata: questi testi
 * li legge una tredicenne che ha male, e sono gli unici che possono farle fare
 * la cosa sbagliata. Sapere quali sono stati rivisti e da chi vale comunque.
 *
 * ⚠️ Una TRADUZIONE di un testo rivisto non è il testo rivisto. Le due lingue
 * hanno stato separato apposta: R9 dice che si spedisce in italiano e inglese.
 */
export type ReviewState = {
  reviewedBy: string | null
  reviewedAt: string | null
  locales: Locale[]
}

export const CLINICAL_REVIEW: Record<string, ReviewState> = {
  /** Lessico e mappatura sensazione → categoria clinica. */
  sensations: {
    reviewedBy: 'Tristin Agtarap',
    reviewedAt: null,       // incontro fatto, testo non ancora ripassato riga per riga
    locales: [],
  },
  /** Care mode, bandiere rosse, instradamento. È il testo che agisce. */
  careRouting: { reviewedBy: null, reviewedAt: null, locales: [] },
  /** Dolore che lavora contro dolore protettivo. */
  painDecode:  { reviewedBy: null, reviewedAt: null, locales: [] },
  /** Ciclo e rete di sicurezza RED-S. Seconda advisor, incontro 11 agosto 2026. */
  cycleRedS:   { reviewedBy: null, reviewedAt: null, locales: [] },
}

/** Vero quando ogni area è stata rivista in quella lingua. Informativo, non bloccante. */
export function fullyReviewed(locale: Locale): boolean {
  return Object.values(CLINICAL_REVIEW).every((r) => r.locales.includes(locale))
}

/**
 * Care mode. Deliberatamente CALMO: il §10 vieta i punteggi nocebo e chiede uno
 * spazio neutro a bassa attivazione. Un'adolescente allarmata segnala MENO, non
 * di più — e il sotto-riporto è già il rischio numero uno (Temm).
 */
export const CARE = {
  title: { it: '🛡️ Care mode — proteggila prima di tutto', en: '🛡️ Care mode — protect it first' },

  /** Quando ha risposto "sì" alla domanda sul dolore protettivo. */
  openerSelfReported: {
    it: 'Hai segnalato dolore protettivo — bella presa. Qualunque tempo mostrino gli altri canali, quella parte del corpo va in Care oggi. Non è essere molli; è come i pro proteggono una carriera lunga.',
    en: "You flagged protective pain — smart catch. Whatever tempo your other channels show, that body part goes into Care today. This isn't being soft; it's how pros protect a long career.",
  },

  /** Quando è una bandiera rossa dal lessico: l'app la nomina al posto suo. */
  openerRedFlag: {
    it: 'Hai detto **{what}** al {where} — è il tipo di segnale che si fa guardare invece di attraversare. Bella presa. Quella parte va in Care oggi.',
    en: "You named **{what}** in your {where} — that's the kind of signal that gets looked at rather than trained through. Good catch. That body part goes into Care today.",
  },

  steps: {
    it: [
      'Non caricarci sopra. Smetti di fare ciò che fa male.',
      'Solo movimento gentile e **senza dolore** — altrimenti riposa quell\'area.',
      'Dillo al tuo coach e a un genitore **{when}**.',
      'Se fa male di notte, ti fa zoppicare, o non migliora in un paio di giorni, vedi un fisioterapista o un medico. Le tue ossa stanno ancora crescendo, quindi il dolore articolare e osseo si fa controllare, mai si supera a forza.',
    ],
    en: [
      "Don't load through it. Stop what makes it hurt.",
      'Gentle, **pain-free** movement only — otherwise rest that area.',
      'Tell your coach and a parent **{when}**.',
      "If it hurts at night, makes you limp, or isn't better in a couple of days, see a physio or doctor. Your bones are still growing, so joint and bone pain gets checked, never pushed through.",
    ],
  },

  whenUrgent: { it: 'adesso', en: 'right now' },
  whenToday: { it: 'oggi', en: 'today' },

  /** "Costruito per essere detto ad alta voce" (principio 9), reso azione. */
  borrowWords: {
    it: 'Parole da prendere in prestito: *«Ho {what} al {where} — devo fermarmi e farlo vedere.»*',
    en: 'Words you can borrow: *"I\'ve got {what} in my {where} — I need to stop and get it looked at."*',
  },
} satisfies Record<string, unknown>

/**
 * Il blocco educativo che PRECEDE sempre la domanda sul dolore: si insegna la
 * distinzione, poi si chiede (§10, "il dolore con sfumature").
 */
export const DECODE_ACHE = {
  workingTitle: { it: '✅ Dolore che lavora, e quotidiano', en: '✅ Working & everyday ache' },
  protectiveTitle: { it: '🛡️ Dolore protettivo', en: '🛡️ Protective pain' },
  working: {
    it: [
      'Il **bruciore** dei muscoli che lavorano forte, e il fiatone',
      'Muscoli che si sentono **tesi o rigidi**',
      'Indolenzimento abbastanza **uguale su entrambi i lati**',
      'Un dolore che **passa mentre ti scaldi**',
      'Dolori sordi che vanno e vengono — **pancia o schiena bassa crampose, o una sensazione di gonfiore e pesantezza**',
    ],
    en: [
      'The **burn** of muscles working hard, and heavy breathing',
      'Muscles feeling **tight or stiff**',
      "Soreness that's fairly **even on both sides**",
      'An ache that **eases as you warm up**',
      'Dull, come-and-go aches — a **crampy tummy or lower back, or a heavy, bloated feeling**',
    ],
  },
  protective: {
    it: [
      '**Acuto, che punge, improvviso**',
      '**Dentro un\'articolazione o un osso**',
      'Solo su **un lato**, o che ti fa zoppicare',
      '**Peggiora** mentre vai avanti, o **fa male di notte**',
    ],
    en: [
      '**Sharp, stabbing or sudden**',
      '**Inside a joint or a bone**',
      'On **one side only**, or makes you limp',
      '**Gets worse** as you go, or **hurts at night**',
    ],
  },
  /** La miglior riga di sicurezza del materiale: risolve il dubbio senza ansia. */
  tell: {
    it: '**Il segnale:** i dolori che lavorano passano scaldandosi e si sistemano in un giorno o due. Il dolore protettivo resta, si acuisce, o cambia come ti muovi. **Quando non sei sicura, chiamalo protettivo.**',
    en: "**The tell:** working and everyday aches ease as you warm up and settle within a day or two. Protective pain sticks, sharpens, or changes how you move. **When you're not sure, call it protective.**",
  },
  question: {
    it: 'Senti qualcosa del tipo 🛡️ protettivo oggi?',
    en: 'Feeling any of the 🛡️ protective kind today?',
  },
}

export function clinicalText<T extends Record<Locale, string>>(node: T, locale: Locale): string {
  return node[locale]
}
