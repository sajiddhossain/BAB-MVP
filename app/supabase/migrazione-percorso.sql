-- ════════════════════════════════════════════════════════════════════════════
-- IL PERCORSO: QUALI LEZIONI SONO STATE FINITE
--
-- Otto lezioni, due parole ciascuna. Una riga per lezione finita.
--
-- Non si riusa `journey_progress`: quella tabella ha una colonna `week` con un
-- vincolo 1..16 ed e' fatta per il programma di sedici settimane, che e'
-- un'altra cosa. Riusarla vorrebbe dire chiamare "settimana" una lezione e
-- lasciare a chi legge il database il compito di indovinare quale delle due
-- cose sta guardando.
--
-- Niente `completed_at` nullo: una riga qui dentro vuol dire finita. Una
-- lezione cominciata e non finita non lascia traccia — riprenderla vuol dire
-- rifarla, e sono tre minuti.
--
-- Idempotente come le altre, ed e' gia' dentro a `schema.sql` per i database
-- nuovi.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.body_language_progress (
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  lesson       smallint not null check (lesson between 1 and 8),
  completed_at timestamptz not null default now(),
  primary key (athlete_id, lesson)
);

comment on table public.body_language_progress is
  'Le lezioni di body-language finite. Una riga = una lezione finita, e con lei le sue due parole sbloccate.';

alter table public.body_language_progress enable row level security;
drop policy if exists "own rows" on public.body_language_progress;
create policy "own rows" on public.body_language_progress
  for all to authenticated
  using (athlete_id = auth.uid()) with check (athlete_id = auth.uid());
