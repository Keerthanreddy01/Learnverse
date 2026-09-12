import { NextRequest, NextResponse } from 'next/server'
import { getReels, upsertReel } from '@/lib/supabase/role-service'
import { ReelRecord } from '@/lib/types/roles'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')
    const status = searchParams.get('status')
    const sourceType = searchParams.get('source_type')
    const createdBy = searchParams.get('created_by')

    const reels = await getReels({
      grade: grade || undefined,
      subject: subject || undefined,
      status: status || undefined,
      source_type: sourceType || undefined,
      created_by: createdBy || undefined,
    })

    return NextResponse.json({ success: true, reels })
  } catch (err: any) {
    console.error('[API /api/reels GET error]:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch reels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      video_url,
      thumbnail_url,
      source_type = 'faculty',
      created_by,
      grade,
      subject,
      chapter,
      topic,
      difficulty = 'medium',
      language = 'English',
      duration_seconds = 15,
      status = 'draft',
      question,
    } = body

    if (!title || !video_url || !subject || !topic) {
      return NextResponse.json(
        { success: false, error: 'Title, video_url, subject, and topic are required' },
        { status: 400 }
      )
    }

    const reelId = `reel-${Date.now()}`
    const newReel: ReelRecord = {
      id: reelId,
      title,
      description: description || null,
      video_url,
      thumbnail_url: thumbnail_url || null,
      source_type,
      created_by: created_by || null,
      grade: grade || null,
      subject,
      chapter: chapter || null,
      topic,
      difficulty,
      language,
      duration_seconds: Number(duration_seconds) || 15,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question: question
        ? {
            id: `q-${reelId}`,
            reel_id: reelId,
            question_text: question.question_text,
            question_type: question.question_type || 'multiple_choice',
            options: question.options || [],
            correct_answer: question.correct_answer,
            explanation: question.explanation || null,
            difficulty: question.difficulty || difficulty,
            created_by: created_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null,
    }

    const saved = await upsertReel(newReel)
    return NextResponse.json({ success: true, reel: saved }, { status: 201 })
  } catch (err: any) {
    console.error('[API /api/reels POST error]:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create reel' },
      { status: 500 }
    )
  }
}
