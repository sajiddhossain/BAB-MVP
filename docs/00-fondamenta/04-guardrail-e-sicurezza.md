# 04 · Guardrail e sicurezza

> Fonte: documento sorgente §10, §11, §12. Più il copy reale dei prototipi
> (blocchi `Care mode`), che è la versione già scritta e testabile di queste regole.

Questa è la sezione che, se sbagliata, chiude il prodotto. Va letta da chiunque tocchi
copy o logica.

---

## 1 · Le bandiere rosse

**Definizione (dal §11):** cedimento articolare, dolore notturno, dolore osseo focale,
gonfiore/calore, intorpidimento persistente.

**Regola 🔴: escalano a un umano immediatamente, mai sepolte in un trend.**

Non esiste caso in cui una bandiera rossa venga aggregata, mediata o rimandata a una
vista settimanale. È un'interruzione, subito.

### Come è già implementato nei prototipi (copy reale, da riusare)

Quando l'atleta segnala dolore protettivo, compare il blocco **Care mode**:

> 🛡️ **Care mode — protect it first**
>
> Hai segnalato dolore protettivo — bella presa. Qualunque andatura mostrino gli altri
> canali, quella parte del corpo va in Care oggi. Non è essere molli; è come i pro
> proteggono una carriera lunga.
>
> - Non caricarci sopra. Smetti di fare ciò che fa male.
> - Solo movimento gentile e **senza dolore** — altrimenti riposa quell'area.
> - Dillo al tuo coach e a un genitore **oggi**.
> - Se fa male di notte, ti fa zoppicare, o non migliora in un paio di giorni, vedi
>   un fisioterapista o un medico. Le tue ossa stanno ancora crescendo, quindi il
>   dolore articolare e osseo si fa controllare, mai si supera a forza.

**Cosa funziona già bene in questo copy** (da preservare):
- Rinforza positivamente l'atto di segnalare (*"bella presa"*) → combatte il sotto-riporto.
- Riformula il riposo come comportamento da professionista, non come debolezza.
- Dà un'istruzione temporale precisa (**oggi**), non generica.
- Spiega il *perché* fisiologico (ossa in crescita) in una riga.

---

## 2 · Il catalogo completo dei guardrail (§10)

| Guardrail | Cosa significa | Come si verifica |
|---|---|---|
| **Calibrazione, non offloading** | Successo = si legge bene **anche senza** il dispositivo. | Riflessioni periodiche "device-off". 🟡 Proposta: una settimana device-off ogni mese nel journey. |
| **Nessun punteggio nocebo** | Niente numeri rossi "PERICOLO". Gli scarti si mostrano come apprendimento. Spazio neutro e a bassa attivazione **prima delle gare**. | 🔵 Da definire: l'app rileva il giorno-gara? Vedi decisioni aperte. |
| **Dolore con sfumature** | Discriminazione protettivo/adattivo, non ipervigilanza. Una lettura verde del device non sovrascrive mai un report di dolore. | Il blocco "Decode your ache" precede sempre la domanda. |
| **Privacy, agency, body-positive, trauma-aware** | Dati mestruali e di dolore sono suoi. Linguaggio curioso, mai sorveglianza. | ⚠️ **Modificato da [R2](../04-brainstorming/04-revisione-roadmap.md#r2--la-squadra-vede-i-dati-dei-due-check-in-ciclo-incluso):** lo staff vede i check-in e le date del ciclo. Resta vero il resto: il testo libero è solo suo, e lei sa chi la vede prima di scrivere. |
| **Scalato per età e verificato in affidabilità** | Stabilire affidabilità test–retest prima di fidarsi dei dati. | ⚠️ **Modificato da [R4](../04-brainstorming/04-revisione-roadmap.md#r4--una-sola-mappa-corporea-dai-12-anni-in-su):** una sola mappa per tutte, dai 12 anni in su. Una mappa per fascia d'età renderebbe i dati non confrontabili proprio mentre lei cresce. |
| **Supervisione clinica** | Instradamento bandiere rosse, percorsi mestruali/RED-S e qualsiasi indicazione di salute rivisti da un professionista. | ⚠️ **Modificato da [R6](../04-brainstorming/04-revisione-roadmap.md#r6--niente-firma-del-medico-dello-sport-per-lmvp):** non è più un blocco di rilascio per l'MVP, perché si passa dalle squadre. La revisione procede per area — vedi `content/clinical.ts`. |

---

## 3 · Esclusioni deliberate (§12) — e perché

Queste non sono "cose non ancora fatte". Sono **decisioni prese**, con motivazione.
Vanno difese quando qualcuno chiederà di aggiungerle.

| Escluso | Motivo |
|---|---|
| **Cibo, fame, sazietà, calorie** | Sensibilità legata all'età. Energia + sete sono i proxy sicuri. |
| **Acute:chronic workload come motore centrale** | Predizione debole (AUC ≤0.60), non studiato nelle giovani atlete femmine. Resta solo come nudge morbido su picchi. |
| **Soglie z-score "confidenti"** | Lo *smallest worthwhile change* non è definito per questo gruppo. Si resta within-athlete e descrittivi. |
| **Normalizzazione di precisione per fase mestruale** | Inaffidabile su cicli adolescenti irregolari. Il ciclo si usa **solo come contesto**. |
| **HRV come spina dorsale** | Troppo variabile individualmente e dipendente dal dispositivo. Solo layer opzionale Tier 2. |

---

## 4 · Output verso gli adulti (§11)

Per una minorenne, l'app **supporta** la decisione push/rest/recover — **non prescrive mai**.

Due soli output portano questo peso:

1. **Un nudge gentile e non diagnostico**, legato al suo fingerprint e al suo carico.
2. **Una "body-story" settimanale condivisibile** — un visual semplice di cosa ha segnalato
   il suo corpo, che lei può passare a un coach, un genitore o un fisio.

Il secondo è la manifestazione concreta del principio *"costruito per essere detto ad alta voce"*
e — 🟡 mia lettura — è **la feature più sottovalutata di tutto il materiale**. È l'unica cosa
che rende il prodotto interessante anche per la squadra, senza tradire la privacy dell'atleta.

---

## 5 · Governance dei dati di minori (§9)

- **Consenso del tutore** obbligatorio.
- **Dati di proprietà dell'atleta** per default.
- **Raccolta e accesso chiari** e dichiarati.
- **De-identificazione** per qualsiasi uso aggregato/di ricerca.
- Partecipazione alla ricerca **opt-in**, e la ragazza **beneficia direttamente**
  del feedback — non è solo una fonte di dati.

> Il documento sorgente lo dice esplicitamente: *"l'etica lo rende un loop virtuoso, non
> estrazione"*. E aggiunge l'umiltà: la scoperta aggregata **genera ipotesi e affina i
> prior; non diventa un claim clinico** finché non è validata indipendentemente.

---

## 6 · La decisione aperta più pesante (§13)

> **Visibilità del coach — serve una chiamata della founder.**
>
> Il safeguarding vorrebbe che gli adulti vedessero le bandiere rosse.
> L'onestà del riporto vorrebbe che i dati siano *suoi*.
>
> Default attuale: **athlete-owned, condivisione opt-in** — da rivedere se il prodotto
> viene distribuito attraverso i club.

Questa tensione è reale e non si risolve con un compromesso di design generico.
Vedi [decisioni aperte](../04-brainstorming/03-decisioni-aperte.md) per le tre opzioni
concrete che ho preparato.
