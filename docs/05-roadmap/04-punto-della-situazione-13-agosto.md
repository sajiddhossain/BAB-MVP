# Punto della situazione — 13 agosto 2026

> Giorno 9 dei 21 previsti dal [piano a 3 settimane](03-piano-3-settimane.md). Questo
> documento dice cosa c'è oggi, cosa manca, e cosa non dipende da noi.

---

## In una riga

**Settimana 1 e Settimana 2 del piano sono chiuse.** L'app si usa da capo a fondo — accesso,
onboarding, check-in pre e post, mappa del corpo, segnalazione immediata — e buona parte
della Settimana 3 è già dentro, prima del previsto. Il pezzo che manca a livello di
prodotto è piccolo (il Percorso è ancora una schermata vuota). Il rischio vero resta
quello scritto fin dall'inizio: **la firma clinica e il testo legale**, che non dipendono
da quanto in fretta si scrive codice.

---

## Settimana 1 · Fondamenta e memoria — ✅ fatta

- App React + Vite + Tailwind, PWA installabile, 3 tab che navigano
- Supabase collegato: accesso con link via email, tabelle, salvataggio e rilettura
- Offline-first: si scrive sul telefono, si sincronizza dopo — con coda visibile e
  idratazione al primo accesso su un dispositivo nuovo
- Design system della landing, un posto solo (`index.css`)

## Settimana 2 · Il cuore quotidiano — ✅ fatta, e rifatta meglio

- **Onboarding completo**, e più di una volta: dopo la prima versione è stato riscritto
  per un pubblico 12+ (copy più semplice, sport multipli, calendario del ciclo invece di
  una data sola, orario di fine allenamento) e da ieri include un esercizio pratico di
  interocezione (indovina → senti → conta il battito) prima di chiedere qualsiasi dato
- **Check-in pre e post**, completi, una domanda per schermata, salvano davvero
- **Home "Oggi"** con gli stati calcolati sui dati veri
- **Mappa del corpo** e **segnalazione immediata** ("mi sono fatta male"), sempre a un
  tocco, anche durante un check-in

## Settimana 3 · Il contorno — parzialmente in anticipo

| Voce del piano | Stato |
|---|---|
| Percorso, Mesi 1–2 | ⛔ Non iniziato — la schermata esiste ma è vuota |
| Me, stadi 1 e 2 | ✅ Fatto (contatore + prima lettura) |
| Vista "Il mio ritmo" | ✅ Fatto |
| Body-story | ✅ Fatto — un'immagine sola, niente accesso o login |
| Impostazioni (privacy, ritmo, profilo, agenda) | ✅ Fatto, incluso esporta/cancella i dati |
| Dashboard squadra + console admin | ✅ Fatto — non era nemmeno richiesto per il pilota |
| Strumentazione del pilota | ⚠️ Parziale — i tre numeri chiave (secondi reali, suggerito
  vs scelto, domande saltate) si salvano; non ancora verificato che si leggano comodamente |
| Pass di accessibilità | ⚠️ Non fatto un giro dedicato — i target da 44px e i colori ci
  sono per costruzione, ma non è stato ancora verificato punto per punto |

## Oltre il piano originale

Cose che non c'erano nel piano a 3 settimane e sono entrate comunque, perché il momento
sembrava giusto:

- **Body-Sense**: una libreria di 6 mini-esercizi di interocezione (respiro, nervosismo
  pre-gara, trovare la propria zona, due lati, fame/sete, nominare una sensazione),
  raggiungibile in ogni momento da "Oggi" — non solo in onboarding
- Nella mappa del corpo: scala di intensità a 5 livelli (era a 3), spiegazione di ogni
  parola del lessico, frasi suggerite per parlarne con l'allenatore prima di mandare la
  Storia della settimana
- Il flusso di revisione con Figma: leggere e rispondere ai commenti di Gaia da terminale,
  senza passare a mano da un commento all'altro

---

## I due rischi — dove stanno oggi

**1. La firma clinica.** Non è qualcosa che si vede dal codice — va verificato con te se
il percorso di revisione (bandiere rosse, layer del ciclo) è partito e a che punto è.
Resta la cosa che decide se si parte con 20 minorenni alla fine della settimana 3 o dopo.

**2. La lingua.** Decisa da subito: italiano, con l'inglese già pronto in parallelo
(l'architettura i18n non ha mai smesso di reggere tutt'e due).

---

## Cosa manca prima del pilota

- **Percorso** (Mesi 1–2) — l'unico pezzo di prodotto della Settimana 3 non ancora iniziato
- **Verifica della firma clinica e del testo legale del consenso** — dipendenza esterna
- Un giro dedicato di **accessibilità** (contrasto, dimensione dei tocchi, screen reader)
- Verificare che i **tre numeri del pilota** siano leggibili, non solo salvati
