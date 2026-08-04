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
| O1 | Benvenuto — cosa fa e cosa non fa BAB | ✅ | v1: due colonne è/non è |
| O2 | Consenso tutore + atleta | 🟠 | v1: flusso e gate pronti; **manca il testo legale reale** |
| O3 | Età | ✅ | v1: seleziona già junior/full |
| O4 | Sport e giorni di allenamento | ✅ | v1 |
| O5 | Il tuo ritmo (ciclo: sì / non ancora / preferisco non dirlo → date + contraccezione) | ✅ | v1: 3 stati, date, contraccezione, blocco privacy |
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
| P3 | Mappa corporea + sensazione | ✅ | v3: lessico a 14 voci in 3 gruppi, intensità, tag comportamento, red flag che instradano da sole |
| P4 | Decode your ache + domanda dolore | ✅ | Va reso collassabile dopo 2 settimane |
| P5 | Risultato: tempo + Compare + Adjust + swap | ✅ | Aggiungere "copia frase per il coach" |
| P5b | Care mode (condizionale) | ✅ | |

### Flusso post-allenamento

| # | Schermata | Stato | Note |
|---|---|---|---|
| Q1 | Look back — tempo + sforzo + durata | 🟠 | Durata e tipo sessione 🔴 |
| Q2 | Mappa corporea | ✅ | v3: stessi miglioramenti di P3 |
| Q3 | Sense — 3 scale + Headspace | ✅ | |
| Q4 | Decode any ache + domanda | ✅ | |
| Q5 | Risultato: Learn (8 esiti) + Recap + Recover | ✅ | |
| Q5b | "Cosa ti sei portata a casa?" | 🔴 | Recuperata dal PDF originale |
| Q5c | Comunicare (opzionale) | 🔴 | Punto 7 del §5 |
| Q5d | Care mode (condizionale) | ✅ | |

### Cattura acuta — sempre accessibile ✅

| # | Schermata | Stato | Note |
|---|---|---|---|
| A1 | "Mi sono fatta male" → mappa | ✅ | v3: bottone sticky, 27 regioni dalla stessa mappa |
| A2 | Sensazione + intensità | ✅ | v3: 7 sensazioni pesate verso l'acuto |
| A3 | Care mode + chi avvisare | ✅ | v3: urgenza adattiva + frase da copiare |

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
| M6 | Body-story — composizione e selezione | ✅ | v1: 5 blocchi, ciclo off di default |
| M7 | Body-story — anteprima e condivisione | ✅ | v1: anteprima live + frase auto-generata |
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
| Onboarding | 4 | 2 | 0 | 6 |
| Oggi (home + stati) | 0 | 1 | 5 | 6 |
| Flusso pre | 5 | 1 | 2 | 8 |
| Flusso post | 5 | 1 | 3 | 9 |
| Cattura acuta | 3 | 0 | 0 | 3 |
| Percorso | 1 | 1 | 3 | 5 |
| Me | 3 | 1 | 4 | 8 |
| Impostazioni | 0 | 0 | 5 | 5 |
| **Totale** | **21** | **8** | **21** | **50** |

> ✅ **Aggiornato dopo i [prototipi](../../prototipi-v3/)**: chiusi i tre buchi di sicurezza
> (P3, Q2, A1–A3), più l'onboarding (O1–O5) e la body-story (M6–M7), che non esistevano
> in nessun prototipo del materiale originale.

**Lettura:** il materiale di partenza copriva bene il **cuore quotidiano** e quasi niente
di tutto ciò che sta attorno — era ~30% dell'MVP, non il 70% che i prototipi potevano far
sembrare. Chiusi i buchi di sicurezza, l'onboarding e la body-story, siamo attorno al
**~50%**.

Quello che resta è concentrato in tre punti: la **home "Oggi"** con i suoi 6 stati (nessuno
prototipato), la **vista Me nelle prime settimane** (il rischio di abbandono numero uno), e
le **impostazioni**. Più il testo legale del consenso, che non è lavoro di design.

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
