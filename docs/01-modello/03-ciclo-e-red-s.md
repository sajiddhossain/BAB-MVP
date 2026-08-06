# 03 · Il layer ciclo e la rete di sicurezza RED-S

> Fonte: documento madre §4.4, §10, §12 + prototipi (blocco "Your Rhythm", journey W4/W7).

Questa è la parte del prodotto che nessun competitor fa bene, ed è anche quella dove è
più facile fare danno. Le regole qui sono tutte 🔴.

---

## Le tre regole non negoziabili

### 1. Il ciclo è **contesto**, mai un normalizzatore di precisione

> *"Il ciclo si usa come **contesto gentile** — non come normalizzatore di precisione,
> perché i cicli sono spesso irregolari nei primi anni dopo il menarca."* (§4.4)

**Conseguenza:** l'app non dirà mai "sei in fase luteale, quindi ti aspetti energia bassa".
Dirà, semmai, guardando *i suoi* dati di mesi: *"nelle ultime settimane la tua energia
tende a calare nei giorni prima del ciclo — potrebbe essere il tuo ritmo"*. Ipotesi da
verificare, non fatto.

Il copy del prototipo journey lo dice perfettamente:
> *"Nessuna di queste è una regola — è una mappa."*

### 2. Il tracking usa il **conteggio a ritroso** (youth green standard)

Non si chiede alla ragazza di identificare la sua fase. Si chiedono **le date recenti del
ciclo in onboarding**, e l'app deriva le fasi.

Il journey lo conferma: *"Imposti le date dei tuoi cicli recenti quando apri BAB per la
prima volta, così può mappare le tue fasi fin dal giorno uno — e la tieni aggiornata
mentre vai avanti."*

### 3. Domanda sulla contraccezione **in cima**

> *"Con una domanda sulla contraccezione in cima (ciclo naturale / contraccezione ormonale
> / disfunzione sospetta), perché ~metà delle atlete usa contraccezione che cambia il segnale."*

**Conseguenza:** questa domanda va in onboarding, prima di qualsiasi mappatura di fasi.
Senza, tutto il layer ciclo produce interpretazioni sbagliate per metà delle utenti.
⚠️ **Attualmente assente da tutti i prototipi.**

---

## La rete di sicurezza RED-S

> *"Cicli assenti o irregolari, o energia bassa, instradano silenziosamente a un check
> RED-S / bassa disponibilità energetica e a un invito a vedere un clinico —
> **mai una conversazione sul cibo**."* (§4.4)

Tre parole chiave, ognuna con un peso:

| Parola | Cosa impone |
|---|---|
| **Silenziosamente** | Nessun alert drammatico. Nessun badge rosso. Un percorso discreto. |
| **Invito a vedere un clinico** | L'app non valuta e non conclude. Instrada. |
| **Mai una conversazione sul cibo** | Il nudge non parlerà mai di alimentazione, porzioni, o "stai mangiando abbastanza?". |

### 🟡 Proposta di implementazione

**Trigger (silenziosi, valutati settimanalmente, mai in tempo reale):**
- ciclo assente da > 90 giorni in chi aveva già cicli regolari, **oppure**
- ≥ 3 cicli negli ultimi 6 mesi con gap fuori dalla sua norma, **oppure**
- energia media sotto la sua baseline personale per ≥ 2 settimane consecutive.

**Output:** una card discreta nella sezione Patterns, non una notifica push.

> **Un pensiero, quando ti va.**
> Nelle ultime settimane il tuo corpo sta mandando un paio di segnali che vale la pena
> far vedere a qualcuno che se ne intende — un medico dello sport, il tuo dottore, o un
> adulto di cui ti fidi che possa accompagnarti.
> Non è un allarme, e non c'è niente di sbagliato in te. È solo che certe cose si capiscono
> meglio con qualcuno che le sa guardare.
> [ Ho capito ] [ Come ne parlo? ]

Il secondo bottone apre uno script di comunicazione — coerente col principio "costruito
per essere detto ad alta voce".

🔵 **Blocco di rilascio:** questo testo e questi trigger devono essere firmati da un
medico dello sport prima di qualsiasi pilota.

---

## Cosa fanno oggi i prototipi

### Il blocco "🌙 Your Rhythm" (pre-check v2)

Copy educativo, poi **un solo bottone**: `🩸 On a period` (toggle on/off).
Poi un accordion "Learn about the four phases 👀" con la spiegazione delle quattro fasi.

**Il testo educativo (da conservare, è ottimo):**

> Dopo il tuo primo ciclo, anche il tuo corpo inizia a fare le sue mosse. Mentre il tuo
> ciclo attraversa quattro fasi diverse, crea un ritmo che tocca tutto: la tua energia,
> la fame, l'umore, il sonno e la concentrazione, in modi che sono unici per te.
>
> Ecco perché fare attenzione a come si muove ogni giorno ti dà uno strumento importantissimo
> per capire come rendere al meglio sentendoti al meglio.

**Le quattro fasi, come le racconta BAB:**

| Fase | Copy |
|---|---|
| 🩸 **Mestruale** — il ciclo | I giorni di sanguinamento. L'energia spesso cala e potresti aver voglia di andarci più piano — va benissimo. Perdi un po' di ferro adesso, quindi cibi ricchi di ferro (carne, fagioli, lenticchie, verdure a foglia) aiutano. |
| 🌱 **Follicolare** — la settimana dopo | Energia e umore di solito salgono mentre il corpo riparte. Potresti sentirti forte, fresca e con voglia di spingere — una bella finestra, se i tuoi canali sono d'accordo. |
| ☀️ **Ovulazione** — intorno alla metà | Spesso il tuo picco: energia, forza e sicurezza al massimo. Goditela, e scaldati bene. |
| 🌙 **Luteale** — la settimana o giù di lì prima del prossimo ciclo | L'energia può calare e arrivano le voglie luteali — hai più fame perché il tuo metabolismo accelera, quindi il tuo corpo ha davvero bisogno di **più** carburante. Anche l'umore può cambiare. Nutrilo, riposa un po' di più, e sii gentile con te stessa. |

**Chiusura:** *"Notare dove sei ti aiuta a **lavorare con il tuo corpo invece che contro**."*

### La versione v1 (archiviata) faceva qualcosa di diverso

Aveva **sei bottoni** di auto-classificazione:
`🩸 On my period · 🍫 Hungry / cravings / moody · ☀️ Strong & clear · 🌫️ Tired / tender / a bit off · 🌱 No periods yet · ☁️ Nothing / rather not say`

**Perché il passaggio a v2 è giusto** 🔴: la v1 chiedeva all'atleta di auto-classificare
il proprio stato ciclico, cioè esattamente quello che il documento madre vieta (conteggio
a ritroso, non auto-report di fase). Inoltre "Hungry / cravings" viola il principio food-safe.

**Perché però v2 ha perso qualcosa** ⚠️: la v1 gestiva esplicitamente due casi che v2 non
copre più:
- **`🌱 No periods yet`** — il menarca non è ancora arrivato. Su una popolazione 11–18 è
  una fetta enorme, e il copy v1 era rassicurante: *"Anche questo del tutto normale — i
  corpi iniziano ai loro tempi, in un punto qualsiasi di questi anni."*
- **`☁️ Nothing / rather not say`** — il diritto esplicito a non rispondere.

🟡 **Proposta:** in v2 il blocco Rhythm deve avere tre stati possibili, decisi in
**onboarding** e non ogni giorno:
1. *Ho già il ciclo* → mostra il toggle giornaliero + le fasi derivate dalle date.
2. *Non l'ho ancora avuto* → il blocco Rhythm diventa solo educativo, nessun input giornaliero.
3. *Preferisco non dirlo* → il blocco sparisce del tutto, e si può riattivare da impostazioni.

---

## La vista Patterns e le fasi

Nel prototipo journey, i grafici hanno le **bande di fase colorate sullo sfondo**:
`Menstrual (period) · Follicular · Ovulation · Luteal`.

La derivazione delle fasi nel prototipo (dati campione, deterministici):

```
giorno del ciclo 0–4   → mestruale
giorno del ciclo 5–11  → follicolare
giorno del ciclo 12–15 → ovulazione
giorno del ciclo 16+   → luteale
```

Con date di inizio ciclo volutamente irregolari (gap di 28, 29, 29 giorni) per mostrare
che il modello non assume regolarità.

🟡 **Nota:** nella versione reale queste fasi devono essere derivate dalle date che lei
inserisce, con **incertezza visibile** — es. le bande sfumate ai bordi invece che
nette — per non comunicare una precisione che non abbiamo. È un dettaglio grafico
piccolo con un significato scientifico grande.

---

## Cosa entra nell'MVP, e il problema di reciprocità

> Aggiunto dopo una domanda giusta: *«ma abbiamo deciso di metterci anche le funzioni di
> ciclo?»* Sì — ma vale la pena essere precisi su **cosa** entra, perché la risposta ingenua
> nasconde un difetto.

### Dentro la v1

| | Dove |
|---|---|
| Le tre opzioni in onboarding (`ce l'ho` / `non ancora` / `preferisco non dirlo`) | Onboarding, schermata 5 |
| Date degli ultimi cicli (conteggio a ritroso) | Onboarding, schermata 5 |
| Domanda sulla contraccezione ormonale | Onboarding, schermata 5 |
| Toggle giornaliero «oggi ho il ciclo» | Blocco Rhythm nel pre-check |
| Contenuto educativo sulle quattro fasi | Blocco Rhythm, accordion |
| Derivazione delle fasi dalle date | `content/cycle.ts`, calcolata a runtime |
| Tabella `cycle_events` con RLS separata | Schema, dal giorno uno |

### Fuori dalla v1

| | Perché |
|---|---|
| **Grafico dei segnali con le bande di fase** (Patterns stadio 3) | Richiede ~9 settimane di dati per esistere |
| **Rete di sicurezza RED-S** | 🔴 Bloccata dalla firma clinica, non dal design |

---

### ⚠️ Il difetto che ne esce

Messe insieme, quelle due righe producono questo:

> **Le si chiedono le date del ciclo il primo giorno, e per nove settimane non le si
> restituisce niente in cambio.**

È un cattivo scambio, e per questa utente in particolare. Il dato più intimo che l'app
raccoglie è anche l'unico che non produce nulla di visibile per due mesi. Su un'adolescente
che sta decidendo se fidarsi, è esattamente il tipo di asimmetria che fa disinstallare.

E c'è un secondo effetto: **rende la richiesta più difficile da giustificare**. Se un
genitore chiede *«perché l'app vuole sapere questo?»*, la risposta non può essere
«fra due mesi te lo dico».

### 🟡 La correzione: una vista minima del ritmo, in v1

Non il grafico dei pattern — quello resta fuori, e giustamente. Una cosa molto più piccola,
dentro la tab «Me»:

```
┌─────────────────────────────────┐
│  🌙 IL MIO RITMO                │
│                                 │
│  Oggi sei nella fase            │
│  🌱 Follicolare · giorno 8      │
│                                 │
│  In questa fase energia e umore │
│  di solito salgono mentre il    │
│  corpo riparte. Potresti sentir-│
│  ti forte e con voglia di       │
│  spingere — se i tuoi canali    │
│  sono d'accordo.                │
│                                 │
│  ○━━━●━━━━○━━━○                 │
│  🩸   🌱   ☀️   🌙              │
│                                 │
│  Le date che hai messo dicono   │
│  circa questo. Il tuo ciclo sta │
│  ancora trovando il suo ritmo,  │
│  quindi è una mappa, non un     │
│  orario.                        │
└─────────────────────────────────┘
```

**Perché regge il test delle cinque domande:**

1. *Le dice cosa fare o le insegna a capirlo?* Insegna: nomina la fase e dice cosa **può**
   voler dire, sempre con «se i tuoi canali sono d'accordo».
2. *Aggiunge secondi al check-in?* Zero. È una vista, non un input.
3. *La confronta con qualcun altro?* No.
4. *Tocca cibo o corpo come forma?* No.
5. *Produce qualcosa da dire a un adulto?* Sì — è il primo mattone di
   *«sono nella settimana prima del ciclo, mi aspetto di essere più stanca»*.

**Costo:** basso. Il contenuto educativo delle quattro fasi **è già scritto** (sta nel
blocco Rhythm), la derivazione della fase dalle date è una ventina di righe, e la tabella
`cycle_events` c'è già nello schema.

**Valore:** restituisce qualcosa dal **giorno uno** in cambio del dato più intimo che
chiediamo. È DECODE nella sua forma più semplice, e rende la richiesta in onboarding
onesta invece che a credito.

🔵 **Guardrail obbligatorio:** l'incertezza va mostrata, non nascosta. Mai un conto alla
rovescia («mancano 6 giorni al ciclo»), mai una previsione. Le fasi si mostrano sfumate ai
bordi, e la frase *«è una mappa, non un orario»* resta sempre visibile. Nei primi anni dopo
il menarca i cicli sono irregolari (§4.4): una precisione finta qui farebbe più danno che
non mostrare niente.

---

## Riepilogo dei gap su questo layer

| Gap | Gravità |
|---|---|
| Domanda contraccezione assente | 🔴 Alta — invalida l'interpretazione per ~metà delle utenti |
| Nessuna gestione "menarca non ancora arrivato" in v2 | 🔴 Alta — fascia 11-13 |
| Nessun opt-out esplicito in v2 | 🟠 Media — richiesto dal principio privacy |
| Rete di sicurezza RED-S non implementata | 🔴 Alta — è un requisito di sicurezza |
| Date del ciclo non raccolte (nessun onboarding nei prototipi) | 🔴 Alta — senza, tutto il layer non funziona |
