-- ════════════════════════════════════════════════════════════════════════════
-- BAB — schema dell'app atleta
-- Eseguire nello SQL Editor di Supabase. Idempotente: si può rilanciare.
--
-- Le motivazioni delle scelte stanno in docs/06-implementazione/02-modello-dati.md
--
-- Due principi che attraversano tutto lo schema:
--   1. I check-in sono EVENTI IMMUTABILI. Non si modificano: se rifà il check-in,
--      è una riga nuova. Questo rende l'offline banale (nessun conflitto) e
--      conserva il fatto che ha cambiato idea, che è un dato interessante.
--   2. Nessun aggregato materializzato. Le soglie non sono validate (§8): tutto
--      ciò che è interpretazione si calcola a runtime e può cambiare senza
--      migrare i dati.
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
-- Nessun nome reale: nel pilota si usa un codice atleta (coerente con il piano
-- di ricerca). L'email vive in auth.users, gestita da Supabase.
-- birth_year e non data di nascita: basta a scalare la mappa corporea per fascia
-- d'età (§10) e riduce il dato personale raccolto su una minorenne.
create table if not exists public.athletes (
  id             uuid primary key references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  athlete_code   text        not null check (char_length(athlete_code) between 3 and 20),
  birth_year     smallint    not null check (birth_year between 1990 and 2030),
  sport          text        check (sport is null or char_length(sport) <= 40),
  training_days  smallint[]  check (training_days is null or array_length(training_days,1) <= 7),
  -- 'undisclosed' non è un ripiego: nasconde il blocco ritmo ovunque, e va
  -- rispettato in ogni schermata.
  cycle_status   cycle_status  not null default 'undisclosed',
  contraception  contraception not null default 'undisclosed',
  locale         text        not null default 'it' check (char_length(locale) <= 5),
  timezone       text        default 'Europe/Rome' check (char_length(timezone) <= 60),
  unique (athlete_code)
);

-- Fascia d'età derivata: usata per scegliere la mappa corporea junior (11–13).
create or replace function public.body_map_variant(p_birth_year smallint)
returns text language sql immutable as $$
  select case when (extract(year from now())::int - p_birth_year) <= 13
              then 'junior' else 'full' end;
$$;


-- ── CONSENSI ────────────────────────────────────────────────────────────────
-- Separati per tipo, ognuno con la VERSIONE del testo accettato: se il testo
-- legale cambia, serve sapere chi ha accettato quale versione.
create table if not exists public.consents (
  id           bigint generated always as identity primary key,
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

  -- ── strumentazione del pilota ──
  -- Il tetto dei 90 secondi è un requisito di fattibilità, non un auspicio:
  -- va misurato, non stimato.
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
  id          bigint generated always as identity primary key,
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
  id            bigint generated always as identity primary key,
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  body_signal_id bigint references public.body_signals(id) on delete set null,
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
  id         bigint generated always as identity primary key,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  kind       text not null check (kind in ('period_start','period_end')),
  event_date date not null,
  created_at timestamptz not null default now(),
  unique (athlete_id, kind, event_date)
);
create index if not exists cycle_events_athlete_idx on public.cycle_events (athlete_id, event_date desc);


-- ── PERCORSO ────────────────────────────────────────────────────────────────
create table if not exists public.journey_progress (
  id           bigint generated always as identity primary key,
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
  id           bigint generated always as identity primary key,
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
  id         bigint generated always as identity primary key,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  created_at timestamptz not null default now(),
  event      text not null check (char_length(event) <= 40),
  screen     text check (screen is null or char_length(screen) <= 40),
  ms         integer check (ms is null or ms between 0 and 3600000),
  meta       jsonb check (meta is null or pg_column_size(meta) < 2000)
);
create index if not exists ux_events_athlete_idx on public.ux_events (athlete_id, created_at desc);


-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Regola unica, su OGNI tabella: athlete_id = auth.uid().
-- Nessuna policy di lettura incrociata, nessuna eccezione.
--
-- Conseguenza: una query che confronta due atlete non è sconsigliata, è
-- IMPOSSIBILE. Il principio del "normale individualizzato" (§3) smette di
-- dipendere dalla disciplina di chi scrive il codice.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['athletes','consents','check_ins','body_signals',
                           'red_flags','cycle_events','journey_progress','shares','ux_events']
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


-- ── EXPORT (§9: i dati sono suoi) ───────────────────────────────────────────
-- Funzione di prima classe, non un'aggiunta successiva.
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
    'shares',       (select coalesce(jsonb_agg(to_jsonb(s)),'[]') from public.shares s where s.athlete_id = auth.uid())
  );
$$;

-- ── CANCELLAZIONE ───────────────────────────────────────────────────────────
-- Reale, non un flag "deleted". Il cascade da athletes fa il resto; qui si
-- rimuove anche l'utente auth.
create or replace function public.delete_my_account()
returns void language plpgsql security definer as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
