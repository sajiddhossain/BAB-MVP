/**
 * Gli stati della home.
 *
 * In Figma sono quattro schermi (home-1..home-4) ma sono la stessa schermata:
 * cambia la tinta della scheda grande, cosa c'e' dentro, e la scheda sotto.
 * Quindi qui c'e' un tipo con quattro valori, non quattro schermi.
 *
 * L'ordine e' quello della giornata: prima si fa il check-in, poi il
 * check-out, poi e' fatto. Il riposo e' un ramo a parte — nei giorni senza
 * allenamento non c'e' niente da indovinare.
 */
export type StatoGiornata = 'checkin' | 'checkout' | 'fatto' | 'riposo'

/**
 * La tinta della scheda grande.
 *
 * Non e' solo lo sfondo: cambiano insieme il colore dell'etichetta in cima e
 * quello del testo sotto al titolo, ed e' per questo che stanno in un oggetto
 * solo invece che sparsi. Ambra quando c'e' qualcosa da fare prima, verde
 * quando la sessione e' andata, viola quando la giornata e' a posto.
 */
export type Tinta = {
  fondo: string
  etichetta: string
  testo: string
  icona: string
}

export const TINTE: Record<StatoGiornata, Tinta> = {
  checkin: {
    fondo: 'linear-gradient(24.36deg, #fff6e4 12.41%, #fdefcf 85.4%)',
    etichetta: 'var(--color-ambra-scuro)',
    testo: '#5b564c',
    icona: 'ambra',
  },
  checkout: {
    fondo: 'linear-gradient(23.74deg, #e5f5f2 12.41%, #d9f1ea 85.4%)',
    etichetta: 'var(--color-verde-scuro)',
    testo: '#524e66',
    icona: 'verde',
  },
  fatto: {
    fondo: 'linear-gradient(24.89deg, #efedfd 12.41%, #e4e1fb 85.4%)',
    etichetta: 'var(--color-viola-scuro)',
    testo: '#524e66',
    icona: 'viola',
  },
  riposo: {
    fondo: 'linear-gradient(33.35deg, #efedfd 12.41%, #e4e1fb 85.4%)',
    etichetta: 'var(--color-viola-scuro)',
    testo: '#524e66',
    icona: 'luna',
  },
}

/** I tre tempi, nell'ordine in cui stanno sulla scheda. */
export const TEMPI = ['carica', 'costante', 'leggero'] as const
export type Tempo = (typeof TEMPI)[number]

/** I campi del check-in del giorno di riposo, nell'ordine del disegno. */
export const CAMPI_RIPOSO = [
  'sonno',
  'energia',
  'scuola',
  'umore',
  'bodymap',
  'ciclo',
  'antidolorifici',
] as const
export type CampoRiposo = (typeof CAMPI_RIPOSO)[number]
