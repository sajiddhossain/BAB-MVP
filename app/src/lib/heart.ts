/** Le tre fasce di battito usate dall'esercizio del battito — onboarding e Body-Sense condividono la stessa soglia. */
export type HeartBand = 'slow' | 'medium' | 'fast'

/** Sotto i 75 è lenta, sopra i 95 è veloce. */
export function bandFromBpm(bpm: number): HeartBand {
  if (bpm < 75) return 'slow'
  if (bpm <= 95) return 'medium'
  return 'fast'
}
