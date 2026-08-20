-- ==============================================================================
-- Schema Database Supabase: Aplikasi Penulis Novel Terstruktur
-- Jalankan skrip ini di SQL Editor pada dashboard proyek Supabase Anda.
-- ==============================================================================

-- 1. Tabel Proyek Novel (Menyimpan seluruh metadata dan state terintegrasi)
CREATE TABLE IF NOT EXISTS public.novel_projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    genre TEXT,
    project_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Audit Log Generasi AI (generation_logs)
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES public.novel_projects(id) ON DELETE CASCADE,
    chapter_id TEXT,
    mode TEXT NOT NULL,
    model TEXT,
    prompt TEXT NOT NULL,
    output_text TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Skema Terstruktur Relasional Tambahan (Opsional untuk query granular)
CREATE TABLE IF NOT EXISTS public.novels (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT,
    genre TEXT,
    logline TEXT,
    central_theme TEXT,
    outline_type TEXT DEFAULT 'save_the_cat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.characters (
    id TEXT PRIMARY KEY,
    novel_id TEXT REFERENCES public.novels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    external_goal TEXT,
    internal_need TEXT,
    fatal_flaw TEXT,
    backstory TEXT,
    arc_start TEXT,
    arc_climax TEXT,
    arc_end TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.world_entries (
    id TEXT PRIMARY KEY,
    novel_id TEXT REFERENCES public.novels(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    detailed_rules TEXT,
    secrets_or_taboos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    novel_id TEXT REFERENCES public.novels(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    pov TEXT DEFAULT 'third_limited',
    tense TEXT DEFAULT 'past',
    status TEXT DEFAULT 'planned',
    target_word_count INTEGER DEFAULT 1500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.revision_notes (
    id TEXT PRIMARY KEY,
    chapter_id TEXT REFERENCES public.chapters(id) ON DELETE CASCADE,
    pass_type TEXT NOT NULL,
    issue TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. Enable Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.novel_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_notes ENABLE ROW LEVEL SECURITY;

-- Policies: Mengizinkan akses publik/anon untuk kemudahan demo atau terikat user yang login
CREATE POLICY "Allow authenticated or public access on novel_projects"
    ON public.novel_projects FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on generation_logs"
    ON public.generation_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on novels"
    ON public.novels FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on characters"
    ON public.characters FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on world_entries"
    ON public.world_entries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on chapters"
    ON public.chapters FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated or public access on revision_notes"
    ON public.revision_notes FOR ALL USING (true) WITH CHECK (true);
