# 01 · Visione e problema

> Fonte: `fonti/documenti/Features - BAB ReadinessBodyLiteracyMaster v1.pdf` §1
> + `fonti/immagini/schema-readiness-body-literacy.jpeg`

---

## La frase che spiega tutto

> **Quasi tutta la tecnologia sportiva misura l'atleta *dall'esterno* e le dice cosa fare.
> BAB fa l'opposto: insegna a una ragazza a leggere il proprio corpo.**

Questa singola inversione è l'intero prodotto. Ogni scelta di design che segue è una
conseguenza di questa frase, e ogni feature proposta va testata contro di essa:

> *"Questa feature le dice cosa fare, o le insegna a capirlo da sola?"*

Se la risposta è la prima, la feature è fuori — anche se è comoda, anche se è quello
che fanno tutti.

---

## Per chi

**Atlete femmine adolescenti, 11–18 anni.**

Non è un dettaglio demografico: è la ragione tecnica per cui il prodotto deve esistere.

| Fattore | Perché conta |
|---|---|
| **Sotto-servite e sotto-studiate** | Gli strumenti di monitoraggio sono costruiti quasi tutti su uomini adulti. Non c'è una base di evidenza per loro. |
| **Alto rischio di infortunio da sovraccarico e burnout** | Il costo di non saper leggere i segnali è concreto e immediato. |
| **Disfunzione mestruale e RED-S** | Bassa disponibilità energetica → rischio infortuni e salute ossea a lungo termine. |
| **Interocezione ancora in sviluppo** | A quest'età la capacità di sentire dentro sé stessi *non è ancora formata*. È letteralmente da allenare. |
| **Alta sensibilità all'immagine corporea** | Qualsiasi cosa somigli a un giudizio sul corpo fa danno, non bene. |

**Il risultato oggi:** ragazze che spesso non sanno ancora distinguere un "buon" fastidio
da allenamento da un segnale d'allarme, e che si sentono goffe a mettere l'una o l'altra
cosa in parole davanti a un adulto.

---

## L'opportunità

L'adolescenza è una **finestra di plasticità** per costruire l'interocezione.

Questo trasforma il prodotto da "app di tracking" a **strumento educativo con effetto
duraturo**. Uno strumento semplice, usato con costanza in questi anni, può insegnare
una competenza di vita — la *body literacy* — mentre genera i dati longitudinali che
rendono visibile il "normale" di ogni singola ragazza.

E siccome quei dati sono consensati e de-identificati, in aggregato costruiscono
**la base di evidenza sull'atleta femmina che oggi manca al settore**.

---

## L'architettura logica (dallo schema a 3 colonne)

Lo schema che la founder ha disegnato è la mappa più utile di tutto il materiale.
Va letto da sinistra a destra:

```
01 · FLUSSI LONGITUDINALI          02 · MODELLO INDIVIDUALE           03 · OUTPUT
                                                                     
  Interocezione                      LA SUA BASELINE                   1. DECODE
    Predict · Sense                                                      capire cos'è
    Look back · Learn        →       Step 1                              normale per lei
                                     impara il segnale tipico     →      e saperlo dire
  Indicatori core                    per zona, dominio e fase
    Sleep · Mood · Energy                                              2. DECIDE
    Painkillers · sRPE                Step 2                             PUSH / RECOVER
    Performance eval        →         traccia il prediction error        / REST
                                      per allenare la calibrazione       (la sua chiamata)
  Mappa corpo e sensazioni
    Sore · Tight · Sharp              Step 3                           3. COMMUNICATE
    Burning · Unstable      →         segnala la deviazione       →      prove da passare a
    Swollen                           dalla SUA baseline,                coach / genitore /
                                      non i valori assoluti              team / clinico
  Ciclo mestruale
    Fase · Contraccezione   →      ─────────────────────────         ─────────────────────
                                   Approccio individualizzato,        BODY LITERACY
  Allenamento                      basato sul suo ciclo, le sue       nominare, riconoscere,
    Tipo · Durata · Carico         sensazioni e il suo carico        comunicare e gestire le
    PE · Competizione                                                 sensazioni corporee
```

E sotto, il loop che chiude il cerchio:

```
AGGREGA                    DISCOVER                     FEED BACK
migliaia di record    →    nuova evidenza su       →    un modello personale
consensati, allineati      ciclo, carico e dolore       più preciso per ogni
al ciclo                                                atleta
        └──────────────── CLOSED LOOP ─────────────────────┘
   La scoperta alimenta il suo modello; il suo modello alimenta la scoperta
```

### Perché questo schema è così importante per il design

Definisce **tre livelli di output completamente diversi**, che nell'app devono restare
tre cose distinte e non mescolarsi mai:

1. **DECODE** = capire. *"Ah, questo è il mio normale."* → vive nei **Patterns**.
2. **DECIDE** = agire. *"Oggi vado Gentle."* → vive nel **check-in giornaliero**.
3. **COMMUNICATE** = trasmettere. *"Ecco cosa dico al coach."* → vive nella **body-story condivisibile**.

Un errore classico sarebbe far fare all'app tutte e tre le cose nella stessa schermata.
Il materiale dice chiaramente di no.

---

## Cosa NON è BAB

Da tenere appeso al muro, perché è la fonte della metà delle decisioni difficili:

- ❌ Non è un **wearable companion**. Funziona al 100% senza dispositivo. La banda è un bonus.
- ❌ Non è un **punteggio di readiness**. Nessun numero rosso "PERICOLO".
- ❌ Non è un **diario alimentare**. Mai fame, sazietà, calorie, cibo.
- ❌ Non è uno **strumento di sorveglianza per il coach**. I dati sono suoi; la condivisione è opt-in.
- ❌ Non **prescrive**. Supporta la decisione push/rest/recover, non la prende.
- ❌ Non è un **dispositivo medico**. Non diagnostica; instrada verso un umano quando serve.
