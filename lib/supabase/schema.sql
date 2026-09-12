-- ==============================================================================
-- LEARNVERSE SUPABASE POSTGRES SCHEMA (Hardened Security Model)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Curriculum Documents Table
CREATE TABLE IF NOT EXISTS public.curriculum_documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT,
  chapter TEXT,
  source_file_name TEXT,
  source_file_path TEXT,
  file_url TEXT,
  extracted_text TEXT,
  overview TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Curriculum Subtopics Table
CREATE TABLE IF NOT EXISTS public.curriculum_subtopics (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES public.curriculum_documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  source_text TEXT,
  source_pages JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  estimated_duration_seconds INTEGER NOT NULL DEFAULT 45,
  reel_status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started' | 'generating' | 'ready' | 'failed'
  reel_job_id TEXT,
  video_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  chapters_json JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Generation Jobs Table
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES public.curriculum_documents(id) ON DELETE CASCADE,
  subtopic_id TEXT REFERENCES public.curriculum_subtopics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued' | 'processing' | 'ready' | 'failed'
  progress INTEGER NOT NULL DEFAULT 0,
  current_step TEXT,
  error_message TEXT,
  video_path TEXT,
  video_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS)
-- Enables strict access control. Anonymous PostgREST requests cannot query tables.
ALTER TABLE public.curriculum_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Remove Any Previous Public Read Policies (Prevent public scraping via anon key)
DROP POLICY IF EXISTS "Public Read Curriculum Documents" ON public.curriculum_documents;
DROP POLICY IF EXISTS "Public Read Curriculum Subtopics" ON public.curriculum_subtopics;
DROP POLICY IF EXISTS "Public Read Generation Jobs" ON public.generation_jobs;

-- Service Role Full Access Policies (Server-Side Next.js API Routes Only)
DROP POLICY IF EXISTS "Service Role Full Access Documents" ON public.curriculum_documents;
CREATE POLICY "Service Role Full Access Documents" ON public.curriculum_documents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Subtopics" ON public.curriculum_subtopics;
CREATE POLICY "Service Role Full Access Subtopics" ON public.curriculum_subtopics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full Access Jobs" ON public.generation_jobs;
CREATE POLICY "Service Role Full Access Jobs" ON public.generation_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
