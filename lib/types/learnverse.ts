export type ContentType = 'pdf' | 'image' | 'link' | 'text'

export interface KeyTerm {
  term: string
  definition: string
  importance: 'high' | 'medium' | 'low'
}

export interface NoteSection {
  heading: string
  summary: string
  bulletPoints: string[]
  keyTakeaway?: string
}

export interface SummaryNotes {
  title: string
  readingTimeMinutes: number
  keyTakeaways: string[]
  keyTerms: KeyTerm[]
  sections: NoteSection[]
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  hint?: string
  topic: string
  confidence?: 'unrated' | 'hard' | 'medium' | 'easy' | 'mastered'
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}

export interface Quiz {
  id: string
  title: string
  totalQuestions: number
  passingScore: number
  questions: QuizQuestion[]
}

export interface ReelChapter {
  id: string
  title: string
  timestampSeconds: number
  subtitle: string
}

export interface VideoReel {
  id: string
  title: string
  durationSeconds: number
  narrationScript: string
  visualStyle: '3d-infographic' | 'motion-sketch' | 'mindmap'
  chapters: ReelChapter[]
  audioWaveform: number[] // Normalized 0-1 values for visualizer
  videoUrl?: string
  audioUrl?: string
  subtopicId?: string
}

export interface KnowledgeTopic {
  name: string
  masteryPercentage: number
  status: 'mastered' | 'improving' | 'critical-gap'
  questionsAttempted: number
  recommendedAction: string
}

export interface KnowledgeGapData {
  overallMastery: number
  weakestArea: string
  strongestArea: string
  topics: KnowledgeTopic[]
  recommendedStudyOrder: string[]
}

export type ReelStatus = 'not_started' | 'generating' | 'ready' | 'failed'

export interface CurriculumSubtopic {
  id: string
  documentId: string
  title: string
  description: string
  learningObjectives: string[]
  sourceText: string
  sourcePages?: number[]
  estimatedDurationSeconds: number
  displayOrder: number
  reelStatus: ReelStatus
  reelJobId?: string
  reel?: VideoReel
  errorMessage?: string
}

export interface CurriculumDocument {
  id: string
  title: string
  subject: string
  grade?: string
  chapter?: string
  sourceFileName?: string
  sourceFileUrl?: string
  overview: string
  subtopics: CurriculumSubtopic[]
  analysisStatus: 'ready' | 'processing' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface StudyMaterial {
  id: string
  title: string
  subject: string
  subjectColor: string // CSS color / badge styling
  type: ContentType
  sourceFileName?: string
  sourceUrl?: string
  uploadDate: string
  estimatedStudyTimeMinutes: number
  progressPercentage: number
  overview?: string
  subtopics?: CurriculumSubtopic[]
  activeSubtopicId?: string
  summaryNotes: SummaryNotes
  flashcards: Flashcard[]
  quiz: Quiz
  reel: VideoReel
  knowledgeGap: KnowledgeGapData
}
