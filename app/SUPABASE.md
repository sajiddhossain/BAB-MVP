# Collegare Supabase

L'app **funziona già senza**: senza le variabili d'ambiente il client è `null`, i
check-in si salvano in locale e la coda resta in attesa. Collegare è l'ultimo passo,
non il primo.

## Chi fa cosa, e perché

| | Chi |
|---|---|
| Creare l'**account** Supabase | 🔴 **Tu.** La creazione di account è una cosa che devo lasciarti, con o senza MCP. |
| Creare il **progetto** dentro l'account | Tu (2 minuti) — oppure io, se colleghi un MCP Supabase |
| Applicare lo **schema** | Tu con un copia-incolla, oppure io con l'MCP |
| Collegare l'app, verificare, generare i tipi | Io, appena ho URL e chiave anon |

**Sull'MCP.** Nel registro dei connettori non c'è Supabase, quindi non è una
cosa da aggiungere con un clic: esiste il server ufficiale
`@supabase/mcp-server-supabase`, che si aggiunge da un terminale interattivo
con `claude mcp add` e vuole un personal access token. Il token resta nella
configurazione e **non passa mai da me**, che è il modo giusto di gestirlo.

🟡 Detto onestamente: per una configurazione da fare **una volta sola**,
collegare l'MCP costa più di quanto faccia risparmiare. Le due cose che
servono sono due minuti sul sito e un copia-incolla di trenta secondi.
L'MCP diventa utile **dopo**, per il lavoro ricorrente — migrazioni,
ispezionare i dati, rigenerare i tipi dallo schema. Se lo colleghi per quello,
ottimo; non aspettarlo per partire.

---

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

> 🔴 Questo non è un ripiego in attesa di Google: **è l'unico che funziona per tutte.** Google ha un'età minima che varia da paese a paese (13–16 in Europa),
> quindi una dodicenne spesso non può usarlo. E gli account
> Google della scuola sono spesso bloccati dall'amministratore per le app di terze parti.
> Vedi [R12](../docs/04-brainstorming/04-revisione-roadmap.md#r12--accesso--link-via-email-e-google-apple-no).

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

### 4c · Cosa va detto nel consenso

Entrare con Google significa dire a Google che quella persona usa BAB. Per un'app che
parla del corpo di una minorenne è un'informazione che il link via email non rivela. Non è
un motivo per non offrirlo — è un motivo per scriverlo, e il copy in `src/copy/it.ts`
(`auth.socialNote`) lo dice già.

> **«Accedi con Apple» non si fa** (R12): 99 $/anno, iscrizione con settimane di attesa se
> come organizzazione, e un client secret JWT da rigenerare ogni 6 mesi — per una comodità
> che il link via email copre già.

## 5 · Semi di prova — per verificare la dashboard squadra

Finché non esiste una squadra con dentro qualcuno, non c'è modo di sapere se le
viste `coach_*` restituiscono le righe giuste e **nascondono davvero il testo
libero**. [`supabase/seed-demo.sql`](supabase/seed-demo.sql) crea il minimo per
poterlo guardare: una squadra, un coach, due atlete, una settimana di check-in
e una bandiera rossa aperta.

Prima servono degli utenti veri (Authentication → Users → Add user): le tabelle
puntano ad `auth.users`. Poi si mettono le email in cima al file e si esegue.

🔴 **Il controllo che conta**, una volta seminato:

```sql
select note from public.coach_check_ins;
```

Deve **fallire** con *column "note" does not exist*. Il seme mette apposta una
nota privata dentro un check-in: se quella query restituisce qualcosa, la
promessa R2 è rotta e le parole di un'atleta sono finite davanti al suo coach.

## 6 · Verifica

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
