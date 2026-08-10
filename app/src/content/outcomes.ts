import type { Locale } from '@/copy'
import type { TempoCode } from './tempo'

/**
 * La card "Impara" del check-in post: otto esiti, incrociando andatura
 * dichiarata × sforzo × stato del corpo.
 *
 * 🔴 In NESSUNO degli otto c'è un giudizio negativo, ed è deliberato. I due
 * casi problematici — uno Steady diventato Upbeat, un Gentle diventato lavoro
 * vero — sono formulati come *"vale uno sguardo curioso"* e *"nessun dramma,
 * solo qualcosa da notare"*. È la discriminazione senza il giudizio: quello che
 * il principio 10 chiede per il dolore, applicato al comportamento.
 *
 * Non "migliorare" questi testi senza una ragione: sono la parte più riuscita
 * del materiale originale, e il tono è il prodotto.
 */
export type OutcomeCode =
  | 'upbeat_read' | 'upbeat_cost' | 'upbeat_solid'
  | 'steady_tipped' | 'steady_spare' | 'steady_judged'
  | 'gentle_work' | 'gentle_true'

export type Outcome = {
  code: OutcomeCode
  emoji: string
  title: Record<Locale, string>
  body: Record<Locale, string>
}

export const OUTCOMES: Record<OutcomeCode, Outcome> = {
  upbeat_read: {
    code: 'upbeat_read', emoji: '🎯',
    title: { it: 'Lettura perfetta', en: 'Spot-on read' },
    body: {
      it: 'Ti sei fidata di te per un giorno Upbeat e il tuo corpo l\'ha gestito bene. Fissa come si sente questo — è il tuo riferimento per un buon giorno Upbeat con recupero.',
      en: "You backed yourself for an Upbeat day and your body handled it well. Lock in how this feels — it's your reference for a good, recovered Upbeat day.",
    },
  },
  upbeat_cost: {
    code: 'upbeat_cost', emoji: '🍃',
    title: { it: 'Il tuo corpo ha preso tanto oggi', en: 'Your body took a lot today' },
    body: {
      it: 'Quella sessione Upbeat è costata più del solito — e notare quel divario fra la fatica e come ti senti adesso *è* la lezione. È una spinta ad andare Steady o Gentle domani. Non è andato storto niente: hai solo imparato qualcosa su oggi.',
      en: "That Upbeat session cost more than usual — and noticing that gap between effort and how you feel now *is* the lesson. It's a nudge to go Steady or Gentle tomorrow. Nothing went wrong; you just learned something about today.",
    },
  },
  upbeat_solid: {
    code: 'upbeat_solid', emoji: '⚡',
    title: { it: 'Un giorno Upbeat solido e onesto', en: 'A solid, honest Upbeat day' },
    body: {
      it: 'Hai spinto forte e sei piacevolmente stanca — è esattamente giusto dopo lavoro vero. Questo è il tipo buono di vuoto.',
      en: "You pushed hard and you're pleasantly tired — that's exactly right after real work. This is the good kind of empty.",
    },
  },
  steady_tipped: {
    code: 'steady_tipped', emoji: '👀',
    title: { it: 'Uno Steady che è diventato Upbeat', en: 'Steady that tipped into Upbeat' },
    body: {
      it: 'Avevi chiamato un giorno Steady ma hai finito per spingere forte — e il tuo corpo lo sente. Vale uno sguardo curioso: cosa ti ha fatto andare più forte del previsto? È una cosa utile da notare.',
      en: "You called a Steady day but ended up pushing hard — and your body's feeling it. Worth a curious look: what made you go harder than planned? That's a useful thing to spot.",
    },
  },
  steady_spare: {
    code: 'steady_spare', emoji: '🌤️',
    title: { it: 'Ne avevi ancora nel serbatoio', en: 'Plenty left in the tank' },
    body: {
      it: 'Steady è stato facile e sei ancora fresca — forse oggi avevi di più. Non è un errore: un giorno di qualità non è mai sprecato, e adesso conosci la tua lettura un po\' meglio.',
      en: "Steady felt easy and you're still fresh — you may have had more today. That's not a mistake: a quality day is never wasted, and now you know your read a little better.",
    },
  },
  steady_judged: {
    code: 'steady_judged', emoji: '🎯',
    title: { it: 'Giorno Steady ben calibrato', en: 'Nicely judged Steady day' },
    body: {
      it: 'Sforzo controllato, corpo in buona forma. Questo è allenarsi con abilità — qualità invece che quantità, esattamente come previsto.',
      en: 'Controlled effort, body in good shape. This is skilful training — quality over quantity, exactly as intended.',
    },
  },
  gentle_work: {
    code: 'gentle_work', emoji: '👀',
    title: { it: 'Un Gentle diventato lavoro vero', en: 'Gentle that became real work' },
    body: {
      it: 'Doveva essere gentile, ma è diventato uno sforzo serio. Se il tuo corpo aveva bisogno di riposo, tienici un occhio — il recupero conta solo quando è davvero facile. Nessun dramma, solo qualcosa da notare.',
      en: "This was meant to be gentle, but it turned into a proper effort. If your body needed rest, keep half an eye on that — recovery only counts when it's actually easy. No drama, just something to notice.",
    },
  },
  gentle_true: {
    code: 'gentle_true', emoji: '🍃',
    title: { it: 'Un vero giorno Gentle — ben giocato', en: 'A real Gentle day — well played' },
    body: {
      it: 'Hai tenuto gentile e hai lasciato ricostruire il tuo corpo. È qui che i tuoi giorni duri diventano silenziosamente forza. Sceglierlo richiede più sicurezza che spingere.',
      en: 'You kept it gentle and let your body rebuild. This is where your hard days quietly turn into strength. Choosing this takes more confidence than pushing does.',
    },
  },
}

/**
 * Quale degli otto. Le condizioni sono quelle dei prototipi e, come le soglie
 * dell'andatura, **non sono validate**: stanno qui insieme perché si cambino
 * in un posto solo.
 */
export function pickOutcome(tempo: TempoCode, effort: number, bodyAvg: number): OutcomeCode {
  if (tempo === 'upbeat') {
    if (bodyAvg >= 3.5) return 'upbeat_read'
    if (bodyAvg < 2.5) return 'upbeat_cost'
    return 'upbeat_solid'
  }
  if (tempo === 'steady') {
    if (effort >= 4 && bodyAvg < 3) return 'steady_tipped'
    if (bodyAvg >= 4 && effort <= 2) return 'steady_spare'
    return 'steady_judged'
  }
  return effort >= 4 ? 'gentle_work' : 'gentle_true'
}
