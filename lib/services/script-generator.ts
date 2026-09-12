import { GoogleGenerativeAI } from '@google/generative-ai'
import { SummaryNotes, Flashcard, Quiz, KnowledgeGapData, VideoReel } from '../types/learnverse'

export const REEL_DURATION_SECONDS = 8
const REEL_PRIMARY_MODEL = 'gemini-3.6-flash'
const REEL_FALLBACK_MODEL = 'gemini-3.5-flash-lite'
const GEMINI_TIMEOUT_MS = 30_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
  ])
}

export interface VisualSlideCue {
  id: string
  slideIndex: number
  chapterTitle: string
  mainHeadline: string
  subHeadline: string
  bulletPoints: string[]
  keyFormulaOrTakeaway: string
  accentColor: string
  estimatedDurationSeconds: number
}

export interface GeneratedCurriculumPackage {
  narrationScript: string
  slides: VisualSlideCue[]
  reel: VideoReel
  summaryNotes: SummaryNotes
  flashcards: Flashcard[]
  quiz: Quiz
  knowledgeGap: KnowledgeGapData
}

export interface SubtopicReelPackage {
  narrationScript: string
  slides: VisualSlideCue[]
  reel: VideoReel
}

/**
 * Generates structured microlearning deck, visual scenes, and narration script using Google Gemini (Google AI Studio).
 * Strict server-side execution with gemini-1.5-flash free-tier model.
 */
export async function generateCurriculumContent(
  extractedText: string,
  title: string,
  subject: string
): Promise<GeneratedCurriculumPackage> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please get a free API key from Google AI Studio (https://aistudio.google.com/app/apikey) and set GEMINI_API_KEY in your .env.local file.'
    )
  }

  const modelName = process.env.GEMINI_MODEL || REEL_PRIMARY_MODEL

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const prompt = `You are an elite educational content director and curriculum video producer for LearnVerse, an adaptive microlearning platform.

Curriculum Document Details:
- Title: "${title}"
- Subject: "${subject}"
- Extracted Content:
"""
${extractedText.slice(0, 25000)}
"""

Produce a comprehensive, high-retention microlearning package in strictly valid JSON format matching this schema:
{
  "narrationScript": "A continuous, engaging 45-60 second spoken educational voiceover script explaining the 3 most crucial core concepts from the text. Only output the exact words to be spoken aloud. Do not include stage directions, audio cues, or bracketed notes.",
  "slides": [
    {
      "slideIndex": 1,
      "chapterTitle": "01. Core Concept",
      "mainHeadline": "Clear Bold Slide Title",
      "subHeadline": "One sentence summary of this concept",
      "bulletPoints": ["High yield takeaway point 1", "High yield takeaway point 2"],
      "keyFormulaOrTakeaway": "Essential rule or definition to memorize",
      "accentColor": "#1DED83",
      "estimatedDurationSeconds": 15
    },
    {
      "slideIndex": 2,
      "chapterTitle": "02. Mechanism & Analysis",
      "mainHeadline": "Process & Operations",
      "subHeadline": "How the components interact",
      "bulletPoints": ["Key interaction step 1", "Key interaction step 2"],
      "keyFormulaOrTakeaway": "Critical mechanism bottleneck",
      "accentColor": "#06B6D4",
      "estimatedDurationSeconds": 18
    },
    {
      "slideIndex": 3,
      "chapterTitle": "03. Exam Synthesis",
      "mainHeadline": "Applications & Review",
      "subHeadline": "Practical problem solving and review",
      "bulletPoints": ["High-yield exam test point", "Common mistake to avoid"],
      "keyFormulaOrTakeaway": "Golden rule for retention",
      "accentColor": "#F59E0B",
      "estimatedDurationSeconds": 15
    }
  ],
  "summaryNotes": {
    "title": "${title} — Key Concept Synthesis",
    "readingTimeMinutes": 4,
    "keyTakeaways": [
      "Core principle 1 extracted directly from text",
      "Core principle 2 extracted directly from text",
      "Core principle 3 extracted directly from text",
      "Core principle 4 extracted directly from text"
    ],
    "keyTerms": [
      { "term": "Key Term 1", "definition": "Clear concise definition", "importance": "high" },
      { "term": "Key Term 2", "definition": "Clear concise definition", "importance": "high" },
      { "term": "Key Term 3", "definition": "Clear concise definition", "importance": "medium" }
    ],
    "sections": [
      {
        "heading": "1. Foundational Principles",
        "summary": "Core hypothesis and introductory framework.",
        "bulletPoints": ["Point A", "Point B"],
        "keyTakeaway": "Primary rule to remember"
      },
      {
        "heading": "2. Detailed Mechanism & Applications",
        "summary": "Step-by-step breakdown.",
        "bulletPoints": ["Point C", "Point D"],
        "keyTakeaway": "Applied synthesis"
      }
    ]
  },
  "flashcards": [
    {
      "id": "fc-1",
      "topic": "Fundamentals",
      "question": "Clear question testing concept recall?",
      "answer": "Direct, precise answer with context.",
      "hint": "Helpful conceptual hint",
      "confidence": "unrated"
    },
    {
      "id": "fc-2",
      "topic": "Mechanisms",
      "question": "Question testing cause-and-effect relationship?",
      "answer": "Direct, precise explanation.",
      "hint": "Helpful conceptual hint",
      "confidence": "unrated"
    },
    {
      "id": "fc-3",
      "topic": "Applications",
      "question": "Application scenario question?",
      "answer": "Direct, precise problem-solving answer.",
      "hint": "Helpful conceptual hint",
      "confidence": "unrated"
    }
  ],
  "quiz": {
    "id": "quiz-gen",
    "title": "${title} Verification Quiz",
    "totalQuestions": 3,
    "passingScore": 66,
    "questions": [
      {
        "id": "q-1",
        "topic": "Core Understanding",
        "question": "Multiple choice question testing fundamental comprehension?",
        "options": ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"],
        "correctIndex": 0,
        "explanation": "Detailed pedagogical explanation of why this answer is correct."
      },
      {
        "id": "q-2",
        "topic": "Mechanisms",
        "question": "Second multiple choice question?",
        "options": ["Distractor 1", "Correct Option", "Distractor 2", "Distractor 3"],
        "correctIndex": 1,
        "explanation": "Explanation for why option 2 is correct."
      },
      {
        "id": "q-3",
        "topic": "Applications",
        "question": "Third application multiple choice question?",
        "options": ["Distractor 1", "Distractor 2", "Correct Option", "Distractor 3"],
        "correctIndex": 2,
        "explanation": "Explanation for why option 3 is correct."
      }
    ]
  },
  "knowledgeGap": {
    "overallMastery": 55,
    "weakestArea": "Mechanisms & Application",
    "strongestArea": "Foundational Terminology",
    "recommendedStudyOrder": ["Mechanisms & Application", "Foundational Principles", "Terminology Review"],
    "topics": [
      {
        "name": "Foundational Terminology",
        "masteryPercentage": 75,
        "status": "improving",
        "questionsAttempted": 4,
        "recommendedAction": "Solid base. Review flashcards once to reinforce."
      },
      {
        "name": "Mechanisms & Application",
        "masteryPercentage": 40,
        "status": "critical-gap",
        "questionsAttempted": 3,
        "recommendedAction": "Watch the 45s explainer reel and take the verification quiz."
      }
    ]
  }
}

Respond ONLY with the JSON object.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    if (!responseText) {
      throw new Error('Gemini API returned an empty response.')
    }

    const parsed = JSON.parse(responseText)

    const slides: VisualSlideCue[] = (parsed.slides || []).map((s: any, idx: number) => ({
      id: `slide-${idx + 1}`,
      slideIndex: s.slideIndex || idx + 1,
      chapterTitle: s.chapterTitle || `0${idx + 1}. Chapter`,
      mainHeadline: s.mainHeadline || `Key Takeaway ${idx + 1}`,
      subHeadline: s.subHeadline || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
      keyFormulaOrTakeaway: s.keyFormulaOrTakeaway || '',
      accentColor: s.accentColor || (idx === 0 ? '#1DED83' : idx === 1 ? '#06B6D4' : '#F59E0B'),
      estimatedDurationSeconds: s.estimatedDurationSeconds || 15,
    }))

    const chapters = slides.map((s, idx) => ({
      id: `c-${idx + 1}`,
      title: s.chapterTitle,
      timestampSeconds:
        idx === 0
          ? 0
          : slides.slice(0, idx).reduce((acc, cur) => acc + (cur.estimatedDurationSeconds || 15), 0),
      subtitle: s.subHeadline || s.mainHeadline,
    }))

    const totalDuration = slides.reduce(
      (acc, cur) => acc + (cur.estimatedDurationSeconds || 15),
      0
    )

    const reel: VideoReel = {
      id: `reel-${Date.now()}`,
      title: `${title} in ${totalDuration}s`,
      durationSeconds: totalDuration,
      narrationScript: parsed.narrationScript,
      visualStyle: '3d-infographic',
      chapters,
      audioWaveform: [0.2, 0.5, 0.8, 0.95, 0.7, 0.6, 0.9, 0.75, 0.4, 0.7, 0.9, 0.6, 0.3],
    }

    return {
      narrationScript: parsed.narrationScript,
      slides,
      reel,
      summaryNotes: parsed.summaryNotes,
      flashcards: parsed.flashcards,
      quiz: parsed.quiz,
      knowledgeGap: parsed.knowledgeGap,
    }
  } catch (err: any) {
    console.error(`[Gemini Generation Error]:`, err)
    if (err.message && err.message.includes('GEMINI_API_KEY')) {
      throw err
    }
    throw new Error(
      `Gemini Generation Failed: ${err?.message || 'Unknown error occurred while contacting Google AI Studio'}. Please verify your GEMINI_API_KEY and quota at https://aistudio.google.com.`
    )
  }
}

/**
 * Generates an educational video reel script and slide visuals focused exclusively
 * on a single selected subtopic from the curriculum outline.
 */
export async function generateSubtopicReelScript(params: {
  documentTitle: string
  subject: string
  subtopicTitle: string
  description: string
  sourceText: string
  learningObjectives: string[]
  subtopicId: string
}): Promise<SubtopicReelPackage> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please get a free API key from Google AI Studio (https://aistudio.google.com/app/apikey) and set GEMINI_API_KEY in your .env.local file.'
    )
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

  const prompt = `You are a world-class educational science animator and video director for LearnVerse.

Create an exactly 8-second educational video reel script with crystal-clear physical visual storytelling for this SPECIFIC SUBTOPIC:

Context:
- Course Document: "${params.documentTitle}" (${params.subject})
- Target Subtopic: "${params.subtopicTitle}"
- Subtopic Description: "${params.description}"
- Target Learning Objectives:
${params.learningObjectives.map((o) => `  * ${o}`).join('\n')}
- Relevant Source Text:
"""
${params.sourceText.slice(0, 10000)}
"""

Instructions:
1. Narration: A natural, crystal-clear spoken voiceover of exactly 18 to 22 words explaining the exact physical/conceptual mechanism.
   Example for Evaporation: "The Sun heats liquid water. Water molecules gain energy, escape the surface, and rise as invisible water vapour."
   Do NOT use jargon like "transit states" or "mechanism details". Speak clearly for a Grade 7 student.
2. Return strictly 2 scenes describing the physical cause and transformation.
3. Takeaway: One single memorable scientific sentence (e.g. "Sunlight changes liquid water into water vapour.").
4. Return strictly valid JSON conforming to this schema:

{
  "narrationScript": "The Sun heats liquid water. Water molecules gain energy, escape the surface, and rise as invisible water vapour.",
  "slides": [
    {
      "slideIndex": 1,
      "chapterTitle": "Solar Heating",
      "mainHeadline": "${params.subtopicTitle}",
      "subHeadline": "Thermal energy excites surface molecules",
      "bulletPoints": ["Sunlight warms the liquid water", "Surface molecules absorb heat energy"],
      "keyFormulaOrTakeaway": "Sunlight changes liquid water into water vapour.",
      "accentColor": "#0284C7",
      "estimatedDurationSeconds": 4
    },
    {
      "slideIndex": 2,
      "chapterTitle": "State Transformation",
      "mainHeadline": "Liquid to Vapour",
      "subHeadline": "Energetic molecules break free into air",
      "bulletPoints": ["Molecules escape liquid surface", "Invisible water vapour rises into sky"],
      "keyFormulaOrTakeaway": "Sunlight changes liquid water into water vapour.",
      "accentColor": "#0EA5E9",
      "estimatedDurationSeconds": 4
    }
  ]
}

Respond ONLY with the JSON object.`

  const request = async (modelToUse: string) => {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelToUse,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    })
    return withTimeout(
      model.generateContent(prompt),
      GEMINI_TIMEOUT_MS,
      `Gemini request timed out after ${GEMINI_TIMEOUT_MS / 1000}s.`
    )
  }

  const isUnavailable503 = (error: any) => error?.status === 503 || error?.statusText === 'Service Unavailable'

  try {
    let result
    try {
      try {
        result = await request(modelName)
      } catch (error) {
        if (!isUnavailable503(error)) throw error
        await new Promise((resolve) => setTimeout(resolve, 350))
        result = await request(modelName)
      }
    } catch (error) {
      if (!isUnavailable503(error) || modelName === REEL_FALLBACK_MODEL) throw error
      await new Promise((resolve) => setTimeout(resolve, 350))
      result = await request(REEL_FALLBACK_MODEL)
    }
    const responseText = result.response.text()

    if (!responseText) {
      throw new Error('Gemini returned an empty response for the subtopic reel.')
    }

    const parsed = JSON.parse(responseText)
    const narrationWordCount = String(parsed.narrationScript || '').trim().split(/\s+/).filter(Boolean).length
    if (narrationWordCount < 18 || narrationWordCount > 24) {
      throw new Error(`The 8-second narration must contain 18-24 words; received ${narrationWordCount}.`)
    }

    const accentPalette = ['#1DED83', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899']

    const slides: VisualSlideCue[] = (parsed.slides || []).map((s: any, idx: number) => ({
      id: `slide-${params.subtopicId}-${idx + 1}`,
      slideIndex: s.slideIndex || idx + 1,
      chapterTitle: s.chapterTitle || `0${idx + 1}. Chapter`,
      mainHeadline: s.mainHeadline || params.subtopicTitle,
      subHeadline: s.subHeadline || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
      keyFormulaOrTakeaway: s.keyFormulaOrTakeaway || '',
      accentColor: s.accentColor || accentPalette[idx % accentPalette.length],
      estimatedDurationSeconds: REEL_DURATION_SECONDS / Math.max(1, Math.min(2, (parsed.slides || []).length)),
    })).slice(0, 2)

    const chapters = slides.map((s, idx) => ({
      id: `c-${params.subtopicId}-${idx + 1}`,
      title: s.chapterTitle,
      timestampSeconds:
        idx === 0
          ? 0
          : slides.slice(0, idx).reduce((acc, cur) => acc + (cur.estimatedDurationSeconds || 4), 0),
      subtitle: s.subHeadline || s.mainHeadline,
    }))

    const totalDuration = REEL_DURATION_SECONDS

    const reel: VideoReel = {
      id: `reel-${params.subtopicId}`,
      title: `${params.subtopicTitle} (8s Reel)`,
      durationSeconds: totalDuration,
      narrationScript: parsed.narrationScript,
      visualStyle: '3d-infographic',
      subtopicId: params.subtopicId,
      chapters,
      audioWaveform: [0.2, 0.4, 0.7, 0.95, 0.8, 0.6, 0.9, 0.75, 0.5, 0.7, 0.85, 0.6, 0.3],
    }

    return {
      narrationScript: parsed.narrationScript,
      slides,
      reel,
    }
  } catch (err: any) {
    console.error(`[Gemini Subtopic Script Error]:`, err)
    if (err.message && err.message.includes('GEMINI_API_KEY')) {
      throw err
    }
    throw new Error(
      `Subtopic Reel Generation Failed: ${err?.message || 'Error communicating with Google AI Studio'}.`
    )
  }
}
