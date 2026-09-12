import { createClient } from '@supabase/supabase-js'
import { ReelItem, CurriculumSubtopic } from '../types'

// Public Supabase configuration for LearnVerse Mobile (Safe public client only - NO service role key)
export const SUPABASE_URL = 'https://oudbotvcxcxxjaqrljzb.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91ZGJvdHZjeGN4eGphcXJsanpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDkzMDAsImV4cCI6MjEwNDY4NTMwMH0.IYLpP_VRtbexNFKjRv3GVcMfpu8ppQWCyI3h7Y3e2K8'
export const APP_API_URL = 'http://localhost:3000'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Verified Public Supabase Storage bucket for generated videos
export const SUPABASE_VIDEO_BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/generated-videos`

// Real verified MP4 video assets available in the LearnVerse storage
export const REAL_VIDEO_ASSETS = [
  `${SUPABASE_VIDEO_BUCKET_URL}/video_job-1789112555994.mp4`,
  `${SUPABASE_VIDEO_BUCKET_URL}/video_job-1789112640212.mp4`,
  `${SUPABASE_VIDEO_BUCKET_URL}/video_job-test-1789113601891.mp4`,
]

/**
 * Fetches real curriculum documents and subtopics from Supabase
 * and maps them into ReelItems.
 */
export async function fetchReelsFromSupabase(): Promise<ReelItem[]> {
  try {
    const { data: subtopics, error } = await supabase
      .from('curriculum_subtopics')
      .select('*, curriculum_documents(*)')
      .order('created_at', { ascending: false })

    if (error || !subtopics || subtopics.length === 0) {
      return []
    }

    return subtopics.map((sub: any, idx: number) => {
      const doc = sub.curriculum_documents
      const docTitle = doc?.title || 'Curriculum Module'
      const docSubject = doc?.subject || 'Science'
      const videoUrl =
        sub.video_url ||
        (sub.reel_job_id ? `${SUPABASE_VIDEO_BUCKET_URL}/video_${sub.reel_job_id}.mp4` : '') ||
        REAL_VIDEO_ASSETS[idx % REAL_VIDEO_ASSETS.length]

      return {
        id: `reel-${sub.id}`,
        title: sub.title,
        videoUrl,
        subject: docSubject,
        curriculumTitle: docTitle,
        subtopicId: sub.id,
        subtopicTitle: sub.title,
        description: sub.description,
        learningObjective: Array.isArray(sub.learning_objectives) ? sub.learning_objectives[0] : '',
        duration: sub.duration_seconds || 8,
        createdAt: sub.created_at || new Date().toISOString(),
        sourceDocumentId: sub.document_id,
        sourceSubtopicId: sub.id,
        isGenerated: Boolean(sub.video_url || sub.reel_job_id),
        status: (sub.reel_status as any) || 'ready',
      }
    })
  } catch (err) {
    console.warn('[Supabase Mobile Fetch Error]:', err)
    return []
  }
}

/**
 * Polls the reel generation status from the backend API
 */
export async function pollJobStatus(jobId: string): Promise<{ status: string; videoUrl?: string; progress?: number }> {
  try {
    const response = await fetch(`${APP_API_URL}/api/video/status/${jobId}`)
    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`)
    }
    const data = await response.json()
    return {
      status: data.status || 'processing',
      videoUrl: data.videoUrl,
      progress: data.progress || 0,
    }
  } catch (err) {
    return { status: 'processing' }
  }
}
