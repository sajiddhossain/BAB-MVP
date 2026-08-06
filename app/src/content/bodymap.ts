import type { Locale } from '@/copy'

/**
 * Regioni della mappa corporea.
 *
 * 🔴 I `code` finiscono nel database (`body_signals.region`) e NON SI CAMBIANO
 * MAI: le etichette cambiano con la lingua e col copy, i dati no. Cambiare un
 * codice significa migrare i dati di tutte le atlete.
 *
 * `junior` marca il sottoinsieme semplificato per la fascia 11–13, richiesto
 * dal §10 del documento madre. Chi ha ≤13 anni vede solo quelle.
 */
export type RegionCode =
  | 'head' | 'neck' | 'shoulders' | 'chest'
  | 'arm_l' | 'arm_r' | 'hand_l' | 'hand_r'
  | 'core' | 'hips'
  | 'quad_l' | 'quad_r' | 'knee_l' | 'knee_r'
  | 'shin_l' | 'shin_r' | 'foot_l' | 'foot_r'
  | 'upper_back' | 'lower_back' | 'glutes'
  | 'ham_l' | 'ham_r' | 'calf_l' | 'calf_r'
  | 'ankle_l' | 'ankle_r'
  | 'all_over' | 'other'

export type Region = {
  code: RegionCode
  side: 'front' | 'back' | 'both' | 'none'
  /** Nel sottoinsieme semplificato per 11–13 anni (§10). */
  junior: boolean
  label: Record<Locale, string>
}

export const REGIONS: Region[] = [
  { code: 'head',       side: 'both',  junior: true,  label: { it: 'Testa',              en: 'Head' } },
  { code: 'neck',       side: 'both',  junior: true,  label: { it: 'Collo',              en: 'Neck' } },
  { code: 'shoulders',  side: 'both',  junior: true,  label: { it: 'Spalle',             en: 'Shoulders' } },
  { code: 'chest',      side: 'front', junior: true,  label: { it: 'Petto',              en: 'Chest' } },
  { code: 'arm_l',      side: 'both',  junior: false, label: { it: 'Braccio sinistro',   en: 'Left arm' } },
  { code: 'arm_r',      side: 'both',  junior: false, label: { it: 'Braccio destro',     en: 'Right arm' } },
  { code: 'hand_l',     side: 'both',  junior: false, label: { it: 'Mano sinistra',      en: 'Left hand' } },
  { code: 'hand_r',     side: 'both',  junior: false, label: { it: 'Mano destra',        en: 'Right hand' } },
  { code: 'core',       side: 'front', junior: true,  label: { it: 'Pancia',             en: 'Tummy & core' } },
  { code: 'hips',       side: 'front', junior: true,  label: { it: 'Fianchi',            en: 'Hips' } },
  { code: 'quad_l',     side: 'front', junior: false, label: { it: 'Coscia sinistra',    en: 'Left quad' } },
  { code: 'quad_r',     side: 'front', junior: false, label: { it: 'Coscia destra',      en: 'Right quad' } },
  { code: 'knee_l',     side: 'both',  junior: false, label: { it: 'Ginocchio sinistro', en: 'Left knee' } },
  { code: 'knee_r',     side: 'both',  junior: false, label: { it: 'Ginocchio destro',   en: 'Right knee' } },
  { code: 'shin_l',     side: 'front', junior: false, label: { it: 'Stinco sinistro',    en: 'Left shin' } },
  { code: 'shin_r',     side: 'front', junior: false, label: { it: 'Stinco destro',      en: 'Right shin' } },
  { code: 'foot_l',     side: 'front', junior: false, label: { it: 'Piede sinistro',     en: 'Left foot' } },
  { code: 'foot_r',     side: 'front', junior: false, label: { it: 'Piede destro',       en: 'Right foot' } },
  { code: 'upper_back', side: 'back',  junior: true,  label: { it: 'Schiena alta',       en: 'Upper back' } },
  { code: 'lower_back', side: 'back',  junior: true,  label: { it: 'Schiena bassa',      en: 'Lower back' } },
  { code: 'glutes',     side: 'back',  junior: true,  label: { it: 'Sedere',             en: 'Glutes' } },
  { code: 'ham_l',      side: 'back',  junior: false, label: { it: 'Dietro coscia sin.', en: 'Left hamstring' } },
  { code: 'ham_r',      side: 'back',  junior: false, label: { it: 'Dietro coscia des.', en: 'Right hamstring' } },
  { code: 'calf_l',     side: 'back',  junior: false, label: { it: 'Polpaccio sinistro', en: 'Left calf' } },
  { code: 'calf_r',     side: 'back',  junior: false, label: { it: 'Polpaccio destro',   en: 'Right calf' } },
  { code: 'ankle_l',    side: 'back',  junior: false, label: { it: 'Caviglia sinistra',  en: 'Left heel & ankle' } },
  { code: 'ankle_r',    side: 'back',  junior: false, label: { it: 'Caviglia destra',    en: 'Right heel & ankle' } },
  { code: 'all_over',   side: 'none',  junior: true,  label: { it: 'Dappertutto',        en: 'All over' } },
  { code: 'other',      side: 'none',  junior: true,  label: { it: 'Da un\'altra parte', en: 'Somewhere else' } },
]

/**
 * Per la fascia 11–13 il §10 chiede regioni più semplici. Le junior sono meno
 * numerose e non distinguono destra/sinistra dove non serve.
 */
export function regionsFor(variant: 'junior' | 'full'): Region[] {
  return variant === 'junior' ? REGIONS.filter((r) => r.junior) : REGIONS
}

export function regionLabel(code: RegionCode, locale: Locale): string {
  return REGIONS.find((r) => r.code === code)?.label[locale] ?? code
}
