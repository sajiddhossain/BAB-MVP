-- ════════════════════════════════════════════════════════════════════════════
-- BAB — schema dell'app atleta
-- Eseguire nello SQL Editor di Supabase. Idempotente: si può rilanciare.
--
-- Le motivazioni delle scelte stanno in docs/06-implementazione/02-modello-dati.md
--
-- Tre principi che attraversano tutto lo schema:
--   1. I check-in sono EVENTI IMMUTABILI. Non si modificano: se rifà il check-in,
--      è una riga nuova. Questo rende l'offline banale (nessun conflitto) e
--      conserva il fatto che ha cambiato idea, che è un dato interessante.
--   2. Nessun aggregato materializzato. Le soglie non sono validate (§8): tutto
--      ciò che è interpretazione si calcola a runtime e può cambiare senza
--      migrare i dati.
--   3. TUTTO È ADDITIVO. R10 della revisione: la webapp non si sostituisce, ci
--      si aggiungono cose. Aggiungere una colonna, una sensazione o una tabella
--      non deve mai costringere a migrare o buttare i dati delle prime settimane.
--      Questo principio ha diritto di veto sulle scorciatoie.
-- ════════════════════════════════════════════════════════════════════════════

-- ── ENUM ────────────────────────────────────────────────────────────────────
do $$ begin
  create type tempo          as enum ('upbeat','steady','gentle');
  create type checkin_kind   as enum ('pre','post');
  create type cycle_status   as enum ('tracking','not_yet','undisclosed');
  create type contraception  as enum ('natural','hormonal','unsure','undisclosed');
  create type behaviour_tag  as enum ('eases','worse_load','at_rest');
exception when duplicate_object then null; end $$;


-- ── ATLETE ──────────────────────────────────────────────────────────────────
-- display_name è il nome con cui l'app le parla: R3 apre l'onboarding con "come
-- ti chiamiamo?". athlete_code resta, opzionale, per la pseudonimizzazione nei
-- dati di ricerca. L'email vive in auth.users, gestita da Supabase.
--
-- birth_date e non solo l'anno: serve la data perché R3 chiede la contraccezione
-- ormonale SOLO sopra i 15 anni, e a cavallo del compleanno l'anno non basta a
-- decidere se mostrare quella domanda a una minorenne.
create table if not exists public.athletes (
  id             uuid primary key references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  display_name   text        not null check (char_length(display_name) between 1 and 40),
  athlete_code   text        check (athlete_code is null or char_length(athlete_code) between 3 and 20),
  birth_date     date        not null check (birth_date > date '1950-01-01'),
  sport          text        check (sport is null or char_length(sport) <= 40),
  -- 'undisclosed' non è un ripiego: nasconde il blocco ritmo ovunque, e va
  -- rispettato in ogni schermata.
  cycle_status   cycle_status  not null default 'undisclosed',
  contraception  contraception not null default 'undisclosed',
  locale         text        not null default 'it' check (char_length(locale) <= 5),
  timezone       text        default 'Europe/Rome' check (char_length(timezone) <= 60),
  unique (athlete_code)
);

-- L'età serve in un punto solo: decidere se mostrare la domanda sulla
-- contraccezione ormonale (R3, sopra i 15). NON serve più a scegliere la mappa
-- corporea: R4 ha deciso che la mappa è una sola, per tutte, dai 12 anni in su.
create or replace function public.age_years(p_birth_date date)
returns integer language sql immutable as $$
  select extract(year from age(current_date, p_birth_date))::int;
$$;


-- ════════════════════════════════════════════════════════════════════════════
-- CHIAVI: uuid generato sul CLIENT, non bigint del server
--
-- Ogni tabella che l'app dell'atleta scrive ha `id uuid`. Non è un gusto: è
-- l'unica cosa che rende la coda di sincronizzazione davvero idempotente.
--
-- Con una chiave assegnata dal server, un inserimento che arriva ma la cui
-- risposta si perde — capita ogni volta che il campo cade in palestra a metà
-- richiesta — viene ritentato e crea una SECONDA riga. L'atleta si ritrova due
-- volte lo stesso polpaccio, e nessuno se ne accorge finché non guarda i
-- pattern. Con l'id generato prima, il ritentativo sbatte su `23505
-- duplicate key`, che `lib/sync.ts` tratta giustamente come «è già arrivata».
--
-- Serve anche all'idratazione: le righe scaricate si scrivono in locale con la
-- stessa chiave che avrebbero avuto uscendo da qui, quindi una riga creata su
-- questo telefono e la sua copia scaricata sono LO STESSO record, non due.
--
-- Il `default gen_random_uuid()` è solo per gli inserimenti fatti a mano
-- (i semi di prova): l'app manda sempre il proprio.
--
-- Le tabelle di squadra restano a bigint: le scrive lo staff da un portatile
-- connesso, senza coda e senza offline, quindi il problema non esiste.
-- ════════════════════════════════════════════════════════════════════════════


-- ── CONSENSI ────────────────────────────────────────────────────────────────
-- Separati per tipo, ognuno con la VERSIONE del testo accettato: se il testo
-- legale cambia, serve sapere chi ha accettato quale versione.
create table if not exists public.consents (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  kind         text not null check (kind in ('athlete','guardian','research')),
  text_version text not null check (char_length(text_version) <= 20),
  granted      boolean not null,
  granted_at   timestamptz not null default now()
);
create index if not exists consents_athlete_idx on public.consents (athlete_id, kind);


-- ── CHECK-IN ────────────────────────────────────────────────────────────────
create table if not exists public.check_ins (
  id            uuid primary key,          -- generato sul client: consente l'offline
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  kind          checkin_kind not null,
  -- La data DELL'ATLETA, non created_at. Il giorno finisce alle 4 del mattino:
  -- un check-in dell'una di notte appartiene al giorno prima. Calcolata sul
  -- client, dove si conosce il fuso.
  local_date    date not null,
  created_at    timestamptz not null default now(),

  -- ── previsione (solo pre) ──
  -- Salvata con il proprio timestamp e PRIMA dell'esito: altrimenti non si
  -- distingue una previsione da una razionalizzazione (§5, la salvaguardia).
  tempo_predicted       tempo,
  prediction_confidence smallint check (prediction_confidence between 1 and 3),

  -- ── esito ──
  -- Due colonne SEMPRE: la differenza fra suggerito e scelto è il dato più
  -- prezioso del pilota — è l'atleta che corregge il modello (principio 5).
  tempo_suggested tempo,
  tempo_chosen    tempo,

  -- ── canali 1–5 ──
  sleep      smallint check (sleep      between 1 and 5),
  energy     smallint check (energy     between 1 and 5),
  hydration  smallint check (hydration  between 1 and 5),
  muscles    smallint check (muscles    between 1 and 5),
  legs       smallint check (legs       between 1 and 5),  -- post
  breath     smallint check (breath     between 1 and 5),  -- post
  effort     smallint check (effort     between 1 and 5),  -- post = session-RPE

  -- ── non scalari ──
  -- Headspace è multi-select di proposito: non si chiede a una ragazza di dare
  -- un voto al proprio umore, le si chiede di nominarlo.
  headspace        text[] check (headspace is null or array_length(headspace,1) <= 8),
  headspace_other  text   check (headspace_other is null or char_length(headspace_other) <= 60),
  surprise         smallint check (surprise between 1 and 3),

  -- ── contesto di vita ──
  sleep_hours   text     check (sleep_hours is null or char_length(sleep_hours) <= 10),
  school_load   smallint check (school_load between 1 and 3),
  painkillers   boolean,

  -- ── riflessione (post) ──
  brought_home text[] check (brought_home is null or array_length(brought_home,1) <= 5),
  note         text   check (note is null or char_length(note) <= 500),

  -- ── sessione (post) ──
  session_type    text check (session_type is null or session_type in ('training','match','pe','gym','other')),
  duration_bucket text check (duration_bucket is null or char_length(duration_bucket) <= 10),

  -- R3: nei giorni in cui il suo calendario dice "educazione fisica", il check-in
  -- chiede se ci è andata davvero — capita spesso di no, e il carico del giorno
  -- cambia parecchio. null = non le è stato chiesto.
  pe_attended     boolean,

  -- ── strumentazione del pilota ──
  -- R1: i 90 secondi NON sono un tetto. Il tempo si misura per capire, non per
  -- giudicare: un check-in lento può voler dire che sta ascoltando meglio, che è
  -- esattamente ciò che il prodotto vuole ottenere.
  started_at     timestamptz,
  completed_at   timestamptz,
  skipped_fields text[] check (skipped_fields is null or array_length(skipped_fields,1) <= 30)
);
create index if not exists check_ins_athlete_date_idx on public.check_ins (athlete_id, local_date desc);


-- ── SEGNALI CORPOREI ────────────────────────────────────────────────────────
-- Una riga per sensazione toccata, non un JSON nel check-in: "quante volte
-- questo mese ha segnalato il polpaccio destro?" è la base sia dei pattern sia
-- della body-story, e con un JSON diventa una query che si scriverà male.
create table if not exists public.body_signals (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete cascade,  -- null = segnalazione immediata
  created_at  timestamptz not null default now(),
  -- CODICE stabile ('calf_r'), non l'etichetta visibile: le etichette cambiano
  -- con la lingua e col copy, i dati no.
  region      text not null check (char_length(region) <= 40),
  region_free text check (region_free is null or char_length(region_free) <= 40),
  sensation   text not null check (char_length(sensation) <= 40),
  intensity   smallint check (intensity between 1 and 3),
  behaviour   behaviour_tag,
  is_red_flag boolean not null default false
);
create index if not exists body_signals_athlete_idx on public.body_signals (athlete_id, created_at desc);
create index if not exists body_signals_region_idx  on public.body_signals (athlete_id, region);


-- ── BANDIERE ROSSE ──────────────────────────────────────────────────────────
-- Tabella a sé, non un campo dentro il check-in: il §11 dice che devono escalare
-- a un umano immediatamente, MAI sepolte in un trend. Per farlo devono essere
-- interrogabili da sole, avere uno stato, e sopravvivere al check-in che le ha
-- generate — che è anche ciò che tiene il Care mode visibile nella home.
create table if not exists public.red_flags (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  body_signal_id uuid   references public.body_signals(id) on delete set null,
  opened_at     timestamptz not null default now(),
  region        text not null check (char_length(region) <= 40),
  sensation     text not null check (char_length(sensation) <= 40),
  -- La misura di sicurezza del pilota: deve arrivare al 100%.
  told_adult    boolean not null default false,
  told_adult_at timestamptz,
  resolved_at   timestamptz
);
create index if not exists red_flags_open_idx on public.red_flags (athlete_id, resolved_at);


-- ── CICLO ───────────────────────────────────────────────────────────────────
-- ⚠ TABELLA SEPARATA, CON LA SUA RLS, MAI IN JOIN A LIVELLO DI DATABASE.
-- L'onboarding promette: "il tuo ciclo non è mai condiviso, mai mostrato, e mai
-- incluso in niente che mandi". Se stesse nella stessa riga dei check-in, quella
-- promessa dipenderebbe dall'attenzione di chi scrive la query successiva.
-- Separata, dipende dal database — che non si distrae.
--
-- Si salvano solo le DATE. Le fasi si derivano nell'app: salvare la fase
-- significherebbe congelare un'inferenza incerta come se fosse un fatto, e nei
-- primi anni dopo il menarca i cicli sono troppo irregolari per farlo (§4.4).
create table if not exists public.cycle_events (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  kind       text not null check (kind in ('period_start','period_end')),
  event_date date not null,
  created_at timestamptz not null default now(),
  unique (athlete_id, kind, event_date)
);
create index if not exists cycle_events_athlete_idx on public.cycle_events (athlete_id, event_date desc);


-- ── PERCORSO ────────────────────────────────────────────────────────────────
create table if not exists public.journey_progress (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  week         smallint not null check (week between 1 and 16),
  completed_at timestamptz,
  reflection   text check (reflection is null or char_length(reflection) <= 1000),
  updated_at   timestamptz not null default now(),
  unique (athlete_id, week)
);


-- ── CONDIVISIONI (body-story) ───────────────────────────────────────────────
-- NON contiene i dati: solo l'elenco dei blocchi inclusi. Serve a dimostrare
-- che il ciclo non è mai stato incluso senza spunta esplicita, e a misurare
-- quanto la funzione viene usata davvero.
--
-- È anche il punto di innesto per la decisione aperta sulla visibilità del
-- coach: se e quando si deciderà che vede qualcosa, la policy leggerà SOLO
-- attraverso questa tabella, mai direttamente sui check-in. Così la decisione
-- non blocca lo schema, e il coach non potrà comunque mai vedere più di quello
-- che lei ha condiviso.
create table if not exists public.shares (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  created_at   timestamptz not null default now(),
  week_start   date not null,
  blocks       text[] not null check (array_length(blocks,1) between 1 and 6),
  included_cycle boolean not null default false,
  recipient_kind text check (recipient_kind is null or recipient_kind in ('coach','parent','physio','other'))
);


-- ── STRUMENTAZIONE ──────────────────────────────────────────────────────────
-- Nessun contenuto: solo evento, schermata, durata e una meta piccola.
create table if not exists public.ux_events (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  created_at timestamptz not null default now(),
  event      text not null check (char_length(event) <= 40),
  screen     text check (screen is null or char_length(screen) <= 40),
  ms         integer check (ms is null or ms between 0 and 3600000),
  meta       jsonb check (meta is null or pg_column_size(meta) < 2000)
);
create index if not exists ux_events_athlete_idx on public.ux_events (athlete_id, created_at desc);


-- ════════════════════════════════════════════════════════════════════════════
-- SQUADRE  (R2 e R5 della revisione)
--
-- La dashboard del coach entra nella v1, e lo staff vede i dati dei due
-- check-in. Ma NON attraverso queste tabelle: lo staff legge solo dalle viste
-- coach_* in fondo al file, che escludono il testo libero. Vedi il commento
-- lungo sopra le viste — è la parte che va capita prima di toccare qualcosa.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 60),
  sport      text not null check (char_length(sport) <= 40),
  -- Determina il vocabolario della dashboard: 'gare' per atletica, nuoto,
  -- Hyrox/CrossFit; 'partite' per calcio, pallavolo, basket, tennis (R5).
  event_word text not null default 'match' check (event_word in ('match','competition')),
  locale     text not null default 'it' check (char_length(locale) <= 5)
);

-- Chi, nella squadra, può vedere le atlete.
create table if not exists public.team_staff (
  team_id   uuid not null references public.teams(id) on delete cascade,
  user_id   uuid not null references auth.users(id)  on delete cascade,
  role      text not null default 'coach' check (role in ('head_coach','coach','physio','staff')),
  added_at  timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index if not exists team_staff_user_idx on public.team_staff (user_id);

-- L'appartenenza ha una FINE, non solo un inizio: quando un'atleta lascia la
-- squadra lo staff smette di vederla, ma le sue righe restano sue e intatte.
create table if not exists public.team_members (
  team_id    uuid not null references public.teams(id)     on delete cascade,
  athlete_id uuid not null references public.athletes(id)  on delete cascade,
  joined_at  timestamptz not null default now(),
  left_at    timestamptz,
  primary key (team_id, athlete_id)
);
create index if not exists team_members_athlete_idx on public.team_members (athlete_id) where left_at is null;

-- ⚠️ ALTEZZA E PESO — R5: "l'atleta non può vederle".
-- Tabella separata proprio per questo. Non ha nessuna policy per l'atleta, e la
-- sua RLS non la nomina mai: non è nascosta nella UI, è irraggiungibile.
-- Se stesse in `athletes` basterebbe una select distratta per mostrargliele.
create table if not exists public.athlete_measurements (
  id          bigint generated always as identity primary key,
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  team_id     uuid not null references public.teams(id)    on delete cascade,
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  height_cm   numeric(4,1) check (height_cm is null or height_cm between 100 and 230),
  weight_kg   numeric(4,1) check (weight_kg is null or weight_kg between 25 and 200)
);
create index if not exists measurements_athlete_idx on public.athlete_measurements (athlete_id, recorded_at desc);

-- Il piano settimanale della squadra: che tipo di sessione e quando (R5).
-- weekday 1 = lunedì, coerente con ISO.
create table if not exists public.team_sessions (
  id           bigint generated always as identity primary key,
  team_id      uuid not null references public.teams(id) on delete cascade,
  weekday      smallint not null check (weekday between 1 and 7),
  start_time   time,
  duration_min smallint check (duration_min is null or duration_min between 15 and 300),
  -- Il carico PIANIFICATO dal coach. Il confronto con l'effort riportato
  -- dall'atleta è la domanda più interessante che la dashboard può porre.
  intensity    text check (intensity is null or intensity in ('low','medium','high')),
  label        text check (label is null or char_length(label) <= 60)
);
create index if not exists team_sessions_team_idx on public.team_sessions (team_id, weekday);

-- Gare e partite della squadra (R5).
create table if not exists public.team_events (
  id         bigint generated always as identity primary key,
  team_id    uuid not null references public.teams(id) on delete cascade,
  event_date date not null,
  start_time time,
  kind       text not null default 'match' check (kind in ('match','competition')),
  title      text check (title is null or char_length(title) <= 80)
);
create index if not exists team_events_team_idx on public.team_events (team_id, event_date desc);


-- ── LA MIA SETTIMANA (calendario dell'atleta, R3) ───────────────────────────
-- Il suo calendario, distinto da quello della squadra: qui c'è l'educazione
-- fisica a scuola, che la squadra non conosce ma che è carico a tutti gli
-- effetti — ed è il motivo per cui il check-in chiede `pe_attended`.
create table if not exists public.athlete_schedule (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  weekday      smallint not null check (weekday between 1 and 7),
  kind         text not null check (kind in ('pe','training','other')),
  start_time   time,
  duration_min smallint check (duration_min is null or duration_min between 15 and 300),
  label        text check (label is null or char_length(label) <= 60),
  unique (athlete_id, weekday, kind, start_time)
);
create index if not exists athlete_schedule_idx on public.athlete_schedule (athlete_id, weekday);

-- Le sue gare. R3: l'orario è opzionale perché spesso non lo sa ancora — e
-- chiederglielo comunque sarebbe un modo per bloccarla su una domanda a cui non
-- può rispondere.
create table if not exists public.athlete_events (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  event_date date not null,
  start_time time,
  kind       text not null default 'competition' check (kind in ('match','competition','other')),
  title      text check (title is null or char_length(title) <= 80)
);
create index if not exists athlete_events_idx on public.athlete_events (athlete_id, event_date desc);


-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Sulle tabelle dell'atleta la regola resta una sola: athlete_id = auth.uid().
-- Le sue righe sono sue, e lo staff NON ha nessuna policy qui sopra.
--
-- Lo staff legge esclusivamente dalle viste coach_* più in basso. Non è una
-- preferenza di stile: è il modo in cui la regola "sì ai dati dei check-in, no
-- al journaling" (R2) smette di dipendere da chi scrive la prossima query.
-- Le colonne di testo libero non sono filtrate a valle — non sono raggiungibili.
--
-- Conseguenza che resta valida anche dopo R2: un'atleta non può vedere i dati di
-- un'altra atleta. Quella query non è sconsigliata, è IMPOSSIBILE, e il
-- principio del "normale individualizzato" (§3) non dipende dalla disciplina di
-- chi scrive il codice.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['athletes','consents','check_ins','body_signals',
                           'red_flags','cycle_events','journey_progress','shares',
                           'ux_events','athlete_schedule','athlete_events']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    if t = 'athletes' then
      execute format($p$create policy "own rows" on public.%I
                       for all to authenticated
                       using (id = auth.uid()) with check (id = auth.uid())$p$, t);
    else
      execute format($p$create policy "own rows" on public.%I
                       for all to authenticated
                       using (athlete_id = auth.uid()) with check (athlete_id = auth.uid())$p$, t);
    end if;
  end loop;
end $$;


-- ── CHI È STAFF DI CHI ──────────────────────────────────────────────────────
-- security definer perché deve poter leggere team_members e team_staff mentre
-- decide se il chiamante ha diritto di leggerli. search_path fissato: senza,
-- una definer è dirottabile creando uno schema con lo stesso nome di tabella.
create or replace function public.is_staff_of(p_athlete uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1
    from public.team_members m
    join public.team_staff  s on s.team_id = m.team_id
    where m.athlete_id = p_athlete
      and s.user_id    = auth.uid()
      and m.left_at is null          -- chi ha lasciato la squadra sparisce
  );
$$;

create or replace function public.is_staff_of_team(p_team uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.team_staff s
    where s.team_id = p_team and s.user_id = auth.uid()
  );
$$;


-- ── RLS DELLE TABELLE DI SQUADRA ────────────────────────────────────────────
alter table public.teams                enable row level security;
alter table public.team_staff           enable row level security;
alter table public.team_members         enable row level security;
alter table public.athlete_measurements enable row level security;
alter table public.team_sessions        enable row level security;
alter table public.team_events          enable row level security;

drop policy if exists "staff read team"   on public.teams;
create policy "staff read team" on public.teams
  for select to authenticated using (public.is_staff_of_team(id));

-- L'atleta vede le squadre di cui fa parte: le serve per sapere CHI la vede.
-- Non è una comodità, è il presupposto del consenso informato (R2).
drop policy if exists "athlete reads own teams" on public.teams;
create policy "athlete reads own teams" on public.teams
  for select to authenticated using (
    exists (select 1 from public.team_members m
            where m.team_id = teams.id and m.athlete_id = auth.uid() and m.left_at is null));

drop policy if exists "staff read roster" on public.team_staff;
create policy "staff read roster" on public.team_staff
  for select to authenticated using (public.is_staff_of_team(team_id));

drop policy if exists "staff manage members" on public.team_members;
create policy "staff manage members" on public.team_members
  for all to authenticated
  using (public.is_staff_of_team(team_id)) with check (public.is_staff_of_team(team_id));

drop policy if exists "athlete reads own membership" on public.team_members;
create policy "athlete reads own membership" on public.team_members
  for select to authenticated using (athlete_id = auth.uid());

-- ⚠️ Una sola policy, e non nomina mai l'atleta: R5 dice che non le vede.
drop policy if exists "staff only" on public.athlete_measurements;
create policy "staff only" on public.athlete_measurements
  for all to authenticated
  using (public.is_staff_of_team(team_id)) with check (public.is_staff_of_team(team_id));

-- Il piano di allenamento lo scrive lo staff, e l'atleta lo legge: le serve per
-- sapere quando ci si aspetta un check-in.
drop policy if exists "staff writes plan" on public.team_sessions;
create policy "staff writes plan" on public.team_sessions
  for all to authenticated
  using (public.is_staff_of_team(team_id)) with check (public.is_staff_of_team(team_id));

drop policy if exists "members read plan" on public.team_sessions;
create policy "members read plan" on public.team_sessions
  for select to authenticated using (
    exists (select 1 from public.team_members m
            where m.team_id = team_sessions.team_id and m.athlete_id = auth.uid() and m.left_at is null));

drop policy if exists "staff writes events" on public.team_events;
create policy "staff writes events" on public.team_events
  for all to authenticated
  using (public.is_staff_of_team(team_id)) with check (public.is_staff_of_team(team_id));

drop policy if exists "members read events" on public.team_events;
create policy "members read events" on public.team_events
  for select to authenticated using (
    exists (select 1 from public.team_members m
            where m.team_id = team_events.team_id and m.athlete_id = auth.uid() and m.left_at is null));


-- ════════════════════════════════════════════════════════════════════════════
-- LE VISTE DELLO STAFF  (R2)
--
-- ⚠️ LEGGERE PRIMA DI MODIFICARE.
--
-- Queste viste girano con i privilegi del PROPRIETARIO (security_invoker = off,
-- che è il default). Bypassano quindi la RLS delle tabelle sottostanti: l'unica
-- cosa che impedisce a un coach di leggere l'intero database è la clausola
-- `where public.is_staff_of(athlete_id)`. Non toglietela, e non aggiungete una
-- vista qui senza.
--
-- In cambio si ottiene la cosa che serviva: l'elenco delle colonne è la
-- frontiera. Il testo libero — `note`, `headspace_other`, `region_free` — non
-- compare, quindi non esiste query che possa farlo uscire. La founder ha deciso
-- che la squadra vede i dati dei due check-in ma non il journaling: qui la
-- distinzione è fatta di colonne, non di buone intenzioni.
--
-- 🔴 AGGIUNGENDO UNA COLONNA DI TESTO LIBERO alle tabelle di base, NON va
-- aggiunta qui. È l'unica regola da ricordare.
-- ════════════════════════════════════════════════════════════════════════════

create or replace view public.coach_athletes as
  select a.id, a.display_name, a.athlete_code, a.birth_date,
         public.age_years(a.birth_date) as age, a.sport, a.locale,
         m.team_id, m.joined_at
  from public.athletes a
  join public.team_members m on m.athlete_id = a.id and m.left_at is null
  where public.is_staff_of_team(m.team_id);

create or replace view public.coach_check_ins as
  select id, athlete_id, kind, local_date, created_at,
         tempo_predicted, prediction_confidence, tempo_suggested, tempo_chosen,
         sleep, energy, hydration, muscles, legs, breath, effort,
         headspace, surprise,            -- headspace_other NO: è testo libero
         sleep_hours, school_load, painkillers,
         brought_home,                   -- `note` NO: sono le sue parole
         session_type, duration_bucket, pe_attended,
         started_at, completed_at
  from public.check_ins
  where public.is_staff_of(athlete_id);

create or replace view public.coach_body_signals as
  select id, athlete_id, check_in_id, created_at,
         region,                         -- `region_free` NO: è testo libero
         sensation, intensity, behaviour, is_red_flag
  from public.body_signals
  where public.is_staff_of(athlete_id);

-- Le bandiere rosse sono il motivo per cui un adulto deve poter vedere: §11
-- chiede che escalino a un umano, e questa vista è come ci arrivano.
create or replace view public.coach_red_flags as
  select id, athlete_id, body_signal_id, opened_at, region, sensation,
         told_adult, told_adult_at, resolved_at
  from public.red_flags
  where public.is_staff_of(athlete_id);

-- ⚠️ R2: la squadra vede anche il ciclo. È la decisione che ha cambiato di più
-- rispetto al progetto originale, dove questa tabella era volutamente
-- irraggiungibile. Si vedono le DATE; le fasi restano un'inferenza che si
-- calcola a runtime e che nessuno deve poter scambiare per un fatto.
create or replace view public.coach_cycle_events as
  select id, athlete_id, kind, event_date, created_at
  from public.cycle_events
  where public.is_staff_of(athlete_id);

create or replace view public.coach_measurements as
  select id, athlete_id, team_id, recorded_at, height_cm, weight_kg
  from public.athlete_measurements
  where public.is_staff_of_team(team_id);

grant select on public.coach_athletes, public.coach_check_ins,
                public.coach_body_signals, public.coach_red_flags,
                public.coach_cycle_events, public.coach_measurements
  to authenticated;


-- ── EXPORT (§9: i dati sono suoi) ───────────────────────────────────────────
-- Funzione di prima classe, non un'aggiunta successiva.
--
-- 🔵 Da chiarire con chi segue il legale: `athlete_measurements` NON è qui,
-- perché R5 dice che l'atleta non vede altezza e peso. Ma un export è anche il
-- modo in cui si soddisfa una richiesta di accesso ai propri dati, e su una
-- minorenne quel diritto esiste comunque. Le due cose non sono automaticamente
-- compatibili. Qui è implementata la decisione di prodotto; la domanda resta.
create or replace function public.export_my_data()
returns jsonb language sql security invoker stable as $$
  select jsonb_build_object(
    'exported_at',  now(),
    'athlete',      (select to_jsonb(a) from public.athletes a where a.id = auth.uid()),
    'consents',     (select coalesce(jsonb_agg(to_jsonb(c)),'[]') from public.consents c where c.athlete_id = auth.uid()),
    'check_ins',    (select coalesce(jsonb_agg(to_jsonb(k)),'[]') from public.check_ins k where k.athlete_id = auth.uid()),
    'body_signals', (select coalesce(jsonb_agg(to_jsonb(b)),'[]') from public.body_signals b where b.athlete_id = auth.uid()),
    'red_flags',    (select coalesce(jsonb_agg(to_jsonb(r)),'[]') from public.red_flags r where r.athlete_id = auth.uid()),
    'cycle_events', (select coalesce(jsonb_agg(to_jsonb(y)),'[]') from public.cycle_events y where y.athlete_id = auth.uid()),
    'journey',      (select coalesce(jsonb_agg(to_jsonb(j)),'[]') from public.journey_progress j where j.athlete_id = auth.uid()),
    'shares',       (select coalesce(jsonb_agg(to_jsonb(s)),'[]') from public.shares s where s.athlete_id = auth.uid()),
    'schedule',     (select coalesce(jsonb_agg(to_jsonb(w)),'[]') from public.athlete_schedule w where w.athlete_id = auth.uid()),
    'events',       (select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.athlete_events e where e.athlete_id = auth.uid()),
    -- 🔴 Anche la strumentazione. Non serve a lei e non gliela mostriamo da
    -- nessuna parte, ma è generata dal suo uso ed è un dato personale: tenerla
    -- fuori da una richiesta di accesso ai propri dati sarebbe indifendibile.
    'ux_events',    (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from public.ux_events x where x.athlete_id = auth.uid())
  );
$$;

-- ── CANCELLAZIONE ───────────────────────────────────────────────────────────
-- Reale, non un flag "deleted". Il cascade da athletes fa il resto; qui si
-- rimuove anche l'utente auth.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
