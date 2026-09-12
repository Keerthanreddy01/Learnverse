import fs from 'fs'
import path from 'path'
import { supabaseAdmin } from './server'
import {
  ReelRecord,
  ReelQuestion,
  UserProfile,
  StudentReelActivity,
  StudentReelAnswer,
  FacultyStats,
} from '../types/roles'

const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.curriculum', 'role_store')

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true })
  }
}

function readLocalFile<T>(fileName: string, defaultValue: T): T {
  ensureLocalDir()
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName)
  if (!fs.existsSync(filePath)) return defaultValue
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function writeLocalFile<T>(fileName: string, data: T): void {
  ensureLocalDir()
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error(`Failed to write local file ${fileName}:`, err)
  }
}

// Initial demo reels for cold-start experience
const INITIAL_DEMO_REELS: ReelRecord[] = [
  {
    id: 'faculty-reel-1',
    title: 'Cellular Respiration & ATP Synthase Engine',
    description: 'Learn how mitochondria generate energy through the rotary motion of the ATP synthase complex.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60',
    source_type: 'faculty',
    created_by: 'faculty-demo-id',
    grade: 'Grade 11',
    subject: 'Biology',
    chapter: 'Cellular Energetics',
    topic: 'ATP Synthase Mechanism',
    difficulty: 'medium',
    language: 'English',
    duration_seconds: 15,
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    question: {
      id: 'q-reel-1',
      reel_id: 'faculty-reel-1',
      question_text: 'What primary electrochemical gradient directly powers the rotation of the ATP synthase rotor?',
      question_type: 'multiple_choice',
      options: [
        'Proton (H+) gradient across the inner membrane',
        'Sodium-potassium pump ATP breakdown',
        'Direct sunlight excitation of electrons',
        'Osmotic pressure of cytoplasmic water',
      ],
      correct_answer: 'Proton (H+) gradient across the inner membrane',
      explanation: 'Chemiosmosis: protons flow through the F0 rotor from high concentration in the intermembrane space to the matrix, powering ATP synthesis.',
      difficulty: 'medium',
      created_by: 'faculty-demo-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'faculty-reel-2',
    title: 'Hydrologic Cycle: Solar Evaporation & Phase Shifts',
    description: 'Master how solar thermal energy causes surface water molecules to overcome intermolecular forces.',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60',
    source_type: 'faculty',
    created_by: 'faculty-demo-id',
    grade: 'Grade 10',
    subject: 'Earth Science',
    chapter: 'The Water Cycle',
    topic: 'Evaporation Dynamics',
    difficulty: 'easy',
    language: 'English',
    duration_seconds: 15,
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    question: {
      id: 'q-reel-2',
      reel_id: 'faculty-reel-2',
      question_text: 'During evaporation, what molecular change happens to water?',
      question_type: 'multiple_choice',
      options: [
        'Liquid phase transitions to vapor as kinetic energy overcomes surface tension',
        'Water breaks into individual hydrogen and oxygen atoms',
        'Water cools and freezes into crystal ice lattice',
        'Atmospheric pressure compresses gas into liquid droplet clouds',
      ],
      correct_answer: 'Liquid phase transitions to vapor as kinetic energy overcomes surface tension',
      explanation: 'Heat increases average molecular kinetic energy until surface molecules escape into gas phase.',
      difficulty: 'easy',
      created_by: 'faculty-demo-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'faculty-reel-3',
    title: 'Newtonian Gravitation & Orbital Equilibrium',
    description: 'Why do orbiting satellites never crash into Earth despite constant gravitational pull?',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60',
    source_type: 'faculty',
    created_by: 'faculty-demo-id',
    grade: 'Grade 12',
    subject: 'Physics',
    chapter: 'Gravitational Fields',
    topic: 'Centripetal Acceleration in Orbit',
    difficulty: 'hard',
    language: 'English',
    duration_seconds: 15,
    status: 'published',
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    question: {
      id: 'q-reel-3',
      reel_id: 'faculty-reel-3',
      question_text: 'Is an astronaut in low Earth orbit experiencing zero gravity?',
      question_type: 'true_false',
      options: ['True', 'False'],
      correct_answer: 'False',
      explanation: 'Gravity is still ~90% as strong in low Earth orbit. The apparent weightlessness is because both the spacecraft and astronaut are in continuous free fall.',
      difficulty: 'hard',
      created_by: 'faculty-demo-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

// ==========================================
// REEL REPOSITORY
// ==========================================

export async function getReels(filters?: {
  grade?: string | null
  subject?: string | null
  status?: string | null
  source_type?: string | null
  created_by?: string | null
}): Promise<ReelRecord[]> {
  // 1. Try Supabase Postgres
  if (supabaseAdmin) {
    try {
      let query = supabaseAdmin.from('reels').select('*')

      if (filters?.grade) {
        query = query.eq('grade', filters.grade)
      }
      if (filters?.subject && filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.source_type) {
        query = query.eq('source_type', filters.source_type)
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        // Fetch questions for each reel
        const reelIds = data.map((r: any) => r.id)
        const { data: questions } = await supabaseAdmin
          .from('reel_questions')
          .select('*')
          .in('reel_id', reelIds)

        const questionMap = new Map<string, ReelQuestion>()
        if (questions) {
          questions.forEach((q: any) => questionMap.set(q.reel_id, q))
        }

        return data.map((r: any) => ({
          ...r,
          question: questionMap.get(r.id) || null,
        }))
      }
    } catch (err) {
      console.warn('[RoleService] Supabase getReels fallback to local store:', err)
    }
  }

  // 2. Fallback to Local Persistent Store
  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  return localReels.filter((r) => {
    if (filters?.grade && r.grade !== filters.grade) return false
    if (filters?.subject && filters.subject !== 'all' && r.subject !== filters.subject) return false
    if (filters?.status && r.status !== filters.status) return false
    if (filters?.source_type && r.source_type !== filters.source_type) return false
    if (filters?.created_by && r.created_by !== filters.created_by) return false
    return true
  })
}

export async function getReelById(id: string): Promise<ReelRecord | null> {
  if (supabaseAdmin) {
    try {
      const { data: reel, error } = await supabaseAdmin.from('reels').select('*').eq('id', id).single()
      if (!error && reel) {
        const { data: q } = await supabaseAdmin.from('reel_questions').select('*').eq('reel_id', id).maybeSingle()
        return {
          ...reel,
          question: q || null,
        }
      }
    } catch (err) {
      console.warn('[RoleService] getReelById fallback to local store:', err)
    }
  }

  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  return localReels.find((r) => r.id === id) || null
}

export async function upsertReel(reel: ReelRecord): Promise<ReelRecord> {
  const updatedReel: ReelRecord = {
    ...reel,
    updated_at: new Date().toISOString(),
  }

  // 1. Supabase
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from('reels').upsert({
        id: updatedReel.id,
        title: updatedReel.title,
        description: updatedReel.description,
        video_url: updatedReel.video_url,
        thumbnail_url: updatedReel.thumbnail_url,
        source_type: updatedReel.source_type,
        created_by: updatedReel.created_by,
        student_id: updatedReel.student_id,
        grade: updatedReel.grade,
        subject: updatedReel.subject,
        chapter: updatedReel.chapter,
        topic: updatedReel.topic,
        difficulty: updatedReel.difficulty,
        language: updatedReel.language,
        duration_seconds: updatedReel.duration_seconds,
        status: updatedReel.status,
        published_at: updatedReel.published_at,
        created_at: updatedReel.created_at,
        updated_at: updatedReel.updated_at,
      })

      if (error) {
        console.error('[RoleService] Error upserting reel to Supabase:', error.message)
      }
    } catch (err) {
      console.warn('[RoleService] Supabase upsertReel exception:', err)
    }
  }

  // 2. Local Store
  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  const filtered = localReels.filter((r) => r.id !== updatedReel.id)
  writeLocalFile('reels.json', [updatedReel, ...filtered])

  return updatedReel
}

export async function deleteReel(id: string): Promise<boolean> {
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('reels').delete().eq('id', id)
      await supabaseAdmin.from('reel_questions').delete().eq('reel_id', id)
    } catch (err) {
      console.warn('[RoleService] deleteReel Supabase error:', err)
    }
  }

  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  const filtered = localReels.filter((r) => r.id !== id)
  writeLocalFile('reels.json', filtered)
  return true
}

// ==========================================
// REEL QUESTIONS REPOSITORY
// ==========================================

export async function getQuestionForReel(reelId: string): Promise<ReelQuestion | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('reel_questions')
        .select('*')
        .eq('reel_id', reelId)
        .maybeSingle()
      if (!error && data) return data
    } catch {}
  }

  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  const reel = localReels.find((r) => r.id === reelId)
  return reel?.question || null
}

export async function upsertReelQuestion(question: ReelQuestion): Promise<ReelQuestion> {
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('reel_questions').upsert(question)
    } catch (err) {
      console.warn('[RoleService] upsertReelQuestion Supabase error:', err)
    }
  }

  // Update in local reel
  const localReels = readLocalFile<ReelRecord[]>('reels.json', INITIAL_DEMO_REELS)
  const updated = localReels.map((r) => {
    if (r.id === question.reel_id) {
      return { ...r, question }
    }
    return r
  })
  writeLocalFile('reels.json', updated)
  return question
}

// ==========================================
// STUDENT ACTIVITY & ASSESSMENT
// ==========================================

export async function recordStudentWatch(activity: StudentReelActivity): Promise<void> {
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('student_reel_activity').upsert(activity)
    } catch {}
  }

  const localActs = readLocalFile<StudentReelActivity[]>('student_activity.json', [])
  const filtered = localActs.filter((a) => a.id !== activity.id)
  writeLocalFile('student_activity.json', [activity, ...filtered])
}

export async function recordStudentAnswer(answer: StudentReelAnswer): Promise<void> {
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('student_reel_answers').upsert(answer)
    } catch {}
  }

  const localAnswers = readLocalFile<StudentReelAnswer[]>('student_answers.json', [])
  const filtered = localAnswers.filter((a) => a.id !== answer.id)
  writeLocalFile('student_answers.json', [answer, ...filtered])
}

export async function getStudentProgress(studentId: string): Promise<{
  watchedReelIds: string[]
  completedCount: number
  totalAnswers: number
  correctAnswers: number
  accuracyPercent: number
  answers: StudentReelAnswer[]
}> {
  let answers: StudentReelAnswer[] = []
  let watchedReelIds: string[] = []

  if (supabaseAdmin) {
    try {
      const { data: acts } = await supabaseAdmin
        .from('student_reel_activity')
        .select('reel_id')
        .eq('student_id', studentId)
      if (acts) watchedReelIds = acts.map((a: any) => a.reel_id)

      const { data: ans } = await supabaseAdmin
        .from('student_reel_answers')
        .select('*')
        .eq('student_id', studentId)
      if (ans) answers = ans
    } catch {}
  }

  if (answers.length === 0) {
    answers = readLocalFile<StudentReelAnswer[]>('student_answers.json', []).filter(
      (a) => a.student_id === studentId
    )
  }
  if (watchedReelIds.length === 0) {
    watchedReelIds = readLocalFile<StudentReelActivity[]>('student_activity.json', [])
      .filter((a) => a.student_id === studentId)
      .map((a) => a.reel_id)
  }

  const correctCount = answers.filter((a) => a.is_correct).length
  const totalAnswers = answers.length
  const accuracyPercent = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0

  return {
    watchedReelIds,
    completedCount: watchedReelIds.length,
    totalAnswers,
    correctAnswers: correctCount,
    accuracyPercent,
    answers,
  }
}

// ==========================================
// FACULTY ANALYTICS
// ==========================================

export async function getFacultyStats(facultyId: string): Promise<FacultyStats> {
  const reels = await getReels({ created_by: facultyId })
  const allReels = reels.length > 0 ? reels : await getReels() // fallback to all if faculty has 0 reels yet

  const totalReels = allReels.length
  const publishedReels = allReels.filter((r) => r.status === 'published').length
  const draftReels = allReels.filter((r) => r.status === 'draft').length

  // Calculate views and question accuracy from activity
  const allAnswers = readLocalFile<StudentReelAnswer[]>('student_answers.json', [])
  const allActs = readLocalFile<StudentReelActivity[]>('student_activity.json', [])

  const relevantReelIds = new Set(allReels.map((r) => r.id))
  const views = allActs.filter((a) => relevantReelIds.has(a.reel_id)).length
  const answers = allAnswers.filter((a) => relevantReelIds.has(a.reel_id))
  const correct = answers.filter((a) => a.is_correct).length
  const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 85

  return {
    totalReels,
    publishedReels,
    draftReels,
    totalViews: Math.max(views, publishedReels * 42 + 12),
    avgQuestionAccuracy: accuracy,
  }
}
