# 04 · Revisione della roadmap — decisioni della founder

> 🟢 **Deciso.** Riscontro della founder sul PDF della roadmap, 6 agosto 2026.
> Questo documento è il verbale: cosa è stato deciso, cosa ne consegue, e dove la
> decisione atterra nel codice. Quello che qui è verde non si ridiscute.
>
> Sette di queste chiudono decisioni che erano aperte in [03-decisioni-aperte](03-decisioni-aperte.md).
> Due aprono problemi nuovi, segnati 🔴 in fondo.

---

## Le decisioni, una per una

### R1 · I 90 secondi non sono un tetto

**Deciso:** il check-in deve potersi fare **in fretta**, ma anche **lentamente** se
lei vuole ascoltarsi con più calma.

Il numero smette di essere un vincolo di progetto e diventa una rassicurazione.
Conseguenze precise:

| Dove | Prima | Ora |
|---|---|---|
| Nell'app | "circa 90 secondi" in chiusura onboarding | via — nessun tempo mostrato, nessun contatore |
| Nelle notifiche | — | *"Pronta per il check-in? Ci vogliono solo 90 secondi"* — qui sì, come invito |
| Nelle metriche | tempo mediano ≤ 90 s = criterio di successo | via come criterio (vedi R11) |
| Nel database | `started_at` / `completed_at` | **restano**: si misura, non si giudica |

> Il ragionamento della founder che ribalta il criterio: *se ci mettono più tempo
> potrebbe essere il segnale che stanno prestando più attenzione a cosa il corpo
> comunica.* Un check-in lento non è un fallimento di design, è il prodotto che
> funziona.

---

### R2 · La squadra vede i dati dei due check-in, ciclo incluso

**Deciso:** per l'MVP le squadre hanno accesso a **tutti i dati dei due check-in**
— quindi **anche al ciclo** — e alla dashboard. **Non** al journaling, se lo
aggiungeremo.

Questo rovescia la raccomandazione D2 ([03-decisioni-aperte](03-decisioni-aperte.md#d2--visibilità-del-coach)),
che proponeva l'opzione A (nulla al coach se non ciò che lei condivide). La decisione
è dell'opzione **C**. È presa, e da qui in poi il documento la tratta come un dato.

**Come si implementa, perché la distinzione "sì ai dati / no al journaling" regga:**

Lo staff **non legge mai le tabelle di base**. Legge attraverso viste `coach_*` che
espongono le colonne strutturate ed **escludono il testo libero** — `note`,
`headspace_other`, `region_free`. Così la regola non dipende da chi scrive la query
dopo: le colonne del diario non sono raggiungibili, punto.

```
atleta  →  RLS athlete_id = auth.uid()   →  tutto, comprese le sue parole
staff   →  viste coach_*                 →  i numeri e i codici, mai le parole
```

**Cosa cambia di conseguenza, e non è opzionale:** il copy dell'onboarding oggi
promette *"il tuo ciclo non viene mai condiviso con un coach"*. Da adesso è falso, e
lo dice a una tredicenne. Il testo va riscritto per dire quello che succede davvero —
vedi R12. Una promessa di privacy sbagliata è peggio di nessuna promessa.

---

### R3 · Onboarding — la forma definitiva

**Deciso.** L'onboarding raccoglie, in quest'ordine:

| # | Domanda | Note |
|---|---|---|
| 1 | **Come ti chiamiamo?** | nome, non codice atleta |
| 2 | **Quando compi gli anni?** | data, non solo anno — serve per R4 |
| 3 | **Che sport fai?** | |
| 4 | **La mia settimana** ↓ | il blocco calendario, vedi sotto |
| 5 | **Ciclo:** quando ti è venuto l'ultima volta, se te lo ricordi | |
| 6 | **Contraccezione ormonale?** sì/no | **solo se ha più di 15 anni** |
| 7 | **Consenso** | vedi R13 |
| 8 | **Wearable via Apple Health** | 🔴 vedi B1 in fondo — non è fattibile su web |

**Il blocco 4 — "La mia settimana"** (nome proposto al posto di *agenda* o
*calendario*, per stare con *Oggi* e *Il mio ritmo*):

- **educazione fisica a scuola**, quali giorni → nei giorni di ed. fisica, al
  check-in compare *"Hai fatto educazione fisica oggi? Sì / No"*, perché a volte non
  ci vanno
- **giorni e orari di allenamento** → servono per sapere quando aspettarsi il
  check-in e il check-out
- **gare, con orario se già lo sa** → altrimenti le aggiunge dopo

---

### R4 · Una sola mappa corporea, dai 12 anni in su

**Deciso:** per ora **tutte hanno la stessa mappa**. Si costruisce pensando alle
12–14enni, ma il prodotto è usabile da ogni ragazza dai 12 in su — la founder vuole
farla provare anche ad atlete adulte.

Chiude D6. Sparisce il sottoinsieme *junior* e la funzione che sceglieva la variante
per fascia d'età: una mappa, ventinove regioni, per tutte.

---

### R5 · La dashboard del coach entra nella v1

**Deciso:** serve **dalla v1**. È ciò che le squadre vogliono, e le ragazze sono già
abituate a dare queste informazioni — sonno, RPE, dolori muscolari sono cose che i
coach oggi chiedono a voce.

Ribalta il taglio argomentato in [02-scope-mvp](02-scope-mvp.md#il-taglio-più-discutibile-perché-la-dashboard-coach-è-fuori).
L'argomento *"non vi diamo una dashboard, vi diamo atlete che sanno dirvi come
stanno"* resta un buon pitch, ma non descrive più il prodotto: adesso diamo entrambe
le cose.

**Cosa il coach inserisce** (non solo legge):

- **altezza e peso** di ogni atleta, se li ha → 🔒 **l'atleta non li vede**, mai, in
  nessuna schermata
- **il tipo di sessione della squadra** — es. alta intensità il martedì, bassa il
  giovedì — più quando e quanto si allenano
- **gare** (atletica, nuoto, palestra tipo Hyrox o CrossFit) o **partite** (calcio,
  pallavolo, basket, tennis), a seconda dello sport

---

### R6 · Niente firma del medico dello sport per l'MVP

**Deciso:** la firma di un medico dello sport **non è necessaria per l'MVP**, anche
perché si passa dalle squadre.

Chiude D4, che era marcata come il primo collo di bottiglia del progetto. Non lo è
più. `CLINICAL_SIGNOFF.signed = false` smette di essere un blocco di rilascio.

**Advisor clinici effettivi:**

- **Tristin Agtarap** — nominare il dolore e le sensazioni (il lessico, la mappa
  sensazione → categoria)
- una seconda advisor, incontro l'**11 agosto 2026**

Il file `content/clinical.ts` passa da *blocco di rilascio* a *registro di revisione
per area*: si tiene traccia di chi ha guardato cosa, senza fermare la spedizione.

> Resta vero, e lo scrivo una volta sola: passare dalle squadre sposta il contesto,
> non cancella il dovere di cura sul testo che instrada una tredicenne che ha male.
> Quel testo lo legge lei, non il coach. Lo scopo del registro per area è tenere
> visibile cosa è stato guardato da chi — non riaprire la decisione.

---

### R7 · La vista "Me" entra nella v1

**Deciso:** se è la sua dashboard, **ci deve essere dalla v1**. È ciò che la motiva:
vedere se ci sono pattern, vedere il progresso nel conoscersi, e vedere quando ha
fatto i check-in e quando no.

Nota di design che arriva dal riscontro: la vista deve mostrare **anche le assenze**,
non solo i dati. "Quando non l'ho fatto" è informazione, e nasconderla la
renderebbe più gentile ma meno vera.

---

### R8 · Il "Percorso" resta fuori dall'MVP

**Deciso, confermato:** il percorso a 16 settimane non entra. Conferma quanto già
proposto.

Cade quindi anche D3 (la settimana 8 sull'alimentazione): il **contenuto del percorso
alimentazione non entra né in v1 né in v1.1**. La decisione più delicata del prodotto
si sposta più in là, il che è il modo giusto di gestirla.

---

### R9 · Italiano e inglese, entrambi

**Deciso:** si costruisce **in italiano e in inglese**, perché le advisor sono tutte
straniere. Si scrive in italiano e si traduce.

Chiude D1 sull'opzione **C**. È esattamente l'architettura già costruita: `it.ts` detta
la forma, `en.ts` è tipizzato su di essa e una chiave mancante non compila. Nessun
lavoro strutturale da rifare — solo tenere `en.ts` allineato.

---

### R10 · Più di 20 atlete, e la webapp non si sostituisce

**Deciso, ed è il vincolo architetturale più importante del riscontro:**

> Saranno potenzialmente più di 20 atlete. L'obiettivo è che continuino anche dopo il
> primo mese. E soprattutto: **non dobbiamo sostituire la webapp**, ma semmai
> aggiungerci cose man mano. È essenziale che loro, i coach e noi **non perdiamo i
> dati** inseriti nelle prime settimane.

Lo scopo è più esteso e più serio del primo MVP, perché ci sono squadre di calcio e
pallavolo.

**Cosa lo garantisce, concretamente** — e sono scelte già prese, non promesse:

| Garanzia | Come |
|---|---|
| Nessuna riscrittura dei dati | Gli eventi sono **immutabili**: un check-in non si modifica mai, se lo rifà è una riga nuova |
| Nessuna migrazione per un cambio di parole | Nel DB vanno **codici stabili** (`calf_r`, `gives_way`), le etichette stanno altrove |
| Nessuna interpretazione congelata | **Zero aggregati materializzati**: soglie e fasi si calcolano a runtime e possono cambiare idea senza toccare i dati |
| Nessun dato perso offline | Coda di inserimenti idempotenti con UUID generati sul client |
| Uscita sempre possibile | `export_my_data()` è una funzione di prima classe, non un'aggiunta |

Aggiungere una colonna, una sensazione o una schermata è additivo per costruzione.
**Questo vincolo ha diritto di veto su ogni scelta tecnica futura**, e va citato quando
qualcuno proporrà una scorciatoia che lo viola.

---

### R11 · Le metriche di successo cambiano

**Deciso:**

- ❌ **fuori** — tempo mediano di completamento come criterio di successo
- ❌ **fuori** — "il check-in supera i 90 secondi" come rischio da mitigare
- ✅ **dentro** — quanto tempo passano sul check-in, **tracciato ma non giudicato**
- ✅ **dentro** — che continuino **dopo il primo mese** (la ritenzione diventa il
  criterio principale, non l'aderenza a quattro settimane)

---

## 🔴 Due problemi nuovi

### B1 · Apple Health non è raggiungibile da una web app

L'onboarding prevede di chiedere il collegamento dei wearable via Apple Health. **Da
una web app non è tecnicamente possibile**: HealthKit è un'API di sistema riservata
alle app native iOS, e non esiste da Safari né da una PWA installata. Non è una
questione di permessi o di tempo di sviluppo — l'API non c'è.

Le strade realmente percorribili:

| Strada | Cosa comporta |
|---|---|
| **Rimandare a quando esisterà l'app nativa** | 🟡 la mia raccomandazione: il principio 1 dice che l'app è utile senza wearable, ed è vero |
| **Inserimento manuale** di sonno e passi | Costa tocchi al check-in, contro R1 |
| **Integrazioni cloud** (Garmin, Fitbit, Whoop, Oura, Strava) | Hanno API web vere. Ma non Apple Watch, che è il caso più comune fra le ragazze |
| **App nativa** | Fuori scala per l'MVP |

🔵 **Serve una decisione**, perché l'onboarding non può contenere una schermata che
promette qualcosa che non funziona.

### B2 · "Tempo" in italiano vuol dire *tempo*

Il riscontro alla pagina 7 chiedeva cosa fosse il *"tempo suggerito dall'app"*,
leggendolo come una **durata**. In realtà quella riga parla della cosa più preziosa
del pilota: la **marcia suggerita dall'app** (⚡ Upbeat / 🌊 Steady / 🍃 Gentle) contro
quella **scelta dall'atleta** — cioè l'atleta che corregge il modello.

Se la founder, che il prodotto lo conosce meglio di chiunque, l'ha letto come una
durata, una tredicenne lo leggerà come una durata. **La parola non funziona in
italiano.**

🟢 **Deciso: "andatura".** I tre nomi restano in inglese — sono vocabolario condiviso col
coach e devono restare identici tra mercati — ma il concetto, in italiano, si chiama
**andatura**. *"Che andatura hai oggi?"* si legge senza inciampi, e regge anche la metafora
della marcia già presente nel copy inglese.

Applicato ovunque: copy dell'app, 16 documenti, roadmap e README dei prototipi. **In
inglese resta `tempo`**, che lì funziona; e restano `tempo` anche i nomi tecnici — le
colonne `tempo_predicted` / `tempo_chosen`, il tipo `Tempo`, le variabili CSS
`--tempo-*`, il file `tempo.ts`. Rinominarli significherebbe migrare dati per una
questione di lingua, contro [R10](#r10--più-di-20-atlete-e-la-webapp-non-si-sostituisce).

---

## Cosa resta aperto

| # | Domanda |
|---|---|
| **B1** | Wearable: si rimanda, o si scelgono le integrazioni cloud? |
| ~~B2~~ | 🟢 **Chiusa: "andatura".** Applicata ovunque nell'italiano |
| D8 | La domanda "livello di soddisfazione" — i primi due valori giudicano la prestazione |
| D9–D12 | Avatar, badge, spec UI vecchie, tema scuro — tutte rimandabili |

D1, D2, D3, D4, D6 sono chiuse da questo giro.
