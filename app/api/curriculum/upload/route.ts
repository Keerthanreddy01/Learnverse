import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToStorage, supabaseAdmin } from '@/lib/supabase/server'
import { extractTextFromPdf } from '@/lib/services/pdf-extractor'
import { analyzeCurriculumSubtopics } from '@/lib/services/subtopic-analyzer'
import { saveCurriculumDocument } from '@/lib/services/video-pipeline'
import { CurriculumDocument } from '@/lib/types/learnverse'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  let currentStage = 1
  try {
    // Stage 1/5: Uploading document
    currentStage = 1
    console.log('[Curriculum] Stage 1/5: Uploading document')

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title =
      (formData.get('title') as string) ||
      file?.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Curriculum Study Module'
    const subject = (formData.get('subject') as string) || 'General Science'

    if (!file || typeof file.arrayBuffer !== 'function') {
      const errMsg = 'Please upload a valid PDF curriculum document before extracting subtopics.'
      console.error(`[Curriculum] FAILED at Stage 1/5: ${errMsg}`)
      return NextResponse.json(
        { success: false, failedStage: 'Stage 1/5', error: errMsg },
        { status: 400 }
      )
    }

    const arrayBuf = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuf)

    // Stage 2/5: Reading document
    currentStage = 2
    console.log('[Curriculum] Stage 2/5: Reading document')
    const extracted = await extractTextFromPdf(pdfBuffer)

    const documentId = `doc-${Date.now()}`
    const fileName = `${documentId}_${file?.name || `${title.replace(/\s+/g, '_')}.pdf`}`

    // Stage 3/5: Analyzing curriculum
    currentStage = 3
    console.log('[Curriculum] Stage 3/5: Analyzing curriculum')
    const analysis = await analyzeCurriculumSubtopics(
      extracted.cleanText,
      title,
      subject,
      documentId
    )

    // Stage 4/5: Preparing subtopics
    currentStage = 4
    console.log('[Curriculum] Stage 4/5: Preparing subtopics')
    const curriculumDoc: CurriculumDocument = {
      id: documentId,
      title: analysis.documentTitle || title,
      subject,
      sourceFileName: fileName,
      sourceFileUrl: '',
      overview: analysis.overview,
      subtopics: analysis.subtopics,
      analysisStatus: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Stage 5/5: Saving curriculum
    currentStage = 5
    console.log('[Curriculum] Stage 5/5: Saving curriculum')

    // 1. Upload to storage
    const uploadResult = await uploadFileToStorage(
      'curriculum-uploads',
      fileName,
      pdfBuffer,
      'application/pdf'
    )
    curriculumDoc.sourceFileUrl = uploadResult.url

    // 2. Save to disk cache
    saveCurriculumDocument(curriculumDoc)

    // 3. Save to Supabase Database if connected
    if (supabaseAdmin) {
      try {
        const { error: docErr } = await supabaseAdmin.from('curriculum_documents').upsert({
          id: documentId,
          title: curriculumDoc.title,
          subject,
          source_file_name: fileName,
          source_file_path: uploadResult.path,
          file_url: uploadResult.url,
          extracted_text: extracted.cleanText.slice(0, 10000),
          overview: curriculumDoc.overview,
          analysis_status: 'ready',
          updated_at: new Date().toISOString(),
        })

        if (docErr) {
          if (docErr.code === 'PGRST205' || docErr.message?.includes('schema cache')) {
            console.warn(`[Supabase Schema Notice] 'curriculum_documents' table not provisioned yet. Using local disk persistence.`)
          } else {
            console.error(`[Supabase DB Error - curriculum_documents]: ${docErr.message} (code: ${docErr.code})`)
          }
        }

        // Upsert subtopics
        for (const sub of analysis.subtopics) {
          const { error: subErr } = await supabaseAdmin.from('curriculum_subtopics').upsert({
            id: sub.id,
            document_id: documentId,
            title: sub.title,
            description: sub.description,
            learning_objectives: sub.learningObjectives,
            source_text: sub.sourceText,
            display_order: sub.displayOrder,
            estimated_duration_seconds: sub.estimatedDurationSeconds,
            reel_status: 'not_started',
            updated_at: new Date().toISOString(),
          })

          if (subErr && subErr.code !== 'PGRST205') {
            console.error(`[Supabase DB Error - curriculum_subtopics]: ${subErr.message} (code: ${subErr.code})`)
          }
        }
      } catch (dbErr: any) {
        console.error(`[Supabase DB Exception - Upload]: ${dbErr?.message || dbErr}`)
      }
    }

    return NextResponse.json(
      {
        success: true,
        stage: 'Stage 5/5',
        documentId,
        title: curriculumDoc.title,
        subject: curriculumDoc.subject,
        overview: curriculumDoc.overview,
        subtopics: curriculumDoc.subtopics,
        status: 'ready',
        message: `Extracted ${curriculumDoc.subtopics.length} curriculum subtopics successfully.`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    const readableError = error?.message || 'Failed to upload and analyze curriculum subtopics'
    console.error(`[Curriculum] FAILED at Stage ${currentStage}/5: ${readableError}`)
    return NextResponse.json(
      {
        success: false,
        failedStage: `Stage ${currentStage}/5`,
        error: readableError,
      },
      { status: 500 }
    )
  }
}
