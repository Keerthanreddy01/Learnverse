-- ==============================================================================
-- LEARNVERSE ROLE-BASED ACCESS & REELS SCHEMA
-- ==============================================================================

-- 1. Profiles Table (Secure Role Storage)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty')),
  grade TEXT, -- e.g. "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate"
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reels Table (Faculty CMS Uploads + AI-Generated Reels)
CREATE TABLE IF NOT EXISTS public.reels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('faculty', 'ai_generated')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Set if private personalized AI reel
  grade TEXT,
  subject TEXT NOT NULL,
  chapter TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT NOT NULL DEFAULT 'English',
  duration_seconds INTEGER NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'failed', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reel Questions Table (Interactive questions connected to each reel)
CREATE TABLE IF NOT EXISTS public.reel_questions (
  id TEXT PRIMARY KEY,
  reel_id TEXT NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Student Reel Activity Table (Watch Tracking)
CREATE TABLE IF NOT EXISTS public.student_reel_activity (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reel_id TEXT NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Student Reel Answers Table (Assessments)
CREATE TABLE IF NOT EXISTS public.student_reel_answers (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reel_id TEXT NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.reel_questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reel_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reel_answers ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Reels Policies
DROP POLICY IF EXISTS "Faculty manage own reels" ON public.reels;
CREATE POLICY "Faculty manage own reels" ON public.reels
  FOR ALL TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Students read published reels" ON public.reels;
CREATE POLICY "Students read published reels" ON public.reels
  FOR SELECT TO authenticated
  USING (
    status = 'published' AND (
      source_type = 'faculty' OR student_id = auth.uid()
    )
  );

-- 3. Reel Questions Policies
DROP POLICY IF EXISTS "Read reel questions" ON public.reel_questions;
CREATE POLICY "Read reel questions" ON public.reel_questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Faculty manage questions" ON public.reel_questions;
CREATE POLICY "Faculty manage questions" ON public.reel_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reels WHERE reels.id = reel_questions.reel_id AND reels.created_by = auth.uid()
    )
  );

-- 4. Activity & Answers Policies
DROP POLICY IF EXISTS "Students track own activity" ON public.student_reel_activity;
CREATE POLICY "Students track own activity" ON public.student_reel_activity
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students manage own answers" ON public.student_reel_answers;
CREATE POLICY "Students manage own answers" ON public.student_reel_answers
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- 5. Service Role Full Access (Server-side Next.js APIs)
CREATE POLICY "Service Role Full Access Profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Reels" ON public.reels FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Questions" ON public.reel_questions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Activity" ON public.student_reel_activity FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Answers" ON public.student_reel_answers FOR ALL TO service_role USING (true) WITH CHECK (true);
