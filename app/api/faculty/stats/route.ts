import { NextRequest, NextResponse } from 'next/server'
import { getFacultyStats } from '@/lib/supabase/role-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('faculty_id') || 'faculty-demo-id'
    const stats = await getFacultyStats(facultyId)
    return NextResponse.json({ success: true, stats })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
