import { NextRequest, NextResponse } from 'next/server'
import { recordStudentWatch } from '@/lib/supabase/role-service'
import { StudentReelActivity } from '@/lib/types/roles'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { student_id, watch_duration_seconds = 0, completed = false } = body

    if (!student_id) {
      return NextResponse.json({ success: false, error: 'student_id is required' }, { status: 400 })
    }

    const activity: StudentReelActivity = {
      id: `act-${student_id}-${params.id}`,
      student_id,
      reel_id: params.id,
      started_at: new Date().toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
      watch_duration_seconds: Number(watch_duration_seconds) || 0,
      completed: Boolean(completed),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await recordStudentWatch(activity)
    return NextResponse.json({ success: true, activity })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
