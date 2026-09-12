import { NextRequest, NextResponse } from 'next/server'
import { getQuestionForReel, recordStudentAnswer } from '@/lib/supabase/role-service'
import { StudentReelAnswer } from '@/lib/types/roles'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { student_id, question_id, selected_answer } = body

    if (!student_id || !question_id || selected_answer === undefined) {
      return NextResponse.json(
        { success: false, error: 'student_id, question_id, and selected_answer are required' },
        { status: 400 }
      )
    }

    const question = await getQuestionForReel(params.id)
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found for this reel' }, { status: 404 })
    }

    // Evaluate answer
    const isCorrect =
      String(selected_answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase()

    const answerRecord: StudentReelAnswer = {
      id: `ans-${student_id}-${question_id}-${Date.now()}`,
      student_id,
      reel_id: params.id,
      question_id,
      selected_answer: String(selected_answer),
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    }

    await recordStudentAnswer(answerRecord)

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      answer: answerRecord,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
