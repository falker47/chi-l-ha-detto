-- =====================================================
-- KEEP-ALIVE TABLE
-- Tabella dedicata al keep-alive: ogni ping è un INSERT
-- (Supabase resetta il pause-timer solo su attività di scrittura)
-- Eseguire nel SQL Editor del progetto Supabase, una volta sola.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pinged_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pings IS 'Heartbeat table to prevent Supabase free-tier auto-pause';

-- RLS abilitata, ma anon può solo INSERT (no SELECT/UPDATE/DELETE)
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can insert pings" ON public.pings;
CREATE POLICY "Anon can insert pings"
  ON public.pings
  FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT INSERT ON public.pings TO anon;
GRANT USAGE ON SEQUENCE public.pings_id_seq TO anon;
