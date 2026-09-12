import { NextRequest, NextResponse } from 'next/server'
import {
  getCurriculumDocument,
  saveCurriculumDocument,
  createJobRecord,
  executeSubtopicVideoPipeline,
  updateSubtopicInDocument,
} from '@/lib/services/video-pipeline'
import { supabaseAdmin } from '@/lib/supabase/server'
import { CurriculumDocument, CurriculumSubtopic } from '@/lib/types/learnverse'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string; subtopicId: string } }
) {
  const { documentId, subtopicId } = params

  if (!documentId || !subtopicId) {
    return NextResponse.json(
      { error: 'Both documentId and subtopicId are required' },
      { status: 400 }
    )
  }

  try {
    // 1. Locate curriculum document (memory/disk or Supabase DB)
    let doc: CurriculumDocument | undefined = getCurriculumDocument(documentId)

    if (!doc && supabaseAdmin) {
      try {
        const { data: dbDoc } = await supabaseAdmin
          .from('curriculum_documents')
          .select('*')
          .eq('id', documentId)
          .single()

        if (dbDoc) {
          const { data: dbSubtopics } = await supabaseAdmin
            .from('curriculum_subtopics')
            .select('*')
            .eq('document_id', documentId)
            .order('display_order', { ascending: true })

          const mappedSubtopics: CurriculumSubtopic[] = (dbSubtopics || []).map((s: any, idx: number) => ({
            id: s.id,
            documentId: s.document_id,
            title: s.title,
            description: s.description || '',
            sourceText: s.source_text || '',
            learningObjectives: s.learning_objectives || [],
            estimatedDurationSeconds: s.duration_seconds || 8,
            displayOrder: typeof s.display_order === 'number' ? s.display_order : idx + 1,
            reelStatus: s.reel_status || 'not_started',
            reelJobId: s.reel_job_id,
          }))

          doc = {
            id: dbDoc.id,
            title: dbDoc.title,
            subject: dbDoc.subject,
            overview: dbDoc.overview || '',
            sourceFileName: dbDoc.source_file_name,
            sourceFileUrl: dbDoc.file_url,
            subtopics: mappedSubtopics,
            analysisStatus: 'ready',
            createdAt: dbDoc.created_at,
            updatedAt: dbDoc.updated_at,
          }

          saveCurriculumDocument(doc)
        }
      } catch (dbErr: any) {
        console.warn(`[Supabase DB Lookup Error]: ${dbErr?.message}`)
      }
    }

    if (!doc) {
      return NextResponse.json(
        { error: `Curriculum document with ID "${documentId}" was not found.` },
        { status: 404 }
      )
    }

    // 2. Validate that the subtopic belongs to this document
    const subtopic = doc.subtopics.find((s) => s.id === subtopicId)

    if (!subtopic) {
      return NextResponse.json(
        {
          error: `Subtopic "${subtopicId}" does not belong to document "${documentId}".`,
        },
        { status: 404 }
      )
    }

    const isRetry = subtopic.reelStatus === 'failed' || Boolean(subtopic.reelJobId)
    const hasStartedGeneration = doc.subtopics.some((item) => item.reelStatus !== 'not_started' || item.reelJobId)
    const analysisTime = Date.parse(doc.updatedAt || doc.createdAt)
    const cooldownRemainingMs = 60_000 - (Date.now() - analysisTime)
    if (!isRetry && !hasStartedGeneration && Number.isFinite(analysisTime) && cooldownRemainingMs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${Math.ceil(cooldownRemainingMs / 1000)} seconds before starting the first reel.`,
          retryAfterSeconds: Math.ceil(cooldownRemainingMs / 1000),
        },
        { status: 429 }
      )
    }

    // 3. Validate that the subtopic has valid textual content (not empty/corrupt)
    const cleanSourceText = (subtopic.sourceText || subtopic.description || '').trim()
    if (!cleanSourceText || cleanSourceText.length < 5) {
      return NextResponse.json(
        {
          error: `Subtopic "${subtopic.title}" has insufficient source text. Cannot synthesize video reel without valid curriculum content.`,
        },
        { status: 400 }
      )
    }

    // 3. Create real video generation job record
    const jobId = `job-sub-${Date.now()}`
    createJobRecord(jobId, documentId, subtopic.title, doc.subject, subtopicId)

    // 4. Update subtopic state to generating
    updateSubtopicInDocument(documentId, subtopicId, {
      reelStatus: 'generating',
      reelJobId: jobId,
    })

    // 5. Update Supabase if configured
    if (supabaseAdmin) {
      try {
        const { error: jobErr } = await supabaseAdmin.from('generation_jobs').insert({
          id: jobId,
          document_id: documentId,
          subtopic_id: subtopicId,
          status: 'queued',
          progress: 5,
          current_step: `Queued video generation for "${subtopic.title}"...`,
        })

        if (jobErr) {
          if (jobErr.code === 'PGRST205' || jobErr.message?.includes('schema cache')) {
            console.warn(`[Supabase Schema Notice] 'generation_jobs' table not provisioned yet. Using local memory/disk job store.`)
          } else {
            console.error(`[Supabase DB Error - generation_jobs insert]: ${jobErr.message} (code: ${jobErr.code})`)
          }
        }

        const { error: subErr } = await supabaseAdmin
          .from('curriculum_subtopics')
          .update({
            reel_status: 'generating',
            reel_job_id: jobId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subtopicId)

        if (subErr && subErr.code !== 'PGRST205') {
          console.error(`[Supabase DB Error - curriculum_subtopics status update]: ${subErr.message} (code: ${subErr.code})`)
        }
      } catch (dbErr: any) {
        console.error(`[Supabase DB Exception - Generate]: ${dbErr?.message || dbErr}`)
      }
    }

    // 6. Launch background video pipeline for this subtopic
    executeSubtopicVideoPipeline(jobId, documentId, subtopicId, {
      documentTitle: doc.title,
      subject: doc.subject,
      subtopicTitle: subtopic.title,
      description: subtopic.description,
      sourceText: subtopic.sourceText,
      learningObjectives: subtopic.learningObjectives,
    }).catch((err) => {
      console.error(`[Background Subtopic Pipeline Failed] Job ${jobId}:`, err)
    })

    return NextResponse.json(
      {
        success: true,
        jobId,
        documentId,
        subtopicId,
        subtopicTitle: subtopic.title,
        status: 'queued',
        message: `Video generation started for subtopic "${subtopic.title}"`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Subtopic Generate Endpoint Error]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to trigger subtopic video generation',
      },
      { status: 500 }
    )
  }
}
