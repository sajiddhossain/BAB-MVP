# 02 · Scope MVP — cosa entra e cosa no

> 🟢 **Aggiornato il 6 agosto 2026** con le decisioni in
> [04-revisione-roadmap](04-revisione-roadmap.md). Il criterio non è "cosa possiamo
> costruire", è **"cosa serve per rispondere alla domanda che il pilota deve rispondere"** —
> ma la domanda stessa si è allargata: non è più solo un pilota, sono squadre di calcio e
> pallavolo che useranno il prodotto sul serio.

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
| **Onboarding** (nome, compleanno, sport, *La mia settimana*, ciclo, contraccezione 15+, consenso) | Bloccante legale e funzionale — forma definitiva in [R3](04-revisione-roadmap.md#r3--onboarding--la-forma-definitiva) |
| **Check-in pre** completo con Predict + confidenza | È il meccanismo (domanda 2) |
| **Check-in post** completo con Look back | Chiude il loop, produce il prediction error (domanda 3) |
| **Mappa corporea + lessico** (con le 2 red flag mancanti, intensità, tag comportamento) | Cuore didattico + sicurezza. Una sola mappa per tutte ([R4](04-revisione-roadmap.md#r4--una-sola-mappa-corporea-dai-12-anni-in-su)) |
| **Care mode** + **pulsante "mi sono fatta male"** | Sicurezza. Non negoziabile. |
| **Home "Oggi"** con tutti gli stati | È l'unica schermata che vedono ogni giorno |
| **Layer ciclo** (toggle giornaliero + fasi derivate + contenuto educativo) | È il differenziante. Senza, siamo un diario qualunque. |
| **Vista "Me"** — la sua dashboard | ⬆️ **Promossa in v1.** È ciò che la motiva a tornare: vedere i pattern, il progresso, **e i giorni in cui non ha fatto il check-in** ([R7](04-revisione-roadmap.md#r7--la-vista-me-entra-nella-v1)) |
| **Dashboard coach** | ⬆️ **Promossa in v1.** È ciò che le squadre vogliono, e le ragazze sono già abituate a dare queste informazioni a voce ([R5](04-revisione-roadmap.md#r5--la-dashboard-del-coach-entra-nella-v1)) |
| **Italiano + inglese** | ⬆️ **Promosso in v1.** Le advisor sono straniere ([R9](04-revisione-roadmap.md#r9--italiano-e-inglese-entrambi)) |
| **Offline completo** | ⬆️ **Promosso in v1.** In palestra non c'è campo, ed è dove il check-in va fatto |
| **Impostazioni privacy** (esporta, cancella, disattiva ritmo) | Requisito §9 |

### Necessario per rispondere alle domande del pilota

| Blocco | Perché |
|---|---|
| **Vista "La mia lettura"** (trend prediction error) | È la misura della domanda 3 |
| **Patterns — stadio Raccolta + Prime ipotesi** | Le prime 8 settimane stanno qui |
| **Body-story settimanale** | L'output che costruisce la competenza di comunicazione |

---

## Fuori — v1.1 o dopo

| Escluso | Quando | Perché non ora |
|---|---|---|
| **Percorso 16 settimane, tutto** | v1.1+ | ⬇️ **Uscito del tutto** ([R8](04-revisione-roadmap.md#r8--il-percorso-resta-fuori-dallmvp)). Il contenuto è scritto: si aggiunge quando serve. |
| **Contenuto sull'alimentazione** | non pianificato | Esce col percorso. È il contenuto a rischio più alto per questa popolazione: rimandarlo è il modo giusto di gestirlo. |
| **Patterns — stadio Fingerprint completo** | v1.1 | Richiede ~9 settimane di dati per esistere |
| **Tema scuro** | v1.1 | Bello, non necessario |
| **Wearable** | 🔴 da decidere | Apple Health **non è raggiungibile da una web app** — vedi [B1](04-revisione-roadmap.md#b1--apple-health-non-è-raggiungibile-da-una-web-app). Serve una decisione, perché tocca una schermata di onboarding. |
| **Glossario personale** | v1.1 | Idea buona, non bloccante |
| **Badge di fine mese** | v1.1 | Da testare, non da assumere |
| **Portale genitore** | v2 | Il consenso in onboarding basta per adesso |
| **Journaling libero** | v1.1 | Se arriva, resta privato: non entra nelle viste dello staff ([R2](04-revisione-roadmap.md#r2--la-squadra-vede-i-dati-dei-due-check-in-ciclo-incluso)) |

---

## Il taglio più discutibile è stato ribaltato

Questo paragrafo argomentava perché la dashboard coach dovesse restare fuori. La founder
ha deciso il contrario, e la decisione è presa. L'argomento resta qui perché **descrive un
rischio che non è sparito con la decisione** — e sapere qual è serve a gestirlo.

**Cosa dicevo:** se il coach vede i dati, i dati cambiano. Un'atleta che sa di essere letta
riporta diversamente, e il sotto-riporto giovanile è già il rischio numero uno (Temm).

**Cosa è cambiato nei fatti, e regge:** le ragazze **già oggi** danno queste informazioni ai
coach a voce — sonno, RPE, dolori muscolari sono cose che vengono chieste in palestra. La
visibilità non introduce una dinamica nuova: rende esplicita e simmetrica una dinamica che
c'è già, e in più le dà un vocabolario per rispondere meglio.

**Cosa ne consegue, concretamente:**

1. **Lei sa chi la vede, prima di scrivere qualsiasi cosa.** La schermata *"Chi vede cosa"*
   sta in onboarding, non nelle impostazioni. Se il copy non è onesto, il consenso non è
   informato — ed è per questo che le promesse di privacy sono già state riscritte.
2. **Il journaling resta suo.** La distinzione non è una policy da ricordare: le colonne di
   testo libero non compaiono nelle viste dello staff, quindi non c'è query che le tiri
   fuori.
3. **Il pitch cambia**, e va riscritto. Il vecchio — *"non vi diamo una dashboard, vi diamo
   atlete che sanno dirvi come stanno"* — non descrive più il prodotto. Il nuovo è
   probabilmente: *"i dati che già chiedete, più un'atleta che ha imparato a leggerli"*.
4. **Nel leggere i risultati va tenuto presente.** Un tasso di segnalazione basso su una
   zona del corpo può voler dire che non fa male, o che non se la sente di dirlo al coach.
   Il pilota non potrà distinguere le due cose, e i risultati vanno letti sapendolo.

---

## Criteri di uscita del pilota

Cosa dobbiamo vedere perché l'MVP sia considerato validato:

| Domanda | Metrica | Soglia proposta 🟡 |
|---|---|---|
| **0. Continuano?** | 🆕 Quante sono ancora attive **dopo il primo mese** | ≥ 60% |
| **1. Lo compilano?** | % di giorni di allenamento con almeno il pre-check completato | ≥ 60% |
| | Curva di abbandono: quante ancora attive alla settimana 4 | ≥ 70% |
| **2. Il meccanismo ha senso?** | % di check-in in cui la previsione viene compilata (è tecnicamente saltabile) | ≥ 85% |
| | Domanda qualitativa in uscita: *"il confronto ti è servito?"* | maggioranza sì |
| **3. Il gap si accorcia?** | Prediction error medio settimana 1-2 vs settimana 7-8 | tendenza in calo |
| | ⚠️ con ~20 atlete non sarà significativo. Serve come segnale, non come prova. | |
| **Sicurezza** | Ogni bandiera rossa segnalata ha portato a una comunicazione a un adulto | 100% |
| | Nessun evento avverso legato a linguaggio su corpo/cibo | 0 |

**Osservato ma non giudicato:**

| Cosa | Perché non è una soglia |
|---|---|
| Tempo speso sul check-in | ⬇️ **Non è più un criterio di successo** ([R1](04-revisione-roadmap.md#r1--i-90-secondi-non-sono-un-tetto)). Si misura per capire, non per promuovere o bocciare: metterci di più può voler dire che sta ascoltando meglio, che è il prodotto che funziona. |
| Quali campi vengono saltati | Dice dove il flusso è pesante, senza trasformare una scelta legittima in un errore |

> **Nota metodologica onesta:** con ~20 atlete e 8 settimane non si valida la metrica di
> body literacy — si valida **l'aderenza e la comprensibilità**. La validazione della
> metrica richiede il piano descritto in §13 (affidabilità test-retest della mappa
> corporea, validazione within-athlete del prediction error contro esiti reali). Va detto
> chiaramente a chiunque legga i risultati del pilota, per non trasformare un segnale
> incoraggiante in un claim.
>
> **E una nota nuova:** ora che lo staff vede i dati, un tasso di segnalazione basso ha due
> spiegazioni possibili — non fa male, oppure non se la sente di dirlo. Il pilota non le
> distingue.
