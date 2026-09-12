import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export interface ExtractedPdfContent {
  rawText: string
  cleanText: string
  pageCount: number
  characterCount: number
  previewSnippet: string
}

function getNodeRequire(): NodeRequire {
  return eval('require') as NodeRequire
}

/**
 * Resolves the absolute path to pdf.worker.mjs within the pdf-parse package.
 */
function resolvePdfWorkerPath(): string {
  try {
    const mainEntry = getNodeRequire().resolve('pdf-parse')
    // pdf-parse 2.4.5 ships the worker beside its CJS parser entry.
    const siblingWorker = path.join(path.dirname(mainEntry), 'pdf.worker.mjs')
    if (fs.existsSync(siblingWorker)) return siblingWorker

    const packageWorker = path.resolve(path.dirname(mainEntry), '../../../worker/pdf.worker.mjs')
    if (fs.existsSync(packageWorker)) return packageWorker
  } catch {
    // Fallback search in node_modules
  }

  // Secondary candidate paths for various packaging layouts
  const fallbackCandidates = [
    path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'pdf-parse', 'cjs', 'pdf.worker.mjs'),
    path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs'),
    path.join(process.cwd(), 'node_modules', '.pnpm', 'pdf-parse@2.4.5', 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs'),
  ]

  for (const candidate of fallbackCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error('Could not locate pdf.worker.mjs for PDF text extraction.')
}

/**
 * Extracts and cleans text from an uploaded PDF file buffer.
 * Rejects corrupt, scanned-only, or binary-dump PDFs containing raw PDF syntax tokens.
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<ExtractedPdfContent> {
  if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    throw new Error('The uploaded PDF is empty or could not be read.')
  }

  if (pdfBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('The uploaded file is not a valid PDF document.')
  }

  let parser: { getText: () => Promise<{ text?: string; total?: number }>; destroy: () => Promise<void> } | undefined

  try {
    const nodeRequire = getNodeRequire()
    const resolvedEntry = nodeRequire.resolve('pdf-parse')
    const { PDFParse } = nodeRequire('pdf-parse')
    const workerPath = resolvePdfWorkerPath()
    const workerExists = fs.existsSync(workerPath)
    const workerUrl = pathToFileURL(workerPath).href

    console.info('[PDF Worker Diagnostics]', {
      resolvedEntry,
      workerPath,
      workerExists,
      workerUrl,
    })

    if (!workerExists) {
      throw new Error('PDF text extraction could not initialize. Please restart the development server.')
    }

    try {
      PDFParse.setWorker(workerUrl)
    } catch {
      throw new Error('PDF text extraction could not initialize. Please restart the development server.')
    }

    const pdfParser = new PDFParse({ data: pdfBuffer })
    parser = pdfParser

    const data = await pdfParser.getText()
    const rawText = data.text || ''

    // Clean text by normalizing whitespace, linebreaks, and stripping artifact lines
    const cleanText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '') // Remove '-- 1 of 1 --' page markers
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim()

    const previewSnippet = cleanText.slice(0, 500) + (cleanText.length > 500 ? '...' : '')

    // Structural Token Check: Detect if output is raw PDF stream syntax rather than natural text
    const structuralTokenRegex = /\b(?:obj|endobj|stream|endstream|FlateDecode|xref|trailer|Catalog|FontDescriptor|Length\s+\d+)\b|%PDF-/gi
    const structuralMatches = cleanText.match(structuralTokenRegex) || []
    const totalWords = cleanText.split(/\s+/).filter(Boolean).length
    const structuralTokenRatio = structuralMatches.length / Math.max(1, totalWords)

    // PDF.js can emit non-text control markers for layout boundaries; structural tokens are the binary-output signal.
    const controlCharacterCount = (rawText.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length
    const isBinaryOrMalformed = structuralTokenRatio > 0.1 || structuralMatches.length > 5

    console.info('[PDF Extraction Diagnostics]', {
      byteLength: pdfBuffer.length,
      characterCount: cleanText.length,
      pageCount: data.total || 1,
      controlCharacterCount,
      structuralTokenCount: structuralMatches.length,
      structuralTokenRatio: structuralTokenRatio.toFixed(3),
      preview: previewSnippet,
    })

    if (!cleanText || cleanText.length < 50 || isBinaryOrMalformed) {
      throw new Error(
        'The uploaded PDF did not contain readable, selectable text. Scanned images or binary-only PDFs are not supported. Please upload a text-based educational PDF.'
      )
    }

    return {
      rawText,
      cleanText,
      pageCount: data.total || 1,
      characterCount: cleanText.length,
      previewSnippet,
    }
  } catch (error: any) {
    if (error?.message?.includes('fake worker') || error?.message?.includes('pdf.worker')) {
      throw new Error('PDF text extraction could not initialize. Please restart the development server.')
    }
    if (error?.message?.includes('readable, selectable text') || error?.message?.includes('not a valid PDF')) {
      throw error
    }
    throw new Error(`Failed to extract readable PDF text: ${error?.message || 'Unknown error'}`)
  } finally {
    try {
      await parser?.destroy()
    } catch {
      // Ignore parser cleanup errors
    }
  }
}

