# 02 · Modello dati

> Lo schema vive in [`app/supabase/schema.sql`](../../app/supabase/schema.sql), idempotente
> e commentato. Qui ci sono **le scelte** e il perché.

---

## Le cinque decisioni che reggono lo schema

### 1 · I check-in sono eventi immutabili, non righe modificabili

Un check-in, una volta inviato, **non si modifica mai**. Se lei rifà il check-in, è una
nuova riga.

Tre conseguenze, tutte positive:
- **L'offline diventa banale.** Non esistono conflitti da risolvere: si accodano inserimenti,
  si inviano in ordine, fine. Vedi [offline](03-offline-e-sync.md).
- **La storia resta vera.** Se lei cambia idea, si vede che ha cambiato idea — che è
  esattamente il tipo di dato che il prodotto studia.
- **Nessuna migrazione dolorosa** quando le soglie cambieranno: gli input grezzi restano
  validi, cambia solo il calcolo.

### 2 · Il ciclo sta in una tabella separata

`cycle_events` ha la sua RLS e non è mai in join con i check-in a livello di database.
La correlazione fase ↔ segnale si fa **nell'app**, a runtime.

**Perché:** l'onboarding promette che *«il tuo ciclo non è mai condiviso, mai mostrato, mai
incluso in niente che mandi»*. Se quei dati stanno nella stessa riga dei check-in, la
promessa dipende dall'attenzione di chi scrive la query successiva. Separati, dipende dal
database — che non si distrae.

### 3 · Le bandiere rosse sono una tabella, non un campo

`red_flags` con `resolved_at`. Il §11 dice che devono escalare a un umano **immediatamente,
mai sepolte in un trend**: per farlo devono essere interrogabili da sole, avere uno stato,
e sopravvivere al check-in che le ha generate.

È anche ciò che permette al Care mode di restare visibile nella home finché non si risolve.

### 4 · Suggerito e scelto sono due colonne

`tempo_suggested` e `tempo_chosen`. Sempre entrambe, sempre popolate.

La differenza tra le due è il dato più prezioso del pilota: è l'atleta che corregge il
modello. Con una colonna sola, quel segnale non esiste e non si recupera dopo.

### 5 · Nessun aggregato materializzato

Niente tabelle di medie, punteggi, fingerprint precalcolati. Tutto si calcola a runtime dai
grezzi.

**Perché:** il §8 dice di restare descrittivi e within-athlete finché non c'è validazione.
Un aggregato salvato è una soglia congelata — e quelle soglie cambieranno.

---

## Le tabelle

```
athletes ──┬── consents            (chi ha acconsentito a cosa, e quando)
           ├── check_ins ──── body_signals   (una riga per sensazione toccata)
           ├── red_flags          (aperte / risolte)
           ├── cycle_events       ⚠ RLS separata, mai in join
           ├── journey_progress   (settimana, missione, riflessioni)
           ├── shares             (body-story: cosa, a chi, quando)
           └── ux_events          (strumentazione del pilota)
```

### `athletes`
Profilo minimo. **Nessun nome reale nel pilota** — un codice atleta, coerente con la ricerca
sul check-in quotidiano.

Campi chiave: `birth_year` (non data di nascita: basta per scalare la mappa corporea e
riduce il dato personale), `sport`, `training_days`, `cycle_status`
(`tracking` / `not_yet` / `undisclosed`), `contraception`, `locale`.

`cycle_status = 'undisclosed'` non è un ripiego: nasconde il blocco ritmo ovunque, e va
rispettato in ogni schermata.

### `check_ins`
Una riga per check-in completato.

| Gruppo | Campi |
|---|---|
| Contesto | `kind` (`pre`/`post`), `local_date`, `session_type`, `duration_bucket` |
| Previsione | `tempo_predicted`, `prediction_confidence` |
| Esito | `tempo_suggested`, `tempo_chosen` |
| Canali | `sleep`, `energy`, `hydration`, `muscles` · post: `legs`, `breath`, `effort` |
| Non scalari | `headspace` (array), `headspace_other`, `surprise` |
| Contesto vita | `sleep_hours`, `school_load`, `painkillers` |
| Riflessione | `brought_home` (array), `note` |
| Strumentazione | `started_at`, `completed_at`, `skipped_fields` |

**Nota sul giorno.** `local_date` è la data *dell'atleta*, non `created_at`. Il giorno finisce
alle 4 del mattino, non a mezzanotte: un check-in fatto all'una di notte appartiene al giorno
prima. Calcolato sul client, dove si conosce il fuso.

### `body_signals`
**Una riga per sensazione toccata**, non un JSON dentro il check-in.

`region`, `sensation`, `intensity` (1–3), `behaviour`
(`eases` / `worse_load` / `at_rest`), `is_red_flag`.

**Perché normalizzata:** la domanda «quante volte questo mese ha segnalato il polpaccio
destro?» è la base sia dei pattern sia della body-story. Con un JSON diventa una query
scomoda che si scriverà male.

`region` è un **codice stabile** (`calf_r`), non l'etichetta visibile: le etichette cambiano
con la lingua e con il copy, i dati no.

### `red_flags`
`opened_at`, `region`, `sensation`, `resolved_at`, `told_adult` (bool + quando).

`told_adult` è la misura di sicurezza del pilota — deve arrivare al 100%.

### `cycle_events`
Solo due tipi: `period_start` e `period_end`. **Le fasi non si salvano**, si derivano.

**Perché:** salvare la fase significherebbe congelare un'inferenza incerta come fosse un
fatto. Le date sono il dato; la fase è un'interpretazione, e va rifatta ogni volta con le
regole correnti.

### `shares`
Cosa è stato incluso in una body-story e quando è stata generata. **Non contiene i dati**:
solo l'elenco dei blocchi inclusi.

Serve a due cose: dimostrare che il ciclo non è mai stato incluso senza spunta esplicita, e
misurare quanto la funzione viene usata davvero.

### `ux_events`
Strumentazione. Nessun contenuto: solo `event`, `screen`, `ms`, `meta` piccola.

---

## Row Level Security

🔴 Regola unica, su ogni tabella:

```sql
using (athlete_id = auth.uid())
with check (athlete_id = auth.uid())
```

Nessuna eccezione, nessuna policy di lettura incrociata. **Una query che confronta due
atlete non è sconsigliata: è impossibile.** Il principio del «normale individualizzato»
smette di dipendere dalla disciplina di chi scrive il codice.

### La visibilità del coach, quando verrà decisa

La tabella `shares` è già il punto di innesto: se e quando si deciderà che il coach vede
qualcosa, si aggiunge una policy che legge **solo attraverso `shares`**, mai direttamente
sui check-in.

Questo significa che **la decisione aperta non blocca lo schema**, e che qualunque cosa si
decida, il coach non potrà mai vedere più di quello che lei ha condiviso esplicitamente.

---

## Consenso e minori

`consents` registra separatamente: consenso atleta, consenso tutore, consenso ricerca.
Ognuno con timestamp e versione del testo accettato.

**La versione del testo conta:** se il testo legale cambia, serve sapere chi ha accettato
quale versione. È il tipo di dettaglio che si rimpiange di non aver messo.

### Export e cancellazione

Due funzioni di prima classe, previste dallo schema, non aggiunte dopo:
- **Export**: un JSON con tutte le sue righe, da tutte le tabelle.
- **Cancellazione**: `on delete cascade` da `athletes`. Reale, non un flag `deleted`.

---

## Cosa lo schema **non** contiene, di proposito

| Assente | Perché |
|---|---|
| Nome, cognome, email in chiaro nel profilo | Nel pilota basta un codice atleta. L'email vive in `auth.users`, gestita da Supabase. |
| Peso, altezza, misure | Nessun dato sul corpo come forma. Principio 6. |
| Punteggi, indici, readiness score | Non validati. Si calcolano a runtime o non esistono. |
| Fase del ciclo | Derivata, mai salvata. |
| Tabelle di squadra o di club | La decisione non è presa. |
| Dati wearable | Fuori dall'MVP. Quando servirà, è una tabella nuova, non una colonna in più. |
