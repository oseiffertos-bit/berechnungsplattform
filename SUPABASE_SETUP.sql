-- ================================================================
--  Berechnungsplattform – Supabase Schema Setup
--  Ausführen in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Unbenannt',
  type        TEXT NOT NULL DEFAULT 'Stationäre Hubsäule',
  status      TEXT NOT NULL DEFAULT 'Entwurf'
                CHECK (status IN ('Entwurf', 'In Bearbeitung', 'Abgeschlossen')),
  form_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_data JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_id_idx  ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);
