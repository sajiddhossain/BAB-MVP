# 03 · Decisioni aperte

> Le domande che servono alla founder per sbloccare il design. Ordinate per **quanto
> bloccano**, non per importanza teorica.
>
> Per ognuna: il contesto, le opzioni concrete, e la mia raccomandazione — così la
> decisione è un sì/no e non un tema di discussione.
>
> ⚠️ **Cinque di queste sono state decise il 6 agosto 2026** e restano qui solo come
> storia del ragionamento. La decisione vale, la raccomandazione no. Il verbale è in
> [04-revisione-roadmap](04-revisione-roadmap.md).

| Decisione | Esito |
|---|---|
| D1 lingua | 🟢 **chiusa** — italiano *e* inglese ([R9](04-revisione-roadmap.md#r9--italiano-e-inglese-entrambi)) |
| D2 visibilità coach | 🟢 **chiusa** — la squadra vede tutto, ciclo incluso ([R2](04-revisione-roadmap.md#r2--la-squadra-vede-i-dati-dei-due-check-in-ciclo-incluso)) |
| D3 settimana 8 | 🟢 **chiusa** — fuori da v1 e v1.1 col percorso ([R8](04-revisione-roadmap.md#r8--il-percorso-resta-fuori-dallmvp)) |
| D4 firma clinica | 🟢 **chiusa** — non necessaria per l'MVP ([R6](04-revisione-roadmap.md#r6--niente-firma-del-medico-dello-sport-per-lmvp)) |
| D6 mappa junior | 🟢 **chiusa** — una sola mappa per tutte ([R4](04-revisione-roadmap.md#r4--una-sola-mappa-corporea-dai-12-anni-in-su)) |
| D5, D7, D8–D12 | 🟠 ancora aperte |

---

## 🔴 BLOCCANTI — senza queste non si disegna

### D1 · Lingua dell'MVP
> 🟢 **Chiusa: opzione C.** Si costruisce in italiano e in inglese — le advisor sono
> straniere. La sotto-decisione sui nomi dei tempi è stata riaperta da
> [B2](04-revisione-roadmap.md#b2--tempo-in-italiano-vuol-dire-tempo).

**Contesto:** documento madre e tutti i prototipi sono in inglese. La landing in produzione,
il PDF originale e il piano del pilota (20 atlete italiane di atletica, 13-14 anni) sono in
italiano.

| Opzione | Implicazioni |
|---|---|
| **A. Italiano** | Va tradotto tutto il copy dei prototipi. Serve rivedere la traduzione dei tre tempi. |
| **B. Inglese** | Il copy esiste già. Ma il pilota italiano diventa impraticabile con tredicenni. |
| **C. Bilingue da subito** | Doppio costo di copy, ma architettura corretta fin dall'inizio. |

**🟡 Raccomandazione: A, con architettura i18n pronta (quindi C a livello tecnico, A a
livello di contenuti).** La landing ha già l'infrastruttura. Si spedisce solo l'italiano.

**Sotto-decisione:** i nomi dei tempi si traducono o restano in inglese? Vedi
[tono di voce](../03-design/02-tono-di-voce.md). 🟡 Mia preferenza: **restano in inglese**,
perché sono un vocabolario condiviso col coach e devono restare identici tra mercati.

---

### D2 · Visibilità del coach
> 🟢 **Chiusa: opzione C**, contro la raccomandazione qui sotto. Per l'MVP la squadra
> vede tutti i dati dei due check-in, ciclo compreso, più la dashboard. Il journaling
> resta privato. Le conseguenze — comprese quelle sul copy — stanno in
> [R2](04-revisione-roadmap.md#r2--la-squadra-vede-i-dati-dei-due-check-in-ciclo-incluso).

**Contesto:** è la decisione aperta esplicita del §13. *"Il safeguarding vuole che gli
adulti vedano le bandiere rosse; l'onestà del riporto vuole che i dati siano suoi."*

| Opzione | Cosa vede il coach | Rischio |
|---|---|---|
| **A. Athlete-owned puro** (default attuale) | Niente, se non ciò che lei condivide | Un infortunio potrebbe non essere segnalato a nessuno |
| **B. Athlete-owned + escalation bandiere rosse** | Solo un alert quando lei segnala dolore protettivo, e **solo se lei ha attivato la condivisione col coach in onboarding** | Compromesso ragionevole |
| **C. Dashboard club** | Aggregati di squadra + alert | 🔴 Cambia il comportamento di riporto. Invalida il pilota. |

**🟡 Raccomandazione: A per il pilota, B come evoluzione, C mai in questa forma.**

Nel pilota serve **A puro**, perché la domanda del test è l'aderenza e la visibilità
del coach la contamina in modo non misurabile. Ma il safeguarding va coperto in altro modo:
il Care mode dice esplicitamente *"dillo al tuo coach e a un genitore oggi"*, e nel pilota
c'è comunque un adulto responsabile del test.

Per il prodotto commerciale, **B**: l'escalation esiste, ma è lei ad averla attivata,
sapendolo. È la lettura più coerente con "privacy, agency e safeguarding first".

---

### D3 · La settimana 8 del percorso ("Fuel your energy")
> 🟢 **Chiusa per sottrazione.** Il percorso non entra nell'MVP, e il contenuto
> sull'alimentazione non entra né in v1 né in v1.1. La decisione più delicata del
> prodotto si sposta più in là invece di essere presa di fretta.

**Contesto:** è l'unico contenuto che parla esplicitamente di cibo, in un prodotto il cui
principio 6 dice *"mai fame, sazietà o cibo"* e la cui §12 esclude esplicitamente il tema.

Il framing attuale è buono (carburante per l'energia, mai peso/forma, richiesta di
*aumentare* l'attenzione al nutrirsi). Ma il principio è formulato in modo assoluto.

| Opzione | |
|---|---|
| **A. Rimuovere la settimana** | Coerenza totale col principio. Si perde un tema che è però collegato a RED-S. |
| **B. Tenerla così** | Richiede di ammorbidire il principio 6, che è scritto come assoluto. |
| **C. Riformularla sull'energia** | Titolo "Ascolta la tua energia". Nessuna menzione di appetito. Il collegamento a RED-S resta gestito dalla rete di sicurezza silenziosa. |

**🟡 Raccomandazione: C**, e in ogni caso **firma clinica obbligatoria** su qualunque
versione. È il singolo contenuto del prodotto con il rischio più alto per questa
popolazione.

---

### D4 · Chi firma clinicamente
> 🟢 **Chiusa: non serve per l'MVP**, perché si passa dalle squadre. Era marcata come
> il primo collo di bottiglia del progetto: non lo è. Advisor effettive — **Tristin
> Agtarap** sul nominare dolore e sensazioni, una seconda dall'11 agosto 2026.
> Vedi [R6](04-revisione-roadmap.md#r6--niente-firma-del-medico-dello-sport-per-lmvp).

**Contesto:** §10 e il disclaimer del documento madre lo richiedono esplicitamente:
*"l'instradamento delle bandiere rosse, i percorsi mestruali/RED-S e qualsiasi indicazione
di salute devono essere firmati da un medico dello sport qualificato"*.

**Serve un nome, prima del pilota.** Cosa deve firmare:
- Il testo del Care mode e la lista delle bandiere rosse
- La mappatura sensazione → categoria clinica
- I trigger e il testo della rete di sicurezza RED-S
- Il contenuto sul ciclo e sulla settimana 8
- I disclaimer

🔵 **Domanda diretta:** c'è già un advisor clinico coinvolto? Se no, questo è il primo
collo di bottiglia del progetto, prima dello sviluppo.

---

## 🟠 IMPORTANTI — si può iniziare a disegnare, ma servono presto

### D5 · Gli input mancanti si aggiungono?

Proposti in [cosa tracciamo](../01-modello/01-cosa-tracciamo.md):
ore di sonno · stress scolastico · antidolorifici · durata sessione · confidenza sulla
previsione · "ti ha sorpresa qualcosa" · intensità e tag di comportamento ·
"cosa ti sei portata a casa".

Costo totale nel caso tipico: **+5–6 tocchi**, che è un aumento reale rispetto ai ~10
attuali.

| Opzione | |
|---|---|
| **A. Tutti** | Il modello è completo, ma il check-in va oltre i 90 secondi. Rischio aderenza. |
| **B. Nessuno** | Si resta nei tempi, ma la metrica è incompleta e alcuni insight non sono generabili. |
| **C. I sei a costo più basso** | confidenza, sorpresa, ore sonno, stress scuola, durata, tag comportamento |

**🟡 Raccomandazione: C**, e **misurare i tempi reali nel pilota**. Se si sfora, il primo
a uscire è "cosa ti sei portata a casa" (bello ma non strutturale), poi le ore di sonno.

⚠️ Nota: `antidolorifici` non è negoziabile come dato di sicurezza, ma costa **zero tocchi
nel caso normale** perché appare solo dopo un report di dolore.

### D6 · La mappa corporea junior
> 🟢 **Chiusa: una sola mappa, per tutte.** Si costruisce pensando alle 12–14enni, ma
> il prodotto è usabile dai 12 anni in su — e va fatto provare anche ad atlete adulte.

**Contesto:** §10 chiede regioni più semplici per 11–13 anni. Le 36 zone attuali sono
probabilmente troppe per un'undicenne, e §10 chiede anche di stabilire l'affidabilità
test–retest **per fascia d'età**.

🔵 **Domanda:** il pilota è su 13–14enni. La fascia 11–12 è nel target dell'MVP o arriva dopo?
Se arriva dopo, la mappa junior si può rimandare a v1.1 e si guadagnano giorni.

### D7 · Il tono della rete di sicurezza RED-S

Il testo proposto in [ciclo e RED-S](../01-modello/03-ciclo-e-red-s.md) è mio. Deve essere
riscritto o approvato dalla founder + firmato clinicamente. È il messaggio più delicato che
l'app manderà mai.

### D8 · La domanda "livello di soddisfazione"

Dal PDF originale: `deluso · frustrato · soddisfatto · fiducioso · orgoglioso`.
🔵 I primi due introducono un giudizio sulla performance. Tenerla, tagliarla, o tenere solo
le tre positive più una neutra?

---

## 🟡 UTILI — si possono decidere dopo

### D9 · Avatar / elemento vivo
Sì all'avatar-specchio dello stato fisiologico? Vedi
[brainstorming](01-brainstorm-app-mobile.md) — la mia posizione è no, con controproposta.

### D10 · Badge di fine mese
Gamification accettabile o no?

### D11 · `ui_ux_component_specs.md`
Va aggiornato al sistema visivo della landing, o archiviato? Attualmente descrive un
prodotto visivamente diverso da quello che si costruirà, e chi lo legge senza contesto
costruirà la cosa sbagliata.

### D12 · Tema scuro
Sì/no, e in che versione.

---

## Riepilogo — cosa serve dalla founder, in ordine

Le sei che bloccavano sono chiuse. Restano due domande nuove, entrambe nate dal
riscontro sulla roadmap, ed entrambe più piccole di quelle appena chiuse:

```
1. B1 — wearable                        → l'onboarding non può promettere Apple Health
                                          da una web app: non esiste l'API
2. B2 — "tempo" o "andatura" in italiano → sblocca il copy definitivo dei tre tempi
3. D5 — quali input aggiungere          → sblocca il disegno dei flussi
4. D8 — "livello di soddisfazione"      → i primi due valori giudicano la prestazione
```

B1 è l'unica con una conseguenza di prodotto immediata: c'è una schermata di onboarding
che dipende dalla risposta. Le altre le posso decidere io con un default ragionevole,
se serve andare avanti.
