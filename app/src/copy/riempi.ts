/**
 * I buchi nelle frasi.
 *
 * Prima le frasi con un pezzo variabile erano funzioni:
 *
 *     saluto: (nome: string) => `Ciao ${nome}`
 *
 * Adesso sono modelli, cioe' stringhe come tutte le altre:
 *
 *     saluto: 'Ciao {nome}'
 *
 * Il motivo non e' l'eleganza, e' che una funzione non si puo' modificare da
 * fuori: chi scrive i testi non puo' toccare codice, e finche' meta' delle
 * frasi erano codice meta' dei testi restava fuori dalla sua portata. Un
 * modello e' una stringa, e una stringa sta in una riga di database.
 *
 * I buchi si scrivono `{nome}`. Un buco che nessuno riempie resta a vista
 * invece di sparire: e' un refuso che si nota, e in una frase su uno schermo
 * "Ciao {nome}" e' molto meglio di "Ciao ".
 */
export function riempi(modello: string, valori: Record<string, string | number>): string {
  return modello.replace(/\{(\w+)\}/g, (intero, chiave: string) =>
    chiave in valori ? String(valori[chiave]) : intero,
  )
}
