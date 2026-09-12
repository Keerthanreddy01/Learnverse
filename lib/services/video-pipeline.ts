import fs from 'fs'
import path from 'path'
import { extractTextFromPdf } from './pdf-extractor'
import {
  generateCurriculumContent,
  generateSubtopicReelScript,
  GeneratedCurriculumPackage,
} from './script-generator'
import { generateNarrationAudio } from './tts-generator'
import { renderCurriculumVideo } from './video-renderer'
import { REEL_DURATION_SECONDS } from './script-generator'
import { uploadFileToStorage, supabaseAdmin } from '../supabase/server'
import { StudyMaterial, CurriculumDocument, CurriculumSubtopic, VideoReel } from '../types/learnverse'

export type JobStatus = 'queued' | 'processing' | 'ready' | 'failed'

const PIPELINE_STAGE_TIMEOUT_MS = 60_000

function withPipelineTimeout<T>(promise: Promise<T>, stage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${stage} timed out after ${PIPELINE_STAGE_TIMEOUT_MS / 1000}s.`)), PIPELINE_STAGE_TIMEOUT_MS)
    ),
  ])
}

export interface VideoJobRecord {
  id: string
  documentId: string
  subtopicId?: string
  title: string
  subject: string
  status: JobStatus
  progress: number
  currentStep: string
  stageNumber?: number
  totalStages?: number
  stageName?: string
  videoUrl?: string
  audioUrl?: string
  durationSeconds?: number
  chapters?: any[]
  studyMaterial?: StudyMaterial
  reel?: VideoReel
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

const TOTAL_REEL_STAGES = 5

function logStage(jobId: string, subtopicId: string, stageNumber: number, stageName: string, status: 'started' | 'completed' | 'failed', startedAt: string, error?: string) {
  console.info('[Reel Stage]', {
    jobId,
    subtopicId,
    stage: `${stageNumber}/${TOTAL_REEL_STAGES}`,
    stageName,
    startTime: startedAt,
    endTime: new Date().toISOString(),
    status,
    ...(error ? { error } : {}),
  })
}

function updateStage(jobId: string, subtopicId: string, stageNumber: number, stageName: string, progress: number) {
  updateJobRecord(jobId, {
    status: 'processing',
    progress,
    stageNumber,
    totalStages: TOTAL_REEL_STAGES,
    stageName,
    currentStep: `Stage ${stageNumber}/${TOTAL_REEL_STAGES}: ${stageName}`,
  })
  return new Date().toISOString()
}

const JOBS_DIR = path.join(process.cwd(), '.jobs')
const CURRICULUM_DIR = path.join(process.cwd(), '.curriculum')

function ensureStorageDirs() {
  if (!fs.existsSync(JOBS_DIR)) {
    fs.mkdirSync(JOBS_DIR, { recursive: true })
  }
  if (!fs.existsSync(CURRICULUM_DIR)) {
    fs.mkdirSync(CURRICULUM_DIR, { recursive: true })
  }
}

// Global job registry
const globalJobRegistry: Map<string, VideoJobRecord> =
  (globalThis as any).__learnverseJobs || new Map<string, VideoJobRecord>()
;(globalThis as any).__learnverseJobs = globalJobRegistry

export function getJob(jobId: string): VideoJobRecord | undefined {
  if (globalJobRegistry.has(jobId)) {
    return globalJobRegistry.get(jobId)
  }
  try {
    ensureStorageDirs()
    const filePath = path.join(JOBS_DIR, `${jobId}.json`)
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      globalJobRegistry.set(jobId, data)
      return data
    }
  } catch {
    // Ignore
  }
  return undefined
}

export function createJobRecord(
  jobId: string,
  documentId: string,
  title: string,
  subject: string,
  subtopicId?: string
): VideoJobRecord {
  const record: VideoJobRecord = {
    id: jobId,
    documentId,
    subtopicId,
    title,
    subject,
    status: 'queued',
    progress: 5,
    currentStep: subtopicId
      ? `Queuing video synthesis for subtopic "${title}"...`
      : 'Job queued in pipeline...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  globalJobRegistry.set(jobId, record)
  try {
    ensureStorageDirs()
    fs.writeFileSync(path.join(JOBS_DIR, `${jobId}.json`), JSON.stringify(record, null, 2))
  } catch (e) {
    console.warn('[Jobs Disk Warning]', e)
  }
  return record
}

export function updateJobRecord(jobId: string, updates: Partial<VideoJobRecord>): VideoJobRecord {
  const existing = getJob(jobId)
  if (!existing) {
    throw new Error(`Job not found: ${jobId}`)
  }
  const updated: VideoJobRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  globalJobRegistry.set(jobId, updated)
  try {
    ensureStorageDirs()
    fs.writeFileSync(path.join(JOBS_DIR, `${jobId}.json`), JSON.stringify(updated, null, 2))
  } catch (e) {
    console.warn('[Jobs Disk Warning]', e)
  }
  return updated
}

// -------------------------------------------------------------
// Curriculum Document Persistence Helpers
// -------------------------------------------------------------

export function saveCurriculumDocument(doc: CurriculumDocument): void {
  try {
    ensureStorageDirs()
    const filePath = path.join(CURRICULUM_DIR, `${doc.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2))
  } catch (err) {
    console.warn('[Curriculum Disk Save Error]:', err)
  }
}

export function getCurriculumDocument(documentId: string): CurriculumDocument | undefined {
  try {
    ensureStorageDirs()
    const filePath = path.join(CURRICULUM_DIR, `${documentId}.json`)
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  } catch (err) {
    console.warn('[Curriculum Disk Read Error]:', err)
  }
  return undefined
}

export function updateSubtopicInDocument(
  documentId: string,
  subtopicId: string,
  updates: Partial<CurriculumSubtopic>
): CurriculumDocument | undefined {
  const doc = getCurriculumDocument(documentId)
  if (!doc) return undefined

  doc.subtopics = doc.subtopics.map((s) => {
    if (s.id !== subtopicId) return s
    return { ...s, ...updates }
  })
  doc.updatedAt = new Date().toISOString()
  saveCurriculumDocument(doc)
  return doc
}

/**
 * Executes video generation pipeline for ONE specific selected subtopic.
 */
export async function executeSubtopicVideoPipeline(
  jobId: string,
  documentId: string,
  subtopicId: string,
  params: {
    documentTitle: string
    subject: string
    subtopicTitle: string
    description: string
    sourceText: string
    learningObjectives: string[]
  }
): Promise<VideoJobRecord> {
  console.log(`[Subtopic Pipeline Started] Job: ${jobId} for Subtopic "${params.subtopicTitle}" (${subtopicId})`)
  let activeStage = 1
  let activeStageName = 'Preparing educational script'
  let activeStageStartedAt = new Date().toISOString()

  try {
    activeStageStartedAt = updateStage(jobId, subtopicId, 1, activeStageName, 10)
    logStage(jobId, subtopicId, 1, activeStageName, 'started', activeStageStartedAt)
    updateSubtopicInDocument(documentId, subtopicId, {
      reelStatus: 'generating',
      reelJobId: jobId,
    })

    const scriptResult = await withPipelineTimeout(generateSubtopicReelScript({
      documentTitle: params.documentTitle,
      subject: params.subject,
      subtopicTitle: params.subtopicTitle,
      description: params.description,
      sourceText: params.sourceText,
      learningObjectives: params.learningObjectives,
      subtopicId,
    }), 'Gemini script generation')

    logStage(jobId, subtopicId, 1, activeStageName, 'completed', activeStageStartedAt)
    updateStage(jobId, subtopicId, 1, activeStageName, 20)

    activeStage = 2
    activeStageName = 'Generating narration'
    activeStageStartedAt = updateStage(jobId, subtopicId, 2, activeStageName, 30)
    logStage(jobId, subtopicId, 2, activeStageName, 'started', activeStageStartedAt)

    const ttsResult = await withPipelineTimeout(
      generateNarrationAudio(scriptResult.narrationScript, undefined, REEL_DURATION_SECONDS, {
        jobId,
        subtopicId,
      }),
      'Edge TTS narration'
    )
    console.log(`[Subtopic Pipeline] TTS audio ready (${ttsResult.estimatedDurationSeconds}s, ${ttsResult.audioBuffer.length} bytes)`)

    const audioFileName = `audio_${jobId}.mp3`
    const audioUpload = await withPipelineTimeout(
      uploadFileToStorage('generated-videos', audioFileName, ttsResult.audioBuffer, ttsResult.contentType),
      'narration storage upload'
    )
    logStage(jobId, subtopicId, 2, activeStageName, 'completed', activeStageStartedAt)
    updateStage(jobId, subtopicId, 2, activeStageName, 40)

    activeStage = 3
    activeStageName = 'Creating visual frames'
    activeStageStartedAt = updateStage(jobId, subtopicId, 3, activeStageName, 50)
    logStage(jobId, subtopicId, 3, activeStageName, 'started', activeStageStartedAt)

    const videoResult = await withPipelineTimeout(
      renderCurriculumVideo(
        scriptResult.slides,
        ttsResult.audioBuffer,
        REEL_DURATION_SECONDS,
        (event) => {
          if (event === 'frames-completed') {
            logStage(jobId, subtopicId, 3, activeStageName, 'completed', activeStageStartedAt)
            updateStage(jobId, subtopicId, 3, activeStageName, 60)
            activeStage = 4
            activeStageName = 'Rendering 8-second video'
            activeStageStartedAt = updateStage(jobId, subtopicId, 4, activeStageName, 70)
            logStage(jobId, subtopicId, 4, activeStageName, 'started', activeStageStartedAt)
          }
          if (event === 'ffmpeg-completed') {
            logStage(jobId, subtopicId, 4, activeStageName, 'completed', activeStageStartedAt)
            updateStage(jobId, subtopicId, 4, activeStageName, 80)
          }
        },
        {
          subtopicTitle: params.subtopicTitle,
          documentTitle: params.documentTitle,
          subject: params.subject,
          narrationScript: scriptResult.narrationScript,
        }
      ),
      'FFmpeg video rendering'
    )
    console.log(`[Subtopic Pipeline] Real MP4 rendered (${videoResult.fileSizeBytes} bytes, ${videoResult.durationSeconds}s)`)

    activeStage = 5
    activeStageName = 'Uploading video'
    activeStageStartedAt = updateStage(jobId, subtopicId, 5, activeStageName, 90)
    logStage(jobId, subtopicId, 5, activeStageName, 'started', activeStageStartedAt)

    const videoFileName = `video_${jobId}.mp4`
    const videoUpload = await withPipelineTimeout(
      uploadFileToStorage('generated-videos', videoFileName, videoResult.videoBuffer, 'video/mp4'),
      'MP4 storage upload'
    )
    logStage(jobId, subtopicId, 5, activeStageName, 'completed', activeStageStartedAt)
    updateStage(jobId, subtopicId, 5, activeStageName, 100)

    const finalReel: VideoReel = {
      ...scriptResult.reel,
      id: `reel-${subtopicId}`,
      videoUrl: videoUpload.url,
      audioUrl: audioUpload.url,
      durationSeconds: videoResult.durationSeconds,
      subtopicId,
    }

    // Update subtopic record on disk/database
    updateSubtopicInDocument(documentId, subtopicId, {
      reelStatus: 'ready',
      reelJobId: jobId,
      reel: finalReel,
    })

    // Update Supabase if configured
    if (supabaseAdmin) {
      try {
        const { error: subErr } = await supabaseAdmin.from('curriculum_subtopics').upsert({
          id: subtopicId,
          document_id: documentId,
          title: params.subtopicTitle,
          description: params.description,
          reel_status: 'ready',
          reel_job_id: jobId,
          video_url: videoUpload.url,
          audio_url: audioUpload.url,
          duration_seconds: videoResult.durationSeconds,
          chapters_json: finalReel.chapters,
          updated_at: new Date().toISOString(),
        })

        if (subErr && subErr.code !== 'PGRST205') {
          console.error(`[Supabase DB Error - curriculum_subtopics finalize]: ${subErr.message} (code: ${subErr.code})`)
        }

        const { error: jobErr } = await supabaseAdmin.from('generation_jobs').upsert({
          id: jobId,
          document_id: documentId,
          subtopic_id: subtopicId,
          status: 'ready',
          progress: 100,
          current_step: 'Subtopic video ready!',
          video_url: videoUpload.url,
          video_path: videoUpload.path,
          updated_at: new Date().toISOString(),
        })

        if (jobErr && jobErr.code !== 'PGRST205') {
          console.error(`[Supabase DB Error - generation_jobs finalize]: ${jobErr.message} (code: ${jobErr.code})`)
        }
      } catch (dbErr: any) {
        console.error(`[Supabase DB Exception - Pipeline]: ${dbErr?.message || dbErr}`)
      }
    }

    const finishedRecord = updateJobRecord(jobId, {
      status: 'ready',
      progress: 100,
      stageNumber: 5,
      totalStages: TOTAL_REEL_STAGES,
      stageName: 'Uploading video',
      currentStep: `Reel for "${params.subtopicTitle}" is ready!`,
      videoUrl: videoUpload.url,
      audioUrl: audioUpload.url,
      durationSeconds: videoResult.durationSeconds,
      chapters: finalReel.chapters,
      reel: finalReel,
    })

    console.log(`[Subtopic Pipeline Complete] Job ${jobId} ready. URL: ${videoUpload.url}`)
    return finishedRecord
  } catch (err: any) {
    console.error(`[Subtopic Pipeline Error] Job ${jobId} failed:`, err)
    logStage(jobId, subtopicId, activeStage, activeStageName, 'failed', activeStageStartedAt, err?.message)

    const stageErrorMessage = `Failed at Stage ${activeStage}/${TOTAL_REEL_STAGES} (${activeStageName}): ${err?.message || 'Video generation failed'}`

    updateSubtopicInDocument(documentId, subtopicId, {
      reelStatus: 'failed',
      errorMessage: stageErrorMessage,
    })

    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('curriculum_subtopics')
          .update({
            reel_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subtopicId)

        await supabaseAdmin
          .from('generation_jobs')
          .update({
            status: 'failed',
            error_message: stageErrorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId)
      } catch (dbErr: any) {
        console.warn('[Supabase DB Failure Sync Error]:', dbErr?.message)
      }
    }

    const failedRecord = updateJobRecord(jobId, {
      status: 'failed',
      stageNumber: activeStage,
      totalStages: TOTAL_REEL_STAGES,
      stageName: activeStageName,
      currentStep: `Failed at Stage ${activeStage}/${TOTAL_REEL_STAGES} (${activeStageName})`,
      errorMessage: stageErrorMessage,
    })
    return failedRecord
  }
}

/**
 * Executes full document video pipeline (legacy whole-doc mode).
 */
export async function executeCurriculumVideoPipeline(
  jobId: string,
  documentId: string,
  pdfBuffer: Buffer,
  title: string,
  subject: string
): Promise<VideoJobRecord> {
  console.log(`[Pipeline Started] Job ID: ${jobId} for "${title}"`)

  try {
    updateJobRecord(jobId, {
      status: 'processing',
      progress: 15,
      currentStep: 'Extracting text and structure from curriculum PDF...',
    })

    const extracted = await extractTextFromPdf(pdfBuffer)

    updateJobRecord(jobId, {
      progress: 35,
      currentStep: 'Synthesizing educational narration script & slide cues...',
    })

    const generated = await generateCurriculumContent(extracted.cleanText, title, subject)

    updateJobRecord(jobId, {
      progress: 55,
      currentStep: 'Synthesizing voiceover audio narration...',
    })

    const ttsResult = await generateNarrationAudio(generated.narrationScript)

    const audioFileName = `audio_${jobId}.mp3`
    const audioUpload = await uploadFileToStorage(
      'generated-videos',
      audioFileName,
      ttsResult.audioBuffer,
      ttsResult.contentType
    )

    updateJobRecord(jobId, {
      progress: 75,
      currentStep: 'Rendering educational slide visuals & encoding MP4 video with FFmpeg...',
    })

    const videoResult = await renderCurriculumVideo(
      generated.slides,
      ttsResult.audioBuffer,
      ttsResult.estimatedDurationSeconds
    )

    updateJobRecord(jobId, {
      progress: 92,
      currentStep: 'Uploading final MP4 video to storage & finalizing microlearning deck...',
    })

    const videoFileName = `video_${jobId}.mp4`
    const videoUpload = await uploadFileToStorage(
      'generated-videos',
      videoFileName,
      videoResult.videoBuffer,
      'video/mp4'
    )

    const finalReel = {
      ...generated.reel,
      id: `reel-${jobId}`,
      videoUrl: videoUpload.url,
      audioUrl: audioUpload.url,
      durationSeconds: videoResult.durationSeconds,
    }

    const completeStudyMaterial: StudyMaterial = {
      id: documentId,
      title,
      subject: subject || 'General Study',
      subjectColor: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      type: 'pdf',
      sourceFileName: `${title.replace(/\s+/g, '_')}.pdf`,
      uploadDate: 'Just now',
      estimatedStudyTimeMinutes: Math.ceil(videoResult.durationSeconds / 60) + 6,
      progressPercentage: 10,
      summaryNotes: generated.summaryNotes,
      flashcards: generated.flashcards,
      quiz: generated.quiz,
      reel: finalReel,
      knowledgeGap: generated.knowledgeGap,
    }

    const finishedRecord = updateJobRecord(jobId, {
      status: 'ready',
      progress: 100,
      currentStep: 'Video ready to play!',
      videoUrl: videoUpload.url,
      audioUrl: audioUpload.url,
      durationSeconds: videoResult.durationSeconds,
      chapters: finalReel.chapters,
      studyMaterial: completeStudyMaterial,
    })

    return finishedRecord
  } catch (err: any) {
    console.error(`[Pipeline Error] Job ${jobId} failed:`, err)
    const failedRecord = updateJobRecord(jobId, {
      status: 'failed',
      currentStep: 'Failed to generate video',
      errorMessage: err?.message || 'An unexpected error occurred during processing',
    })
    return failedRecord
  }
}
