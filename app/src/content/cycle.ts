import type { Locale } from '@/copy'

/**
 * Le quattro fasi.
 *
 * 🔴 Il ciclo è CONTESTO, mai un normalizzatore di precisione (§4.4): nei primi
 * anni dopo il menarca è troppo irregolare. Di conseguenza:
 *   - le fasi si DERIVANO dalle date, non si salvano nel database
 *   - i confini si riscalano sulla lunghezza media della singola atleta
 *   - non esistono conti alla rovescia né previsioni, in nessun punto dell'app
 *
 * 🔴 Il testo delle fasi va firmato da un medico dello sport.
 */
export type PhaseCode = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export type Phase = {
  code: PhaseCode
  emoji: string
  cssVar: string
  /** Confini su un ciclo di riferimento di 29 giorni; si riscalano sul suo. */
  from: number
  to: number
  name: Record<Locale, string>
  text: Record<Locale, string>
}

export const PHASES: Record<PhaseCode, Phase> = {
  menstrual: {
    code: 'menstrual', emoji: '🩸', cssVar: '--phase-menstrual', from: 0, to: 5,
    name: { it: 'Mestruale', en: 'Menstrual' },
    text: {
      it: 'I giorni di sanguinamento. L\'energia spesso cala e potresti aver voglia di andarci più piano — va benissimo. Perdi un po\' di ferro adesso, quindi i cibi ricchi di ferro (carne, fagioli, lenticchie, verdure a foglia) aiutano.',
      en: "Your bleeding days. Energy often dips and you might feel like taking it easier — that's okay. You lose a little iron now, so iron-rich food (meat, beans, lentils, leafy greens) helps.",
    },
  },
  follicular: {
    code: 'follicular', emoji: '🌱', cssVar: '--phase-follicular', from: 5, to: 12,
    name: { it: 'Follicolare', en: 'Follicular' },
    text: {
      it: 'Energia e umore di solito salgono mentre il corpo riparte. Potresti sentirti forte, fresca e con voglia di spingere — una bella finestra, se i tuoi canali sono d\'accordo.',
      en: 'Energy and mood usually climb as your body gears back up. You may feel strong, fresh and up for pushing — a lovely window, if your channels agree.',
    },
  },
  ovulation: {
    code: 'ovulation', emoji: '☀️', cssVar: '--phase-ovulation', from: 12, to: 16,
    name: { it: 'Ovulazione', en: 'Ovulation' },
    text: {
      it: 'Spesso il tuo picco: energia, forza e sicurezza al massimo. Goditela, e scaldati bene.',
      en: 'Often your peak: your highest energy, strength and confidence. Enjoy it, and warm up well.',
    },
  },
  luteal: {
    code: 'luteal', emoji: '🌙', cssVar: '--phase-luteal', from: 16, to: 29,
    name: { it: 'Luteale', en: 'Luteal' },
    text: {
      it: 'L\'energia può calare e arrivano le voglie luteali — hai più fame perché il tuo metabolismo accelera, quindi il tuo corpo ha davvero bisogno di più carburante. Anche l\'umore può cambiare. Nutrilo, riposa un po\' di più, e sii gentile con te stessa.',
      en: 'Energy can ease off and the luteal munchies arrive — you feel hungrier because your metabolism ticks up, so your body genuinely needs more fuel. Your mood can shift too. Feed it, rest a little more, and be kind to yourself.',
    },
  },
}

export const PHASE_ORDER: PhaseCode[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

const REFERENCE_CYCLE = 29

export type CycleRead = {
  cycleDay: number
  length: number
  spread: number | null
  /** Quanto ci si può fidare: guida la larghezza della sfumatura in UI. */
  confidence: 'one' | 'variable' | 'ok'
  /** Oltre una lunghezza intera senza una data nuova, si smette di indovinare. */
  stale: boolean
  phase: PhaseCode
  nDates: number
}

/** Derivazione delle fasi dalle date. Nessuna previsione, mai. */
export function readCycle(isoDates: string[], today: Date): CycleRead | null {
  if (isoDates.length === 0) return null
  const starts = [...isoDates].sort().map((d) => new Date(`${d}T00:00:00`))
  const last = starts[starts.length - 1]

  const gaps: number[] = []
  for (let i = 1; i < starts.length; i++) {
    gaps.push(Math.round((+starts[i] - +starts[i - 1]) / 864e5))
  }
  const length = gaps.length
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : 28
  const spread = gaps.length > 1 ? Math.max(...gaps) - Math.min(...gaps) : null

  const elapsed = Math.floor((+today - +last) / 864e5)
  const stale = elapsed >= length + 7
  const cycleDay = ((elapsed % length) + length) % length

  const confidence: CycleRead['confidence'] =
    starts.length === 1 ? 'one' : spread !== null && spread > 5 ? 'variable' : 'ok'

  return { cycleDay, length, spread, confidence, stale, nDates: starts.length,
           phase: phaseForDay(cycleDay, length) }
}

export function phaseForDay(cycleDay: number, length: number): PhaseCode {
  const scale = length / REFERENCE_CYCLE
  for (const code of PHASE_ORDER) {
    const p = PHASES[code]
    if (cycleDay >= p.from * scale && cycleDay < p.to * scale) return code
  }
  return 'luteal'
}

/** Più bassa la confidenza, più larga la sfumatura fra le fasi. */
export function featherPercent(confidence: CycleRead['confidence']): number {
  return confidence === 'ok' ? 5 : confidence === 'variable' ? 11 : 14
}
