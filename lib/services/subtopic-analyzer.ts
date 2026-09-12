import { GoogleGenerativeAI } from '@google/generative-ai'
import { CurriculumSubtopic } from '../types/learnverse'

export interface SubtopicAnalysisResult {
  documentTitle: string
  overview: string
  subtopics: CurriculumSubtopic[]
}

/**
 * Analyzes extracted curriculum text using Google Gemini (Google AI Studio) to identify
 * logically distinct educational subtopics grounded strictly in the source text.
 */
export async function analyzeCurriculumSubtopics(
  extractedText: string,
  title: string,
  subject: string,
  documentId: string
): Promise<SubtopicAnalysisResult> {
  const cleanText = extractedText.trim()

  if (!cleanText || cleanText.length < 50) {
    throw new Error(
      'The uploaded document contains insufficient readable text. Please upload a clear PDF, lecture slide deck, or textbook excerpt with selectable text.'
    )
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please get a free API key from Google AI Studio (https://aistudio.google.com/app/apikey) and set GEMINI_API_KEY in your .env.local file.'
    )
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const prompt = `You are an elite curriculum architect and educational decomposition expert for LearnVerse.

Task: Analyze the following educational text and decompose it into distinct, sequential, and logical microlearning subtopics.

Curriculum Context:
- Document Title: "${title}"
- Subject Area: "${subject}"
- Extracted Source Text:
"""
${cleanText.slice(0, 30000)}
"""

Rules:
1. Ground every subtopic strictly in the provided text. Use the actual terminology from the document.
2. Group related concepts together into coherent bite-sized units.
3. Target 3 to 6 subtopics for short texts (< 2,000 words), or 5 to 9 subtopics for longer texts.
4. Each subtopic must have 2 to 4 clear, measurable learning objectives.
5. Extract the relevant source text excerpt corresponding to that subtopic.
6. Do not invent facts or create generic filler topics.
7. Return strictly valid JSON adhering to this schema:

{
  "documentTitle": "${title}",
  "overview": "A clear, engaging 2-3 sentence overview summarizing the whole curriculum document and what the student will master.",
  "subtopics": [
    {
      "id": "sub-1",
      "title": "Clear Subtopic Title",
      "description": "A concise 1-2 sentence description explaining the key focus of this subtopic.",
      "learningObjectives": [
        "Actionable learning objective 1",
        "Actionable learning objective 2"
      ],
      "sourceText": "Relevant excerpt extracted directly from the uploaded text for this subtopic.",
      "estimatedDurationSeconds": 8,
      "order": 1
    }
  ]
}

Respond ONLY with the raw JSON object.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    if (!responseText) {
      throw new Error('Gemini returned an empty subtopic analysis response.')
    }

    const parsed = JSON.parse(responseText)

    if (!parsed.subtopics || !Array.isArray(parsed.subtopics) || parsed.subtopics.length === 0) {
      throw new Error('Gemini failed to extract structured subtopics from the document text.')
    }

    const subtopics: CurriculumSubtopic[] = parsed.subtopics.map((s: any, idx: number) => ({
      id: `sub-${documentId}-${idx + 1}`,
      documentId,
      title: s.title || `Subtopic ${idx + 1}`,
      description: s.description || 'Core concept breakdown from the uploaded curriculum.',
      learningObjectives: Array.isArray(s.learningObjectives) && s.learningObjectives.length > 0
        ? s.learningObjectives
        : ['Understand core terminology', 'Apply principles to practical questions'],
      sourceText: s.sourceText || cleanText.slice(idx * 500, (idx + 1) * 500),
      estimatedDurationSeconds: s.estimatedDurationSeconds || 8,
      displayOrder: idx + 1,
      reelStatus: 'not_started',
    }))

    return {
      documentTitle: parsed.documentTitle || title,
      overview:
        parsed.overview ||
        `Comprehensive curriculum breakdown for ${title} covering foundational principles, operational mechanisms, and high-yield review takeaways.`,
      subtopics,
    }
  } catch (err: any) {
    const rawMsg = err?.message || String(err)
    console.error(`[Gemini Subtopic Analysis Error]:`, rawMsg)

    if (
      err?.status === 429 ||
      rawMsg.includes('429') ||
      rawMsg.toLowerCase().includes('quota') ||
      rawMsg.toLowerCase().includes('resource_exhausted') ||
      rawMsg.toLowerCase().includes('rate limit')
    ) {
      throw new Error(
        'Gemini API quota reached. Please wait and try again, or switch to an available model.'
      )
    }

    if (
      err?.status === 503 ||
      rawMsg.includes('503') ||
      rawMsg.toLowerCase().includes('overloaded') ||
      rawMsg.toLowerCase().includes('high demand')
    ) {
      throw new Error(
        'Gemini API is temporarily overloaded (503). Please wait a few moments and try again.'
      )
    }

    if (rawMsg.toLowerCase().includes('timeout') || rawMsg.toLowerCase().includes('fetch failed')) {
      throw new Error(
        'Gemini API request timed out. Please check your network connection and try again.'
      )
    }

    if (rawMsg.includes('GEMINI_API_KEY')) {
      throw new Error(
        'GEMINI_API_KEY is not configured. Please set a valid Gemini API key in .env.local.'
      )
    }

    throw new Error(rawMsg.replace(/https?:\/\/[^\s]+/g, '').trim())
  }
}

