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
  audioWaveform: number[]
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

export interface CurriculumSubtopic {
  id: string
  title: string
  description: string
  learningObjectives: string[]
  estimatedDurationSeconds?: number
  reelStatus?: 'not_started' | 'generating' | 'ready' | 'failed'
  videoUrl?: string
}

export interface ReelItem {
  id: string
  sourceType?: 'youtube' | 'direct'
  youtubeVideoId?: string
  title?: string
  videoUrl: string
  subject?: string
  curriculumTitle: string
  subtopicId?: string
  subtopicTitle: string
  description?: string
  learningObjective?: string
  duration?: number
  createdAt?: string
  documentId?: string
  sourceDocumentId?: string
  sourceSubtopicId?: string
  isGenerated?: boolean
  status: 'generating' | 'ready' | 'failed' | 'not_started'
  thumbnailUrl?: string
  audioWaveform?: number[]
  visualStyle?: '3d-infographic' | 'motion-sketch' | 'mindmap'
}

export interface StudyMaterial {
  id: string
  title: string
  subject: string
  subjectColor: string
  type: ContentType
  sourceFileName?: string
  sourceUrl?: string
  uploadDate: string
  estimatedStudyTimeMinutes: number
  progressPercentage: number
  overview?: string
  subtopics?: CurriculumSubtopic[]
  summaryNotes: SummaryNotes
  flashcards: Flashcard[]
  quiz: Quiz
  reel: VideoReel
  knowledgeGap: KnowledgeGapData
}

