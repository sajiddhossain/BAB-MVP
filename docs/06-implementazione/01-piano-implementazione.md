# 01 · Piano di implementazione

> Come si costruisce l'app, in che ordine, e quali vincoli tecnici derivano dai principi
> di prodotto. Questo documento è il ponte tra
> [i principi](../00-fondamenta/03-principi-di-design.md) e il codice in [`/app`](../../app/).

---

## I principi di prodotto, tradotti in vincoli tecnici

Questa tabella è la parte più importante del documento. Ogni riga è un principio che, se
non viene tradotto in una scelta architetturale, resta un poster appeso al muro.

| Principio di prodotto | Vincolo tecnico che ne deriva |
|---|---|
| **Semplicità = aderenza** (≤ 60–90 s) | Il check-in deve funzionare **offline**, senza attese di rete. Nessuna schermata che gira una rotella. Scrittura locale immediata, sincronizzazione dopo. |
| **Nessuna soglia validata** (§8) | Non si materializzano tabelle di aggregati né punteggi nel database. Si salvano **eventi grezzi**; ogni interpretazione si calcola a runtime e si può cambiare senza migrare i dati. |
| **Normale individualizzato** | Nessuna query che confronta atlete tra loro. La RLS lo rende **impossibile per costruzione**, non solo sconsigliato. |
| **Il ciclo non si condivide mai** | I dati di ciclo stanno in una **tabella separata con la sua RLS**. La promessa diventa strutturale, non affidata al codice applicativo. |
| **L'app supporta, non prescrive** | Tempo **suggerito** e tempo **scelto** sono due colonne distinte. Mai una sola. |
| **Bandiere rosse mai sepolte in un trend** | Le red flag sono una tabella a sé con `resolved_at`, non un campo dentro il check-in. Devono poter essere interrogate da sole. |
| **Dati di proprietà dell'atleta** (§9) | Export completo e cancellazione reale sono funzionalità di prima classe, previste dallo schema fin dall'inizio. |
| **Prediction error = la metrica** | La previsione va salvata **prima** dell'esito, con il proprio timestamp. Altrimenti non si distingue una previsione da una razionalizzazione. |

---

## Struttura del progetto

```
app/
├── src/
│   ├── lib/
│   │   ├── supabase.ts        client, tipizzato dallo schema
│   │   ├── db.ts              coda locale IndexedDB + sincronizzazione
│   │   ├── session.ts         atleta corrente, profilo, config derivata
│   │   ├── tempo.ts           la formula del tempo — isolata di proposito
│   │   └── track.ts           strumentazione del pilota
│   ├── copy/
│   │   ├── it.ts              tutte le stringhe, una lingua per file
│   │   └── en.ts
│   ├── components/            componenti riusabili del design system
│   │   ├── EmojiScale.tsx     usato 7 volte tra pre e post
│   │   ├── PillGroup.tsx      multi-select e single-select
│   │   ├── BodyMap.tsx        la mappa, usata 3 volte
│   │   ├── Collapsible.tsx    i blocchi educativi
│   │   └── TempoCard.tsx
│   ├── screens/
│   │   ├── onboarding/
│   │   ├── checkin/           pre e post condividono quasi tutto
│   │   ├── today/
│   │   ├── journey/
│   │   └── me/
│   └── content/
│       ├── journey.ts         le 16 settimane
│       ├── lexicon.ts         le sensazioni e la mappatura clinica
│       └── insights.ts        le regole di generazione
└── supabase/
    └── schema.sql             lo schema, idempotente
```

**Perché i componenti prima delle schermate.** La scala emoji compare 7 volte, la mappa
corporea 3, il blocco collassabile 5. Farne uno buono vale più che disegnare venti schermate.

**Perché `tempo.ts` è isolato.** La formula attuale (somma di 5 canali, soglie 20 e 13) non
è validata: il §8 dice esplicitamente di validare prima che una soglia guidi una decisione.
Isolarla in un file solo significa che, quando arriveranno i dati del pilota, si cambia lì e
basta — e nel frattempo si può personalizzare per atleta senza toccare le schermate.

**Perché `copy/` esiste dal giorno uno.** Vedi [i18n](04-i18n-e-copy.md): è il lavoro che
elimina il rischio "lingua non decisa" senza aver bisogno della decisione.

---

## Ordine di lavoro

Ogni blocco è verificabile da solo. Chiudere un blocco significa poterlo dimostrare.

### Blocco A · Le fondamenta *(fatto)*
- [x] Progetto, PWA, service worker, build pulita
- [x] Design system sui token della landing
- [x] Navigazione a 3 tab + segnalazione immediata persistente

### Blocco B · Copy fuori dal codice
- [ ] `copy/it.ts` e `copy/en.ts` con tutte le stringhe dei 6 prototipi
- [ ] Hook `useCopy()` con fallback e chiave visibile in sviluppo se manca
- [ ] Nessuna stringa letterale nei componenti (verificato con lint)

*Verificabile:* si cambia lingua da un solo interruttore e l'app intera cambia.

### Blocco C · La memoria
- [ ] Schema SQL applicato, RLS su ogni tabella
- [ ] Login con link via email
- [ ] Coda locale IndexedDB, scrittura immediata
- [ ] Sincronizzazione al ritorno della rete, con retry
- [ ] Export e cancellazione dei propri dati

*Verificabile:* si fa un check-in in modalità aereo, si riapre l'app domani, c'è ancora.

### Blocco D · Onboarding
- [ ] Le 6 schermate, con i gate già verificati nel prototipo
- [ ] Scrittura del profilo e del consenso
- [ ] Calcolo della configurazione derivata (mappa junior/full, layer ciclo, fasi)

*Verificabile:* un'atleta di 12 anni con ciclo e contraccezione ormonale ottiene la
configurazione giusta, e quella di 16 senza ciclo non vede mai il blocco ritmo.

### Blocco E · I due check-in
- [ ] Componenti condivisi (scala, pill, mappa, collassabile)
- [ ] Flusso pre: predict + confidenza → canali → mappa → decode → risultato
- [ ] Flusso post: look back → mappa → sense → decode → gli 8 esiti
- [ ] Care mode e segnalazione immediata collegati al database
- [ ] Strumentazione: secondi reali, suggerito vs scelto, campi saltati

*Verificabile:* una giornata intera pre → post, con i dati che finiscono nel database
nella forma giusta.

### Blocco F · Oggi
- [ ] I 6 stati calcolati sui dati veri, non scelti da uno switcher
- [ ] Care mode persistente finché non risolto

### Blocco G · Percorso e Me
- [ ] Percorso mesi 1–2, missioni spuntate dai check-in reali
- [ ] Me: trend della lettura, stadi Raccolta e Prime ipotesi
- [ ] Body-story con selezione, anteprima, esportazione immagine

### Blocco H · Impostazioni e messa a punto
- [ ] Profilo, ritmo, privacy, notifiche, aiuto
- [ ] Pass di accessibilità: contrasto AA, target 44 px, movimento ridotto, focus
- [ ] Verifica dei tempi reali di completamento

---

## Le tre misure del pilota

🔴 Vanno nel codice **prima** che il pilota inizi. Costano poche ore e sono irrecuperabili
dopo.

| Misura | Come | Perché |
|---|---|---|
| **Secondi reali** per check-in | `started_at` all'apertura, `completed_at` all'invio | Il tetto di 90 s è un requisito di fattibilità, non un auspicio. Va misurato, non stimato. |
| **Suggerito vs scelto** | Due colonne, sempre entrambe | È lei che corregge il modello. Dopo ~8 settimane quella differenza permette di personalizzare le soglie per atleta — cioè il «normale individualizzato» del principio 4. |
| **Campi saltati** | Un array dei campi lasciati vuoti | Dice quali domande non funzionano, prima che sia l'abbandono a dirlo. |

---

## Cosa non fare

Anti-pattern che sembrano ragionevoli e non lo sono, qui.

| Tentazione | Perché no |
|---|---|
| Salvare il tempo calcolato come unico valore | Perde il dato più prezioso: la correzione dell'atleta. Servono sempre due colonne. |
| Materializzare medie e aggregati nel database | Le soglie non sono validate: quando cambiano, i dati aggregati sono da rifare. Si calcola a runtime finché non c'è evidenza. |
| Mettere il ciclo dentro la tabella dei check-in | Rende la promessa di privacy una questione di attenzione nel codice invece che una garanzia strutturale. |
| Un endpoint «dammi i dati della squadra» | La decisione sulla visibilità del coach non è presa. Costruirlo significa averla presa. |
| Bloccare il check-in in attesa della rete | Viola il vincolo dei 90 secondi nel momento peggiore: in palestra, senza campo. |
| Notifiche oltre il promemoria del check-in | Rumore, e il principio «gioco a bassa posta» vieta streak e solleciti. |
| Salvare il testo libero senza limiti di lunghezza | Come sulla landing: i `CHECK` di colonna sono difesa server-side, non decorazione. |

---

## Documenti collegati

| | |
|---|---|
| [02 · Modello dati](02-modello-dati.md) | Schema, RLS, e le scelte che lo motivano |
| [03 · Offline e sincronizzazione](03-offline-e-sync.md) | Perché gli eventi immutabili risolvono il problema |
| [04 · i18n e copy](04-i18n-e-copy.md) | Come togliere di mezzo il rischio lingua |
