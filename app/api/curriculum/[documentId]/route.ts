import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCurriculumDocument, saveCurriculumDocument } from '@/lib/services/video-pipeline'
import { INITIAL_STUDY_MATERIALS } from '@/lib/mock-data'
import { StudyMaterial, CurriculumSubtopic, CurriculumDocument } from '@/lib/types/learnverse'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const documentId = params?.documentId

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  // 1. Check local curriculum store
  const localDoc = getCurriculumDocument(documentId)
  if (localDoc) {
    // Check if any subtopic has a generated reel
    const readySubtopic = localDoc.subtopics.find((s) => s.reelStatus === 'ready' && s.reel)
    const activeReel = readySubtopic?.reel || {
      id: `reel-${documentId}`,
      title: `${localDoc.title} Outline Overview`,
      durationSeconds: 45,
      narrationScript: `Welcome to the curriculum outline for ${localDoc.title}. Select any subtopic from the outline to generate its custom 8-second microlearning reel.`,
      visualStyle: '3d-infographic' as const,
      chapters: localDoc.subtopics.map((s, idx) => ({
        id: `c-${s.id}`,
        title: s.title,
        timestampSeconds: idx * 15,
        subtitle: s.description,
      })),
      audioWaveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.95, 0.7, 0.4, 0.6, 0.85, 0.9, 0.75, 0.5, 0.3],
    }

    const studyMaterial: StudyMaterial = {
      id: localDoc.id,
      title: localDoc.title,
      subject: localDoc.subject,
      subjectColor: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      type: 'pdf',
      sourceFileName: localDoc.sourceFileName,
      sourceUrl: localDoc.sourceFileUrl,
      uploadDate: 'Just now',
      estimatedStudyTimeMinutes: Math.ceil(localDoc.subtopics.length * 2.5),
      progressPercentage: 10,
      overview: localDoc.overview,
      subtopics: localDoc.subtopics,
      summaryNotes: {
        title: `${localDoc.title} — Key Concept Synthesis`,
        readingTimeMinutes: Math.ceil(localDoc.subtopics.length * 1.5),
        keyTakeaways: localDoc.subtopics.map((s) => s.description),
        keyTerms: localDoc.subtopics.map((s) => ({
          term: s.title,
          definition: s.description,
          importance: 'high' as const,
        })),
        sections: localDoc.subtopics.map((s, idx) => ({
          heading: `${idx + 1}. ${s.title}`,
          summary: s.description,
          bulletPoints: s.learningObjectives,
          keyTakeaway: s.learningObjectives[0] || 'Master foundational concept',
        })),
      },
      flashcards: localDoc.subtopics.map((s, idx) => ({
        id: `fc-${s.id}`,
        topic: s.title,
        question: `What is the primary focus of "${s.title}"?`,
        answer: s.description,
        hint: `Think about ${localDoc.subject}`,
        confidence: 'unrated' as const,
      })),
      quiz: {
        id: `quiz-${localDoc.id}`,
        title: `${localDoc.title} Verification Quiz`,
        totalQuestions: localDoc.subtopics.length,
        passingScore: 60,
        questions: localDoc.subtopics.map((s, idx) => ({
          id: `q-${s.id}`,
          topic: s.title,
          question: `Which learning objective belongs to "${s.title}"?`,
          options: [
            s.learningObjectives[0] || 'Core conceptual mastery',
            'Unrelated historical timeline',
            'Passive textbook scanning',
            'Random unsupported conjecture',
          ],
          correctIndex: 0,
          explanation: `The objective "${s.learningObjectives[0] || s.title}" is the primary focus of this unit.`,
        })),
      },
      reel: activeReel,
      knowledgeGap: {
        overallMastery: 50,
        weakestArea: localDoc.subtopics[1]?.title || localDoc.subtopics[0]?.title || 'Core Concepts',
        strongestArea: localDoc.subtopics[0]?.title || 'Introduction',
        recommendedStudyOrder: localDoc.subtopics.map((s) => s.title),
        topics: localDoc.subtopics.map((s, idx) => ({
          name: s.title,
          masteryPercentage: idx === 0 ? 70 : 40,
          status: idx === 0 ? ('improving' as const) : ('critical-gap' as const),
          questionsAttempted: 2,
          recommendedAction: `Watch the subtopic reel and review objectives.`,
        })),
      },
    }

    return NextResponse.json({
      success: true,
      document: localDoc,
      studyMaterial,
    })
  }

  // 2. Check Supabase DB
  if (supabaseAdmin) {
    try {
      const { data: doc, error: docErr } = await supabaseAdmin
        .from('curriculum_documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (docErr && docErr.code !== 'PGRST116' && docErr.code !== 'PGRST205') {
        console.error(`[Supabase DB Error - curriculum_documents fetch]: ${docErr.message} (code: ${docErr.code})`)
      }

      const { data: subtopics, error: subErr } = await supabaseAdmin
        .from('curriculum_subtopics')
        .select('*')
        .eq('document_id', documentId)
        .order('display_order', { ascending: true })

      if (subErr && subErr.code !== 'PGRST205') {
        console.error(`[Supabase DB Error - curriculum_subtopics fetch]: ${subErr.message} (code: ${subErr.code})`)
      }

      if (doc) {
        const mappedSubtopics: CurriculumSubtopic[] = (subtopics || []).map((s: any, idx: number) => ({
          id: s.id,
          documentId: s.document_id,
          title: s.title,
          description: s.description || '',
          sourceText: s.source_text || '',
          learningObjectives: s.learning_objectives || [],
            estimatedDurationSeconds: s.duration_seconds || 8,
          displayOrder: typeof s.display_order === 'number' ? s.display_order : idx + 1,
          reelStatus: s.reel_status || 'not_started',
          reelJobId: s.reel_job_id,
          reel: s.chapters_json || s.video_url
            ? {
                id: `reel-${s.id}`,
                title: s.title,
                durationSeconds: s.duration_seconds || 45,
                narrationScript: '',
                visualStyle: '3d-infographic',
                videoUrl: s.video_url,
                audioUrl: s.audio_url,
                chapters: s.chapters_json || [],
                audioWaveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.95, 0.7, 0.4, 0.6, 0.85, 0.9, 0.75, 0.5, 0.3],
                subtopicId: s.id,
              }
            : undefined,
        }))

        const fullDoc: CurriculumDocument = {
          id: doc.id,
          title: doc.title,
          subject: doc.subject,
          overview: doc.overview || '',
          sourceFileName: doc.source_file_name,
          sourceFileUrl: doc.file_url,
          subtopics: mappedSubtopics,
          analysisStatus: 'ready',
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
        }

        saveCurriculumDocument(fullDoc)

        const readySubtopic = mappedSubtopics.find((s) => s.reelStatus === 'ready' && s.reel)
        const activeReel = readySubtopic?.reel || {
          id: `reel-${doc.id}`,
          title: `${doc.title} Overview`,
          durationSeconds: 45,
          narrationScript: `Welcome to the curriculum outline for ${doc.title}. Select any subtopic from the outline to generate its custom 8-second microlearning reel.`,
          visualStyle: '3d-infographic' as const,
          chapters: mappedSubtopics.map((s, idx) => ({
            id: `c-${s.id}`,
            title: s.title,
            timestampSeconds: idx * 15,
            subtitle: s.description,
          })),
          audioWaveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.95, 0.7, 0.4, 0.6, 0.85, 0.9, 0.75, 0.5, 0.3],
        }

        const studyMaterial: StudyMaterial = {
          id: doc.id,
          title: doc.title,
          subject: doc.subject,
          subjectColor: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
          type: 'pdf',
          sourceFileName: doc.source_file_name,
          sourceUrl: doc.file_url,
          uploadDate: 'Just now',
          estimatedStudyTimeMinutes: Math.max(8, Math.ceil(mappedSubtopics.length * 2.5)),
          progressPercentage: 10,
          overview: doc.overview,
          subtopics: mappedSubtopics,
          summaryNotes: {
            title: `${doc.title} — Key Concept Synthesis`,
            readingTimeMinutes: Math.max(3, Math.ceil(mappedSubtopics.length * 1.5)),
            keyTakeaways: mappedSubtopics.map((s) => s.description),
            keyTerms: mappedSubtopics.map((s) => ({
              term: s.title,
              definition: s.description,
              importance: 'high' as const,
            })),
            sections: mappedSubtopics.map((s, idx) => ({
              heading: `${idx + 1}. ${s.title}`,
              summary: s.description,
              bulletPoints: s.learningObjectives,
              keyTakeaway: s.learningObjectives[0] || 'Master foundational concept',
            })),
          },
          flashcards: mappedSubtopics.map((s) => ({
            id: `fc-${s.id}`,
            topic: s.title,
            question: `What is the primary focus of "${s.title}"?`,
            answer: s.description,
            hint: `Think about ${doc.subject}`,
            confidence: 'unrated' as const,
          })),
          quiz: {
            id: `quiz-${doc.id}`,
            title: `${doc.title} Verification Quiz`,
            totalQuestions: mappedSubtopics.length,
            passingScore: 60,
            questions: mappedSubtopics.map((s) => ({
              id: `q-${s.id}`,
              topic: s.title,
              question: `Which learning objective belongs to "${s.title}"?`,
              options: [
                s.learningObjectives[0] || 'Core conceptual mastery',
                'Unrelated historical timeline',
                'Passive textbook scanning',
                'Random unsupported conjecture',
              ],
              correctIndex: 0,
              explanation: `The objective "${s.learningObjectives[0] || s.title}" is the primary focus of this unit.`,
            })),
          },
          reel: activeReel,
          knowledgeGap: {
            overallMastery: 50,
            weakestArea: mappedSubtopics[1]?.title || mappedSubtopics[0]?.title || 'Core Concepts',
            strongestArea: mappedSubtopics[0]?.title || 'Introduction',
            recommendedStudyOrder: mappedSubtopics.map((s) => s.title),
            topics: mappedSubtopics.map((s, idx) => ({
              name: s.title,
              masteryPercentage: idx === 0 ? 70 : 40,
              status: idx === 0 ? ('improving' as const) : ('critical-gap' as const),
              questionsAttempted: 2,
              recommendedAction: `Watch the subtopic reel and review objectives.`,
            })),
          },
        }

        return NextResponse.json({
          success: true,
          document: fullDoc,
          studyMaterial,
        })
      }
    } catch (err: any) {
      console.warn(`[Supabase Document Fetch Error]: ${err?.message}`)
    }
  }

  // 3. Fallback to initial mock datasets
  const found = INITIAL_STUDY_MATERIALS.find((m) => m.id === documentId)
  if (found) {
    return NextResponse.json({ success: true, studyMaterial: found })
  }

  return NextResponse.json({ error: 'Curriculum document not found' }, { status: 404 })
}
