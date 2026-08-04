# Prototipi v3 — chiusura dei buchi di sicurezza

Prototipi funzionanti, self-contained, aprili nel browser. Partono dalla v2 in
[`../fonti/prototipi/`](../fonti/prototipi/) e chiudono i tre buchi di sicurezza
identificati nell'analisi. **Nessun altro cambiamento**: copy, flusso, logica del tempo
e degli 8 esiti sono identici alla v2.

| File | |
|---|---|
| `01-pre-training-check-in--v3.html` | Predict → Tune in → Compare → Adjust |
| `02-post-training-reflect--v3.html` | Look back → Sense → Learn → Recover |

Lingua: **inglese**, come la v2 — così il lavoro non è bloccato dalla
[decisione D1 sulla lingua](../docs/04-brainstorming/03-decisioni-aperte.md).

---

## Cosa è cambiato, e perché

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

## Cosa manca ancora

Questi prototipi chiudono i **buchi di sicurezza**. Restano fuori, in ordine di priorità:

1. **Onboarding** — senza date del ciclo e contraccezione il layer che differenzia il
   prodotto non funziona ([D5](../docs/04-brainstorming/03-decisioni-aperte.md))
2. **Body-story settimanale condivisibile** (§11)
3. Confidenza sulla previsione, "ti ha sorpresa qualcosa", ore di sonno, stress scolastico,
   durata della sessione, "cosa ti sei portata a casa"
4. Mappa corporea junior per 11–13 anni (§10)
5. Rete di sicurezza RED-S (§4.4) — **blocco: firma clinica**

---

## ⚠️

Specifica di design, non consiglio medico. Il testo del Care mode, la lista delle bandiere
rosse e la mappatura sensazione → categoria clinica **devono essere firmati da un medico
dello sport** prima dell'uso con minori.
