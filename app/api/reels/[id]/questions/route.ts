import { NextRequest, NextResponse } from 'next/server'
import { getQuestionForReel, upsertReelQuestion } from '@/lib/supabase/role-service'
import { ReelQuestion } from '@/lib/types/roles'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await getQuestionForReel(params.id)
    return NextResponse.json({ success: true, question })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      question_text,
      question_type = 'multiple_choice',
      options = [],
      correct_answer,
      explanation,
      difficulty = 'medium',
      created_by,
    } = body

    if (!question_text || !correct_answer) {
      return NextResponse.json(
        { success: false, error: 'Question text and correct answer are required' },
        { status: 400 }
      )
    }

    const question: ReelQuestion = {
      id: body.id || `q-${params.id}-${Date.now()}`,
      reel_id: params.id,
      question_text,
      question_type,
      options,
      correct_answer,
      explanation: explanation || null,
      difficulty,
      created_by: created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const saved = await upsertReelQuestion(question)
    return NextResponse.json({ success: true, question: saved }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
