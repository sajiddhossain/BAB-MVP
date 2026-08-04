# Fonti — materiale originale della founder

Questa cartella contiene **il materiale grezzo così com'è arrivato**, senza modifiche.
Tutto il lavoro di riorganizzazione, analisi e sintesi vive in [`/docs`](../docs/).

Regola: **i file qui dentro non si modificano mai.** Sono la fonte di verità.
Se una cosa va cambiata, si cambia in `/docs` e si annota la divergenza.

---

## `documenti/`

| File | Cos'è | Lingua | Peso decisionale |
|---|---|---|---|
| `Features - BAB ReadinessBodyLiteracyMasterv1.pdf` | **Il documento madre.** 13 sezioni: visione, fondamenta scientifiche, principi di design, cosa si traccia, ritmo giornaliero, tier wearable, metrica, modello individuale, dati longitudinali, guardrail, output, esclusioni deliberate, decisioni aperte. | EN | 🔴 **Massimo** — è la costituzione del prodotto |
| `BAB before & after Training.pdf` | Schema sintetico dei due check-in in 3 fasi ciascuno. Versione "prima bozza" (Hooper 1-7, VAS). | IT | 🟡 Medio — superato in parte dai prototipi |

## `immagini/`

| File | Cos'è | Peso decisionale |
|---|---|---|
| `schema-readiness-body-literacy.jpeg` | **Lo schema strategico a 3 colonne**: `01 Longitudinal streams → 02 Individual pattern model → 03 Output (Decode / Decide / Communicate)` + il loop "Research in real time". È la mappa mentale dell'intero sistema. | 🔴 **Massimo** — definisce l'architettura logica |
| `note-before-after-training.jpeg` | Appunti a mano/Notion dei due check-in, con le opzioni testuali (soddisfazione, "what did you bring home?"). Coincide col PDF `before & after`. | 🟡 Medio |

## `prototipi/`

Cinque prototipi HTML standalone, funzionanti, self-contained (zero dipendenze).
I nomi originali erano `check-in-tool_1/9`, `after-training-tool/_6`, `bab-4-month-journey_3`:
rinominati per rendere leggibile **quale versione è la più recente**.

| File | Cos'è | Stato |
|---|---|---|
| `01-pre-training-check-in--v2-LATEST.html` | Check-in pre-allenamento. 4 step: Predict → Tune in → Compare → Adjust. | ✅ **Versione di riferimento** |
| `01-pre-training-check-in--v1.html` | Versione precedente: 6 canali (aveva `fuel` e `mind` come scale 1-5), lista fasi ciclo estesa. | 📦 Archivio |
| `02-post-training-reflect--v2-LATEST.html` | Riflessione post-allenamento. 4 step: Look back → Sense → Learn → Recover. | ✅ **Versione di riferimento** |
| `02-post-training-reflect--v1.html` | Versione precedente: aveva `mind` come scala 1-5 invece di Headspace multi-select. | 📦 Archivio |
| `03-journey-16-settimane--v1.html` | Il percorso di 4 mesi / 16 settimane + la vista "My Patterns" con grafico su fasi del ciclo + insight generati. | ✅ Unica versione |

### Come sono cambiate le versioni (il segnale più importante del materiale)

Il diff `v1 → v2` racconta una direzione di prodotto precisa, ed è coerente con i
principi del documento madre:

1. **`fuel` (quanto ti senti sazia, 1-5) è stato rimosso** dal check-in.
   → Coerente col principio **food-safe**: si tracciano energia e sete, mai fame/sazietà/cibo.
2. **`mind`/`mood` (scala 1-5) è diventato `Headspace` (multi-select di parole + "Altro")**.
   → Non si chiede a una ragazza di dare un voto al proprio umore: si chiede di **nominarlo**.
   È la stessa filosofia della mappa corporea. Nominare > misurare.
3. **La sezione ciclo è passata da "scegli come ti senti" a "sto avendo il ciclo sì/no" + contenuto educativo sulle 4 fasi.**
   → Coerente col principio: il ciclo è **contesto**, non un normalizzatore di precisione.
4. **Il totale che determina il tempo è sceso da 24/16 a 20/13** (meno canali, soglie riscalate).

**Conclusione operativa:** la direzione è *meno input, più significato*. Ogni volta
che nel dubbio si può togliere una domanda, si toglie.
