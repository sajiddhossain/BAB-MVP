# Prototipi

Prototipi funzionanti, self-contained, aprili nel browser.

I primi due partono dalla v2 in [`../fonti/prototipi/`](../fonti/prototipi/) e chiudono i
tre buchi di sicurezza trovati nell'analisi — **nient'altro è cambiato**: copy, flusso,
formula del tempo e gli 8 esiti sono identici, così v2 e v3 restano confrontabili quando
li testi con le atlete.

Gli altri due **non esistevano affatto** nel materiale, ed erano i due pezzi senza cui il
prodotto non regge: l'onboarding e la body-story.

| File | |
|---|---|
| `01-pre-training-check-in--v3.html` | Predict → Tune in → Compare → Adjust |
| `02-post-training-reflect--v3.html` | Look back → Sense → Learn → Recover |
| `03-onboarding--v1.html` | Le 6 schermate di setup — **nuovo, non esisteva nel materiale** |
| `04-body-story--v1.html` | La story settimanale condivisibile (§11) — **nuovo, non esisteva nel materiale** |
| `05-oggi-home--v1.html` | La home "Oggi" e i suoi 6 stati — **nuovo** |
| `06-me-patterns--v1.html` | La vista "Me" nei tre stadi di maturità dei dati — **nuovo** |
| `07-il-mio-ritmo--v1.html` | La vista del ciclo, che restituisce valore dal giorno uno — **nuovo** |

Lingua: **inglese**, come la v2 — così il lavoro non è bloccato dalla
[decisione D1 sulla lingua](../docs/04-brainstorming/03-decisioni-aperte.md).

---

# 01 · 02 — Cosa è cambiato nei check-in

### 1 · Il lessico delle sensazioni, in tre gruppi

**Prima:** 8 opzioni, tutte negative.
**Ora:** 14 opzioni in tre gruppi visivamente distinti.

| Gruppo | Voci | Perché |
|---|---|---|
| **Feels good** | 💪 Strong · 🔥 Warm / switched on · 🪶 Light · ✨ All fine | §4.3 chiede *"opzioni neutre e positive incluse, per costruire literacy ed evitare l'ipervigilanza"*. Nella v2 mancavano tutte. Un lessico fatto solo di parole negative insegna che il corpo è un posto da cui arrivano solo problemi. |
| **Worth noticing** | Tight/stiff · Sore/achy · Burning · Heavy/tired · Tender · Buzzy/tingly/numb · Crampy · Sharp | Le 8 della v2, con `numb` aggiunto alla voce formicolio (cautela neurale, §4.3). |
| **Worth showing someone** | **Gives way / unstable** · **Swollen / hot** | 🔴 Le due bandiere rosse del §4.3 che **non esistevano** nel lessico v2. L'atleta non aveva le parole per dirle. |

### 2 · Le bandiere rosse instradano da sole al Care mode

Nella v2 il Care si attivava **solo** se l'atleta rispondeva "sì" alla domanda
*"senti dolore del tipo 🛡️ protettivo?"* — cioè le si chiedeva di fare lei la
classificazione clinica. È esattamente ciò che il modello dice di non chiederle.

Ora: toccare `Gives way / unstable` o `Swollen / hot` apre il Care mode **da solo**,
qualunque cosa lei risponda alla domanda binaria.

> **Verificato:** con tutti i canali al massimo, tempo `⚡ Upbeat`, e risposta **"No"**
> alla domanda sul dolore protettivo, il Care mode si attiva comunque e nomina il segnale
> — *"You named gives way / unstable in your left knee — that's the kind of signal that
> gets looked at rather than trained through."*

Compare anche una nota immediata sotto la mappa, nel momento in cui lo tocca, invece di
farla aspettare fino alla fine.

### 3 · Intensità e tag di comportamento

§4.3: *"Ogni tap prende anche un'intensità (1–5) e un tag di comportamento."*
Nella v2 non c'erano nessuno dei due.

Dopo aver scelto la sensazione si apre:
- **How strong is it?** → `A little` · `Quite a bit` · `A lot`
  *(3 livelli invece di 1–5: meno preciso, molto più veloce e onesto per un'adolescente)*
- **And what does it do?** → `Eases as I warm up` · `Worse under load` · `There even at rest`

Il secondo è il punto: **il tag di comportamento è il discriminante clinico** tra dolore
adattivo e protettivo. Chiederlo come descrizione concreta ("cosa fa?") sposta il lavoro
di classificazione dall'atleta al sistema.

Scegliere la sensazione non registra più l'entry: la registra il bottone **Add this**,
attivo solo quando ci sono tutti e tre i pezzi. Il chip risultante è più ricco:

```
🛡️ Left knee — Gives way / unstable · quite a bit · worse under load  ×
```

### 4 · Segnalazione immediata sempre a un tocco

§5: *"**Anytime:** acute red-flag capture (sharp pain, giving-way) is always one tap away."*
Nella v2 non c'era nessun modo di registrare un infortunio fuori dal flusso del check-in.

Ora un bottone **🩹 I got hurt** è sticky in alto in ogni momento. Apre un pannello:

```
dove?  →  cosa senti?  →  Care mode + le parole per dirlo
```

- Le zone del corpo sono **generate dalla stessa mappa** del check-in (27 regioni uniche),
  così il vocabolario resta identico e non si crea un secondo linguaggio.
- Le sensazioni qui sono pesate verso l'acuto: 5 delle 7 sono bandiere rossa.
- Il Care mode adatta l'urgenza: `right now` per una bandiera rossa, `today` altrimenti.
- Chiude con una frase da copiare, coerente col principio *"costruito per essere detto
  ad alta voce"*:
  > *"I've got sharp / stabbing in my left knee — I need to stop and get it looked at."*

Chiudibile con ×, click fuori, o Escape.

---

## Cosa **non** è cambiato

Deliberatamente. Ogni altra modifica avrebbe reso impossibile confrontare v2 e v3 con le
atlete:

- Il copy di tutto il resto
- I 4 canali + Headspace, e le loro emoji-scale
- La formula del tempo e le soglie (20 / 13)
- I 3 tempi, i loro testi, e il bottone di swap
- Gli 8 esiti della card Learn nel post
- Il blocco "Decode your ache"
- Il blocco ciclo

---

# 03 · Onboarding

Non esisteva in nessun prototipo, e senza di esso metà del modello non funziona.
Sei schermate, ~90 secondi.

| # | Schermata | Nota |
|---|---|---|
| 1 | **Benvenuto** | Due colonne *cos'è / cosa non è*. Setta subito l'aspettativa: niente punteggi, niente cibo, il coach non ti guarda. |
| 2 | **Permesso** 🔴 | Due consensi obbligatori (atleta + tutore) e uno **opzionale** per la ricerca, con detto chiaramente che tutto funziona lo stesso se dice no. §9. |
| 3 | **Età** 🔴 | Determina la scalatura della mappa corporea (§10). |
| 4 | **Sport e giorni** | Determina quando aspettarsi un check — e quando stare zitti. Saltabile. |
| 5 | **Il tuo ritmo** 🔴 | Il pezzo che sbloccava tutto. |
| 6 | **Riepilogo** | Cosa BAB sa di lei + cosa questo attiva dietro le quinte. |

### La schermata 5 è quella che conta

Tre stati, non uno: `Ce l'ho già` · `Non l'ho ancora avuto` · `Preferisco non dirlo`.
Il secondo e il terzo non sono ripieghi — per una fascia 11–18 sono risposte frequentissime
e devono sembrare normali quanto la prima.

Se sceglie il primo, e **solo allora**, compaiono:
- **Le date degli ultimi cicli** (fino a 3). Conteggio a ritroso, lo youth green standard —
  non le si chiede mai di auto-classificare la fase. Il prototipo lo spiega:
  > *"Perché BAB chiede le date invece di 'in che fase sei?' Perché ricavarlo dalle date è
  > il modo affidabile — indovinare la propria fase non lo è, specie nei primi anni.
  > Non dovrai mai classificarti da sola."*
- **La domanda sulla contraccezione ormonale** — quella che mancava e che riguarda ~metà
  delle atlete. Con il motivo detto: *"cambia cosa significano i tuoi segnali, quindi BAB
  deve saperlo per leggerli bene."*

E un blocco privacy che vale come promessa contrattuale:
> 🔒 Il tuo ciclo non viene mai condiviso con un coach, mai mostrato a nessuno, e mai incluso
> in niente che mandi — a meno che non lo spunti tu, ogni singola volta.

### La schermata 6 mostra *cosa ha sbloccato*

Il riepilogo non elenca solo le risposte: mostra la **configurazione derivata**. È il modo
più diretto di far capire — a te, alla founder e agli sviluppatori — perché l'onboarding
non è burocrazia:

```
bodyMap        = "junior" (~12 regions, ages 11–13)
cycleLayer     = on
phaseMapping   = "from 2 cycles — usable"
signalReading  = "adjusted for hormonal contraception"
redsSafetyNet  = on  // silent, weekly, never a food conversation
dailyCheckins  = 4 days/week
researchShare  = true  // de-identified
```

**Gate verificati:** consenso atleta+tutore obbligatori (quello ricerca no), età obbligatoria,
e se sceglie "ce l'ho già" non si prosegue senza almeno una data **e** la risposta sulla
contraccezione.

---

# 04 · Body-story

La feature del §11 che non esisteva da nessuna parte, e che rende il prodotto proponibile
a una squadra senza dare alla squadra i dati dell'atleta.

### Come funziona

`scegli cosa includere → vedi esattamente cosa vedranno → manda`

Cinque blocchi selezionabili, con anteprima che si aggiorna dal vivo:

| Blocco | Default | |
|---|---|---|
| ⚡ I miei tempi | **on** | La settimana in una riga di icone |
| 📍 Dove ho sentito cose | **on** | I punti più frequenti; le bandiere rossa si distinguono |
| 🔋 La mia energia | off | Una **forma**, senza asse e senza numeri |
| 💬 Quello che ho scritto | off | La sua nota, tra virgolette |
| 🌙 Il mio ciclo | **off** 🔴 | Bordo tratteggiato, separato dagli altri, spento sempre |

### Le regole rispettate

- 🔴 **Il ciclo è escluso di default**, ha una spunta a parte visivamente distinta, e il copy
  dice che attivarlo vale **per questa card soltanto**, mai per la prossima.
- 🔴 **Nessun punteggio.** L'energia è una linea senza asse: si vede la *forma* della
  settimana, non un voto.
- 🔴 **Nessun link, nessuna dashboard, nessun login.** Il copy lo dice esplicitamente:
  *"così quello che mandi è tutto quello che ricevono."*
- 🔴 **Nessun invio automatico.** Il bottone è disabilitato se non ha selezionato niente.

### La parte migliore: la frase si costruisce da sola

Dopo "Manda", compaiono **le parole per aprire il discorso**, generate da ciò che ha
effettivamente scelto — non un template fisso:

> *"Posso farti vedere la mia settimana? Ho avuto una fitta al ginocchio sinistro e vorrei
> che qualcuno lo guardasse, il polpaccio destro è stato teso quasi tutta la settimana, e
> venerdì mi serviva un giorno Gentle."*

Se una bandiera rossa è tra le cose incluse, **va sempre in prima posizione**. E la frase è
tagliata a tre clausole di proposito: una frase che riesce davvero a dire ad alta voce vale
più di una completa.

Questo chiude il cerchio dello schema strategico della founder: **DECODE → DECIDE → COMMUNICATE**.

---

---

# 05 · La home "Oggi"

L'unica schermata che l'atleta vede ogni giorno, e nessun prototipo del materiale la aveva.
Il file ha uno **switcher demo** in cima per passare tra i sei stati.

**La regola che tiene in piedi la schermata:** in qualsiasi momento c'è **una sola cosa
ovvia da fare**. Tutto il resto sta un livello sotto.

| Stato | Cosa mostra |
|---|---|
| ☀️ **Niente fatto** | Una card, un bottone. Il default. |
| 🌊 **Sintonizzata, si allena** | Il tempo che ha scelto lei, e il passo successivo in tono più calmo — perché non è ancora ora |
| ✅ **Giornata chiusa** | Previsto vs allenato, cosa ha imparato, e **niente da fare**: l'app lo dice invece di inventarsi un compito |
| 🌱 **Giorno di riposo** 🔴 | Una riflessione **opzionale**, mai il flusso completo (§5). Il bottone è calmo, non arancione: non è un task. |
| 👋 **Torna dopo un'assenza** | Nessuno streak rotto, nessun contatore azzerato, nessuna colpa. *"Non si perde niente, e niente si resetta."* |
| 🛡️ **Care attivo** | Il banner sta **sopra** tutto e resta finché non si risolve |

### Due scelte che vale la pena difendere

**Il Care mode è deliberatamente calmo.** L'istinto sarebbe fare rumore visivo su una
bandiera rossa. Ma §10 dice *"nessun punteggio nocebo, proteggi uno spazio neutro e a
bassa attivazione"* — e un'adolescente allarmata segnala **meno**, non di più. La serietà
si comunica con la chiarezza dell'istruzione, non col colore.

**Il giorno saltato non ha conseguenze.** Nessun "hai perso la serie". La missione della
settimana resta esattamente dov'era. È l'applicazione diretta del principio "gioco a bassa
posta" (§7): nel momento in cui la costanza diventa una performance, il meccanismo si rompe.

---

# 06 · La vista "Me"

Il rischio di abbandono numero uno di tutto il prodotto:

> **Per tre settimane l'app non ha niente da mostrarle — ed è esattamente quando decide
> se vale il suo tempo.**

La risposta non è inventare insight su nove giorni di dati. È rendere i tre stadi
**espliciti**, e far crescere visibilmente il valore con l'uso.

| Stadio | Quando | Cosa mostra |
|---|---|---|
| **Collecting** | Sett. 1–3 | Nessun insight, nessun grafico. Un **contatore** (`9 di 21 check-in`), la griglia dei puntini che si riempie, e i punti che ha nominato di più — senza conclusioni. La body-story è visibilmente bloccata. |
| **First hunches** | Sett. 4–8 | Il trend della sua lettura + **un solo** insight, formulato al condizionale (*"è presto, ma…"*), con 👍/🤔 |
| **Your fingerprint** | Sett. 9+ | Il grafico completo con le bande di fase, le medie per fase, tre insight |

### Il contatore è la mossa che risolve il problema

Trasforma il vuoto da **fallimento** ("non c'è niente") a **progresso** ("ne mancano 8").
È l'unica meccanica tipo-gioco che il prodotto può permettersi, perché **premia la presenza,
non la performance** — e un giorno Gentle riempie un puntino esattamente come un giorno
Upbeat.

### I pollici su/giù non sono cortesia

Ogni insight ha `👍 Mi sembra proprio io` / `🤔 Non mi torna`. Fanno tre lavori insieme:
esercitano il giudizio (è letteralmente la Settimana 6 del percorso), danno al modello
un segnale su quali insight funzionano, e rendono *cliccabile* la promessa "tu resti
l'esperta di te".

### Due dettagli che sembrano piccoli e non lo sono

**Almeno un insight per segnale non parla del ciclo.** Nel prototipo è quello sulle
settimane d'esame — che **contraddice** la lettura ciclica. Il ciclo è il differenziante
del prodotto, il che rende tentante spiegare tutto con esso: un'app che spiega tutto di
una ragazza con il suo ciclo fa un danno educativo.

**Il trend della lettura sale, non scende.** Misura la stessa cosa del "divario che si
accorcia", ma disegnato al contrario: una linea che scende si legge come *"sto peggiorando"*
per una tredicenne, e questo è l'unico grafico che non deve mai sembrare un verdetto.
Nessun asse numerico, nessuna percentuale.

---

---

# 07 · Il mio ritmo

Nata da una domanda: *«ma abbiamo deciso di metterci anche le funzioni di ciclo?»*
Sì — ma mettendo in fila cosa entra e cosa esce, saltava fuori un difetto:

> Le si chiedono le date del ciclo il primo giorno, e per nove settimane non le si
> restituisce niente.

Il grafico dei segnali con le bande di fase resta fuori dalla v1 (serve ~9 settimane di
dati). Questa vista è molto più piccola e riempie quel vuoto: **dove sei adesso, e cosa
può voler dire.**

### Le tre regole che la governano

**1 · Nessun conto alla rovescia, nessuna previsione.** 🔴
La tentazione, nella fase luteale, è scrivere *«il ciclo arriva fra 3 giorni»*. Non si fa.
Verificato con un controllo automatico sui testi di tutti gli stati.

**2 · L'incertezza si mostra, non si nasconde.**
La sfumatura fra le fasi si **allarga** quando la lettura è meno affidabile:
`5%` con cicli regolari · `11%` con cicli variabili · `14%` con una sola data.
Il marcatore "oggi" è un alone morbido, non una linea. E la frase *«è una mappa, non un
orario»* resta sempre visibile.

**3 · Oltre una lunghezza intera senza una data nuova, BAB smette di indovinare.**
Continuare sarebbe inventare. Il copy chiede la data e basta: non allarma, non insinua.

### Gli otto stati

| Stato | Cosa mostra |
|---|---|
| 🌱 Follicolare, cicli regolari | Il caso normale — fase, giorno, cosa può voler dire |
| 🩸 Durante il ciclo | Stesso schema. Il copy parla di ferro e di andarci più piano, mai di «prestazione ridotta» |
| 🌙 Luteale tardiva | La fase dove la tentazione del conto alla rovescia è massima |
| 📍 Una data sola | Funziona lo stesso, ma lo dice — e la sfumatura si allarga |
| 〰️ Cicli irregolari | Nomina la variabilità invece di nasconderla |
| 🕰️ Nessuna data recente | Smette di indovinare e chiede |
| 🌱 Menarca non arrivato | Nessun input, solo contenuto educativo. Non deve mai sembrare un ripiego |
| ☁️ Preferisce non dirlo | 🔴 Il blocco **sparisce**. Non svuotato, non insistente. Riattivabile in impostazioni |

### Note di implementazione

- I confini delle fasi si **riscalano sulla sua lunghezza media**, non su 28 giorni fissi.
- Il copy delle quattro fasi è **lo stesso** del blocco Rhythm dei check-in: un solo
  vocabolario, non due.
- Le date demo sono state calcolate, non scelte a occhio: ogni stato produce davvero la
  fase che l'etichetta dichiara.

---

## Cosa manca ancora

1. Confidenza sulla previsione, "ti ha sorpresa qualcosa", ore di sonno, stress scolastico,
   durata della sessione, "cosa ti sei portata a casa"
2. Mappa corporea junior per 11–13 anni (§10) — l'onboarding la *seleziona* già, ma la
   variante semplificata va ancora disegnata
3. Rete di sicurezza RED-S (§4.4) — **blocco: firma clinica**
4. Le impostazioni (profilo, ritmo, privacy/export, notifiche, aiuto)
5. Il percorso oltre il dettaglio settimana (settimane passate, fine mese, fine percorso)

---

## ⚠️

Specifica di design, non consiglio medico. Il testo del Care mode, la lista delle bandiere
rosse e la mappatura sensazione → categoria clinica **devono essere firmati da un medico
dello sport** prima dell'uso con minori.
