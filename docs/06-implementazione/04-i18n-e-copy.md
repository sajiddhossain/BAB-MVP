# 04 · i18n e copy

> Il lavoro che **elimina un rischio senza aver bisogno della decisione** che lo causa.

---

## Il problema

Tutto il copy esistente — sei prototipi, il documento madre, il percorso di 16 settimane —
è in **inglese**. Il pilota è previsto su venti atlete italiane di 13–14 anni.

La decisione sulla lingua ([D1](../04-brainstorming/03-decisioni-aperte.md)) non è ancora
presa. Finché non arriva, ogni riga di testo scritta dentro un componente è una riga che
andrà ritoccata a mano dopo.

**Se la decisione arriva alla settimana 3, la traduzione diventa il collo di bottiglia
esattamente alla fine** — che è il momento peggiore in cui trovarne uno.

## La soluzione

Estrarre tutto il copy in file di lingua **fin dal primo componente**. Costa poche ore
adesso e trasforma la traduzione da riscrittura a operazione meccanica.

È l'unico lavoro del progetto che **cancella un rischio senza risolvere la sua causa**.

---

## Come

### Un file per lingua, non uno per schermata

```
src/copy/
├── it.ts
├── en.ts
└── index.ts     // il tipo, il fallback, l'hook
```

Un file per lingua e non uno per schermata perché chi traduce vuole vedere **tutto il tono
insieme**. Il copy di BAB è la cosa più curata del materiale: spezzarlo in venti file
significa perdere la coerenza di voce che è il suo valore.

### Il tipo lo detta l'italiano

```ts
// it.ts è la fonte di verità della forma
export const it = { … } as const
export type Copy = typeof it

// en.ts deve conformarsi: una chiave mancante è un errore di compilazione
export const en: Copy = { … }
```

Così **non si può dimenticare una stringa**: se manca in una lingua, il build fallisce.
È la garanzia più economica che esista.

### Chiavi che descrivono il posto, non il testo

```ts
checkin.pre.predict.title       ✅  resta valida se il testo cambia
checkin.pre.beforeYouTuneIn     ❌  diventa bugiarda al primo ritocco
```

### In sviluppo, la chiave mancante si vede

Se una chiave non esiste, in sviluppo appare `⟦checkin.pre.predict.title⟧` invece di una
stringa vuota. Una stringa vuota si nota tardi; una chiave in mezzo allo schermo si nota
subito.

---

## Cosa NON va nei file di lingua

Distinzione importante, e facile da sbagliare.

| | Dove | Perché |
|---|---|---|
| Etichette UI, prompt, messaggi | `copy/` | Cambiano con la lingua |
| **Contenuto del percorso** (16 settimane) | `content/journey.ts` | È materiale editoriale lungo, versionato, che si rivede a blocchi |
| **Lessico delle sensazioni** | `content/lexicon.ts` | Ogni voce ha un **codice stabile** + etichetta tradotta + mappatura clinica. Il codice non si traduce mai. |
| **Regioni della mappa corporea** | `content/bodymap.ts` | Stesso motivo: `calf_r` è il dato, «polpaccio destro» è la sua etichetta |
| Testi clinici (Care mode, RED-S) | `content/clinical.ts` | 🔴 **Vanno firmati da un medico.** Tenerli separati rende ovvio cosa è stato firmato e cosa no — e una traduzione va rifirmata. |

Quest'ultima riga è la più importante del documento. Un testo clinico tradotto **non è più
il testo firmato**: la traduzione va sottoposta di nuovo.

---

## I nomi dei tempi

`Upbeat / Steady / Gentle` non sono una semplice stringa: sono un **vocabolario condiviso
tra atleta e coach** — è l'intera Settimana 10 del percorso (*«il tempo di BAB vi dà una
parola condivisa, così 'Gentle oggi' significa qualcosa che capite entrambi»*).

🔵 Per questo la sotto-decisione «si traducono o restano in inglese?» è separata da D1.
🟡 La mia raccomandazione resta: **lasciarli in inglese** anche nella versione italiana.
Sono tre parole brevi, il gergo sportivo giovanile italiano è già pieno di inglese, e
restano identici tra mercati — il che conta se il vocabolario condiviso è un asset.

In ogni caso vivono in **una costante sola**, così la decisione è reversibile in un punto.

---

## Terminologia interna da sistemare

Non riguarda l'app ma i documenti, e va fatta prima di condividerli fuori.

| Termine attuale | Problema | 🟡 Proposta |
|---|---|---|
| **Cattura acuta** | Calco dal clinico inglese, incomprensibile a un genitore o a un direttore sportivo | **Segnalazione immediata** nei documenti, *«Mi sono fatta male»* nell'app |
| **Prediction error** | Corretto scientificamente, opaco per tutti gli altri | Tenerlo nei documenti tecnici; nell'app è già *«quanto bene mi leggo»* |
| **Body literacy** | Termine del brand, si tiene | — |

---

## Ordine di lavoro

1. Creare `copy/it.ts` con le stringhe della schermata su cui si lavora — **mano a mano**,
   non tutte in una volta.
2. `en.ts` si popola dai prototipi, che il copy inglese ce l'hanno già.
3. Lint: nessun letterale di testo nei `.tsx`.
4. Un interruttore di lingua in impostazioni, visibile solo in sviluppo, per verificare che
   l'app intera cambi davvero.

**Cosa non fare:** aspettare di avere tutto il copy per iniziare. Il file cresce con
l'app; l'importante è che nessuna stringa nasca dentro un componente.
