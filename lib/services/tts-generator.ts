import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const TTS_TIMEOUT_MS = 45_000

export interface TtsResult {
  audioBuffer: Buffer
  contentType: string
  estimatedDurationSeconds: number
}

export interface TtsContext {
  jobId?: string
  subtopicId?: string
}

// Known standard neural voices that do not require full remote API catalog queries
const KNOWN_VOICES = new Set([
  'en-US-ChristopherNeural',
  'en-US-GuyNeural',
  'en-US-JennyNeural',
  'en-US-AriaNeural',
  'en-US-EricNeural',
  'en-US-AnaNeural',
  'en-GB-SoniaNeural',
  'en-GB-RyanNeural',
])

export async function generateNarrationAudio(
  text: string,
  voice: string = 'en-US-ChristopherNeural',
  targetDurationSeconds?: number,
  context?: TtsContext
): Promise<TtsResult> {
  const selectedVoice = process.env.TTS_VOICE || voice
  const startTime = new Date().toISOString()
  const stageName = 'Stage 2/5: Generating narration'
  const jobId = context?.jobId || 'direct-tts'
  const subtopicId = context?.subtopicId || 'direct-subtopic'

  let tts: MsEdgeTTS | undefined
  let audioStream: ReturnType<MsEdgeTTS['toStream']>['audioStream'] | undefined
  let dataChunks = 0
  let totalBytes = 0
  let timeoutHandle: NodeJS.Timeout | undefined

  console.info('[TTS Diagnostics]', {
    jobId,
    subtopicId,
    stage: '2/5',
    stageName,
    voice: selectedVoice,
    status: 'started',
    startTime,
  })

  try {
    tts = new MsEdgeTTS({ enableLogger: false })

    // If voice is not in known list, check with getVoices()
    if (!KNOWN_VOICES.has(selectedVoice)) {
      try {
        const voices = await Promise.race([
          tts.getVoices(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Voice catalog lookup timed out after 10s.`)), 10_000)
          ),
        ])
        const voiceAvailable = voices.some((candidate) => candidate.ShortName === selectedVoice)
        if (!voiceAvailable) {
          console.warn(`[TTS Diagnostics] Voice "${selectedVoice}" not found, falling back to "en-US-ChristopherNeural"`)
        }
      } catch (voiceErr: any) {
        console.warn(`[TTS Diagnostics] Voice catalog lookup skipped: ${voiceErr?.message}`)
      }
    }

    const effectiveVoice = KNOWN_VOICES.has(selectedVoice) ? selectedVoice : 'en-US-ChristopherNeural'
    await tts.setMetadata(effectiveVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    const cleanText = text.replace(/[*#_`~[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanText) {
      throw new Error('Narration text is empty.')
    }

    const streamResult = tts.toStream(cleanText)
    audioStream = streamResult.audioStream

    const chunks: Buffer[] = []

    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        cleanup()
        reject(new Error(`Edge TTS narration timed out after ${TTS_TIMEOUT_MS / 1000}s (received ${dataChunks} chunks, ${totalBytes} bytes).`))
      }, TTS_TIMEOUT_MS)

      const cleanup = () => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
          timeoutHandle = undefined
        }
      }

      audioStream?.on('data', (chunk: Buffer) => {
        dataChunks += 1
        totalBytes += chunk.length
        chunks.push(chunk)
        if (dataChunks === 1) {
          console.info('[TTS Diagnostics]', {
            jobId,
            subtopicId,
            stage: '2/5',
            event: 'first-chunk',
            firstChunkSize: chunk.length,
          })
        }
      })

      audioStream?.on('end', () => {
        cleanup()
        const combined = Buffer.concat(chunks)
        console.info('[TTS Diagnostics]', {
          jobId,
          subtopicId,
          stage: '2/5',
          event: 'stream-end',
          dataChunks,
          totalBytes: combined.length,
        })
        resolve(combined)
      })

      audioStream?.on('error', (err: any) => {
        cleanup()
        reject(err)
      })

      audioStream?.on('close', () => {
        cleanup()
        if (chunks.length > 0) {
          resolve(Buffer.concat(chunks))
        }
      })
    })

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Edge TTS returned an empty audio stream.')
    }

    const endTime = new Date().toISOString()
    console.info('[TTS Diagnostics]', {
      jobId,
      subtopicId,
      stage: '2/5',
      stageName,
      voice: effectiveVoice,
      status: 'completed',
      startTime,
      endTime,
      dataChunks,
      totalBytes: audioBuffer.length,
    })

    const wordCount = cleanText.split(/\s+/).filter(Boolean).length
    return {
      audioBuffer,
      contentType: 'audio/mpeg',
      estimatedDurationSeconds: targetDurationSeconds || Math.max(8, Math.round((wordCount / 140) * 60)),
    }
  } catch (error: any) {
    const message = error?.message || 'Unknown Edge TTS error'
    const endTime = new Date().toISOString()
    console.error('[TTS Diagnostics]', {
      jobId,
      subtopicId,
      stage: '2/5',
      stageName,
      voice: selectedVoice,
      status: 'failed',
      startTime,
      endTime,
      dataChunks,
      totalBytes,
      error: message,
    })
    throw new Error(`Edge TTS narration failed: ${message}`)
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
    audioStream?.removeAllListeners()
    try {
      tts?.close()
    } catch {
      // Ignore close errors
    }
  }
}
