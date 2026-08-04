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

### 4 · Cattura acuta sempre a un tocco

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

## Cosa manca ancora

1. Confidenza sulla previsione, "ti ha sorpresa qualcosa", ore di sonno, stress scolastico,
   durata della sessione, "cosa ti sei portata a casa"
2. Mappa corporea junior per 11–13 anni (§10) — l'onboarding la *seleziona* già, ma la
   variante semplificata va ancora disegnata
3. Rete di sicurezza RED-S (§4.4) — **blocco: firma clinica**
4. La home "Oggi" e i suoi 6 stati
5. La vista Patterns nei primi giorni (stadi Raccolta / Prime ipotesi)

---

## ⚠️

Specifica di design, non consiglio medico. Il testo del Care mode, la lista delle bandiere
rosse e la mappatura sensazione → categoria clinica **devono essere firmati da un medico
dello sport** prima dell'uso con minori.
