-- ════════════════════════════════════════════════════════════════════════════
-- IL TUTORIAL: CHI L'HA GIÀ VISTO, E IL PRIMO BATTITO CONTATO
--
-- Si incolla nell'editor SQL di Supabase. Si può rieseguire quante volte si
-- vuole. Non dipende dalle altre migrazioni: l'ordine non conta.
--
-- ── PERCHÉ DUE COLONNE E NON UN FLAG NEL TELEFONO ──────────────────────────
-- Il profilo si scrive alla fine dell'onboarding, cioè PRIMA del tutorial. Da
-- quel momento la guardia sa che questa persona ha già risposto alle domande,
-- e senza `tutorial_done` la manderebbe dritta in home: chi chiude l'app a
-- metà del minigioco non rivedrebbe il tutorial mai più.
--
-- In `localStorage` non basta: cambiare telefono, svuotare i dati del sito o
-- aprire BAB dal browser di qualcun altro rimetterebbe tutto da capo. Questo
-- è un fatto dell'account, non del dispositivo, e sta dove sta l'account.
--
-- ── IL BATTITO ─────────────────────────────────────────────────────────────
-- `first_bpm` è il battito che ha contato lei stessa, col dito sul polso, nei
-- quindici secondi del tutorial. Non è una misura clinica e non va letta come
-- tale: è il suo punto di partenza, quello che le fa vedere quanto la sua
-- sensazione e il suo conteggio si somigliano.
--
-- È un dato sulla salute, quindi sta sulla riga dell'atleta e non in una
-- tabella condivisa: le regole di `athletes` dicono già che ogni riga la vede
-- solo lei. Nessuno staff, nessun allenatore.
--
-- Il limite 30-220 non è pignoleria: è il minigioco che si difende da un dito
-- che tocca a caso. Fuori da lì il valore non si scrive.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.athletes
  add column if not exists tutorial_done timestamptz;

comment on column public.athletes.tutorial_done is
  'Quando ha finito il tutorial. Null = non l''ha finito, e la guardia ce la riporta.';

alter table public.athletes
  add column if not exists first_bpm smallint;

comment on column public.athletes.first_bpm is
  'I battiti al minuto contati da lei nel tutorial. Il suo punto di partenza, non una misura clinica.';

alter table public.athletes drop constraint if exists athletes_first_bpm_check;
alter table public.athletes add constraint athletes_first_bpm_check
  check (first_bpm is null or first_bpm between 30 and 220);

-- Le regole di riga di `athletes` esistono già e valgono anche per queste due
-- colonne: una riga la legge e la scrive solo chi è quella riga. Non c'è
-- niente da aggiungere qui, ed è proprio il motivo per cui il battito sta qui
-- invece che in una tabella nuova.
