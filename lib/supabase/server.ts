import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isServerSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey)

export const supabaseAdmin = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

/**
 * Uploads a buffer to Supabase Storage bucket or falls back to public storage folder
 */
export async function uploadFileToStorage(
  bucket: 'curriculum-uploads' | 'generated-videos',
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        })

      if (!error && data) {
        let returnUrl = data.path
        if (bucket === 'generated-videos') {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(fileName)
          returnUrl = publicUrlData.publicUrl
        }

        return {
          url: returnUrl,
          path: data.path,
        }
      } else if (error) {
        const isMissingBucket =
          error.message?.toLowerCase().includes('bucket not found') ||
          (error as any).statusCode === '404' ||
          (error as any).status === 404 ||
          error.message?.toLowerCase().includes('does not exist')

        if (isMissingBucket) {
          console.warn(`[Supabase Storage Notice] Bucket '${bucket}' not provisioned yet. Using local static storage fallback.`)
        } else {
          console.error(`[Supabase Storage Error] Upload failed on bucket '${bucket}': ${error.message}`)
        }
      }
    } catch (err: any) {
      console.error(`[Supabase Storage Exception] Failed during upload to '${bucket}': ${err?.message}`)
    }
  }

  // Fallback to local public/ storage for seamless offline/dev testing
  const localDir = path.join(process.cwd(), 'public', bucket)
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true })
  }

  const localFilePath = path.join(localDir, fileName)
  fs.writeFileSync(localFilePath, buffer)

  const publicUrl = `/${bucket}/${fileName}`
  return {
    url: publicUrl,
    path: localFilePath,
  }
}
