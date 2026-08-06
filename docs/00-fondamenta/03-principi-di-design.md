# 03 · Principi di design — il DNA

> Fonte: documento sorgente §3. Sono dieci, li ho lasciati tutti e dieci e ho aggiunto
> per ciascuno **la conseguenza concreta di UI** — perché un principio che non cambia
> una schermata è solo un poster.

Tutti 🔴 non negoziabili.

---

### 1. Il self-report è la spina dorsale; il wearable è un bonus

L'app è **pienamente utile senza alcun dispositivo**. Una banda semplice la migliora, non
la abilita.

**Conseguenza UI:** l'onboarding non chiede mai di collegare un device come step obbligatorio.
Nessuna schermata mostra uno stato vuoto del tipo "collega il tuo dispositivo per iniziare".
Il tier wearable è una preferenza in impostazioni, non un gate.

---

### 2. Calibrazione interocettiva, non monitoraggio

Lei **prevede**, poi **verifica**. Il punto è il prediction error che si restringe.

**Conseguenza UI:** la schermata `Compare` è il cuore emotivo del prodotto, non un
riepilogo di cortesia. Ha lo stesso peso visivo del risultato. La domanda ricorrente
dell'app è *"quanto bene mi sono letta oggi?"* — mai *"quanto sono in forma?"*.

---

### 3. La semplicità compra l'aderenza

Carico giornaliero minimo, pochi item validati — altrimenti i dati diventano invalidi.

**Conseguenza UI:** budget rigido di ~10 micro-tocchi per check-in. Ogni nuova domanda
proposta deve **sostituire** una esistente, non sommarsi. Il tetto è ≤60–90 secondi e va
misurato davvero nel pilota, non stimato.

---

### 4. "Normale" è individualizzato

Tutto è giudicato **within-person nel tempo**, mai contro una norma di popolazione.

**Conseguenza UI:** bandita ogni forma di classifica, percentile, confronto con
"altre atlete della tua età". I grafici hanno sempre come riferimento **la sua linea
di base**, disegnata dai suoi dati.

---

### 5. Body literacy, non sorveglianza

Framing curioso e di supporto, che costruisce una competenza che è **sua**, con locus
of control interno.

**Conseguenza UI:** il linguaggio è in seconda persona e sempre attribuisce l'agency a
lei: *"il tuo corpo, la tua chiamata"*. Il bottone che permette di cambiare l'andatura
suggerito dall'app non è un'eccezione: è una feature di principio.

---

### 6. Food-safe

Si tracciano **energia e sete**. Mai fame, sazietà, cibo. Sensibilità legata all'età.

**Conseguenza UI:** questo principio ha già cancellato una feature reale — il canale
`fuel` ("quanto ti senti sazia", 1-5) presente nel prototipo v1 è stato rimosso in v2.
Il rifornimento post-allenamento è invece ammesso come *nudge neutro* ("mangia quando
hai fame"), perché è recovery, non tracking.

> ⚠️ Attenzione: il **Mese 2, settimana 8** del journey ("Fuel your energy") e il vecchio
> nudge `🥪 Quick one: eaten enough...` sono **al limite** di questo principio. Vedi
> [decisioni aperte](../04-brainstorming/03-decisioni-aperte.md).

---

### 7. Privacy, agency e safeguarding prima di tutto

I suoi dati sono suoi. La condivisione è opt-in. Dati intimi e mestruali sono protetti
in modo speciale.

**Conseguenza UI:** nessuna condivisione di default. Ogni schermata che genera un output
condivisibile ha un passaggio esplicito in cui è lei a scegliere cosa passare e a chi.

---

### 8. Umiltà sull'evidenza

Nessuna soglia a falsa precisione. Prima within-athlete. Supervisione clinica per
qualsiasi cosa riguardi la salute.

**Conseguenza UI:** niente "readiness 73%". I risultati sono qualitativi e nominati
(`Upbeat` / `Steady` / `Gentle`), non quantificati.

---

### 9. Costruito per essere detto ad alta voce

**Ogni output deve aiutarla a comunicare il suo stato a un adulto.**

**Conseguenza UI:** questo è il principio più sottovalutato e il più differenziante.
Ogni risultato dovrebbe avere una forma "frase pronta da dire":
> *"Oggi leggo un po' basso — possiamo tenerla Steady?"*

Nel journey questa è un'intera skill (Mese 3, `Communicate`). Nel prodotto deve essere
un componente ricorrente, non una schermata sola.

---

### 10. Il dolore con sfumature

Si allena la discriminazione **protettivo vs adattivo**, non l'ipervigilanza. Un report
di dolore preoccupante **non viene mai sovrascritto** da una lettura verde del dispositivo.

**Conseguenza UI:** il blocco "Decode your ache" mette le due colonne **fianco a fianco
prima di chiedere**. Si insegna la distinzione, poi si fa la domanda. E la regola
esplicita in copy: *"nel dubbio, chiamalo protettivo"*.

---

## Test rapido per ogni nuova feature

Prima di aggiungere qualsiasi cosa, cinque domande:

1. Le **dice cosa fare** o le **insegna a capirlo**? → se la prima, fuori.
2. Aggiunge **secondi** al check-in giornaliero? → se sì, cosa toglie in cambio?
3. La confronta con **qualcun altro**? → se sì, fuori.
4. Tocca **cibo, peso o corpo come forma**? → se sì, fuori.
5. Produce qualcosa che lei **può dire a un adulto**? → se sì, punto bonus.
