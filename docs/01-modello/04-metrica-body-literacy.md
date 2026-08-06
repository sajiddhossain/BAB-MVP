# 04 · La metrica — prediction error

> Fonte: documento sorgente §7, §8, §9.

---

## L'unica metrica che conta

> **Metrica principale: il prediction error, in calo.**
> Uno scarto che si restringe tra previsto e reale (sentito, o misurato) è la definizione
> operativa di readiness e body literacy in crescita — e funziona **con o senza dispositivo**.

Questo è il KPI del prodotto. Non l'aderenza, non il numero di check-in, non il "readiness
score". **Quanto bene si legge, e se sta migliorando.**

---

## Le tre facce (Welsh, via Garfinkel)

| Faccia | Domanda | Serve un device? |
|---|---|---|
| **Awareness** | L'ha notato? | ❌ No |
| **Insight** | Quanto era sicura, e quanto aveva ragione? | ❌ No — **è il segnale core del tier gratuito** |
| **Accuracy** | Sentito vs misurato | ✅ Solo wearable — mostrato come *"quanto ci sei andata vicino"*, mai come voto buono/cattivo |

> Nota: la faccia **Insight** ("quanto era sicura") richiede un input di **confidenza**
> che nei prototipi non c'è. Attualmente si cattura solo la previsione, non quanto è
> sicura di essa.
>
> 🟡 **Proposta:** dopo la scelta dell'andatura prevista, una micro-domanda a 3 stati:
> *"Quanto sei sicura?"* → `Tiro a indovinare · Abbastanza · Sicura`. Un tocco.
> È l'input a costo più basso e valore più alto di tutto il modello: senza, una delle
> tre facce della metrica non è misurabile.

---

## I tre segnali di apprendimento generati dai due check-in

Il §5 lo dice chiaramente: due check al giorno producono **tre** segnali di apprendimento,
non due:

```
 1. MICRO — predict → sense
    Lo scarto tra come pensava di stare e come sta, catturato nel pre-check.
    "Ti ha sorpreso qualcosa rispetto a quello che ti aspettavi?"
    → La sorpresa viene loggata come dato.

 2. MACRO — pre → post (session prediction error)
    Lo scarto tra come pensava che sarebbe andata e come è andata davvero.
    → È il titolo del post-check: "Was the morning read right?"

 3. CROSS-DAY — evoluzione dell'indolenzimento
    Il pre-check di domani è la lettura DOMS a ~24h di oggi.
    → Per questo la mappa corporea deve essere identica pre e post.
```

> **"Non perdi l'indolenzimento ritardato":** il DOMS non appare la sera dopo
> l'allenamento, appare la mattina dopo. Il sistema a due check lo cattura naturalmente,
> senza chiedere un terzo check.

---

## La salvaguardia sulla previsione

Due frasi cruciali del §5, facili da perdere e costose da ignorare:

> **Perché prevedere prima:** impegnarsi in una previsione *prima* di osservare è ciò che
> allena l'interocezione (apprendimento per errore di previsione).
>
> **La salvaguardia:** valutare l'accuratezza contro **l'esito post-allenamento**, non
> contro la pre-scansione "primed", e mantenere la previsione un gioco a bassa posta per
> evitare profezie auto-avveranti negative.

**Traduzione operativa 🔴:**
- L'accuratezza si calcola su `previsione mattutina → esito post-allenamento`, **non** su
  `previsione mattutina → sensazione mattutina` (che è contaminata: dopo aver previsto
  "Gentle" è più probabile che si senta Gentle).
- Il tono attorno alla previsione deve restare leggero. Nessuna serie, nessuno streak di
  accuratezza, nessun badge "predittrice esperta". Il momento in cui la previsione diventa
  una performance, il meccanismo si rompe.

---

## Definire "normale": il fingerprint

> *"Il 'normale' è il suo pattern ricorrente, costruito nel tempo e consapevole della fase."*

Dalla sua storia accumulata di predict/sense, l'app assembla un **fingerprint personale**:
- i suoi segnali tipici **per sito e per dominio**,
- come si spostano **lungo il ciclo**,
- **quanto accuratamente legge** ciascuno.

Il modello segnala le **deviazioni dal suo fingerprint** — un sito focale nuovo, un segnale
che non segue il carico, uno che persiste o peggiora — **non valori assoluti**. 🔴

### Note di modellazione (§8)

Sono note tecniche, ma hanno conseguenze di prodotto:

> Aspettarsi dati **sparsi e ad alta dimensionalità** (regioni × sensazioni × intensità,
> per lo più vuoti per ogni ragazza). Usare metodi **gerarchici / a partial pooling** che
> prendono in prestito forza tra regioni e atlete per gestire il cold-start, invece di un
> modello separato per ogni parte del corpo. **Accoppiare ogni segnale al carico.** Iniziare
> descrittivi e within-athlete; validare prima che una soglia guidi una decisione.

**Conseguenza di prodotto 🔴:** nelle prime settimane l'app **non ha un fingerprint**.
Il design deve gestire onestamente questo periodo. Non si inventano insight su 5 giorni
di dati.

🟡 **Proposta — tre stadi espliciti nella sezione Patterns:**

| Stadio | Durata indicativa | Cosa mostra |
|---|---|---|
| **Raccolta** | Settimane 1–3 | Solo i dati grezzi, belli da guardare. Zero interpretazione. Copy: *"Stiamo ancora imparando come sei fatta — ogni check-in aggiunge un pezzo."* |
| **Prime ipotesi** | Settimane 4–8 | Pattern proposti con linguaggio ipotetico e richiesta di conferma. |
| **Fingerprint** | Settimana 9+ | Il suo profilo, con confronto contro la sua baseline. |

Questo non è solo onestà scientifica: è anche una **buona meccanica di engagement**, perché
il valore cresce visibilmente con l'uso.

---

## Come si mostra l'errore senza fare danno

Il prototipo lo risolve già bene. Copy reale, da conservare:

**Quando la previsione azzecca:**
> Avevi previsto **Steady** — e il tuo corpo è d'accordo. 🎉 Questa è la tua lettura
> interocettiva che si affina: stai imparando a sentire cosa arriva prima di controllare.
> Continua così.

**Quando la previsione sbaglia:**
> Avevi previsto **Upbeat**, ma i tuoi canali puntano a **Gentle**. Quel divario è **oro**
> — è esattamente così che impari. Fermati un attimo: quale canale ti ha sorpresa?
> Nominare la sorpresa è come il divario si accorcia la prossima volta.

**Quando non ha previsto:**
> La prossima volta prova a indovinare la tua andatura *prima* di sintonizzarti — confrontare
> la tua previsione con il tuo corpo è tutto ciò che allena la tua lettura interiore.

> **Perché funziona:** l'errore non è mai chiamato errore. È chiamato *gap*, *sorpresa*,
> *oro*. E immediatamente dopo arriva una domanda che trasforma l'errore in azione
> cognitiva ("quale canale ti ha sorpresa?"). Questo è design didattico fatto bene.

---

## Cosa NON mostrare mai

🔴 Divieti espliciti derivati da §7, §10, §12:

- ❌ Una percentuale di accuratezza ("sei accurata al 68%")
- ❌ Un grafico dell'accuratezza in discesa presentato come fallimento
- ❌ Confronto della sua accuratezza con altre atlete
- ❌ Streak / badge / gamification dell'accuratezza predittiva
- ❌ Qualsiasi numero rosso
- ❌ Un "readiness score" complessivo

Ciò che si può mostrare, nel tempo: una **linea di tendenza del gap**, senza asse
numerico, con l'unico messaggio *"si sta accorciando"* / *"sta oscillando, del tutto
normale"*.
