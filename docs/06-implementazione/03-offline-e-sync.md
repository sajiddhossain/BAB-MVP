# 03 · Offline e sincronizzazione

> Perché è un requisito e non una rifinitura, e perché il modello a eventi
> immutabili lo rende quasi banale.

---

## Perché serve davvero

Tre ragioni, in ordine di peso:

1. **In palestra spesso non c'è campo.** È il posto dove il check-in va fatto.
2. **Il tetto è 60–90 secondi.** Se l'app aspetta la rete, quel tetto salta nel momento
   peggiore. E un check-in che gira una rotella è un check-in che non si fa.
3. **Il sotto-riporto è già il rischio numero uno** con questa fascia d'età (Temm).
   Ogni attrito aggiunto lo peggiora.

🔴 Conclusione: **l'app non chiede mai alla rete il permesso di registrare qualcosa.**

---

## La scelta che rende tutto semplice

Il modello a **eventi immutabili** (vedi [modello dati](02-modello-dati.md)) elimina il
problema più difficile della sincronizzazione: i conflitti.

- Un check-in non si modifica mai → non esistono due versioni della stessa riga.
- Se rifà il check-in, è **una riga nuova** → non c'è nulla da fondere.
- L'`id` è un UUID **generato sul client** → l'inserimento è idempotente: se il retry
  reinvia la stessa riga, il database la rifiuta come duplicato e non succede niente.

Quindi la sincronizzazione è una coda di inserimenti, non un algoritmo di merge.

```
   scrittura                    coda                      server
   ─────────                    ────                      ──────
   check-in    →  IndexedDB  →  pending[]  ──online──→   insert
   completato     (subito)                 ──offline─→   resta in coda
                                              ↑
                                        riprova quando
                                        torna la rete
```

---

## Come funziona

### Scrittura
1. L'app genera l'UUID e scrive **subito in IndexedDB**. La UI prosegue immediatamente:
   per l'atleta il check-in è finito.
2. La riga entra nella coda `pending`.
3. Se c'è rete, si prova subito l'invio. Se non c'è, resta in coda.

### Sincronizzazione
- Si attiva su: ritorno online, riapertura dell'app, e un tentativo periodico leggero.
- Invia **in ordine di creazione**, perché `body_signals` e `red_flags` referenziano il
  check-in.
- Retry con attesa crescente. Un errore di rete non svuota mai la coda.
- Un errore di **validazione** (un `CHECK` rifiutato) invece sì: quella riga va messa da
  parte e segnalata, perché riprovarla all'infinito non la sistemerà.

### Lettura
Prima IndexedDB, poi il server. L'app deve essere **utilizzabile a schermo pieno senza
rete**: la home, il percorso e le proprie ultime settimane sono tutte disponibili offline.

---

## Cosa deve funzionare senza rete

| | Offline | Nota |
|---|---|---|
| Check-in pre e post | ✅ | Il caso d'uso principale |
| Segnalazione immediata e Care mode | ✅ | 🔴 Un infortunio non aspetta il campo |
| Home «Oggi» e i suoi stati | ✅ | Calcolati sui dati locali |
| Percorso e missioni | ✅ | Il contenuto è nel bundle |
| Vista «Me» | ✅ | Sui dati locali già scaricati |
| Body-story | ✅ | Si compone offline; si condivide quando c'è rete |
| Onboarding | ⚠️ parziale | Il login richiede rete: è l'unica cosa che la richiede davvero |

---

## Il caso che va gestito bene

**Più dispositivi, o app reinstallata.** Non è frequente, ma quando succede va bene.

- Al login si scaricano gli ultimi ~90 giorni in locale.
- La coda locale non parte mai da zero se ci sono righe non ancora inviate: si inviano
  prima quelle.
- Siccome gli UUID sono generati sul client e gli inserimenti sono idempotenti, un
  doppio invio non crea duplicati.

---

## Cosa non fare

| Tentazione | Perché no |
|---|---|
| Sincronizzazione bidirezionale con risoluzione conflitti | Non serve: gli eventi sono immutabili. Aggiungerebbe la parte più fragile del sistema senza motivo. |
| Un indicatore «non sincronizzato» ben visibile | Comunica all'atleta un problema che non è suo. Un'icona discreta in impostazioni basta. |
| Bloccare l'invio finché la coda non è vuota | La coda si svuota da sola. Bloccare significa trasformare un problema di rete in un problema dell'utente. |
| Salvare in `localStorage` | Sincrono, limite ~5 MB, e blocca il thread principale. IndexedDB è la scelta giusta. |
| Cancellare la coda in caso di errore | Un errore di rete è temporaneo. Solo un errore di validazione giustifica di mettere una riga da parte — e comunque segnalandolo, mai in silenzio. |
