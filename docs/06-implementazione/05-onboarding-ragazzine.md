# 05 · Onboarding, rifatto per una tredicenne

> Lista di modifiche all'accesso e all'onboarding, raccolte in una sessione di revisione
> del 2026-08-12. Testo semplice, una cosa per schermata, età target 12+. Questo documento
> è pensato per essere eseguito task per task (es. con un loop), non tutto insieme — ogni
> voce è indipendente dalle altre salvo dove segnalato.
>
> File coinvolti: [`SignIn.tsx`](../../app/src/screens/SignIn.tsx),
> [`Onboarding.tsx`](../../app/src/screens/Onboarding.tsx),
> [`copy/it.ts`](../../app/src/copy/it.ts) e [`copy/en.ts`](../../app/src/copy/en.ts)
> (le due lingue vanno tenute in parità — vedi [04-i18n-e-copy](04-i18n-e-copy.md)),
> [`repo.ts`](../../app/src/lib/repo.ts) per lo schema di salvataggio.

---

## 1 · Schermata di accesso (`SignIn.tsx`)

### 1.1 — Titolo con il punto di domanda
- **Ora:** `t.auth.title` = *"Ciao, pronta per entrare in BAB"*
- **Deve diventare:** *"Ciao, pronta per entrare in BAB?"*
- Solo `copy/it.ts` (e l'equivalente in `en.ts`, se serve un punto di domanda anche lì).

### 1.2 — Descrizione sotto il titolo
- **Ora:** `t.auth.lede` = *"Ti mandiamo un link via email. Nessuna password da ricordare, e nessuna da farsi rubare."*
- **Deve diventare:** *"Inserisci la tua mail, clicca sul link che ti arriverà e si parte"*
- Stesso file, stessa chiave.

---

## 2 · Il blocco "Cos'è / Cosa non è" — da togliere

- Oggi è il primo passo dell'onboarding (`step === 'welcome'` in `Onboarding.tsx`, righe
  157–173), subito dopo che l'atleta è entrata con l'email. Due card: `isTitle`/`isItems`
  ("Cos'è") e `isNotTitle`/`isNotItems`  ("Cosa non è").
- **Va tolto del tutto.** Non sostituito con altro testo lungo — il principio è "una cosa
  per schermata", e questa schermata ne aveva quattro.
- Cosa resta del passo `welcome`: valutare se il passo stesso serve ancora (titolo
  `welcomeTitle` + `welcomeBody` da soli possono bastare come primissima schermata, oppure
  si può saltare dritti a `whoSees`). Decisione da prendere in fase di implementazione,
  non bloccante per il resto della lista.
- Chiavi di copy da rimuovere (dopo aver tolto l'uso): `isTitle`, `isItems`, `isNotTitle`,
  `isNotItems` in entrambe le lingue. Attenzione alla parità con `en.ts`.

---

## 3 · "Quando compi gli anni" → "Quando sei nata"

- **File:** `Onboarding.tsx`, step `birthday` (righe 211–218).
- **Titolo — ora:** `birthdayTitle` = *"Quando compi gli anni?"*
  **deve diventare:** *"Quando sei nata?"*
- **Sottotitolo — ora:** `birthdayHelp` = *"Serve a due cose: farti gli auguri, e sapere
  quali domande ha senso farti e quali no."*
  **deve diventare:** *"Serve a due cose: farti gli auguri e creare un percorso adatto a
  te"*
- Solo copy, nessuna modifica di logica (il calcolo dell'età resta uguale).

---

## 4 · Sport: da campo di testo a selezione multipla

- **Ora:** `Onboarding.tsx` step `sport` (righe 220–228) è un `<input>` di testo libero,
  uno sport solo, salvato come stringa (`profile.sport`).
- **Deve diventare:** un menu a tendina / selezione **multi-sport** (un'atleta può
  praticarne più di uno — es. atletica + pallavolo).
- Implicazioni a cascata, da trattare come task collegate ma separate:
  - **Lista sport:** serve un elenco predefinito (con eventuale "Altro" + campo libero
    per non bloccare chi fa uno sport di nicchia). Da definire dove vive questa lista
    (nuovo file in `content/`, es. `content/sports.ts`).
  - **Modello dati:** `profile.sport` oggi è `string | null` in `repo.ts`/schema. Con
    più sport diventa una lista. Verificare `saveProfile` e la tabella `athletes` nello
    schema Supabase — serve capire se cambia la colonna o si aggiunge una tabella
    `athlete_sports` collegata. Questo è il pezzo più delicato della lista: tocca lo
    schema del database, non solo il frontend.
  - **Passo 5 (sotto)** dipende da questa: gli allenamenti si chiedono *per sport*.

---

## 5 · Un allenamento per sport, un'azione per schermata

- **Principio guida (esplicito dell'utente):** anche con più sport, resta **una sola
  azione per schermata** — si scorre uno sport alla volta, non tutto insieme.
- Per ciascuno sport selezionato al passo 4, chiedere in sequenza (schermate separate):
  1. Giorni di allenamento di quello sport.
  2. Orario di inizio.
  3. **Nuovo — orario di fine indicativo** (oggi c'è solo `trainTime`, l'inizio; manca
     la fine). Sempre facoltativo/indicativo, e sempre ririmodificabile.
- **Testo descrittivo da usare (sostituisce `weekTrainingHelp` per questo contesto):**
  *"Seleziona i giorni e l'orario. Puoi sempre modificarli se cambia qualcosa."*
- **Promemoria di prodotto, da mettere per iscritto in una schermata di riepilogo o come
  nota fissa:** tutto questo resta comunque modificabile in seguito dalla scheda profilo
  (`screens/settings/`) — va verificato che quella schermata esista già per il calendario
  allenamenti o vada creata.
- **Modello dati:** `saveSchedule`/`ScheduleEntry` in `repo.ts` oggi ha `weekday`,
  `kind`, `start_time`. Serve aggiungere `end_time` (nullable). Controllare la tabella
  corrispondente nello schema Supabase.
- Il passo `pe` (educazione fisica a scuola) e `events` (gare) restano come sono, non
  sono nella richiesta.

---

## 6 · "Hai il ciclo" — nuova descrizione, meno testo sui bottoni

### 6.1 — Testo sotto il titolo (`rhythmBody`)
- **Ora:** *"Se ce l'hai, BAB può usarlo come sfondo dietro tutti gli altri segnali — la
  cosa che quasi nessuna app sportiva fa. Puoi spegnerlo quando vuoi, e prima di decidere
  ti diciamo esattamente chi lo vede."*
- **Deve diventare** (tradotto in italiano dal testo fornito, adattato al tono BAB):
  *"Dopo il primo ciclo, anche il tuo corpo comincia a muoversi a modo suo. Il ciclo
  attraversa quattro fasi diverse, e crea un ritmo che tocca tutto — energia, umore,
  sonno, concentrazione — in un modo che è unico per te. BAB ti aiuta a capirlo."*
- ⚠️ Verificare che resti coerente con `whoSees`/`cyclePrivacy` più avanti nel flusso
  (chi vede le date): questa schermata parla solo di cosa fa BAB, non di privacy — va
  bene così, la privacy resta nella schermata delle date (punto 8).

### 6.2 — I tre bottoni: via la descrizione da due su tre
- **Ora** ognuno dei tre bottoni (righe 269–278) ha un'etichetta + una riga di aiuto:
  `rhythmYes`/`rhythmYesHelp`, `rhythmNotYet`/`rhythmNotYetHelp`,
  `rhythmSkip`/`rhythmSkipHelp`.
- **Deve diventare:** solo **"Sì, ce l'ho"** (`rhythmYes`) mantiene la riga di aiuto
  (`rhythmYesHelp`, invariata: *"BAB mapperà le tue fasi dalle date che le dai"*).
  "Non ancora" e "Preferisco non dirlo" restano come **solo etichetta**, senza sottotesto.
- In pratica: smettere di passare `help` per quei due bottoni nel componente (o svuotare
  `rhythmNotYetHelp`/`rhythmSkipHelp` e adattare il markup così che quando `help` è vuoto
  non lasci uno spazio vuoto nel bottone).

---

## 7 · Date del ciclo: titolo, e calendario al posto dei tre campi

### 7.1 — Titolo (`datesTitle`)
- **Ora:** *"Quando sono iniziati i tuoi ultimi cicli?"*
- **Deve diventare:** *"Quando è stato il tuo ultimo ciclo?"*
- Da valutare in fase di implementazione: se il titolo ora parla al singolare ("il tuo
  ultimo ciclo"), l'help sotto (`datesHelp`, che oggi parla di "una, due o tre date")
  va riallineato di conseguenza — vedi 7.2.

### 7.2 — Da tre campi data a un calendario con selezione multipla di giorni
- **Ora:** tre `<input type="date">` separati — "il più recente", "quello prima",
  "e ancora prima" (righe 286–293) — cioè si chiede solo la **data di inizio** di tre
  cicli passati.
- **Deve diventare:** un **calendario** dove l'atleta seleziona **tutti i giorni** del
  suo ultimo ciclo (non solo il primo giorno) — coerente col nuovo titolo al singolare,
  "il tuo ultimo ciclo", non più tre cicli.
- Implicazione tecnica: serve un componente calendario con multi-selezione di date
  (nuovo componente in `components/`, es. `CalendarMultiSelect.tsx` — non esiste ancora
  nulla di simile nel progetto, va scritto da zero o con una libreria leggera già
  compatibile con lo stack Vite/React esistente).
- **Modello dati:** oggi `saveCycleEvent(userId, d, 'period_start')` salva un evento per
  data di inizio. Con la selezione di più giorni consecutivi bisogna decidere come
  salvarli: o un evento per ciascun giorno selezionato con un tipo diverso (es.
  `period_day`), o mantenere `period_start` per il primo giorno selezionato e derivare la
  durata dagli altri. Da chiarire con lo schema `body_signals`/eventi ciclo esistente
  prima di scrivere codice.

### 7.3 — Via il box "Perché BAB chiede le date invece di che fase sei"
- **Ora:** righe 294–297, un `<details>` con `whyDatesTitle` + `whyDatesBody`.
- **Va tolto del tutto.** Chiavi di copy `whyDatesTitle`/`whyDatesBody` da rimuovere
  (entrambe le lingue) dopo aver tolto l'uso.
- Il box subito sotto (`cyclePrivacy`, righe 298–300, chi vede le date) **resta** — non
  è quello di cui l'utente ha chiesto la rimozione.

---

## 8 · Contraccettivi ormonali

### 8.1 — Nuova descrizione (`contraceptionHelp`)
- **Ora:** *"Pillola, impianto, spirale, cerotto, iniezione. Circa metà delle atlete lo
  fa, e cambia cosa significano i tuoi segnali — quindi BAB deve saperlo per leggerli
  bene."*
- **Deve diventare:** *"I contraccettivi ormonali possono influenzare i segnali che il
  corpo ti manda. Per questo è importante prenderne nota."*

### 8.2 — Etichetta della terza opzione
- **Ora:** il terzo bottone del `PillGroup` (riga 311) usa `t.checkin.common.dontKnow`
  = *"Non lo so"* — condivisa con il check-in giornaliero.
- **Deve diventare** una chiave **dedicata** a questo schermo (per non toccare il testo
  del check-in, che è un contesto diverso), col testo che l'utente ha indicato:
  *"Preferisco non dirlo"* (stesso tono di `rhythmSkip`, coerenza con lo step 6).
  Aggiungere una chiave tipo `onboarding.contraceptionUndisclosed` in `it.ts`/`en.ts` e
  usarla al posto di `t.checkin.common.dontKnow` in quel `PillGroup`.

### 8.3 — Soglia d'età: da 15 a 16 — ✅ fatto
- **Era:** `Onboarding.tsx` riga 120 —
  `const asksContraception = cycle === 'tracking' && age !== null && age >= 15`
- **Confermato dall'utente (2026-08-12):** "da 16 anni in su" (`>= 16`, 16 compiuti
  inclusi) — implementato.

---

## Cose da NON toccare (per evitare regressioni mentre si lavora su questa lista)

- Il passo `whoSees` (chi vede cosa) e il passo `consent` (i due sì) — non nominati
  nella richiesta, restano come sono.
- `weekPe` (educazione fisica) e `weekEvents` (gare) — non nominati, restano come sono.
- Il riepilogo finale (`done`) — non nominato, ma **andrà aggiornato** una volta che sport
  e allenamenti diventano multipli (oggi mostra un solo `sport` e un solo blocco
  `weekTraining` — righe 316–332), altrimenti mostrerà dati incompleti dopo il punto 4/5.
  Segnato qui come effetto collaterale prevedibile, non come richiesta a sé.
- Google Sign-In, il codice a 6 cifre, tutto quello deciso nelle sessioni precedenti —
  non toccato da questa lista.

---

## Ordine consigliato di esecuzione

Le voci 1, 2, 3, 6.1, 6.2, 7.1, 7.3, 8.1, 8.2 sono **solo testo/copy** (e piccoli `if`),
basso rischio, si possono fare per prime e velocemente. Le voci 4, 5, 7.2 richiedono
decisioni di modello dati (schema Supabase) e componenti nuovi — vanno pianificate con
più cura, probabilmente in questo ordine perché 5 dipende da 4, e 7.2 è indipendente ma
è il pezzo di UI più nuovo (calendario multi-select) del lotto. La voce 8.3 è una riga
sola ma **va confermata con l'utente** prima di implementarla (vedi nota in 8.3).

> **Stato 2026-08-12:** le voci 1, 2, 3, 6.1, 6.2, 7.1, 7.3, 8.1, 8.2, 8.3 sono fatte e
> verificate (typecheck pulito, 8.3 confermata a `age >= 16`). Quello che segue è il
> progetto tecnico per le tre voci rimaste — 4, 5, 7.2 — scritto **prima** di toccare
> codice o schema, come richiesto. Non ancora implementato.

---

## Progetto tecnico per le voci 4, 5, 7.2

Letto tutto quello che tocca: `supabase/schema.sql`, `lib/repo.ts`, `lib/agenda.ts`
(usato da `screens/settings/AgendaDays.tsx`), `content/cycle.ts` (l'algoritmo che deriva
la fase dalle date) e `components/PillGroup.tsx`. Tre cose emerse leggendo il codice
vero che cambiano il progetto rispetto a come erano scritte le voci nel piano:

1. **Non esiste nessun `<select>` nell'app dell'atleta** — mai, in nessuna schermata.
   L'unico menu a tendina di tutto il progetto è in `screens/admin/Teams.tsx`, lato
   staff adulto. Per le atlete l'idioma è sempre **pillole toccabili**
   (`PillGroup.tsx`), e supporta già la selezione multipla — è la stessa componente
   usata per i sentimenti multipli nel check-in. Quindi niente dropdown per gli sport:
   pillole, come tutto il resto.
2. **`athlete_schedule` ha già una colonna `duration_min`**, oggi dichiarata nello
   schema ma mai scritta né letta da nessuna schermata. È esattamente quello che serve
   per "l'orario di fine indicativo" — **senza aggiungere nessuna colonna**: si chiede
   inizio e fine con due `<input type="time">`, e si salva la differenza in minuti.
3. **L'algoritmo del ciclo (`content/cycle.ts: readCycle`) non usa affatto la durata del
   ciclo** (quanti giorni sanguina): usa lo **spazio fra le date di inizio** di cicli
   diversi per stimare quanto dura il suo ciclo intero, e quindi in che fase è oggi. Con
   una sola data (un solo `period_start`) resta per forza in `confidence: 'one'`, il
   grado di incertezza più alto, e usa 28 giorni di default finché non arriva una
   seconda data. Questo è il punto più delicato dei tre — vedi 7.2 qui sotto.

---

### Voce 4 — Sport multipli, con le pillole

**Modello dati — additivo, zero migrazioni distruttive.** Nuova tabella, la colonna
`athletes.sport` **resta** (non si tocca, non si rimuove):

```sql
create table if not exists public.athlete_sports (
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  sport      text not null check (char_length(sport) <= 40),
  created_at timestamptz not null default now(),
  primary key (athlete_id, sport)
);
-- stessa RLS di ogni altra tabella dell'atleta: athlete_id = auth.uid()
```

`athletes.sport` diventa il suo sport **principale** (il primo che sceglie), tenuto
sincronizzato per compatibilità con chi lo legge già oggi
(`screens/settings/Index.tsx:64`, il riepilogo "Nome · Sport"). `athlete_sports` è la
lista completa, fonte di verità per tutto il resto. Non serve toccare `contraception`,
`cycle_status` o altro: la tabella è isolata.

**Lista sport.** Nuovo file `content/sports.ts`, un elenco curato con voce **"Altro"**
che apre un campo libero (così chi fa uno sport di nicchia non resta bloccata). Prima di
scrivere la lista definitiva serve un confronto veloce con te sui nomi — proposta di
partenza: atletica, pallavolo, calcio, nuoto, basket, ginnastica (artistica/ritmica),
danza, tennis, pallamano, arti marziali/judo, ciclismo, sci, hyrox/functional, altro.

**UI.** Onboarding step `sport`: `PillGroup` `size="lg"`, multi-select (come oggi il
check-in dei sentimenti), etichetta invariata (`t.onboarding.sportLabel`).

**Codice:** `repo.ts` — nuova `saveSports(athleteId, sports: string[])`, stesso pattern
di `saveSchedule`. `Onboarding.tsx` — `sport: string` diventa `sports: string[]`.
`AthleteDraft` in `repo.ts:172` — il campo `sport` resta com'è (va lo sport principale).

**Cosa NON cambia:** `sportHelp` promette che lo sport "cambia il vocabolario — gare o
partite". Oggi quella promessa non è collegata a nessun codice (l'unico `event_word` che
esiste è sul lato squadra, `teams.event_word`, non sull'atleta) — è un gap preesistente,
non introdotto da questa modifica. Non lo tocco qui; lo segnalo solo perché non vale la
pena "risolverlo per sbaglio" a metà mentre si lavora sugli sport.

---

### Voce 5 — Un allenamento per sport, con l'orario di fine

**Modello dati.** Una sola colonna nuova, additiva:

```sql
alter table public.athlete_schedule add column if not exists sport text;
```

`null` per le righe `pe`/`other` (che non hanno sport); per `training` è il nome dello
sport a cui quel giorno appartiene. Il vincolo di unicità va allargato per includere lo
sport, altrimenti due sport diversi allenati lo stesso giorno alla stessa ora
collidono:

```sql
alter table public.athlete_schedule drop constraint if exists athlete_schedule_athlete_id_weekday_kind_start_time_key;
alter table public.athlete_schedule add constraint athlete_schedule_uniq
  unique (athlete_id, weekday, kind, sport, start_time);
```

`duration_min` (già in schema, riga 377) diventa il posto dove va la fine indicativa:
si chiede `start` e `end` in UI, si salva `duration_min = end - start` in minuti; in
lettura si ricostruisce `end = start + duration_min`. Zero colonne nuove per questo
pezzo.

**UI — un'azione per schermo, ripetuta per ogni sport scelto.** Per ciascuno sport
selezionato al passo 4, in sequenza:
1. Giorni di allenamento (pillole, come oggi).
2. Orario di inizio.
3. Orario di fine indicativo (nuovo).

Con la descrizione fissa: *"Seleziona i giorni e l'orario. Puoi sempre modificarli se
cambia qualcosa."*

⚠️ **Cosa cambia nella barra di avanzamento.** Oggi `ORDER` in `Onboarding.tsx:79-82` è
un array fisso — un passo `training` sempre uguale. Con N sport diventa un array
**costruito dinamicamente** dopo che sa quanti sport ha scelto (3 schermate × N sport).
Con 1 sport non cambia niente rispetto a oggi; con 3 sport sono 9 schermate solo per gli
allenamenti, più le altre — la barra "passo X di Y" resta corretta solo se `Y` si
ricalcola con lei. Da tenere d'occhio in fase di test: con più di 2-3 sport l'onboarding
si allunga parecchio, ed è il tipo di cosa che si sente meglio provandola che
leggendola — vale la pena verificarlo a schermo prima di dirlo finito.

**Impostazioni (dopo l'onboarding).** Esiste già `/settings/agenda` →
`screens/settings/AgendaDays.tsx`, che oggi modifica i giorni per **un `kind` solo**
(`training` o `pe`), non per sport. Con più sport serve una tappa in più nella
navigazione — uno schermo per sport, non uno schermo per `kind` — quindi
`lib/agenda.ts` (`entriesOf`, `setDays`, `Entry`) prende un `sport` opzionale in più
oltre a `kind`, e `screens/settings/Agenda.tsx` (l'indice che oggi elenca "Allenamenti" /
"Ed. fisica") elenca una riga per sport quando `kind === 'training'`. Questo è il pezzo
che rende vera la promessa fatta in onboarding — "tutto modificabile dalla scheda
profilo" — quindi non è opzionale, va fatto insieme al resto della voce 5.

---

### Voce 7.2 — Calendario multi-selezione per le date del ciclo

Qui c'è una tensione reale fra quello che hai chiesto e come funziona oggi l'algoritmo
che stima la fase — meglio deciderla adesso che a metà codice.

**Il problema.** Oggi si chiedono **tre date di inizio** (le ultime tre volte che è
iniziato il ciclo). `readCycle()` in `content/cycle.ts` calcola la distanza *fra* quelle
tre date per stimare quanto dura il suo ciclo — non usa mai quanti giorni sanguina.
Se l'onboarding chiede solo "il tuo ultimo ciclo" e le fai segnare tutti i giorni di
*quello*, ottieni un'ottima informazione nuova (quanto dura il flusso) ma **perdi le
altre due date di inizio** — quindi il calcolo della fase resta bloccato al livello di
incertezza più basso (`confidence: 'one'`, ciclo stimato a 28 giorni di default) finché
non arriva una seconda data, cosa che oggi non ha nessun posto dove succedere dopo
l'onboarding (è nel backlog non bloccante del piano originale, mai costruito).

**Due strade, da scegliere prima di scrivere il componente:**

- **A — Ibrida (consigliata).** Tre schermate, sempre una domanda per volta, tutte col
  calendario invece dei campi data:
  1. *"Il tuo ultimo ciclo"* — calendario, **selezione multipla**: tocca tutti i giorni
     in cui ha sanguinato. Si salva il primo giorno toccato come `period_start` e
     l'ultimo come `period_end` — usa i due valori che lo schema ha già, **zero
     migrazioni** su `cycle_events`.
  2. *"E prima ancora, più o meno quando?"* — calendario, **un tocco solo** (il giorno
     di inizio), saltabile con "Non me lo ricordo".
  3. *"E prima di quello?"* — stesso pattern, saltabile.
  Risultato: la stima della fase resta buona quanto oggi (fino a 3 punti), *e* in più si
  registra per la prima volta la durata del flusso — un dato che oggi BAB non ha mai
  chiesto a nessuna.
- **B — Solo l'ultimo ciclo.** Una schermata sola, calendario multi-selezione, e basta.
  Più vicina alla lettera della richiesta (il titolo ora dice "il tuo ultimo ciclo",
  singolare). Ma **ogni** atleta che ha già il ciclo parte con la stima più incerta
  possibile, e resta così finché non esiste un modo — che oggi non c'è — di aggiungere
  altre date dopo l'onboarding.

Non decido da solo fra le due: cambiano cosa vede ogni atleta il primo giorno che apre
l'app. Te lo chiedo sotto.

**Il componente.** Nessuna libreria nuova — coerente col resto del progetto, che oggi
non ha nessun date-picker esterno, solo `<input type="date">` nativi. Un componente
piccolo e nuovo, `components/CalendarMultiSelect.tsx`: griglia del mese, frecce
avanti/indietro, tocco per accendere/spegnere un giorno, usato sia in modalità
multi-tocco (schermata 1) sia mono-tocco (schermate 2 e 3, se si va con l'opzione A).

**Cosa NON cambia:** `cycle_events` come tabella resta identica; la RLS che promette "il
ciclo non è mai in join con niente" (commento a riga 217 dello schema) non è toccata da
questa voce.

---

## Decisioni da prendere prima di partire

Tre cose, non di più — tutto il resto del progetto qui sopra è già una scelta presa
(riuso di `PillGroup`, riuso di `duration_min`, niente dropdown, niente libreria di
calendario esterna):

1. **Voce 7.2 — opzione A (ibrida, 3 schermate) o B (solo l'ultimo ciclo, 1 schermata)?**
   Vedi sopra: cambia quanto BAB "sa" del ciclo di ogni atleta dal primo giorno.
2. **Voce 4 — la lista sport proposta va bene, o la correggi/allunghi prima che diventi
   codice?**
3. **Voce 5 — con 3+ sport l'onboarding arriva a 9+ schermate solo per gli orari. Va
   bene così (coerente con "un'azione per schermo"), o preferisci un tetto — es. oltre
   i 2 sport, dal terzo in poi si chiede solo il giorno e l'orario si imposta dopo dalle
   impostazioni?**

> **Deciso con l'utente (2026-08-12):**
> 1. Voce 7.2 → **opzione A**, ibrida a 3 schermate. Da implementare così com'è
>    descritto sopra.
> 2. Voce 4 → lista sport confermata così com'è scritta sopra, nessuna modifica.
> 3. Voce 5 → nessun tetto. Un'azione per schermo resta valido anche con 3+ sport.
>
> Il progetto qui sopra è definitivo su questi tre punti. Prossimo passo:
> implementazione, nell'ordine 4 → 5 → 7.2 (5 dipende da 4).

---

## Stato 2026-08-12 (sera) — voci 4, 5, 7.2 implementate e verificate

Tutte e tre scritte insieme, perché 4 e 5 condividono `Onboarding.tsx` e lo schema.
Verificate con `npx tsc --noEmit` (pulito) e a schermo, con un server finto al posto di
Supabase: onboarding completo con due sport (Pallavolo + Nuoto, giorni/orari diversi),
calendario multi-selezione per il ciclo, e poi le stesse cose riaperte e modificate dalle
impostazioni. I dati salvati in locale corrispondevano esattamente a quello che avevo
scelto a schermo.

**File toccati:**
- `content/sports.ts` (nuovo) — lista sport + `sportLabel()`.
- `components/CalendarMultiSelect.tsx` (nuovo) — il calendario, nessuna libreria.
- `lib/sports.ts` (nuovo) — `setSports`, stesso pattern di diff di `agenda.ts`.
- `lib/agenda.ts` — `Entry`/`entriesOf`/`setDays` sanno di sport e di orario di fine
  (`duration_min`, riusato); nuove `sportsOf`, `endTimeOf`, `minutesBetween`.
- `lib/repo.ts` — `saveSports`, `listSports`, `removeSport`; `ScheduleEntry` con `sport`.
- `lib/db.ts`, `lib/hydrate.ts` — `athlete_sports` registrata per coda offline e idratazione.
- `screens/Onboarding.tsx` — riscritto: sport multi-select, un allenamento per sport
  (giorno → inizio → fine, tre schermate ripetute), tre schermate calendario per le date
  del ciclo (ultimo ciclo multi-giorno + due precedenti saltabili).
- `screens/settings/Profile.tsx`, `Agenda.tsx`, `AgendaDays.tsx`, `Index.tsx` —
  editabili dopo l'onboarding, come promesso: una riga per sport in agenda, orario di
  fine anche lì, sport multipli nel profilo.
- `App.tsx` — nuova rotta `/settings/agenda/allenamenti/:sport`.
- `supabase/schema.sql` — additivo: tabella `athlete_sports` nuova; `athlete_schedule`
  con colonna `sport` in più e vincolo di unicità allargato; `export_my_data` con la
  chiave `sports`; RLS estesa alla tabella nuova.

**✅ Applicato al database vero (2026-08-12).** Schema rilanciato nello SQL Editor di
Supabase; verificato con una chiamata REST diretta che `athlete_sports` e
`athlete_schedule.sport` rispondono `200 []` invece dell'errore di tabella/colonna
assente. Le voci 4, 5 e 7.2 sono complete: scritte, verificate a schermo, e ora anche
live sul server.
