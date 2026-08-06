# 02 · Fondamenta scientifiche

> Fonte: documento sorgente §2, §7, §8, + riferimenti bibliografici in coda al PDF.

Il modello poggia su tre fonti. Ognuna contribuisce un pilastro **diverso**, e
soprattutto ognuna **impone dei vincoli di design**. Questa è la parte che più spesso
viene ignorata: la scienza qui non è decorazione da landing page, è la ragione per cui
certe schermate sono fatte così e non altrimenti.

---

## Pilastro 1 — Il meccanismo
### Welsh, Seshadri, Kiely & Khalsa (2026) — *Interoceptive Intelligence in Sports*

**Cosa dice:** l'interocezione è **allenabile**, e si allena riducendo lo scarto tra
stato corporeo *previsto* e stato corporeo *effettivo* (il **prediction error**).
L'adolescenza è una finestra di plasticità.

**Corollario critico:** i wearable devono essere **strumenti di calibrazione, non verdetti**.
Se il dispositivo dà il responso, causa dipendenza ed effetti nocebo — cioè peggiora
esattamente la competenza che stiamo cercando di costruire.

### Vincoli di design che ne derivano 🔴

| Vincolo | Dove si vede nell'app |
|---|---|
| **Si prevede PRIMA di osservare** | Step 1 di ogni check-in pre è `Predict`. Non è opzionale né spostabile dopo. |
| **Lo scarto è il dato, non l'errore** | La schermata `Compare` celebra la differenza: *"quel gap è oro"*. Mai "hai sbagliato". |
| **Il device non decide mai** | Tier 2 (HRV) è esplicitamente "individual-level only, never the decider". |
| **Tre facce della metrica** | Awareness (l'ha notato?) · Insight (quanto era sicura, e quanto giusta?) · Accuracy (sentito vs misurato — solo con device). |

---

## Pilastro 2 — La fattibilità
### Temm, Standing & Best (2022) — *Training, Wellbeing and Recovery Load Monitoring in Female Youth Athletes* (IJERPH 2022;19:11463)

**Cosa dice:** il monitoraggio nelle atlete giovani funziona solo se è **semplice, a basso
costo, individualizzato e sostenibile**. Altrimenti l'aderenza crolla e i dati diventano
invalidi.

Gli strumenti "green-standard" per questa popolazione sono: **sRPE**, **item di wellness
brevi**, **conteggio a ritroso del ciclo**. I rischi dominanti sono **RED-S** e **sovraccarico**.
I giovani **sotto-riportano** e **sbagliano la scala**.

### Vincoli di design che ne derivano 🔴

| Vincolo | Dove si vede nell'app |
|---|---|
| **Pochi item, di proposito** | 4 canali scalari + Headspace. Il prototipo v1 ne aveva 6: ne sono stati tolti due. |
| **Tetto duro di tempo** | ≤ 60–90 secondi per check-in. Non è un obiettivo, è un limite. |
| **sRPE è obbligatorio** | È l'unica misura di carico validata per questa fascia. Nel post: "quanto è stata dura davvero". |
| **Conteggio a ritroso per il ciclo** | Si chiedono le date recenti in onboarding, non si chiede alla ragazza di auto-classificare la fase. |
| **Sotto-riporto → mai domande a scelta binaria sul dolore senza contesto** | Prima si insegna a distinguere i due tipi di dolore, *poi* si chiede. Vedi il blocco "Decode your ache". |

> **Nota importante da §12:** il rapporto **acute:chronic workload** è stato *deliberatamente
> escluso* come motore centrale — predizione debole (AUC ≤0.60) e non studiato nelle giovani
> atlete femmine. Resta al massimo come nudge morbido su picchi di carico.

---

## Pilastro 3 — La readiness
### Beato, Madsen, Clubb, Emmonds & Krustrup (2024) — *Monitoring Readiness to Train and Perform in Female Football* (IJSPP 2024;19:223–231)

**Cosa dice:** la readiness è **oggettiva + soggettiva**, valutata **contro la baseline
dell'atleta stessa**. L'HRV è altamente individuale. La disfunzione mestruale richiede
**invio a un clinico**. Molti strumenti a item singolo **non sono validati**: verificare
l'affidabilità prima di fidarsi.

### Vincoli di design che ne derivano 🔴

| Vincolo | Dove si vede nell'app |
|---|---|
| **Mai confronto con una norma di popolazione** | Zero percentili, zero "sei sopra/sotto la media". Solo lei vs lei. |
| **HRV non può essere la spina dorsale** | Tier 2 opzionale, mai decisore. |
| **Disfunzione mestruale → percorso clinico** | Assenza/irregolarità o bassa energia instradano silenziosamente a un check RED-S e all'invito a vedere un clinico. |
| **Umiltà sulle soglie** | Nessuna soglia z-score "confidente": lo *smallest worthwhile change* non è definito per questo gruppo. |

---

## Strumenti di supporto citati

- **OSTRC / Youth Overuse Injury Questionnaire** — riferimento per il monitoraggio del sovraccarico.
- **Adolescent Pediatric Pain Tool** — riferimento per la mappa corporea e il lessico del dolore.
- **Foxen-Craft et al., Eur J Pain 2019** — descrittori di dolore pediatrico.
- **MAIA-Y** — scala self-report di interocezione per giovani; da usare come **baseline periodica di tratto**, mentre il loop giornaliero è lo *stream di stato*. 🟡 Proposta: somministrarla a T0, T+2 mesi, T+4 mesi nel pilota.

---

## La sintesi in una tabella

Se dovessi spiegare le fondamenta scientifiche in 30 secondi a un direttore sportivo:

| Domanda | Risposta |
|---|---|
| Perché prevedere prima? | Perché è così che si allena l'interocezione (Welsh). |
| Perché così poche domande? | Perché altrimenti le ragazze smettono e i dati diventano spazzatura (Temm). |
| Perché nessun punteggio? | Perché non esiste una soglia validata per questa popolazione, e i numeri rossi fanno nocebo (Beato + Welsh). |
| Perché il ciclo è solo contesto? | Perché nei primi anni dopo il menarca è troppo irregolare per normalizzare con precisione (Beato). |
| Perché non parliamo di cibo? | Sensibilità legata all'età; energia e sete sono i proxy sicuri (§12). |

---

## ⚠️ Disclaimer che deve viaggiare con ogni versione del prodotto

> Specifica di design, non consiglio medico. Tutte le soglie cliniche, l'instradamento
> delle bandiere rosse e i percorsi mestruali/RED-S devono essere rivisti e firmati da
> un medico dello sport qualificato, e l'affidabilità degli strumenti stabilita per fascia
> d'età, prima dell'uso con minori.
