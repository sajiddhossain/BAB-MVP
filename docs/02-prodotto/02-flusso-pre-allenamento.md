# 02 · Flusso pre-allenamento

> Fonte: `fonti/prototipi/01-pre-training-check-in--v2-LATEST.html` + documento sorgente §5
> + `fonti/documenti/BAB before & after Training.pdf`.
>
> **Budget: ≤ 60–90 secondi. ~10 micro-tocchi.** 🔴

---

## Le tre nomenclature del materiale (e quale usare)

Lo stesso flusso ha tre nomi diversi nelle tre fonti. Vale la pena allinearle una volta
per tutte.

| Documento sorgente §5 | PDF `before & after` | Prototipo v2 | **Da usare** |
|---|---|---|---|
| Predict the session | Fase 1 · Previsione | Step 1 · Predict | **Predict** |
| Then sense & locate | Fase 2 · Sintonia (Tune In) | Step 2 · Tune in | **Tune in** |
| — | Fase 3 · Pinpoint & name it | Step 2 · Pinpoint & name it | (parte di Tune in) |
| (implicito) | — | Step 3 · Compare | **Compare** |
| (implicito) | — | Step 4 · Adjust | **Adjust** |
| Auto: overnight recovery | — | ⚠️ assente | da aggiungere |

**Decisione 🟡:** si usa la nomenclatura del prototipo — `Predict → Tune in → Compare →
Adjust` — perché è quella già testata in copy per adolescenti, e perché mette in evidenza
i due momenti (Compare, Adjust) che sono il valore didattico del prodotto.

---

## Struttura schermo per schermo

Il prototipo è una pagina unica scrollabile. 🟡 **Per l'app mobile propongo di spezzarlo
in schermate**, una per step, con progress bar in cima. Motivo: su una pagina lunga
l'atleta vede tutto il lavoro che l'aspetta, e questo è esattamente ciò che fa abbandonare.
Su schermate separate vede solo il passo corrente.

```
[●○○○○]  →  [●●○○○]  →  [●●●○○]  →  [●●●●○]  →  [●●●●●]
 Ritmo      Predict     Tune in    Pinpoint     Risultato
                                   & Decode
```

---

### Schermata 0 · 🌙 Il tuo ritmo *(condizionale)*

Mostrata **solo** se in onboarding ha dichiarato di avere il ciclo.

- Toggle unico: `🩸 Oggi ho il ciclo` (tap per attivare, tap per disattivare)
- Accordion educativo: *"Impara le quattro fasi 👀"* → il testo completo delle 4 fasi
  (vedi [ciclo e RED-S](../01-modello/03-ciclo-e-red-s.md))

🟡 **Nota:** nel prototipo questo blocco è in cima al form. Va bene, ma il testo educativo
è lungo (~180 parole). Per un uso quotidiano deve essere **chiuso di default** e il toggle
deve essere immediatamente raggiungibile. Il contenuto educativo si legge una volta,
non ogni mattina.

---

### Schermata 1 · Step 1 · Predict

> **Prima di sintonizzarti — qual è la tua andatura oggi?**
>
> La tua "andatura" è semplicemente quanto ha da dare il tuo corpo oggi. Tira a indovinare
> adesso — lo confermerai alla fine. Indovinare prima allena la tua lettura interiore, e
> "sbagliare" non è un fallimento, è tutto il punto.

Tre bottoni grandi:

| | Nome | Sottotitolo |
|---|---|---|
| ⚡ | **Upbeat** | Serbatoio pieno — giorno da costruire |
| 🌊 | **Steady** | Mezzo serbatoio — giorno da tecnica |
| 🍃 | **Gentle** | Serbatoio basso — giorno da ricostruire |

🟡 **Da aggiungere:** la micro-domanda di confidenza (vedi
[metrica](../01-modello/04-metrica-body-literacy.md)) — senza, la faccia "Insight" della
metrica non è misurabile.

> *Quanto sei sicura?* → `Tiro a indovinare` · `Abbastanza` · `Sicura`

🟡 **Da aggiungere (§5.3):** *"Auto: overnight recovery. Sleep recall + resting HR (se ha
una banda)."* Nel tier 0 questo si traduce in: **ore di sonno**, un tocco.

---

### Schermata 2 · Step 2 · Tune in — i tuoi canali

Quattro scale emoji + Headspace. Il dettaglio completo (estremi, emoji per livello) è in
[cosa tracciamo](../01-modello/01-cosa-tracciamo.md).

**La cornice concettuale conta quanto le domande.** Il §5 dice che questo step va
*"inquadrato per invitare la sorpresa: 'ti ha sorpreso qualcosa rispetto a quello che ti
aspettavi?' La sorpresa viene loggata come dato."*

⚠️ **Nel prototipo questa domanda non c'è.** C'è il confronto automatico previsione↔canali
nello step Compare, ma non la cattura esplicita della sorpresa soggettiva.

🟡 **Proposta:** in fondo allo step 2, una riga sola:

> Qualcosa ti ha sorpresa?
> `No, come pensavo` · `Sì, un po'` · `Sì, parecchio`

Un tocco. È il segnale micro (predict → sense) del §5, e senza di esso il prodotto ne
misura due su tre.

---

### Schermata 3 · Step 2b · Pinpoint & name it

La mappa corporea. Fronte/retro, 36 zone, + `All over` / `Somewhere else`.

**Il copy del prototipo, che è il cuore didattico dell'intera app:**

> Fermarsi a trovare *dove* sta una sensazione, e metterci una *parola* sopra, è il cuore
> della competenza — è come un vago "mi sento strana" diventa qualcosa che capisci davvero.
> Tocca un punto — passa tra **fronte** e **retro** — poi scegli come si sente. Aggiungine
> quante ne noti, o nessuna se è tutto tranquillo.

**"o nessuna se è tutto tranquillo"** è importante: rende esplicito che non segnalare
nulla è una risposta valida e non un compito non svolto. Contrasta l'ipervigilanza.

🟡 **Da aggiungere qui:** intensità e tag di comportamento (§4.3), e le due sensazioni
bandiera rossa mancanti. Vedi [lessico](../01-modello/02-lessico-delle-sensazioni.md).

---

### Schermata 4 · Decode your ache

Il blocco educativo a due colonne + la domanda binaria.
Testo completo in [lessico](../01-modello/02-lessico-delle-sensazioni.md).

🟡 **Nota di design importante:** questo blocco è ~200 parole di contenuto educativo.
Mostrarlo per intero **ogni giorno** viola il budget di 60-90 secondi.

**Proposta:**
- Le **prime 2 settimane**: mostrato per intero (è la Skill 1 del percorso — Recognise).
- **Dopo**: collassato in una riga `▸ Rivedi la differenza`, con solo la domanda visibile.
- **Sempre riespanso** se lei risponde "sì" per la prima volta in 30 giorni.

Questo è un pattern generale che vale per tutti i blocchi educativi dell'app: **il
contenuto didattico si consuma, la domanda resta**.

---

### Schermata 5 · Risultato — Step 3 Compare + Step 4 Adjust

Una schermata sola, tre blocchi in ordine:

#### A · La card dell'andatura

Grande, colorata secondo l'andatura. Contiene nome, icona, tag e il *significato*.

**I tre significati (copy reale, ottimo, da conservare):**

**⚡ Upbeat** — *un giorno da costruire, vai a prendertelo*
> Il tuo serbatoio legge pieno e niente sta facendo la guardia. Questo è un giorno in cui
> il tuo corpo può prendere carico vero e trasformarlo in forza. Spingi dentro il bruciore
> onesto — muscoli che lavorano, polmoni che vanno, fatica che è *guadagnata*. È qui che
> sali di livello.

**🌊 Steady** — *un giorno di qualità, mettilo a fuoco*
> Hai qualcosa nel serbatoio, ma non tutto. Questo non è un giorno di riposo e non è un
> fallimento — è un giorno di **qualità invece che quantità**. Allenati in modo intelligente
> e preciso, e spesso migliorerai *più* che in una macinata.

**🍃 Gentle** — *un giorno da ricostruire, è qui che cresci*
> I tuoi segnali leggono bassi su tutta la linea — ed ecco il segreto che le migliori
> atlete conoscono: **non diventi più forte durante l'allenamento duro, diventi più forte
> mentre recuperi da esso.** Oggi, andarci piano *è* l'allenamento. Scegliere questa andatura
> è una mossa di potere, non un passo indietro.

> **Perché questo copy è forte:** non c'è un'andatura "buona" e una "cattiva". Ogni andatura ha
> una sua vittoria. Gentle in particolare è riformulato come atto di forza — il che è
> l'unico modo per cui una tredicenne lo sceglierà davvero.

#### B · Step 3 · Compare

Il confronto previsione ↔ corpo. Copy completo in
[metrica](../01-modello/04-metrica-body-literacy.md).

Aggiunge una riga sull'Headspace, con tono adattivo:
- se prevalgono le negative: *"portarsi dietro un carico mentale è reale, e attinge dalla
  stessa batteria dell'allenamento. Sii gentile con la tua andatura oggi."*
- se prevalgono le positive: *"una testa libera è un vantaggio vero. Godilo."*

#### C · Step 4 · Adjust — il piano di oggi

3–4 azioni concrete per l'andatura scelta. Esempio per Gentle:
- Riposa, o fai recupero attivo gentile: camminata facile, mobilità leggera, stretching.
- Metti energia nel sonno e in pasti come si deve — è quello che riempie il serbatoio.
- Di' al tuo coach che vai in Gentle così può adattare — le atlete forti comunicano.
- Torna domani e sintonizzati di nuovo; un giorno Gentle protegge una settimana di Upbeat.

> Nota: il terzo punto è il principio "costruito per essere detto ad alta voce" incarnato
> in una riga di piano. 🟡 **Proposta:** trasformarlo in un bottone vero:
> `📋 Copia cosa dire al coach` → mette negli appunti *"Oggi leggo Gentle — posso tenerla
> leggera?"*. Un tocco, e il principio smette di essere un consiglio e diventa un'azione.

#### D · Lo swap — "il tuo corpo, la tua chiamata"

> Vuoi cambiare andatura? Sei tu alla guida:
> `⚡ Upbeat` `🌊 Steady` `🍃 Gentle`

🔴 **Questo componente non si tocca.** È l'incarnazione del principio 5 (locus of control
interno) e del principio 8 (l'app supporta, non prescrive). Un'app che calcola un'andatura
e non permette di cambiarlo sta dicendo cosa fare — cioè fa esattamente ciò che BAB
esiste per non fare.

#### E · Care mode *(condizionale)*

Se ha segnalato dolore protettivo, appare **sopra** il piano. Testo completo in
[guardrail](../00-fondamenta/04-guardrail-e-sicurezza.md).

---

## La logica di calcolo (dal prototipo v2)

```
totale = sleep + energy + hydration + muscles + headspaceValue
         (ciascuno 1–5, quindi range 5–25)

headspaceValue = clamp(3 + n_positive − n_negative, 1, 5)
                 positive: calm, focused, confident
                 negative: distracted, insecure, stressed, overwhelmed

totale ≥ 20  →  ⚡ Upbeat
totale ≥ 13  →  🌊 Steady
altrimenti   →  🍃 Gentle
```

⚠️ **Questa formula è provvisoria e va trattata come tale.**

Il §8 è esplicito: *"Iniziare descrittivi e within-athlete; validare prima che qualsiasi
soglia guidi una decisione."* Una somma non pesata con due soglie fisse **è** una soglia
che guida una decisione, e non è validata.

🟡 **Proposta per la v1:** mantenere la formula (serve qualcosa che funzioni), ma:
1. Loggare separatamente `totale`, ogni canale, l'andatura suggerita e quella **scelta**.
2. La differenza suggerito↔scelto è un dato prezioso: è lei che corregge il modello.
   Dopo ~8 settimane, quella differenza permette di **personalizzare le soglie per atleta** —
   che è esattamente il "normale individualizzato" del principio 4.
3. Non comunicare mai il totale numerico all'atleta.

---

## Condizione di sblocco del bottone finale

Nel prototipo: **tutti** i canali + la domanda dolore + almeno una voce di Headspace.
La mappa corporea è **facoltativa**.

🟡 Giusto così. Ma con una modifica: dopo 3 settimane, permettere di **saltare un canale**
con un tocco lungo (`non lo so`). Un dato mancante onesto vale più di un dato inventato per
sbloccare il bottone — e il sotto-riporto giovanile (Temm) suggerisce che il secondo caso
accadrà.
