-- ==============================================================================
-- AKTIFKAN SUPABASE REALTIME REPLICATION UNTUK PORTOFOLIO V5
-- Salin dan jalankan script ini di: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

DO $$
BEGIN
  -- 1. Realtime untuk Konfigurasi & Tampilan CMS (portfolio_settings)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'portfolio_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_settings;
  END IF;

  -- 2. Realtime untuk Proyek Portofolio (projects)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;

  -- 3. Realtime untuk Sertifikat (certificates)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'certificates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
  END IF;

  -- 4. Realtime untuk Komentar / Buku Tamu (portfolio_comments)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'portfolio_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_comments;
  END IF;
END $$;
