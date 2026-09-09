/**
 * Il tutorial che viene subito dopo l'onboarding.
 *
 * Sette schermi: si spiega il giro (indovina → sintonizzati → confronta), poi
 * lo si fa davvero una volta sola, sul battito. Indovina come le sembra,
 * conta per quindici secondi col dito sul polso, e vede quanto le due cose si
 * somigliano. È la "prima rep" di cui parlano i testi.
 *
 * Qui c'è solo la FORMA: quali schermi, in che ordine, con che icona. Le
 * parole stanno in `copy/tutorial.ts`, come per tutto il resto.
 *
 * ── PERCHÉ NON È DENTRO A `data/onboarding.ts` ─────────────────────────────
 * Perché il profilo si salva alla fine dell'onboarding, cioè prima di qui, e
 * da quel momento la guardia sa che le domande hanno avuto risposta. Tenendo
 * il tutorial nello stesso motore, la stessa regola che porta a casa chi
 * rientra porterebbe a casa anche chi il tutorial non l'ha ancora visto.
 * Sono due tappe con due condizioni diverse, e hanno due indirizzi diversi.
 */
export type Passo = {
  id: string
  /** l'icona accanto all'occhiello, da `assets/tutorial/` */
  segno: string
  /** i due node-id di Figma, uno per lingua */
  nodo: { it: string; en: string }
}

/*
 * L'ordine non è quello dei frame sulla tela di Figma.
 *
 * Lì `training-overview` sta dopo `21-wrap`, ma il bottone di wrap dice «Fai
 * il mio primo check-in» — e mandarlo su un'altra spiegazione sarebbe una
 * promessa non mantenuta. I ritmi vengono prima, e wrap resta l'ultimo
 * schermo perché è l'unico il cui bottone porta davvero a fare qualcosa.
 */
export const PASSI: Passo[] = [
  { id: 'come-funziona', segno: 'razzo', nodo: { it: '3772:338', en: '3958:323' } },
  { id: 'prima-rep', segno: 'battito', nodo: { it: '3772:361', en: '3958:364' } },
  { id: 'indovina', segno: 'bersaglio', nodo: { it: '3908:2', en: '3958:381' } },
  { id: 'conta', segno: 'battito', nodo: { it: '3908:33', en: '3958:412' } },
  { id: 'confronto', segno: 'battito', nodo: { it: '3889:363', en: '3958:432' } },
  { id: 'ritmi', segno: 'razzo', nodo: { it: '3950:2', en: '3958:242' } },
  { id: 'andiamo', segno: 'razzo', nodo: { it: '3909:31', en: '3958:206' } },
]

export const CHIAVI = PASSI.map((p) => p.id)

/** Le tre bande in cui può cadere un battito, e come le chiama lei. */
export type Banda = 'lento' | 'medio' | 'veloce'

export const BANDE: Banda[] = ['lento', 'medio', 'veloce']

/**
 * In che banda cade un battito.
 *
 * Le soglie sono larghe apposta. A riposo, da seduta, quasi tutte finiscono
 * in «medio»: è la banda che perdona, ed è quella giusta da premiare il primo
 * giorno — il tutorial insegna a fermarsi ad ascoltare, non a indovinare un
 * numero. Chi ne sa più di noi le può cambiare qui, in una riga sola.
 *
 * Non è una soglia clinica e non decide niente sulla salute di nessuna: serve
 * solo a dire «la tua sensazione e il tuo conteggio si somigliano».
 */
export function bandaDi(bpm: number): Banda {
  if (bpm < 70) return 'lento'
  if (bpm < 90) return 'medio'
  return 'veloce'
}

/**
 * Quanto si conta, e per quanto.
 *
 * Quindici secondi e non sessanta: un minuto col dito sul polso a contare è
 * lungo abbastanza da far perdere il filo, e il disegno infatti ne chiede
 * quindici. Il ×4 è quello che li rende battiti al minuto.
 */
export const SECONDI = 15
export const MOLTIPLICATORE = 60 / SECONDI

/** Un conteggio che non è un dito che tocca a caso, né uno che si è distratta. */
export function battitoValido(bpm: number): boolean {
  return bpm >= 30 && bpm <= 220
}
