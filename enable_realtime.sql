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

-- 5. Pastikan Storage Bucket 'resume-files' Tersedia untuk Upload Resume PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume-files', 'resume-files', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for resume-files'
  ) THEN
    CREATE POLICY "Public Access for resume-files" ON storage.objects FOR SELECT USING (bucket_id = 'resume-files');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload for resume-files'
  ) THEN
    CREATE POLICY "Public Upload for resume-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resume-files');
  END IF;
END $$;

-- 6. Mengatasi Peringatan Keamanan RLS untuk tabel public.voters (Jika Ada di Database)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'voters') THEN
    EXECUTE 'ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'voters' AND policyname = 'Public Read voters'
    ) THEN
      EXECUTE 'CREATE POLICY "Public Read voters" ON public.voters FOR SELECT USING (true);';
    END IF;
  END IF;
END $$;
