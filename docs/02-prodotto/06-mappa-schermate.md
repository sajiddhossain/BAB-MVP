# 06 · Mappa schermate MVP

> 🟡 Inventario completo di ciò che va costruito. Serve per stimare, per assegnare, e per
> non dimenticare gli stati vuoti — che sono metà del lavoro vero.

---

## Legenda stato

| | Significato |
|---|---|
| ✅ | Già prototipato, copy pronto |
| 🟠 | Parzialmente prototipato, va completato |
| 🔴 | Da progettare da zero |

---

## Onboarding — 6 schermate

| # | Schermata | Stato | Note |
|---|---|---|---|
| O1 | Benvenuto — cosa fa e cosa non fa BAB | 🔴 | Copy adattabile dal journey ("Fatto per farti bene") |
| O2 | Consenso tutore + atleta | 🔴 | Requisito legale §9. Serve testo legale reale. |
| O3 | Età | 🔴 | Determina la mappa corporea junior/full |
| O4 | Sport e giorni di allenamento | 🔴 | Determina i default dei check |
| O5 | Il tuo ritmo (ciclo: sì / non ancora / preferisco non dirlo → date + contraccezione) | 🔴 | Copy proposto in [architettura](01-architettura-informativa.md) |
| O6 | Primo check-in guidato | 🟠 | Riusa il flusso pre con overlay esplicativi |

---

## Tab "Oggi"

| # | Schermata / stato | Stato | Note |
|---|---|---|---|
| T1 | Home — pre non fatto | 🔴 | Una card, un bottone |
| T2 | Home — pre fatto, post no | 🔴 | Mostra il tempo scelto |
| T3 | Home — giornata completa | 🔴 | Riepilogo + missione settimana |
| T4 | Home — giorno di riposo | 🔴 | Riflessione opzionale (§5) |
| T5 | Home — giorno saltato | 🔴 | Copy neutro, nessuna colpa |
| T6 | Home — Care mode attivo | 🟠 | Il contenuto esiste, manca lo stato persistente |

### Flusso pre-allenamento

| # | Schermata | Stato | Note |
|---|---|---|---|
| P0 | Il tuo ritmo (condizionale) | ✅ | Accordion chiuso di default |
| P1 | Predict + confidenza + ore sonno | 🟠 | Predict ✅; confidenza e ore 🔴 |
| P2 | Tune in — 4 canali + Headspace | ✅ | |
| P2b | "Ti ha sorpresa qualcosa?" | 🔴 | Segnale micro del §5 |
| P3 | Mappa corporea + sensazione | 🟠 | Mancano intensità, tag comportamento, 2 sensazioni red flag |
| P4 | Decode your ache + domanda dolore | ✅ | Va reso collassabile dopo 2 settimane |
| P5 | Risultato: tempo + Compare + Adjust + swap | ✅ | Aggiungere "copia frase per il coach" |
| P5b | Care mode (condizionale) | ✅ | |

### Flusso post-allenamento

| # | Schermata | Stato | Note |
|---|---|---|---|
| Q1 | Look back — tempo + sforzo + durata | 🟠 | Durata e tipo sessione 🔴 |
| Q2 | Mappa corporea | 🟠 | Stessi gap di P3 |
| Q3 | Sense — 3 scale + Headspace | ✅ | |
| Q4 | Decode any ache + domanda | ✅ | |
| Q5 | Risultato: Learn (8 esiti) + Recap + Recover | ✅ | |
| Q5b | "Cosa ti sei portata a casa?" | 🔴 | Recuperata dal PDF originale |
| Q5c | Comunicare (opzionale) | 🔴 | Punto 7 del §5 |
| Q5d | Care mode (condizionale) | ✅ | |

### Cattura acuta — sempre accessibile 🔴

| # | Schermata | Stato | Note |
|---|---|---|---|
| A1 | "Mi sono fatta male" → mappa | 🔴 | Da qualsiasi schermata, 1 tocco |
| A2 | Sensazione + intensità | 🔴 | |
| A3 | Care mode + chi avvisare | 🟠 | Copy Care ✅ |

---

## Tab "Percorso"

| # | Schermata | Stato | Note |
|---|---|---|---|
| J1 | Vista mese corrente + settimana protagonista | 🟠 | Contenuto ✅, layout da rifare per mobile |
| J2 | Dettaglio settimana (missione, come BAB aiuta, rifletti) | ✅ | Aggiungere campo riflessione |
| J3 | Settimane passate | 🔴 | |
| J4 | Fine mese — la competenza acquisita | 🔴 | 🔵 badge sì/no da decidere |
| J5 | Fine percorso — la tua mappa | 🔴 | Output della Settimana 16 |

---

## Tab "Me"

| # | Schermata | Stato | Note |
|---|---|---|---|
| M1 | La mia lettura (trend prediction error) | 🔴 | Nessun asse numerico |
| M2 | Patterns — stadio Raccolta (sett. 1–3) | 🔴 | Con contatore |
| M3 | Patterns — stadio Prime ipotesi (4–8) | 🔴 | |
| M4 | Patterns — stadio Fingerprint (9+) | ✅ | Grafico + fasi + insight prototipati |
| M5 | Dettaglio insight + 👍/🤔 | 🟠 | Insight ✅, feedback 🔴 |
| M6 | Body-story — composizione e selezione | 🔴 | **Feature strategica mancante** |
| M7 | Body-story — anteprima e condivisione | 🔴 | |
| M8 | Card RED-S (condizionale, silenziosa) | 🔴 | Blocco: firma clinica |

---

## Impostazioni e sistema

| # | Schermata | Stato |
|---|---|---|
| S1 | Profilo e età | 🔴 |
| S2 | Il mio ritmo (modifica date, disattiva) | 🔴 |
| S3 | Privacy e dati (esporta, cancella) | 🔴 |
| S4 | Notifiche (orari check) | 🔴 |
| S5 | Wearable (Tier 1/2) | ⏸️ **fuori MVP** |
| S6 | Aiuto / chi contattare | 🔴 |

---

## Riepilogo

| Categoria | ✅ | 🟠 | 🔴 | Totale |
|---|---|---|---|---|
| Onboarding | 0 | 1 | 5 | 6 |
| Oggi (home + stati) | 0 | 1 | 5 | 6 |
| Flusso pre | 4 | 2 | 2 | 8 |
| Flusso post | 4 | 2 | 3 | 9 |
| Cattura acuta | 0 | 1 | 2 | 3 |
| Percorso | 1 | 1 | 3 | 5 |
| Me | 1 | 1 | 6 | 8 |
| Impostazioni | 0 | 0 | 5 | 5 |
| **Totale** | **10** | **9** | **31** | **50** |

**Lettura:** il materiale copre già molto bene il **cuore quotidiano** (i due check-in:
8 schermate su 17 pronte, il resto da completare). Quello che manca quasi interamente è
**tutto ciò che sta attorno**: onboarding, stati della home, la vista Me nei primi giorni,
la body-story, le impostazioni.

È un profilo tipico e non preoccupante: significa che il pensiero è andato dove serviva
prima — sul valore. Ma va detto chiaramente che **la parte "già fatta" è ~30% dell'MVP**,
non il 70% che i prototipi possono far sembrare.

---

## Edge case da non dimenticare

| Caso | Cosa deve succedere |
|---|---|
| Apre l'app a mezzanotte | Il "giorno" finisce alle 4 del mattino, non a mezzanotte |
| Fa il post senza aver fatto il pre | Consentito. Il Compare salta, il resto funziona. Nessun rimprovero. |
| Fa due allenamenti in un giorno | 🔴 Comunque 2 check totali; si taggano le sessioni (§5) |
| Salta 3 settimane e torna | Il percorso non avanza da solo oltre 1 settimana di inattività; ricomincia da dove era. Copy di ritorno caldo. |
| Segna dolore protettivo 5 giorni di fila | Escalation: il Care mode diventa più insistente sul vedere un clinico |
| Non ha ancora il ciclo | Tutto il layer Rhythm resta educativo; nessun input, nessun grafico a bande |
| Ha 11 anni | Mappa corporea junior, linguaggio già adatto |
| Offline | I check-in devono funzionare offline e sincronizzare dopo — si allena in palestre senza campo |
| Cancella l'account | Export completo + cancellazione reale (§9) |
