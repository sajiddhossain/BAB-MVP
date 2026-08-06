# Collegare Supabase

L'app **funziona già senza**: senza le variabili d'ambiente il client è `null`, i
check-in si salvano in locale e la coda resta in attesa. Collegare è l'ultimo passo,
non il primo.

## 1 · Il progetto — 2 minuti, li fai tu

La creazione dell'account non posso farla io. Su [supabase.com](https://supabase.com):

1. Crea l'account (o accedi).
2. **New project** — nome `bab-app`, regione **Frankfurt (eu-central-1)**.
   🔴 La regione conta: dati di minorenni, quindi server UE (§9).
3. Segnati la password del database che ti fa scegliere: serve una volta sola, al passo 3.

## 2 · Lo schema — 30 secondi, zero segreti condivisi

Nel dashboard → **SQL Editor** → **New query** → incolla tutto il contenuto di
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

È idempotente: si può rilanciare senza rompere niente.

Poi verifica che la RLS sia attiva: **Table Editor** → ogni tabella deve mostrare
`RLS enabled`. Se una non ce l'ha, i dati sono leggibili da chiunque abbia la chiave
anon — che è pubblica.

## 3 · Le chiavi

Dashboard → **Project Settings** → **API**. Copia in `app/.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Queste due sono **pubbliche per design**: finiscono nel bundle del frontend, ed è la
RLS a proteggere i dati. Puoi passarmele senza problemi.

**La password del database e il personal access token non servono all'app** e non
vanno in `.env`. Se ti serve che li usi io per qualcosa, mettili in un file che non
stampo mai e dimmi dove.

## 4 · Autenticazione

Dashboard → **Authentication** → **Providers**:
- **Email** attivo, con **Confirm email** attivo
- **Disabilita** la password: si usa solo il magic link
  *(nessuna password da ricordare né da farsi rubare — per delle minorenni è la
  scelta più semplice e più sicura)*

**URL Configuration** → aggiungi `http://localhost:5180` fra i redirect consentiti.

## 5 · Verifica

```bash
npm run dev --prefix app
```

In console del browser:

```js
await bab.repo.saveCheckIn({ athlete_id: '<il tuo uid>', kind: 'pre', tempo_chosen: 'steady' })
await bab.flush()        // { sent: 1, kept: 0, parked: 0 }
await bab.parked()       // []  ← se non è vuoto, guarda lastError
```

Se `flush` restituisce `parked: 1`, la riga ha violato un `CHECK` o la RLS: l'errore
è in `lastError` e la riga **non** viene ritentata all'infinito.

---

## Cosa NON è ancora fatto

- [ ] Schermata di login (il client c'è, l'interfaccia no)
- [ ] Idratazione iniziale: scaricare gli ultimi ~90 giorni al primo accesso
- [ ] Export e cancellazione collegati alle funzioni SQL già scritte
