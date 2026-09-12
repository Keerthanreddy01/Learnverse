import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const facultyUserId = (formData.get('facultyUserId') as string) || 'faculty-demo-user'
    const contentId = (formData.get('contentId') as string) || `content-${Date.now()}`
    const fileType = (formData.get('fileType') as string) || 'video' // 'video' | 'thumbnail'

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'No valid file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop() || (fileType === 'video' ? 'mp4' : 'jpg')
    const fileName = `${fileType}.${ext}`
    const storagePath = `${facultyUserId}/${contentId}/${fileName}`

    let publicUrl = ''

    // 1. Try Supabase Storage 'faculty-content' bucket
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from('faculty-content')
          .upload(storagePath, buffer, {
            contentType: file.type || (fileType === 'video' ? 'video/mp4' : 'image/jpeg'),
            upsert: true,
          })

        if (!error && data) {
          const { data: pubData } = supabaseAdmin.storage
            .from('faculty-content')
            .getPublicUrl(storagePath)
          publicUrl = pubData.publicUrl
        } else if (error) {
          console.warn('[Faculty Upload] Supabase storage note:', error.message)
        }
      } catch (err: any) {
        console.warn('[Faculty Upload] Supabase storage exception:', err?.message)
      }
    }

    // 2. Fallback to public folder for dev if storage bucket is unreachable
    if (!publicUrl) {
      const localDir = path.join(process.cwd(), 'public', 'faculty-content', facultyUserId, contentId)
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true })
      }
      const localFilePath = path.join(localDir, fileName)
      fs.writeFileSync(localFilePath, buffer)
      publicUrl = `/faculty-content/${facultyUserId}/${contentId}/${fileName}`
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      fileName,
      sizeBytes: buffer.length,
    })
  } catch (err: any) {
    console.error('[Faculty Upload Error]:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'File upload failed' },
      { status: 500 }
    )
  }
}
