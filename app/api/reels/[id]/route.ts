import { NextRequest, NextResponse } from 'next/server'
import { getReelById, upsertReel, deleteReel } from '@/lib/supabase/role-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reel = await getReelById(params.id)
    if (!reel) {
      return NextResponse.json({ success: false, error: 'Reel not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, reel })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getReelById(params.id)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Reel not found' }, { status: 404 })
    }

    const body = await request.json()
    const updated = await upsertReel({
      ...existing,
      ...body,
      id: params.id,
      published_at:
        body.status === 'published' && !existing.published_at
          ? new Date().toISOString()
          : existing.published_at,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, reel: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteReel(params.id)
    return NextResponse.json({ success: true, message: 'Reel deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}
