export type UserRole = 'student' | 'faculty'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  grade?: string | null
  institution?: string | null
  created_at: string
  updated_at: string
}

export type ReelSourceType = 'faculty' | 'ai_generated'

export type ReelDifficulty = 'easy' | 'medium' | 'hard'

export type ReelStatus = 'draft' | 'processing' | 'published' | 'failed' | 'archived'

export interface ReelRecord {
  id: string
  title: string
  description?: string | null
  video_url: string
  thumbnail_url?: string | null
  source_type: ReelSourceType
  created_by?: string | null
  student_id?: string | null
  grade?: string | null
  subject: string
  chapter?: string | null
  topic: string
  difficulty: ReelDifficulty
  language: string
  duration_seconds: number
  status: ReelStatus
  published_at?: string | null
  created_at: string
  updated_at: string
  question?: ReelQuestion | null
}

export type QuestionType = 'multiple_choice' | 'true_false'

export interface ReelQuestion {
  id: string
  reel_id: string
  question_text: string
  question_type: QuestionType
  options: string[]
  correct_answer: string
  explanation?: string | null
  difficulty: ReelDifficulty
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface StudentReelActivity {
  id: string
  student_id: string
  reel_id: string
  started_at: string
  completed_at?: string | null
  watch_duration_seconds: number
  completed: boolean
  created_at: string
  updated_at: string
}

export interface StudentReelAnswer {
  id: string
  student_id: string
  reel_id: string
  question_id: string
  selected_answer: string
  is_correct: boolean
  answered_at: string
}

export interface FacultyStats {
  totalReels: number
  publishedReels: number
  draftReels: number
  totalViews: number
  avgQuestionAccuracy: number
}
