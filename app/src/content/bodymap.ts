import type { Locale } from '@/copy'

/**
 * Regioni della mappa corporea.
 *
 * 🔴 I `code` finiscono nel database (`body_signals.region`) e NON SI CAMBIANO
 * MAI: le etichette cambiano con la lingua e col copy, i dati no. Cambiare un
 * codice significa migrare i dati di tutte le atlete — e R10 dice che i dati
 * delle prime settimane non si perdono.
 *
 * R4: **una sola mappa, per tutte.** Si costruisce pensando alle 12–14enni, ma
 * il prodotto è usabile da ogni ragazza dai 12 anni in su, incluse le atlete
 * adulte a cui va fatto provare. Il sottoinsieme "junior" per la fascia 11–13
 * è stato tolto: una mappa diversa per fascia d'età avrebbe reso i dati non
 * confrontabili nel tempo, proprio mentre l'atleta cresce e cambia fascia.
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
  label: Record<Locale, string>
}

export const REGIONS: Region[] = [
  { code: 'head',       side: 'both',  label: { it: 'Testa',              en: 'Head' } },
  { code: 'neck',       side: 'both',  label: { it: 'Collo',              en: 'Neck' } },
  { code: 'shoulders',  side: 'both',  label: { it: 'Spalle',             en: 'Shoulders' } },
  { code: 'chest',      side: 'front', label: { it: 'Petto',              en: 'Chest' } },
  { code: 'arm_l',      side: 'both',  label: { it: 'Braccio sinistro',   en: 'Left arm' } },
  { code: 'arm_r',      side: 'both',  label: { it: 'Braccio destro',     en: 'Right arm' } },
  { code: 'hand_l',     side: 'both',  label: { it: 'Mano sinistra',      en: 'Left hand' } },
  { code: 'hand_r',     side: 'both',  label: { it: 'Mano destra',        en: 'Right hand' } },
  { code: 'core',       side: 'front', label: { it: 'Pancia',             en: 'Tummy & core' } },
  { code: 'hips',       side: 'front', label: { it: 'Fianchi',            en: 'Hips' } },
  { code: 'quad_l',     side: 'front', label: { it: 'Coscia sinistra',    en: 'Left quad' } },
  { code: 'quad_r',     side: 'front', label: { it: 'Coscia destra',      en: 'Right quad' } },
  { code: 'knee_l',     side: 'both',  label: { it: 'Ginocchio sinistro', en: 'Left knee' } },
  { code: 'knee_r',     side: 'both',  label: { it: 'Ginocchio destro',   en: 'Right knee' } },
  { code: 'shin_l',     side: 'front', label: { it: 'Stinco sinistro',    en: 'Left shin' } },
  { code: 'shin_r',     side: 'front', label: { it: 'Stinco destro',      en: 'Right shin' } },
  { code: 'foot_l',     side: 'front', label: { it: 'Piede sinistro',     en: 'Left foot' } },
  { code: 'foot_r',     side: 'front', label: { it: 'Piede destro',       en: 'Right foot' } },
  { code: 'upper_back', side: 'back',  label: { it: 'Schiena alta',       en: 'Upper back' } },
  { code: 'lower_back', side: 'back',  label: { it: 'Schiena bassa',      en: 'Lower back' } },
  { code: 'glutes',     side: 'back',  label: { it: 'Sedere',             en: 'Glutes' } },
  { code: 'ham_l',      side: 'back',  label: { it: 'Dietro coscia sin.', en: 'Left hamstring' } },
  { code: 'ham_r',      side: 'back',  label: { it: 'Dietro coscia des.', en: 'Right hamstring' } },
  { code: 'calf_l',     side: 'back',  label: { it: 'Polpaccio sinistro', en: 'Left calf' } },
  { code: 'calf_r',     side: 'back',  label: { it: 'Polpaccio destro',   en: 'Right calf' } },
  // 🔴 «e tallone», non solo «caviglia»: il dolore al tallone da crescita
  // (apofisite calcaneare) è fra gli infortuni più comuni fra gli 8 e i 14 anni.
  // Se l'etichetta non lo nomina, chi ha male al tallone non trova dove dirlo.
  { code: 'ankle_l',    side: 'back',  label: { it: 'Caviglia e tallone sin.', en: 'Left heel & ankle' } },
  { code: 'ankle_r',    side: 'back',  label: { it: 'Caviglia e tallone des.', en: 'Right heel & ankle' } },
  { code: 'all_over',   side: 'none',  label: { it: 'Dappertutto',        en: 'All over' } },
  { code: 'other',      side: 'none',  label: { it: 'Da un\'altra parte', en: 'Somewhere else' } },
]

/** Le regioni di una faccia della mappa, più quelle senza lato. */
export function regionsOn(side: 'front' | 'back'): Region[] {
  return REGIONS.filter((r) => r.side === side || r.side === 'both')
}

export function regionLabel(code: RegionCode, locale: Locale): string {
  return REGIONS.find((r) => r.code === code)?.label[locale] ?? code
}
