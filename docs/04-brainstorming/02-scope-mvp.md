# 02 · Scope MVP — cosa entra e cosa no

> 🟡 Proposta. Il criterio non è "cosa possiamo costruire", è **"cosa serve per rispondere
> alla domanda che il pilota deve rispondere"**.

---

## La domanda del pilota

Dalla ricerca sul check-in quotidiano, formulata dalla founder stessa:

> **Unico scopo del test: capire se lo compilano.** Se non rispondono a 2 minuti di domande
> al giorno, il modello va sistemato qui prima di costruire altro.

È la domanda giusta, ed è coerente con Temm: **l'aderenza è il vincolo di fattibilità
numero uno**. Tutto il resto del prodotto poggia sull'assunto che ci siano dati quotidiani.

Ma va allargata di poco, perché "se lo compilano" da solo non basta a validare *questo*
prodotto:

> 1. **Lo compilano?** (aderenza — il vincolo)
> 2. **Il predict→compare ha senso per loro?** (il meccanismo)
> 3. **Il gap si accorcia?** (la metrica)

L'MVP è **il minimo che permette di rispondere a queste tre.**

---

## Dentro — v1

### Nucleo (senza questo non esiste il prodotto)

| Blocco | Perché è dentro |
|---|---|
| **Onboarding** (6 schermate, incl. consenso, età, date ciclo, contraccezione) | Bloccante legale e funzionale |
| **Check-in pre** completo con Predict + confidenza | È il meccanismo (domanda 2) |
| **Check-in post** completo con Look back | Chiude il loop, produce il prediction error (domanda 3) |
| **Mappa corporea + lessico** (con le 2 red flag mancanti, intensità, tag comportamento) | Cuore didattico + sicurezza |
| **Care mode** + **pulsante "mi sono fatta male"** | Sicurezza. Non negoziabile. |
| **Home "Oggi"** con tutti gli stati | È l'unica schermata che vedono ogni giorno |
| **Layer ciclo** (toggle giornaliero + fasi derivate + contenuto educativo) | È il differenziante. Senza, siamo un diario qualunque. |
| **Impostazioni privacy** (esporta, cancella, disattiva ritmo) | Requisito §9 |

### Necessario per rispondere alle domande del pilota

| Blocco | Perché |
|---|---|
| **Vista "La mia lettura"** (trend prediction error) | È la misura della domanda 3 |
| **Patterns — stadio Raccolta + Prime ipotesi** | Le prime 8 settimane del pilota stanno qui |
| **Percorso — Mese 1 e 2** (8 settimane) | Un pilota di 8-12 settimane non arriva oltre |
| **Body-story settimanale** | È l'output che rende il pilota interessante per il club che ospita il test |

---

## Fuori — v1.1 o dopo

| Escluso | Quando | Perché non ora |
|---|---|---|
| **Percorso Mesi 3 e 4** | v1.1 | Un pilota di 8-12 settimane non ci arriva. Il contenuto è già scritto: si aggiunge quando serve. |
| **Patterns — stadio Fingerprint completo** | v1.1 | Richiede ~9 settimane di dati per esistere |
| **Tema scuro** | v1.1 | Bello, non necessario per rispondere alle 3 domande |
| **Integrazione wearable (Tier 1/2)** | v2 | Principio 1: l'app è utile senza. Costo alto, differenziazione bassa. |
| **Dashboard coach** | v2 o mai | Vedi [decisioni aperte](03-decisioni-aperte.md). La body-story copre gran parte del bisogno. |
| **Glossario personale** | v1.1 | Idea buona, non bloccante |
| **Badge di fine mese** | v1.1 | Da testare, non da assumere |
| **Portale genitore** | v2 | Il consenso in onboarding basta per il pilota |
| **Multi-lingua** | v1.1 | L'architettura i18n va messa in v1, i contenuti no |
| **Modalità offline completa** | v1.1 | ⚠️ Con una riserva: se il pilota è in palestre senza campo, diventa v1. Da verificare. |

---

## Il taglio più discutibile: perché la dashboard coach è fuori

È probabilmente la richiesta commerciale più forte che arriverà dalle squadre, e la escludo
comunque. Tre ragioni:

1. **§13 la marca come decisione aperta, non come feature.** Costruirla significa aver
   preso la decisione implicitamente, e nella direzione più rischiosa.
2. **Se il coach vede i dati, i dati cambiano.** Un'atleta che sa che il coach legge il suo
   check-in riporterà diversamente. Il sotto-riporto giovanile è già il rischio numero uno
   (Temm): la visibilità del coach lo amplifica in modo non misurabile. E il pilota
   perderebbe la capacità di rispondere alla domanda 1 in modo pulito.
3. **La body-story copre il bisogno reale con lo 0% del rischio.** Il coach non ha bisogno
   dei dati grezzi: ha bisogno di sapere come sta l'atleta. Una story che lei sceglie di
   mandare gli dà quello — e per di più costruisce la competenza di comunicazione che è
   l'obiettivo del Mese 3.

**Il pitch da usare con le squadre:**
> *"Non vi diamo una dashboard che vi mostra le vostre atlete. Vi diamo atlete che sanno
> dirvi come stanno."*

È anche una posizione difendibile con i genitori, che è dove le vendite ai club si vincono
o si perdono.

---

## Criteri di uscita del pilota

Cosa dobbiamo vedere perché l'MVP sia considerato validato:

| Domanda | Metrica | Soglia proposta 🟡 |
|---|---|---|
| **1. Lo compilano?** | % di giorni di allenamento con almeno il pre-check completato, nelle 4 settimane | ≥ 60% |
| | Curva di abbandono: quante ancora attive alla settimana 4 | ≥ 70% |
| | Tempo mediano di completamento del pre-check | ≤ 90 secondi |
| **2. Il meccanismo ha senso?** | % di check-in in cui la previsione viene compilata (è tecnicamente saltabile) | ≥ 85% |
| | Domanda qualitativa in uscita: *"il confronto ti è servito?"* | maggioranza sì |
| **3. Il gap si accorcia?** | Prediction error medio settimana 1-2 vs settimana 7-8 | tendenza in calo |
| | ⚠️ con N=20 non sarà significativo. Serve come segnale, non come prova. | |
| **Sicurezza** | Ogni bandiera rossa segnalata ha portato a una comunicazione a un adulto | 100% |
| | Nessun evento avverso legato a linguaggio su corpo/cibo | 0 |

> **Nota metodologica onesta:** con 20 atlete e 8 settimane non si valida la metrica di
> body literacy — si valida **l'aderenza e la comprensibilità**. La validazione della
> metrica richiede il piano descritto in §13 (affidabilità test-retest della mappa
> corporea per fascia d'età, validazione within-athlete del prediction error contro esiti
> reali). Va detto chiaramente a chiunque legga i risultati del pilota, per non trasformare
> un segnale incoraggiante in un claim.
