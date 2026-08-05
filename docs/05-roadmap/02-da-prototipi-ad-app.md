# 02 · Da prototipi ad app — spiegato semplice

> Cosa manca davvero per avere una **web app mobile** che un'atleta può usare tutti i giorni.
> Scritto in modo semplice apposta: serve a capirsi tra chi decide, chi disegna e chi programma.

---

## Prima: cosa abbiamo davvero adesso

Immagina di voler costruire una casa.

Quello che abbiamo fatto finora è **disegnare le stanze**. Sei stanze, disegnate bene,
in scala, con i mobili al posto giusto. Puoi entrarci e guardarti intorno.

Ma sono **sei disegni separati**. Non c'è un corridoio che li collega. Non c'è la porta
d'ingresso. Non c'è l'elettricità. E soprattutto: **se esci e rientri, la stanza è di
nuovo vuota** — nessuno si ricorda che eri già stato lì.

Questo è, letteralmente, cosa sono i sei file HTML in [`/prototipi-v3`](../../prototipi-v3/):

| Cosa sembra | Cosa è davvero |
|---|---|
| Un'app | Sei pagine web separate |
| Le tue risposte vengono salvate | Chiudi la pagina e sparisce tutto |
| Ci sono i tuoi dati | I dati sono finti, scritti a mano dentro il file |
| Ci si passa da una all'altra | Non si parlano: devi aprire i file a mano |
| È l'app di BAB | Non c'è nessun account: è uguale per chiunque la apra |

**Questo va benissimo per la fase in cui siamo.** I prototipi servono a decidere *cosa*
costruire, ed è esattamente quello che hanno fatto. Ma ora la domanda è diversa.

---

## Le 5 cose che trasformano dei disegni in un'app

### 1 · La memoria 🧠
> *"L'app si ricorda di me"*

Oggi non c'è. Serve un posto dove finiscono i suoi check-in e da cui si rileggono:
un **database**. Senza memoria non esistono i pattern, non esiste il fingerprint, non
esiste il percorso di 16 settimane. **Metà del prodotto è la memoria.**

### 2 · La porta d'ingresso 🔑
> *"Questa app è mia, non di chiunque apra il link"*

Serve un **account**. Non necessariamente una password — per delle minorenni la cosa più
semplice e più sicura è un link che arriva per email e ti fa entrare, senza password da
ricordare né da farsi rubare.

### 3 · Il corridoio 🚪
> *"Dalla home vado nel check-in, e poi torno"*

Serve la **navigazione**: le tre tab in fondo che funzionano davvero, e le schermate che
si passano le informazioni. Oggi ogni file è un'isola.

### 4 · L'icona sul telefono 📱
> *"La apro come tutte le altre app"*

Una web app può essere **installata sulla schermata home** e aprirsi a schermo intero,
senza la barra del browser. Si chiama PWA. Da fuori è indistinguibile da un'app scaricata
dallo store — ma non devi passare da Apple e Google, e si aggiorna da sola.

E deve **funzionare anche senza campo**, perché in palestra spesso non c'è: le risposte si
salvano sul telefono e si sincronizzano quando torna la linea.

### 5 · Il vestito giusto 🎨
> *"Sembra BAB"*

I prototipi sono **blu scuro**. Che è proprio la direzione che ho raccomandato di *non*
prendere, perché è il linguaggio visivo di Whoop e Oura — cioè l'opposto del posizionamento
di BAB. Vanno rifatti col sistema della landing: crema, bordi neri, sfondo a quaderno.

Non è lavoro creativo: i disegni ci sono già. È **ricolorare**, e si fa una volta sola se
i colori stanno in un posto solo.

---

## La roadmap

Le settimane sono **ordini di grandezza** per un team piccolo (1 designer, 1–2 sviluppatori),
non impegni. Le fasi 1–4 sono in sequenza, la 5 corre in parallelo dall'inizio.

```
 SETTIMANA   1   2   3   4   5   6   7   8   9  10  11  12
             │   │   │   │   │   │   │   │   │   │   │   │
 FASE 1  ████████████                    Le fondamenta
 FASE 2          ████████████            La memoria
 FASE 3                  ████████████████ Le schermate vere
 FASE 4                              ████████ Quel che manca
 FASE 5  ████████████████████████████████████ Sicurezza (in parallelo)
                                              │
 FASE 6                                       └──▶ PILOTA
```

---

### 🧱 Fase 1 · Le fondamenta — *~2 settimane*

Costruire lo scheletro dell'app vuota, ma vera.

- Progetto **React + Vite**, lo stesso stack della landing — così il codice, i font e i
  colori si riusano invece di rifarli
- **PWA**: installabile sulla home, apribile a schermo intero
- **Navigazione** a tre tab funzionante
- **Design system** portato dal blu scuro al sistema della landing, in un posto solo

**Alla fine di questa fase:** un'app vuota che si installa sul telefono, si apre, e ci si
naviga dentro. Nessun contenuto ancora.

---

### 💾 Fase 2 · La memoria — *~2 settimane*

- **Account** con link via email (niente password)
- **Database** — la landing usa già Supabase, quindi si riusa quello
- **Salvataggio** dei check-in, e rilettura
- **Offline**: funziona senza campo, sincronizza dopo

**Alla fine:** puoi fare un check-in, chiudere l'app, riaprirla domani e ritrovarlo.
È il momento in cui smette di essere una demo.

---

### 🧩 Fase 3 · Le schermate vere — *~3-4 settimane*

Qui si prendono i sei prototipi e diventano schermate dell'app vera, collegate e con
**dati veri al posto di quelli finti**.

Ordine consigliato, dal più al meno importante:

1. **Onboarding** — è la prima cosa che vede, e senza le date del ciclo non funziona nient'altro
2. **Check-in pre e post** — il cuore quotidiano
3. **Home "Oggi"** — con i 6 stati calcolati sul serio, non scelti da uno switcher
4. **Percorso** — le 16 settimane, con le missioni che si spuntano dai check-in reali
5. **Me** — i tre stadi, che ora avanzano davvero col passare delle settimane
6. **Body-story** — che genera un'immagine vera da mandare

**Alla fine:** l'app è completa e usabile.

---

### 🔧 Fase 4 · Quello che manca ancora — *~2 settimane*

- **Impostazioni** (profilo, ritmo, privacy, notifiche, aiuto) — 5 schermate mai disegnate
- **Notifiche**: il promemoria del check-in. Una sola, all'orario giusto. Niente altro.
- **Rete di sicurezza RED-S** — ⚠️ bloccata dalla firma clinica, non dal codice
- Le domande mancanti nei check-in (ore di sonno, stress scolastico, durata sessione…)

---

### 🛡️ Fase 5 · Sicurezza e conformità — *in parallelo, dalla settimana 1*

**Questa non aspetta il codice. Va aperta oggi.**

| Cosa | Chi |
|---|---|
| **Firma del medico dello sport** su Care mode, bandiere rosse, mappatura clinica, RED-S | advisor clinico — **da trovare** |
| **Testo legale** del consenso, privacy, GDPR, minori | legale |
| **Verifica accessibilità** — contrasto, bottoni ≥44px, `prefers-reduced-motion` | designer |
| **Protocollo del pilota** — cosa si misura e chi è l'adulto responsabile | founder |

🔴 Niente di tutto questo è tagliabile per anticipare il pilota. **Sono minorenni.**

---

### 🚀 Fase 6 · Il pilota — *8-12 settimane*

~20 atlete, 13–14 anni. Le tre domande a cui deve rispondere e le soglie sono nello
[scope MVP](../04-brainstorming/02-scope-mvp.md).

**Da mettere nel codice PRIMA di partire** — facile da dimenticare, impossibile da
recuperare dopo:
- quanti secondi impiega davvero ogni check-in
- il tempo **suggerito** dall'app vs quello **scelto** da lei *(il dato più prezioso di tutti:
  è lei che corregge il modello)*
- quali domande salta

---

## Le tre cose che servono da te per partire

Il codice può iniziare anche senza queste. Ma senza, si arriva alla fine e ci si ferma.

| # | Decisione | Perché blocca |
|---|---|---|
| 1 | **Trovare l'advisor clinico** | È l'unica cosa che non recuperi dopo, e può richiedere settimane. **Va aperta oggi.** |
| 2 | **In che lingua** | Tutto il copy è in inglese, il pilota è su tredicenni italiane. Blocca ogni riga di testo. |
| 3 | **Il coach vede qualcosa?** | Cambia il database, i permessi, e come si vende alle squadre. Meglio deciderlo prima di costruire, non dopo. |

Le altre nove domande sono in [decisioni aperte](../04-brainstorming/03-decisioni-aperte.md),
ma su quelle posso proporre un default ragionevole e andare avanti.

---

## In una riga

> Abbiamo disegnato bene le stanze. Ora servono le fondamenta, l'impianto elettrico e la
> porta d'ingresso — circa **due o tre mesi** per un team piccolo — e in parallelo va
> trovato il medico che firma, perché è la cosa che rischia di far aspettare tutto il resto.
