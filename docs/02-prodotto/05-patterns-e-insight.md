# 05 · Patterns e insight — la vista "Me"

> Fonte: `fonti/prototipi/03-journey-16-settimane--v1.html`, tab "📈 My Patterns"
> + documento madre §8, §9.

---

## Cosa fa questa vista

È il **DECODE** dello schema della founder: il momento in cui i puntini diventano un
pattern, e lei capisce com'è fatta.

Il copy del prototipo lo dice bene:

> Qui è dove scatta. Ogni check-in quotidiano diventa un puntino — e nell'arco di settimane,
> i puntini rivelano i tuoi pattern.

---

## Struttura

```
┌──────────────────────────────────────┐
│  [🔋 Energia] [🎯 Focus]             │   ← selettore segnale
│  [💜 Umore ] [🩹 Dolore]             │
├──────────────────────────────────────┤
│                                      │
│  ▓▓▒▒▒▒░░░░████▓▓▒▒▒▒░░░░████        │   ← bande di fase ciclo (sfondo)
│    ╱╲    ╱╲                          │
│   ╱  ╲__╱  ╲___╱╲___                 │   ← la sua linea del segnale
│                                      │
│  ▓ Mestruale  ▒ Follicolare          │
│  ░ Ovulazione █ Luteale              │
├──────────────────────────────────────┤
│  La tua media per fase del ciclo     │
│  ┌────┬────┬────┬────┐               │
│  │3.1 │4.2 │4.5 │3.4 │               │
│  └────┴────┴────┴────┘               │
├──────────────────────────────────────┤
│  🔎 Cosa BAB ha notato per te        │
│  🌙 [insight 1]                      │
│  📚 [insight 2]                      │
│  ☀️ [insight 3]                      │
└──────────────────────────────────────┘
```

**Quattro segnali selezionabili:** 🔋 Energia · 🎯 Focus · 💜 Umore · 🩹 Dolore.

⚠️ Nota: questi quattro **non coincidono** con i canali catturati dal check-in
(sonno, energia, idratazione, muscoli, headspace). `Focus` e `Umore` sono derivati da
Headspace; `Dolore` dalla mappa corporea. Va bene — sono viste, non input — ma la
derivazione va definita esplicitamente e non è documentata nei prototipi. 🔵

---

## La frase più importante dell'intera vista

> I pattern che BAB ha notato finora — pensali come **idee, non fatti**. L'esperta di te
> sei tu: tieni quelli che ti sembrano veri, e metti in dubbio quelli che non ti tornano.

🔴 Questa frase, o una sua equivalente, deve stare **sopra ogni insight generato**, sempre.

È la traduzione in UI dell'umiltà sull'evidenza (§8) e della settimana 6 del percorso
("le cause sono un mix"). Senza di essa, un'app che mostra "la tua energia cala prima del
ciclo" sta facendo un'affermazione clinica su una minorenne basata su otto settimane di
self-report. Con essa, sta facendo esattamente il suo lavoro: proporre un'ipotesi e
restituire l'autorità all'atleta.

🟡 **Rafforzamento proposto:** ogni insight ha due bottoni:
> `👍 Mi torna` · `🤔 Non mi torna`

Tre effetti, tutti buoni:
1. L'atleta esercita attivamente il giudizio invece di ricevere passivamente (Settimana 6).
2. Il modello raccoglie feedback per pesare gli insight futuri.
3. Rende visibile e concreta la promessa "tu resti l'esperta di te".

---

## Gli insight campione (dal prototipo)

Sono esempi generati su dati sintetici, ma il **tono** è il prodotto e va conservato.

### 🔋 Energia
- 🌙 La tua **energia cala nei pochi giorni prima del ciclo** (luteale tardiva) e durante — poi risale dopo. Quello è il tuo ritmo, non un crollo. Pianifica un giorno o due Gentle lì.
- 📚 Due delle tue settimane più basse coincidevano con le **settimane d'esame**, non col tuo ciclo — la prova che lo stress scolastico spende dalla stessa batteria dell'allenamento.
- ☀️ Sei **più energica nelle fasi follicolare e ovulatoria** — un'ottima finestra per cercare sessioni Upbeat toste.

### 🎯 Focus
- 🎯 Il tuo **focus è più acuto verso la metà del ciclo** (ovulazione) — timing perfetto per sessioni tecniche o ricche di abilità.
- 🌫️ Il focus tende a disperdersi un po' nella tua **settimana luteale tardiva e durante gli esami** — sessioni più corte e semplici funzionano meglio lì.

### 💜 Umore
- 💜 Il tuo **umore tende a salire nella fase follicolare** e ad ammorbidirsi prima del ciclo. Sapere che sta arrivando rende più facile essere gentile con te stessa.
- 🔗 Il tuo umore e la tua energia si muovono insieme quasi tutti i giorni — quando uno cala, controlla l'altro, e controlla anche cos'è successo fuori dal campo.

### 🩹 Dolore
- 🩹 **Dolori e crampi salgono durante il ciclo e la settimana prima** — scaldarsi più a lungo e andare Steady aiuta a lavorarci insieme.
- 🛡️ La maggior parte del tuo dolore è del tipo quotidiano che passa col riscaldamento. Continua a stare attenta al **dolore protettivo** (acuto, articolare/osseo, su un lato, peggiore di notte) — quello è il tipo di cui parlare.

---

## Le tre regole di scrittura degli insight

Analizzando i dieci esempi sopra, emerge una struttura ricorrente che vale la pena
formalizzare come **regola per generarne di nuovi**:

```
[OSSERVAZIONE sui suoi dati]  +  [NORMALIZZAZIONE]  +  [COSA FARCI]
```

Esempio smontato:
> *"La tua energia cala nei giorni prima del ciclo"* ← osservazione
> *"Quello è il tuo ritmo, non un crollo"* ← normalizzazione
> *"Pianifica un giorno o due Gentle lì"* ← cosa farci

**Le tre regole:**

1. 🔴 **Mai un'osservazione senza normalizzazione.** Ogni pattern che potrebbe leggersi
   come "c'è qualcosa che non va in me" va immediatamente riformulato come "così sei fatta".
2. 🔴 **Sempre un'azione, e sempre alla sua portata.** Non "parla col tuo nutrizionista":
   *"scaldati più a lungo"*, *"pianifica un giorno Gentle"*, *"sessioni più corte"*.
3. 🔴 **Almeno un insight per segnale non deve riguardare il ciclo.** L'insight sugli
   esami è il migliore del set proprio perché **smentisce** l'interpretazione ciclica.
   Un'app che attribuisce tutto al ciclo di una ragazza fa un danno educativo.

> Quest'ultima regola è la più facile da violare e la più importante. Il ciclo è il
> differenziante del prodotto, il che rende molto tentante spiegare tutto con esso.

---

## Il disclaimer sui dati campione

> Questi sono dati campione per mostrare come funziona. Nel percorso vero, i tuoi check-in
> quotidiani riempiono i segnali e le bande del ciclo vengono dalle date che hai impostato —
> quindi i pattern che appaiono sono solo tuoi.

Da conservare nella demo/onboarding. È onesto e insegna a leggere il grafico prima di
avere dati propri.

---

## Il problema dei primi giorni

⚠️ Il prototipo mostra 16 settimane di dati. **Una vera utente al giorno 3 non ha niente.**

Questo è il rischio di abbandono numero uno di tutto il prodotto: la sezione più
interessante è vuota esattamente quando l'atleta sta decidendo se l'app vale il suo tempo.

🟡 **Proposta — i tre stadi** (già introdotti in [metrica](../01-modello/04-metrica-body-literacy.md)):

| Stadio | Quando | Cosa mostra | Copy |
|---|---|---|---|
| **Raccolta** | Sett. 1–3 | I puntini grezzi, ben disegnati. Zero interpretazione. Un contatore visibile di quanto manca. | *"Stiamo ancora imparando come sei fatta. Ancora N check-in e i primi pattern iniziano ad apparire."* |
| **Prime ipotesi** | Sett. 4–8 | 1–2 insight, molto cauti, con i bottoni 👍/🤔 | *"È presto, ma una cosa inizia a intravedersi…"* |
| **Fingerprint** | Sett. 9+ | Il set completo, la vista per fase, il trend del prediction error | *"Questa sei tu."* |

Il contatore nello stadio 1 è importante: trasforma il vuoto da **fallimento** ("non c'è
niente") in **progresso** ("mancano 8"). È una delle poche meccaniche tipo-gioco che
il prodotto può permettersi senza tradire i principi, perché non premia la performance,
premia la presenza.

---

## La body-story — il pezzo che manca

Il §11 la richiede esplicitamente:

> Una **"body-story" settimanale condivisibile** — un visual semplice di cosa ha segnalato
> il suo corpo — che lei può passare a un coach, un genitore o un fisio.

**Non esiste in nessun prototipo.** 🔴 È l'unico output che incarna il terzo pilastro dello
schema della founder (COMMUNICATE) ed è, a mio parere, la feature più strategica non ancora
disegnata: è ciò che rende il prodotto interessante per una squadra **senza** dare alla
squadra accesso ai dati dell'atleta.

🟡 **Proposta di specifica:**

```
┌─────────────────────────────────┐
│  LA MIA SETTIMANA               │
│  12–18 maggio                   │
│                                 │
│  Tempi:  ⚡⚡🌊🍃🌊⚡–           │
│                                 │
│  Ho segnalato più spesso:       │
│  📍 Polpaccio destro — teso     │
│  📍 Schiena bassa — dolorante   │
│                                 │
│  La mia energia: ~~~~~~~        │
│  Questa settimana ho notato:    │
│  "[la sua nota, se ne ha scritte]"│
│                                 │
│  ┌───────────────────────────┐  │
│  │ Scegli cosa condividere:  │  │
│  │ ☑ Tempi                   │  │
│  │ ☑ Dove sento qualcosa     │  │
│  │ ☐ Energia e umore         │  │
│  │ ☐ Il mio ciclo            │  │
│  └───────────────────────────┘  │
│                                 │
│  [ Condividi ]  [ Solo per me ] │
└─────────────────────────────────┘
```

**Regole di design 🔴:**
- Il ciclo è **escluso di default** e ha una spunta a parte, sempre.
- Nessun invio automatico, mai. Lei preme il bottone, ogni volta.
- L'output è un'immagine o un PDF, non un link a una dashboard: lei controlla cosa vede
  il destinatario e non gli dà accesso continuativo.
- Nessun punteggio nell'immagine. Solo segnali, tempi e le sue parole.
