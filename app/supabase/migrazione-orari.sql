-- ════════════════════════════════════════════════════════════════════════════
-- L'ORA LOCALE DI CHI HA RISPOSTO
--
-- `completed_at` e' un timestamptz: dice l'istante assoluto, in UTC. Ma "erano
-- le sette di mattina o le undici di sera?" e' un'altra domanda, ed e'
-- esattamente quella che le finestre della giornata pongono.
--
-- Da `completed_at` a quell'ora ci si arriverebbe solo col fuso dell'atleta.
-- `athletes.timezone` c'e', ma non lo scrive nessuno: e' un default
-- ('Europe/Rome') messo quando la riga nasce, quindi e' vero per il pilota
-- italiano e falso per chiunque altro. Dedurre l'ora da un default vuol dire
-- leggere un'ipotesi come se fosse un dato.
--
-- Quindi la si scrive, come si scrive gia' `local_date` e per la stessa
-- ragione: il fuso lo conosce il telefono, e il valore derivato lo calcola
-- lui, una volta, quando la cosa succede.
--
-- Un `time` e non un `timestamp`: la data c'e' gia' in `local_date`, e
-- tenerla due volte vuol dire poterle far dire due cose diverse.
--
-- Idempotente come le altre: si puo' rilanciare, ed e' gia' dentro a
-- `schema.sql` per i database nuovi.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.check_ins add column if not exists local_time time;

comment on column public.check_ins.local_time is
  'L''ora sull''orologio dell''atleta quando ha finito. Scritta dal telefono come local_date, e per la stessa ragione: il fuso lo conosce solo lui.';
