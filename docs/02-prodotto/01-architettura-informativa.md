# 01 · Architettura informativa

> 🟡 Questo documento è **proposta di design**, costruita sul materiale. Le parti marcate
> 🔴 derivano direttamente dal documento sorgente.

---

## Il problema da risolvere

Il materiale contiene **cinque cose diverse**: il check-in pre, il check-in post, il
percorso di 16 settimane, la vista dei pattern, e la body-story condivisibile.

Se le mettiamo tutte davanti all'atleta come pari, l'app diventa complicata — e la
complicazione uccide l'aderenza, che è il primo requisito di fattibilità (Temm).

**La regola che uso per ordinarle:**

> In qualsiasi momento, l'app deve avere **una sola cosa ovvia da fare adesso**.
> Tutto il resto sta un livello sotto.

---

## La struttura: 3 tab, non 5

```
┌─────────────────────────────────────┐
│                                     │
│           [ contenuto ]             │
│                                     │
│                                     │
├─────────────────────────────────────┤
│    ●  Oggi    ○ Percorso   ○ Me     │
└─────────────────────────────────────┘
```

| Tab | Ruolo | Corrisponde a (schema founder) |
|---|---|---|
| **Oggi** | L'azione. Un solo prossimo passo. | **DECIDE** |
| **Percorso** | Il senso. Perché lo sto facendo, cosa sto imparando. | (la struttura pedagogica) |
| **Me** | La comprensione + la voce. | **DECODE** + **COMMUNICATE** |

Tre tab, non quattro: la body-story **non è una tab**, è l'azione principale dentro "Me".
Metterla come quarta tab la trasformerebbe da "cosa che faccio quando mi serve" a "cosa
che l'app mi chiede di fare", ed è l'opposto dell'agency.

---

## Tab 1 · Oggi — la macchina a stati

Questa è l'unica schermata che l'atleta vede ogni giorno. Deve essere **una card grande
con un bottone**, e cambiare in base allo stato della giornata.

```
                    ┌──────────────────┐
                    │   apre l'app     │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      pre non fatto    pre fatto,     entrambi fatti
              │        post no        oppure giorno di riposo
              │              │              │
              ▼              ▼              ▼
   ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
   │ ⚡ Sintonizzati│ │ 🌙 Chiudi il │ │ ✅ Fatto per │
   │               │ │    cerchio    │ │     oggi     │
   │ "Un minuto,   │ │              │ │              │
   │ prima di      │ │ "Hai previsto│ │ Il tuo tempo:│
   │ iniziare"     │ │  Steady.     │ │   🌊 Steady  │
   │               │ │  Com'è andata│ │              │
   │ [ Inizia → ]  │ │  davvero?"   │ │ + missione   │
   └───────────────┘ │              │ │   della      │
                     │ [ Riflettі →]│ │   settimana  │
                     └──────────────┘ └──────────────┘
```

### Gli stati da gestire (tutti, non solo il caso felice)

| Stato | Cosa mostra Oggi |
|---|---|
| **Prima del pre-check** | Card "Sintonizzati". Un bottone. |
| **Pre fatto, allenamento in corso** | Card del tempo scelto + bottone secondario "Chiudi il cerchio" |
| **Entrambi fatti** | Riepilogo della giornata + la missione della settimana + niente da fare |
| **Giorno di riposo** 🔴 | *"una riflessione opzionale (recupero, segnali persistenti, ciclo/energia)"* — mai il flusso completo |
| **Giorno di solo PE (educazione fisica)** 🔴 | Coppia pre/post più leggera. Il PE conta come carico. |
| **PE + allenamento lo stesso giorno** 🔴 | Comunque **due** check: pre prima della prima attività, post dopo l'ultima; si taggano le sessioni. **Mai scalare i check con il numero di sessioni.** |
| **Giorno saltato** | Nessuna colpa, nessuno streak rotto. Copy neutro: *"Nessun problema. Ricominciamo da oggi."* |
| **Bandiera rossa attiva** | Il Care mode sta **sopra** tutto il resto, sempre visibile fino a risoluzione |
| **Momento acuto, in qualsiasi ora** 🔴 | *"la segnalazione di bandiere rosse acute (dolore acuto, cedimento) è sempre a un tocco di distanza"* → serve un **accesso permanente**, vedi sotto |

### Il pulsante sempre presente 🔴

Il §5 dice: *"**Anytime:** acute red-flag capture (sharp pain, giving-way) is always one
tap away."*

**Conseguenza:** in ogni schermata dell'app, in alto a destra, un'icona discreta:

> 🩹 **Mi sono fatta male**

Non è nel flusso del check-in. Non richiede che sia il momento giusto. Apre direttamente
mappa corporea → sensazione → Care mode. Tre tocchi dal problema all'istruzione.

Questa è probabilmente la feature di sicurezza più importante dell'app e nei prototipi
non esiste.

---

## Tab 2 · Percorso — il senso

Contiene i 4 mesi / 16 settimane. Ma **non** come una lista da scorrere: come **una
settimana alla volta**.

```
┌─────────────────────────────────┐
│  MESE 1 · 👀 NOTICE             │
│  Riconosci i tuoi segnali       │
│                                 │
│  ●━━━━●━━━━○━━━━○               │
│  S1   S2   S3   S4              │
│                                 │
│  ┌───────────────────────────┐  │
│  │ SETTIMANA 3               │  │
│  │ Una batteria, due consumi │  │
│  │                           │  │
│  │ 🎯 La tua missione        │  │
│  │ In un giorno pieno o      │  │
│  │ stressante, sintonizzati  │  │
│  │ e guarda cosa fa il tuo   │  │
│  │ corpo.                    │  │
│  │                           │  │
│  │ [ Leggi tutto ]           │  │
│  └───────────────────────────┘  │
│                                 │
│  ↓ Le settimane passate         │
└─────────────────────────────────┘
```

**Perché così:** il prototipo journey mostra tutte e 16 le settimane apribili subito.
Va benissimo come **pitch deck per la founder e per i club**, molto meno come app per una
tredicenne, perché comunica "hai 16 compiti davanti". Nell'app, la settimana corrente è
protagonista; le passate si scorrono sotto; le future si intravedono ma non si aprono.

---

## Tab 3 · Me — comprensione e voce

Tre blocchi in verticale, in quest'ordine preciso:

```
┌─────────────────────────────────┐
│  1. LA MIA LETTURA              │
│     Quanto bene mi leggo         │
│     ~~~~~~~~~~~~~~~~~~ (trend)   │
│     "Il tuo divario si sta       │
│      accorciando 🌱"             │
├─────────────────────────────────┤
│  2. I MIEI PATTERN               │
│     [🔋 Energia][🎯 Focus]       │
│     [💜 Umore ][🩹 Dolore]       │
│                                  │
│     ▓▓░░░░▒▒▒▒▓▓░░░░▒▒▒▒        │
│     (grafico con bande di fase)  │
│                                  │
│     🌙 Quello che ho notato...   │
├─────────────────────────────────┤
│  3. LA MIA STORIA                │
│     Da far vedere a qualcuno      │
│     [ Prepara ]                   │
└─────────────────────────────────┘
```

**L'ordine è deliberato e segue lo schema della founder:**
1. `La mia lettura` = **la metrica del prodotto** (prediction error). Sta in cima perché
   è la risposta alla domanda *"sto migliorando?"*, e la domanda giusta è *"quanto bene
   mi leggo"*, non *"quanto sono in forma"*.
2. `I miei pattern` = **DECODE**.
3. `La mia storia` = **COMMUNICATE**.

---

## Cosa NON è nell'app

| Escluso | Perché |
|---|---|
| **Tab "Dashboard coach"** | Il coach non è un utente dell'app dell'atleta. 🔵 Se serve un prodotto coach, è un prodotto separato — vedi decisioni aperte. |
| **Feed / social / squadra** | Nessun confronto tra atlete (principio 4). |
| **Notifiche di streak** | Rompono il principio "gioco a bassa posta" e generano colpa. |
| **Schermata "collega il tuo wearable"** in onboarding | Principio 1: il self-report è la spina dorsale. |
| **Chat / AI coach conversazionale** | 🟡 Tentante e fuori scope. L'app deve insegnare a lei a parlare **con adulti reali**, non a sostituirli. |

---

## Onboarding — la parte che manca completamente dai prototipi

Nessuno dei cinque prototipi ha onboarding, ma senza di esso metà del modello non
funziona (fasi del ciclo, scalatura per età, consenso).

**Proposta: 6 schermate, ~90 secondi, tutto saltabile tranne consenso ed età.**

| # | Schermata | Perché |
|---|---|---|
| 1 | **Benvenuto** — cosa fa BAB in una frase, e cosa non fa | Setta l'aspettativa: non è un punteggio |
| 2 | **Consenso** — tutore + atleta, chiaro e leggibile 🔴 | Requisito legale e di governance (§9) |
| 3 | **Quanti anni hai** 🔴 | Determina la scalatura della mappa corporea (§10) |
| 4 | **Il tuo sport e quando ti alleni** | Determina i giorni di default per i check |
| 5 | **Il tuo ritmo** 🔴 — hai già il ciclo? (sì / non ancora / preferisco non dirlo) → se sì: date recenti + contraccezione | Senza, il layer ciclo non esiste (§4.4) |
| 6 | **La prima previsione** — falle fare subito un check-in | Il valore si capisce facendolo, non leggendolo |

La schermata 5 è delicata. 🟡 Copy proposto:

> **Il tuo ritmo**
> Se hai già il ciclo, BAB può usarlo come sfondo per capire i tuoi segnali — è la cosa
> che quasi nessuna app sportiva fa. È tuo, resta tuo, e puoi spegnerlo quando vuoi.
>
> `Ce l'ho già` · `Non l'ho ancora avuto` · `Preferisco non dirlo`

Il secondo bottone non è un ripiego: è la risposta di moltissime undicenni e dodicenni, e
deve sembrare normale quanto le altre.
