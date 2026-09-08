# BAB

Web app, ricostruita dal file Figma `TA3cGQAArcaxt4tnCSQWJw`.

## La regola che tiene in piedi tutto

Il disegno e' fatto su frame da 402x874 con ogni elemento in **posizione
assoluta**. Qui quelle coordinate non si copiano: si copia il risultato.

Ogni schermo e' una colonna larga al massimo 402, centrata, con il contenuto
nel flusso normale e le distanze misurate dal frame. Il bottone principale sta
in fondo, fuori dallo scorrimento.

Il motivo e' pratico: con le coordinate assolute un testo piu' lungo del
previsto finisce sopra a quello che viene dopo, e fuori da 402x874 non
funziona niente. Su ~40 schermi con dati veri e' la differenza fra un
prototipo e un'app.

## Dove sta cosa

    src/ui/        i componenti condivisi: sono loro il sistema di design
    src/screens/   uno schermo, un file, col node-id Figma nel commento
    src/data/      i contenuti: domande, livelli, parole
    src/lib/       supabase e il resto dell'impianto
    src/assets/    gli asset scaricati da Figma (i link scadono in 7 giorni)
    supabase/      lo schema: 19 tabelle, 16 politiche, 10 funzioni
    ../figma/frames.json   l'indice dei 372 frame: nome, node-id, link

## I token

Il file Figma non usa variabili: i colori stanno come valori diretti dentro ai
frame. La fonte di verita' e' `src/index.css`, ricavata misurando gli schermi.
Un valore ci finisce solo se compare almeno due volte nel disegno.

## Tre blocchi su quattro sono contenuto, non schermi

Dal censimento dei 372 frame:

    body-language   138 frame  ->  8 livelli x ~9 tipi di schermo
    onboarding      104 frame  ->  ~20 schermi, ~6 layout
    body-sense       42 frame  ->  6 esercizi x ~5 passi
    word-cards       33 frame  ->  UNA card x 16 parole

Costruiti come schermi sono 317 lavori. Costruiti come un riproduttore piu' un
elenco sono ~20 schermi e 4 file di dati.

## Accendere il backend

Le risposte finiscono in Supabase solo se ci sono le chiavi. Senza, l'app
funziona tutta ma resta nel telefono, e la schermata finale lo dice.

1. Nel progetto Supabase, SQL Editor → incolla e lancia `supabase/schema.sql`.
   È idempotente: si può rilanciare. Su un database già acceso prima di
   settembre 2026 basta l'ultimo blocco, staccato in
   `supabase/migrazione-sessione.sql`: senza quello il check-in e il
   check-out si vedono ma non riescono a salvare. Con lo stesso criterio
   c'e' `supabase/migrazione-testi.sql`, che serve solo alla pagina
   `/admin` — senza, l'app funziona tutta e le scritte restano quelle
   compilate.
2. Authentication → Sign In / Providers → Email: acceso, e in cima alla
   pagina "Allow new users to sign up" acceso. Email OTP length: 6.
3. **Authentication → Emails**: nei due modelli `Magic Link` e
   `Confirm signup` sostituisci `{{ .ConfirmationURL }}` con `{{ .Token }}`.
   Senza questo passaggio nella mail arriva ancora un link, e l'app non lo
   aspetta piu' (vedi sotto).
4. Copia `.env.example` in `.env` e metti `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` (Project Settings → API).

Nessun Redirect URL da configurare: senza link non c'e' niente da far
rientrare.

### Perche' il codice e non il link

Si entra solo col codice a sei cifre. La mail si apre quasi sempre su un
dispositivo diverso da quello in cui si sta usando la app — il computer di
casa, il telefono di un genitore — e il link aprirebbe la sessione li',
lasciando fuori la app che si aveva in mano. Il codice si porta a mano da
dove si legge a dove si sta, e funziona anche quando la mail si guarda su un
altro schermo.

Nel codice questo e' `mandaCodice`, che chiama `signInWithOtp` **senza**
`emailRedirectTo`: senza indirizzo di rientro Supabase non ha un link da
mandare. L'altra meta' e' il punto 3 qui sopra, che sta nel pannello.

### Dove finisce cosa

| Onboarding | Tabella |
|---|---|
| nome, nascita, sport principale, ciclo, contraccezione, lingua | `athletes` |
| tutti gli sport | `athlete_sports` |
| giorni di allenamento e di educazione fisica | `athlete_schedule` |
| le tre date del ciclo | `cycle_events` (`period_start`) |
| le due spunte del consenso | `consents` (`athlete`, `guardian`) |

| Check-in e check-out | Tabella |
|---|---|
| il ritmo indovinato la mattina | `check_ins.tempo_predicted` (`kind = 'pre'`) |
| il ritmo sentito dopo | `check_ins.tempo_chosen` (`kind = 'post'`) |
| sonno, energia, umore, scuola (1–7) | `check_ins` |
| ore dormite, ciclo, antidolorifici | `check_ins` |
| lo sforzo (0–10, CR-10 di Foster) | `check_ins.effort` |
| la faccia e cosa si è portata a casa | `check_ins.satisfaction`, `brought_home` |
| la frase che scrive lei | `check_ins.note` — fuori dalla vista del coach |
| "senti un dolore protettivo?" | `check_ins.protective_pain` |
| ogni punto segnato sul corpo | `body_signals` (una riga per punto) |

Una riga per tipo per giorno, tenuta ferma da un indice unico su
`(athlete_id, kind, local_date)`: rifare un check-out corregge quello di
prima invece di aggiungerne un secondo. Il giorno dell'atleta finisce alle
quattro del mattino, quindi un check-out dell'una di notte appartiene
all'allenamento della sera prima.

Il codice della zona porta il lato dentro (`front_quad_r`, `back_ham_l`):
diciannove zone su trentatré hanno lo stesso nome davanti e dietro, e senza
il lato un ginocchio che fa male davanti e uno che fa male dietro sarebbero
la stessa riga.

Si scrive tutto in fondo al percorso, in un colpo solo: a metà onboarding non
c'è ancora una riga `athletes` valida da aggiornare. Rifare l'onboarding
riscrive la settimana invece di aggiungerne una seconda, e non duplica i
consensi già dati per la stessa versione del testo.

L'età minima (12 anni) è nel vincolo di `athletes.birth_date` **e** nello
schermo del compleanno: se stesse solo nella UI basterebbe una chiamata
diretta all'API per aggirarla, e se stesse solo nel database l'inserimento
fallirebbe alla fine con un errore che a chi legge non dice niente.

## Cambiare le scritte senza toccare il codice

`/admin` e' la pagina da cui si cambiano le parole dell'app. Il layout non si
tocca: si tocca solo cio' che c'e' scritto dentro.

A sinistra gli schermi, in mezzo lo schermo vero dentro a una cornice. La
cornice e' un `<iframe>` con questa stessa app dentro, quindi l'anteprima non
e' una somiglianza: sono gli stessi componenti, le stesse misure e lo stesso
carattere che vedra' un'atleta. Mentre si scrive, il testo cambia dentro alla
cornice senza salvare niente.

**Si cambia toccando.** Si punta il dito sulla scritta dentro allo schermo e
si apre a destra: non c'e' da cercarla in un elenco di ottocento voci e non
c'e' da sapere come si chiama. Vale per tutto quello che si legge — titoli,
bottoni, etichette, il grigino dentro ai campi da riempire. Se il tocco prende
una frase cucita insieme da piu' pezzi, si sceglie quale. L'elenco completo
resta in fondo, chiuso, con la ricerca: serve a chi cerca una frase di cui non
ricorda lo schermo.

Come faccia a sapere quale scritta e' stata toccata: dentro alla cornice ogni
scritta si porta dietro il proprio numero, scritto in caratteri a larghezza
zero (`marcatore` in `src/lib/scritte.ts`, `src/lib/tocco.ts` per il tocco).
Invisibili a chi legge, ma il codice li ritrova. Il vantaggio e' che non c'e'
niente da annotare a mano nei ~400 punti in cui le scritte vengono usate: una
scritta nuova e' toccabile il giorno che nasce. Nell'app che usano le atlete
non c'e' niente di tutto questo — il ramo sta dietro a `IN_ANTEPRIMA`, che
vuole insieme `?anteprima=1` e l'essere dentro a una cornice.

**Due modi.** *Correggi le scritte* trasforma ogni tocco in "apri questa
scritta", cosi' i bottoni non partono e non si cambia schermo mentre si
scrive. *Prova lo schermo* lo fa funzionare davvero. Servono tutt'e due: meta'
delle scritte stanno dentro ai bottoni, ma al foglio delle sensazioni ci si
arriva solo toccando il corpo.

**Chi entra.** Chi sta in `platform_admins`. Non e' una password controllata
nel browser: la anon key sta dentro al pacchetto che scarica chiunque, quindi
un controllo fatto nel browser sarebbe una serratura su una porta senza muri.
A decidere e' il database, riga per riga (`is_admin()`). Il primo admin si
aggiunge a mano, una volta sola — vedi il fondo di `supabase/schema.sql`.

**Bozza e pubblicato.** Due colonne. Si salva la bozza quante volte si vuole
senza che nessuno se ne accorga; alle atlete arriva solo premendo "pubblica".
Durante il pilota un refuso salvato per sbaglio non deve finire sullo schermo
di una ragazza di dodici anni.

**Cosa succede se il database non risponde.** Niente. I testi restano dove
sono, in `src/copy/`, compilati dentro all'app: la tabella tiene solo cio' che
qualcuno ha cambiato dopo. Tabella vuota, Supabase spento o rete assente
vogliono dire l'app di sempre, non un'app muta. Ogni scritta torna
all'originale togliendo la sua riga, e c'e' un bottone che lo fa.

**Le frasi coi buchi.** Alcune scritte hanno un pezzo che cambia:
`Pensavi che il ritmo del tuo corpo fosse {previsto}, ma si e' rivelato
{sentito}.` I buchi vanno lasciati come sono; il campo li elenca sotto. Un
buco cancellato per sbaglio non rompe niente, semplicemente quel pezzo non
compare piu'.

**Le liste.** Qualche scritta e' un elenco — i quattro passi di "Prova questo
oggi", i nomi dei giorni. Li' il campo vuole una riga per voce: togliendo una
riga si toglie una voce.

### Lavorare sugli schermi senza rifare l'accesso

Con le chiavi in `.env` la guardia chiede una sessione per tutto tranne i due
schermi dell'accesso, il che rende scomodo lavorare sull'onboarding. Per
saltarla mentre si sviluppa:

```bash
echo 'VITE_SENZA_ACCESSO=1' > app/.env.local
```

Vive **solo** con il server di sviluppo: e' dietro a `import.meta.env.DEV`,
che e' falso in ogni versione costruita per essere pubblicata, quindi quella
riga sparisce proprio dal codice compilato. Non e' una porta chiusa a chiave:
in produzione non esiste. (Si controlla con
`grep SENZA_ACCESSO dist/assets/*.js`, che non trova niente.)

### Provare l'accesso senza mandare mail

Il codice a sei cifre si puo' farsi dare da Supabase senza spedirlo. Serve la
chiave `service_role`, che **non va nel repo e non va in nessuna chat**:

```bash
echo 'SERVICE_ROLE=…' > ~/.bab-service-key && chmod 600 ~/.bab-service-key
```

Poi, ogni volta che serve un codice:

```bash
source ~/.bab-service-key && curl -s -X POST \
  "https://<progetto>.supabase.co/auth/v1/admin/generate_link" \
  -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{"type":"magiclink","email":"…"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['email_otp'])"
```

Le sei cifre si scrivono nella app come se fossero arrivate per posta: la
sessione che si apre e' vera, il percorso e' quello vero. **Non e' una
scorciatoia dentro al codice** — la app non sa niente di tutto questo, e non
c'e' niente da togliere prima di andare online.

Serve anche a capire dove sta un guasto: se `generate_link` risponde subito e
`signInWithOtp` no, allora generare il codice funziona e a essere rotto e' solo
lo spedirlo — cioe' la SMTP o il modello di mail, non l'autenticazione.
