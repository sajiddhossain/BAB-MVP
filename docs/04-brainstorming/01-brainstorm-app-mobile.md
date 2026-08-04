# 01 · Brainstorming — come farei l'app mobile

> Tutte le idee sul tavolo: quelle già nel materiale, quelle implicite, e quelle mie.
> Ognuna valutata contro il **test a 5 domande** dei
> [principi di design](../00-fondamenta/03-principi-di-design.md).

**Il test, per riferimento:**
1. Le dice cosa fare, o le insegna a capirlo?
2. Aggiunge secondi al check-in? Cosa toglie in cambio?
3. La confronta con qualcun altro?
4. Tocca cibo, peso o corpo come forma?
5. Produce qualcosa che può dire a un adulto?

---

## 🟢 TENERE — sono già nel materiale e reggono il test

| Idea | Fonte | Perché regge |
|---|---|---|
| **Predict → Compare** | doc madre §5 | È il meccanismo. Senza, il prodotto è un diario qualsiasi. |
| **I tre tempi (Upbeat/Steady/Gentle)** | prototipi | Vocabolario condiviso atleta↔coach. Nessuno è "buono". |
| **Il bottone "cambia tempo"** | prototipi | Agency resa cliccabile. |
| **Mappa corporea con lessico** | doc madre §4.3 | Il cuore didattico: localizzare + nominare. |
| **Decode your ache (2 colonne)** | prototipi | Insegna la discriminazione prima di chiedere. |
| **Headspace multi-select** | prototipi v2 | Nominare > misurare. |
| **Care mode** | prototipi | Sicurezza, con tono giusto. |
| **Percorso 16 settimane** | prototipo journey | La struttura pedagogica. È il prodotto, non un extra. |
| **Patterns con bande di ciclo** | prototipo journey | Il differenziante assoluto. |
| **Insight come ipotesi, non fatti** | prototipo journey | Umiltà + agency. |

---

## 🟡 AGGIUNGERE — mancano e servono

Ordinate per rapporto valore/costo.

### 1 · Il pulsante "mi sono fatta male" sempre accessibile 🔴
**Da:** §5 (*"acute red-flag capture is always one tap away"*).
**Costo:** basso. **Valore:** massimo — è sicurezza.
Oggi un infortunio a metà allenamento non ha dove essere registrato se non aspettando
il post-check. Tre tocchi: mappa → sensazione → Care mode.

### 2 · La body-story settimanale condivisibile 🔴
**Da:** §11. **Costo:** medio. **Valore:** massimo.
È l'unico output che incarna COMMUNICATE, ed è **la feature che rende il prodotto
vendibile a una squadra senza dare alla squadra i dati dell'atleta**. Specifica in
[patterns](../02-prodotto/05-patterns-e-insight.md).

### 3 · La micro-domanda di confidenza sulla previsione
**Da:** §7 (la faccia "Insight" della metrica). **Costo:** 1 tocco. **Valore:** alto.
Senza, una delle tre facce della metrica principale non è misurabile.

### 4 · "Ti ha sorpresa qualcosa?"
**Da:** §5 (*"la sorpresa viene loggata come dato"*). **Costo:** 1 tocco. **Valore:** alto.
È il segnale micro (predict→sense). Attualmente il prodotto ne cattura 2 su 3.

### 5 · Intensità + tag di comportamento sulla mappa
**Da:** §4.3. **Costo:** 2 tocchi *solo quando segnala*. **Valore:** alto.
Il tag *"migliora scaldandomi / peggiora sotto carico / c'è anche ferma"* è il
discriminante clinico tra adattivo e protettivo. Toglierlo dalle mani dell'atleta e
darlo al sistema è più sicuro *e* meno faticoso per lei.

### 6 · Le 2 sensazioni bandiera rossa mancanti
**Da:** §4.3. **Costo:** zero. **Valore:** alto.
`Cede / instabile` e `Gonfia / calda` mancano dal lessico dei prototipi. Vanno aggiunte e
devono attivare il Care mode **da sole**.

### 7 · "Cosa ti sei portata a casa?"
**Da:** PDF originale della founder (persa nei prototipi). **Costo:** 1 tocco.
Le opzioni includono *"ascoltato il mio corpo"* e *"mostrato gentilezza verso me stessa"*,
che sono gli obiettivi del prodotto resi selezionabili. Alimenta la body-story.

### 8 · Ore di sonno, stress scolastico, antidolorifici
**Da:** §4.2 + schema strategico. **Costo:** +2 tocchi.
Senza lo stress scolastico dedicato, l'insight migliore del set campione — *"due delle tue
settimane più basse erano settimane d'esame, non il ciclo"* — **non è generabile**.

### 9 · Durata della sessione
**Da:** schema strategico (`Training: Type · Duration · Load`). **Costo:** 1 tocco.
sRPE = RPE × durata. Senza durata non è sRPE.

### 10 · I tre stadi della vista Patterns
**Costo:** medio. **Valore:** alto — è anti-abbandono.
Vedi [patterns](../02-prodotto/05-patterns-e-insight.md).

### 11 · "Copia una frase per il coach"
**Costo:** basso. **Valore:** alto.
Trasforma il principio 9 da consiglio scritto ad azione da un tocco.

### 12 · Onboarding completo
**Costo:** medio. **Valore:** bloccante.
Senza date del ciclo e contraccezione, il layer ciclo non funziona. Senza età, la mappa
corporea non è scalata. Senza consenso, non si può fare il pilota.

---

## 🔵 DA DISCUTERE — tentanti ma rischiose

### L'avatar Tamagotchi
**Da:** `ui_ux_component_specs.md` §5. Tre stati (Active / Default / Down) che rispecchiano
lo stato fisiologico.

**A favore:** *"il driver primario di engagement per l'atleta under-18, che rimuove la
sensazione clinica del tracking tradizionale"*. È vero che funziona con questa fascia.

**Contro, e sono contro seri:**
- Un avatar che diventa triste/addormentato quando lei sta male è **un giudizio con un
  volto**. Il principio 1 dice "nessun punteggio nocebo": un avatar depresso è un punteggio
  nocebo con più empatia, non meno.
- Introduce un **secondo destinatario delle cure**. Il rischio è che si prenda cura
  dell'avatar invece che di sé — o peggio, che riporti dati falsi per non farlo star male.
  Il sotto-riporto giovanile (Temm) è già il rischio numero uno dei dati.
- La ricompensa per un buon dato diventa "l'avatar sta bene", che è esattamente il tipo
  di locus of control **esterno** che il principio 5 vuole evitare.

🟡 **Mia posizione: no all'avatar come specchio dello stato fisiologico.**
🟡 **Controproposta:** un elemento vivo che riflette **la costanza della pratica**, non lo
stato del corpo. Qualcosa che cresce quando lei si sintonizza — e che non peggiora mai
quando lei sta male. Un giorno Gentle lo fa crescere quanto un giorno Upbeat, perché in
questo prodotto sono equivalenti. Così l'affetto per l'oggetto premia l'abitudine senza
premiare il sentirsi bene.

### La dashboard coach
**Da:** presente nella landing (`CoachDashboard.tsx`), e §13 la chiama "decisione aperta".

Vedi [decisioni aperte](03-decisioni-aperte.md) per le tre opzioni concrete.
🟡 **Fuori MVP in ogni caso.** La body-story copre il 70% del bisogno con lo 0% del rischio.

### La settimana 8 "Fuel your energy"
Unico contenuto del percorso che parla di cibo. Vedi
[journey](../02-prodotto/04-journey-16-settimane.md). 🔵 Serve firma clinica.

### La domanda "livello di soddisfazione"
Dal PDF originale: `deluso · frustrato · soddisfatto · fiducioso · orgoglioso`.
🔵 I primi due introducono un giudizio sulla performance in un prodotto che ha scelto di
non giudicare la performance. Ma catturano un dato reale sull'esperienza. Da decidere.

### I badge di fine mese
Un badge per la competenza acquisita (Recognise, Understand, ...) non è uno streak e non
premia la performance. 🔵 Probabilmente accettabile, da testare.

---

## 🔴 SCARTARE — falliscono il test

| Idea | Perché fallisce |
|---|---|
| **Streak giornalieri** | Genera colpa. E §7 dice esplicitamente che la previsione deve restare "un gioco a bassa posta". |
| **Classifica di squadra / confronto tra atlete** | Principio 4: mai contro una norma. |
| **Percentuale di accuratezza predittiva** | §7: mai un voto sull'accuratezza. |
| **Readiness score complessivo** | §8: umiltà sull'evidenza. Non esiste una soglia validata. |
| **Feed sociale** | Fuori scope, e apre problemi di safeguarding enormi con minori. |
| **AI coach conversazionale** | L'app deve insegnarle a parlare **con adulti reali**, non sostituirli. |
| **Integrazione wearable in v1** | Principio 1. Spende il budget sulla parte meno differenziante. |
| **Diario alimentare** | Principio 6, §12. Non si discute. |
| **Notifiche push motivazionali generiche** | Rumore. L'unica notifica giustificata è il promemoria del check. |
| **Consigli di allenamento specifici** | L'app supporta, non prescrive (§11). E non conosce il piano del coach. |

---

## Tre idee mie, oltre il materiale

### A · Il "check device-off"
**Da:** §10 (*"il successo è che si legga bene anche senza il dispositivo; fare riflessioni
periodiche device-off"*).

Una volta al mese, il check-in chiede la previsione e poi **non mostra il risultato calcolato
finché lei non ha completato tutto**. È già così — ma la variante interessante è
l'opposto: un giorno in cui l'app le chiede solo *"che tempo è oggi?"* e non le fa
compilare nulla, poi la sera le chiede *"avevi ragione?"*.

Costa un giorno di dati e restituisce una misura pulita di quanto la competenza è
interiorizzata. È anche un bel momento nel percorso (adatto alla Settimana 15).

### B · Il glossario personale
Ogni volta che usa `Somewhere else` o l'`Other` di Headspace, scrive una parola sua.
Quelle parole diventano **il suo lessico personale**, riproposto come opzione rapida le
volte successive.

Regge il test: non le dice cosa fare, aggiunge zero secondi (anzi ne toglie), non la
confronta con nessuno, e produce esattamente il linguaggio che poi userà con un adulto.
Ed è coerente con la Settimana 16 ("scrivi il tuo fingerprint").

### C · Le due domande di fine mese
Il percorso ha già una domanda di riflessione a fine di ogni mese (settimane 4, 8, 12, 16),
ma sono retoriche. 🟡 Renderle un vero momento: due schermate, due campi di testo, e
l'output entra nella body-story del mese e nella "mappa" finale della Settimana 16.

È il modo più economico di dare al percorso un **finale** — e un percorso senza finale
non si completa.
