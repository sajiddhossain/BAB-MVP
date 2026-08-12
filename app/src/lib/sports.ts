import { listSports, removeSport, saveSports } from './repo'

/**
 * Gli sport che pratica, tenuti allineati a quello che sceglie — in onboarding
 * e dopo, dalle impostazioni. Stesso principio di `agenda.ts: setDays`: si
 * diffa, non si ricrea, perché ogni riga cancellata e reinserita sarebbe due
 * viaggi in coda invece di uno solo su una connessione spesso scarsa.
 */
export async function setSports(athleteId: string, wanted: string[]): Promise<void> {
  const current = await listSports()
  const want = new Set(wanted)
  const have = new Set(current.map((r) => r.sport))

  for (const r of current) if (!want.has(r.sport)) await removeSport(r.id)

  const added = wanted.filter((s) => !have.has(s))
  if (added.length) await saveSports(athleteId, added)
}
