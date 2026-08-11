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

### 4c-bis · Il codice a 6 cifre — e come entrare senza aspettare l'email

Sotto «Guarda la posta» c'è anche un campo per il codice. Non è un ripiego: su
iPhone il link aperto dalla posta si apre spesso in un browser diverso da quello
dove BAB è installata, la sessione nasce nel posto sbagliato, e da lì sembra che
l'app sia rotta. Il codice si incolla dove sei già.

🔴 Perché il codice arrivi davvero, il template deve contenerlo. Dashboard →
**Authentication → Emails → Magic Link**: accanto al link metti anche

```
{{ .Token }}
```

Senza quella riga il campo c'è ma nell'email non c'è niente da copiare.

**Per entrare senza aspettare l'email** — utile per le demo e per il primo
accesso da admin — Supabase ha i **Test OTP**: legano un indirizzo a un codice
fisso e non mandano niente. Dashboard → **Authentication**, cerca *Test OTPs*, e
aggiungi una riga tipo:

```
bab@babsport.com:123456
```

Da lì: scrivi l'indirizzo → «Mandami il link» → incolli il codice fisso → dentro.
Nessuna email, nessuna attesa.

🔴 Perché così e non con una scorciatoia nel codice: `bab@babsport.com` sarà un
account **admin**, e una riga tipo «se l'email è questa, entra» starebbe nel
bundle JavaScript — cioè pubblica, leggibile da chiunque apra i sorgenti del
sito. Sarebbe una porta di servizio per la console admin di un'app che tiene
dati di minorenni. Il codice fisso invece vive nella dashboard: si cambia in
dieci secondi, si toglie in dieci secondi, e non lo vede nessuno.

🔵 Toglilo dai Test OTP prima di aprire il pilota. Finché c'è, chi conosce
quelle sei cifre entra come te.

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

## 7 · Vercel

[`vercel.json`](vercel.json) è già nel repo. Fa due cose che senza di lui non
succedono: rimanda ogni indirizzo a `index.html` (senza, un ricaricamento su
`/settings/agenda` dà 404, perché quel file sul disco non esiste), e impedisce
che `sw.js` venga messo in cache — un service worker congelato serve la vecchia
app a chi ha già installato la PWA, e non se ne esce più.

Su [vercel.com](https://vercel.com) → **Add New → Project** → importa
`sajiddhossain/BAB-MVP`:

| Campo | Valore |
|---|---|
| **Root Directory** | `app` 🔴 senza questo non trova niente |
| Framework | Vite (lo riconosce da solo) |
| Environment Variables | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, gli stessi di `app/.env` |

Le variabili vanno messe a mano perché `.env` è gitignorato, ed è giusto così
anche se sono pubbliche: un file di configurazione che si trascina nel repo
prima o poi ci si porta dentro qualcos'altro.

🔴 **`.gitignore` non protegge il deploy.** La CLI carica la cartella locale, e
`app/.env` sale insieme al resto: al primo tentativo è uscita la build
collegata invece di quella senza backend, con URL e chiave dentro al bundle.
Per questo c'è [`.vercelignore`](.vercelignore) — e per questo un segreto in
`.env` sarebbe pubblicato, non solo tenuto fuori da git. Le variabili si
mettono dal pannello (Settings → Environment Variables), mai lasciandole
viaggiare col file.

### Deploy senza backend

Se **non** metti le due variabili, esce una build che funziona lo stesso: niente
schermata d'accesso, si entra dritti su Oggi, e tutto si salva sul telefono.
Provato: check-in salvato, riletto dopo un ricaricamento, Oggi che passa allo
stato «Chiudi il cerchio», e la coda che **tiene** la riga (`sent: 0, kept: 1`)
invece di buttarla.

🔵 Vite sostituisce `import.meta.env` con dei letterali, quindi senza le
variabili il ramo `createClient` è morto e **`@supabase/supabase-js` sparisce
dal bundle**: 447 KB invece di 660.

🔴 Cosa vuol dire davvero: ogni persona che apre quell'indirizzo ha una copia
sua, vuota, che non esce dal suo telefono. Nessuno vede niente di nessun altro —
e **una bandiera rossa non arriva a nessun adulto**. Il contenuto di sicurezza
(cosa fare quando fa male) c'è comunque, perché non ha mai dipeso dall'essere
collegate. Va bene per far vedere il prodotto, non per darlo a un'atleta vera.

🔴 **Appena hai il dominio**, torna su Supabase → **Authentication → URL
Configuration**:
- **Site URL** → `https://<il-dominio>.vercel.app`
- **Redirect URLs** → aggiungi sia `https://<il-dominio>.vercel.app` sia
  `https://*.vercel.app` (le anteprime di ogni push hanno un indirizzo diverso;
  senza il jolly il link via email non torna indietro da nessuna anteprima).

E se hai configurato Google, aggiungi lo stesso dominio anche fra le origini
autorizzate in Google Cloud Console.

### Prima che lo veda qualcuno che non sei tu

Un deploy è un indirizzo pubblico. Tre cose non ci sono ancora, e nessuna è
bloccante per provarla in due, ma tutt'e tre lo sono per il pilota:

- lo **schema** (§2), senza il quale si entra e poi non si salva niente;
- il testo legale del **consenso**, che oggi non è scritto da nessuna parte;
- un **SMTP vero**. Quello incluso in Supabase ha un limite basso di email
  all'ora ed è dichiaratamente non per la produzione: con una squadra intera che
  entra lo stesso pomeriggio, le ultime non ricevono il link.

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
