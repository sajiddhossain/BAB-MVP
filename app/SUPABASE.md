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

### 4a · Il link via email — obbligatorio, è la strada principale

Dashboard → **Authentication** → **Providers**:
- **Email** attivo, con **Confirm email** attivo
- **Disabilita** la password: si usa solo il magic link
  *(nessuna password da ricordare né da farsi rubare — per delle minorenni è la
  scelta più semplice e più sicura)*

**URL Configuration** → aggiungi `http://localhost:5180` fra i redirect consentiti.

> 🔴 Questo non è un ripiego in attesa di Google e Apple: **è l'unico che funziona per
> tutte.** Google ha un'età minima che varia da paese a paese (13–16 in Europa) e l'Apple
> ID parte da 13 quasi ovunque, quindi una dodicenne spesso non può usarli. E gli account
> Google della scuola sono spesso bloccati dall'amministratore per le app di terze parti.
> Vedi [R12](../docs/04-brainstorming/04-revisione-roadmap.md#r12--accesso--il-link-via-email-resta-la-spina-dorsale-google-e-apple-si-aggiungono).

### 4b · Google — opzionale, gratis, ~mezza giornata

Serve più per lo **staff** che per le atlete: i coach sono adulti, hanno account veri, e
accedono da un portatile dove copiare un codice dalla mail è più scomodo.

1. [console.cloud.google.com](https://console.cloud.google.com) → nuovo progetto
2. **APIs & Services → OAuth consent screen** → tipo *External*, nome app, email di
   supporto. Con i soli scope di base (email, profilo) **non serve la verifica di Google**
3. **Credentials → Create credentials → OAuth client ID** → tipo *Web application*
4. Fra gli **Authorized redirect URIs** metti quello che Supabase ti mostra alla voce
   Google (`https://<ref>.supabase.co/auth/v1/callback`)
5. Copia **Client ID** e **Client Secret** in Supabase → Providers → Google

🔵 Client ID e Client Secret di Google **non vanno in `.env`**: si incollano nella
dashboard di Supabase, che li tiene lato server. Nel frontend non ci finiscono mai.

### 4c · Apple — opzionale, a pagamento, con una dipendenza esterna

⚠️ **Richiede l'Apple Developer Program: 99 $/anno.** Non posso iscrivermi io — la
creazione di account resta una cosa tua.

🔴 **Il collo di bottiglia è l'iscrizione, non il codice.** Come persona fisica di solito
ci vogliono 24–48 ore; **come organizzazione serve un numero D-U-N-S e possono volerci
settimane.** Se «Accedi con Apple» deve esistere entro le tre settimane, l'account va
aperto adesso.

Una volta dentro:

1. **Certificates, Identifiers & Profiles → Identifiers** → crea un **App ID** con
   *Sign In with Apple* abilitato
2. Crea un **Services ID** — è quello che fa da client ID per il web
3. Configuralo con il dominio e il *Return URL* di Supabase
4. **Keys** → nuova chiave con *Sign In with Apple* → scarica il `.p8` (**si scarica una
   volta sola**)
5. In Supabase → Providers → Apple, inserisci Services ID, Team ID, Key ID e la chiave

⚠️ Il client secret di Apple è un **JWT che scade**: va rigenerato almeno **ogni 6 mesi**,
altrimenti l'accesso smette di funzionare senza preavviso. Vale la pena segnarselo in
calendario il giorno stesso in cui lo si configura.

### 4d · Cosa va detto nel consenso

Entrare con Google o Apple significa dire a Google o ad Apple che quella persona usa BAB.
Per un'app che parla del corpo di una minorenne è un'informazione che il link via email
non rivela. Non è un motivo per non offrirli — è un motivo per scriverlo, e il copy in
`src/copy/it.ts` (`auth.socialNote`) lo dice già.

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
