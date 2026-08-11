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

## 2 · Lo schema — 30 secondi, zero segreti condivisi — 🔴 **da fare**

> Stato al momento del collegamento: il progetto risponde (GoTrue attivo, email
> acceso, Google spento) ma `public.athletes` e tutte le altre non esistono
> ancora — PostgREST risponde `PGRST205`. Questo passo lo devi fare tu: con la
> sola chiave pubblica non si crea niente, ed è giusto così.


Nel dashboard → **SQL Editor** → **New query** → incolla tutto il contenuto di
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

È idempotente: si può rilanciare senza rompere niente.

Poi verifica che la RLS sia attiva: **Table Editor** → ogni tabella deve mostrare
`RLS enabled`. Se una non ce l'ha, i dati sono leggibili da chiunque abbia la chiave
anon — che è pubblica.

## 3 · Le chiavi — ✅ fatto

`app/.env` c'è ed è gitignorato; il client non è più `null` e la schermata
d'accesso compare. Dashboard → **Project Settings** → **API**. Copia in `app/.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

La chiave può chiamarsi `anon` `public` (`eyJ...`, formato vecchio) oppure
**Publishable** (`sb_publishable_...`, formato nuovo): stessa variabile, stesso
ruolo. Vanno tutt'e due bene con `@supabase/supabase-js` ≥ 2.

Queste due sono **pubbliche per design**: finiscono nel bundle del frontend, ed è la
RLS a proteggere i dati. Puoi passarmele senza problemi.

🔴 Quella che **non** va mai in `.env` né in chat è la `service_role` /
**Secret key** (`sb_secret_...`): scavalca tutta la RLS, quindi con quella in
mano si leggono i dati di tutte. Se scappa, si rigenera dalla dashboard —
cancellare il messaggio non basta.

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

🔵 Non c'è niente da toccare nel codice: la schermata d'accesso chiede a
`/auth/v1/settings` quali provider sono accesi e **mostra il bottone Google solo
se lo è** (`session.googleEnabled`). Finché non lo configuri, il bottone non
c'è — invece di portare a una pagina d'errore di Supabase che una dodicenne
leggerebbe come colpa sua.

### 4c · Cosa va detto nel consenso

Entrare con Google significa dire a Google che quella persona usa BAB. Per un'app che
parla del corpo di una minorenne è un'informazione che il link via email non rivela. Non è
un motivo per non offrirlo — è un motivo per scriverlo, e il copy in `src/copy/it.ts`
(`auth.socialNote`) lo dice già.

> **«Accedi con Apple» non si fa** (R12): 99 $/anno, iscrizione con settimane di attesa se
> come organizzazione, e un client secret JWT da rigenerare ogni 6 mesi — per una comodità
> che il link via email copre già.

## 4d · Il primo admin — una riga di SQL, una volta sola

`team_staff` dice chi vede una squadra. Non dice chi può *crearne* una, iscriverci
un'atleta, o guardare se il pilota sta funzionando. Quello lo dice
`platform_admins`, ed è una tabella **che l'app non sa scrivere**: nessuna policy
di insert, update o delete. Un admin si aggiunge solo da qui, cioè da chi ha già
le chiavi di casa.

🔴 Prima entra in BAB una volta col tuo indirizzo (senza, non esisti in
`auth.users`). Poi, nel SQL Editor:

```sql
insert into public.platform_admins (user_id, note)
select id, 'founder' from auth.users where email = 'tu@esempio.it';
```

Da lì in poi `/admin` si apre da sola: chi entra viene mandato a casa propria —
un'atleta a Oggi, chi allena alla dashboard squadra, un admin alla console.

**Per togliere un admin** basta cancellare la riga: ha effetto al ricaricamento
successivo, senza aspettare che scada nessun token.

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

- [x] ~~Modificare l'agenda della settimana~~ — fatto. La coda ha imparato a
      cancellare (`db.remove`), ed è l'unica cosa del prodotto che si cancella
      davvero: un check-in è successo, un martedì di allenamento a cui ha
      smesso di andare no.

- [ ] **`body_signals.created_at` sulle righe già sul server.** Da adesso il
      telefono manda sempre il proprio, ma se qualche riga fosse già stata
      inserita lasciando fare al `default now()`, la sua data è quella
      dell'arrivo e non quella in cui è stata sentita. Non è recuperabile: al
      massimo si risale al `local_date` del check-in collegato, e le
      segnalazioni immediate (`check_in_id is null`) non ce l'hanno.
      Da controllare **prima** di aprire il pilota, quando le righe sono ancora
      poche o zero.

## Da verificare appena il progetto esiste

L'idratazione iniziale (`src/lib/hydrate.ts`) è provata contro un finto
PostgREST, non contro Supabase. Le due cose che vanno riviste sul progetto vero,
perché un finto server non le può dire:

1. **La RLS lascia leggere le proprie righe.** Con l'utente collegato:

   ```js
   await bab.hydrate.hydrateAll('<il tuo uid>')   // { rows: n, tables: m }
   ```

   Se torna `rows: 0` con dati sul server, la policy `select` di quella tabella
   non c'è o non guarda `auth.uid()`.

2. **Il ciclo si scarica ma resta suo.** `cycle_events` finisce sul telefono
   dell'atleta perché è la sua storia; NON deve comparire in nessuna vista
   `coach_*` se non attraverso `coach_cycle_events`, che è filtrata (R2).

3. **La cancellazione cancella davvero.** `delete_my_account()` è `security
   definer` e toglie la riga da `auth.users`; tutto il resto se ne va in
   cascata. Da riprovare sul progetto vero, perché è l'unica cosa che un finto
   server non può dimostrare:

   ```sql
   -- come postgres, DOPO che l'atleta ha cancellato dall'app
   select count(*) from public.check_ins    where athlete_id = '<uid>';  -- 0
   select count(*) from public.cycle_events where athlete_id = '<uid>';  -- 0
   select count(*) from auth.users          where id         = '<uid>';  -- 0
   ```

   Se il primo conteggio non è zero, manca un `on delete cascade` da qualche
   parte e la cancellazione è una mezza cancellazione — la cosa peggiore, perché
   la schermata le ha promesso che spariva tutto.
