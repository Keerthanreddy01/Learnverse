import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/services/video-pipeline'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params?.jobId

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
  }

  // 1. Check in-memory active registry
  const memoryJob = getJob(jobId)
  if (memoryJob) {
    return NextResponse.json({
      success: true,
      jobId: memoryJob.id,
      documentId: memoryJob.documentId,
      title: memoryJob.title,
      subject: memoryJob.subject,
      status: memoryJob.status,
      progress: memoryJob.progress,
      stageNumber: memoryJob.stageNumber || null,
      totalStages: memoryJob.totalStages || 5,
      stageName: memoryJob.stageName || null,
      currentStep: memoryJob.currentStep,
      videoUrl: memoryJob.videoUrl || null,
      audioUrl: memoryJob.audioUrl || null,
      durationSeconds: memoryJob.durationSeconds || 0,
      chapters: memoryJob.chapters || [],
      studyMaterial: memoryJob.studyMaterial || null,
      reel: memoryJob.reel || null,
      errorMessage: memoryJob.errorMessage || null,
      updatedAt: memoryJob.updatedAt,
    })
  }

  // 2. Check Supabase DB if not in memory
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('generation_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (!error && data) {
        return NextResponse.json({
          success: true,
          jobId: data.id,
          documentId: data.document_id,
          subtopicId: data.subtopic_id || null,
          status: data.status,
          progress: typeof data.progress === 'number' ? data.progress : 0,
          stageNumber: data.stage_number || null,
          totalStages: data.total_stages || 5,
          stageName: data.stage_name || null,
          currentStep: data.current_step || 'Processing...',
          videoUrl: data.video_url || null,
          videoPath: data.video_path || null,
          audioUrl: data.audio_url || null,
          durationSeconds: 8,
          errorMessage: data.error_message || null,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        })
      } else if (error) {
        if (error.code !== 'PGRST116' && error.code !== 'PGRST205') {
          console.error(`[Supabase DB Error - generation_jobs status]: ${error.message} (code: ${error.code})`)
        }
      }
    } catch (err: any) {
      console.warn(`[Supabase Status Query Error]: ${err?.message}`)
    }
  }

  return NextResponse.json({ error: 'Job not found' }, { status: 404 })
}
