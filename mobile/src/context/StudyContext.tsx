import React, { createContext, useContext, useState } from 'react'
import { StudyMaterial, Flashcard, ReelItem } from '../types'
import { INITIAL_STUDY_MATERIALS } from '../constants/mock-data'

interface StudyContextType {
  materials: StudyMaterial[]
  activeMaterialId: string | null
  setActiveMaterialId: (id: string | null) => void
  streakDays: number
  getMaterialById: (id: string) => StudyMaterial | undefined
  getFeedReels: () => ReelItem[]
  addMaterial: (newMaterial: { title: string; subject: string; type: 'pdf' | 'image' | 'link' | 'text'; sourceFileName?: string }) => StudyMaterial
  updateFlashcardConfidence: (materialId: string, cardId: string, confidence: 'hard' | 'medium' | 'easy' | 'mastered') => void
  recordQuizScore: (materialId: string, scorePercentage: number) => void
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS)
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>('bio-101')
  const [streakDays, setStreakDays] = useState<number>(5)

  const getMaterialById = (id: string) => {
    return materials.find((m) => m.id === id)
  }

  const addMaterial = (newMaterial: { title: string; subject: string; type: 'pdf' | 'image' | 'link' | 'text'; sourceFileName?: string }): StudyMaterial => {
    const id = `mat-${Date.now()}`
    const created: StudyMaterial = {
      id,
      title: newMaterial.title || 'New Course Material',
      subject: newMaterial.subject || 'General Study',
      subjectColor: '#A855F7',
      type: newMaterial.type,
      sourceFileName: newMaterial.sourceFileName || (newMaterial.type === 'pdf' ? `${newMaterial.title.replace(/\s+/g, '_')}.pdf` : undefined),
      uploadDate: 'Just now',
      estimatedStudyTimeMinutes: 10,
      progressPercentage: 15,
      overview: `Modular active-learning curriculum outline synthesized for ${newMaterial.title}, breaking down core axioms, operational principles, and review flashcards.`,
      subtopics: [
        {
          id: `sub-${id}-1`,
          title: `Foundations of ${newMaterial.title}`,
          description: 'Core concepts, terminology, and foundational structures extracted from curriculum source material.',
          learningObjectives: [
            'Master key foundational terms and definitions',
            'Understand operational framework and principles',
          ],
          estimatedDurationSeconds: 8,
          reelStatus: 'ready',
        },
        {
          id: `sub-${id}-2`,
          title: `Applied Analysis & Problem Solving`,
          description: 'High-yield practical problems and synthesis workflows for long-term conceptual retention.',
          learningObjectives: [
            'Apply principles to sample assessment questions',
            'Identify common edge-cases and critical problem areas',
          ],
          estimatedDurationSeconds: 8,
          reelStatus: 'ready',
        },
      ],
      summaryNotes: {
        title: `${newMaterial.title} Synthesis`,
        readingTimeMinutes: 4,
        keyTakeaways: [
          `Key concepts synthesized from ${newMaterial.title}.`,
          'Logical microlearning decomposition prepared for adaptive review.',
        ],
        keyTerms: [
          {
            term: 'Core Thesis',
            definition: 'Central conceptual proposition identified during document parsing.',
            importance: 'high',
          },
        ],
        sections: [
          {
            heading: '1. Executive Breakdown',
            summary: 'Primary principles and definitions extracted from source notes.',
            bulletPoints: ['Foundation concept mastery.', 'Application mechanism analysis.'],
          },
        ],
      },
      flashcards: [
        {
          id: `fc-${id}-1`,
          topic: 'Foundations',
          question: `What is the primary focus of "${newMaterial.title}"?`,
          answer: 'Comprehensive active-recall synthesis of key definitions and workflows.',
          confidence: 'unrated',
        },
        {
          id: `fc-${id}-2`,
          topic: 'Application',
          question: 'What is the optimal method to retain these concepts long-term?',
          answer: 'Active recall spaced repetition coupled with quiz verification.',
          confidence: 'unrated',
        },
      ],
      quiz: {
        id: `quiz-${id}`,
        title: `${newMaterial.title} Assessment`,
        totalQuestions: 2,
        passingScore: 50,
        questions: [
          {
            id: `q-${id}-1`,
            topic: 'Core Understanding',
            question: `Which learning approach does LearnVerse employ for "${newMaterial.title}"?`,
            options: [
              'Adaptive microlearning (flashcards, notes, quiz, reels)',
              'Passive reading with no retrieval practice',
              'Memorization without explanations',
              'Unstructured notes',
            ],
            correctIndex: 0,
            explanation: 'Multi-modal microlearning maximizes conceptual retention.',
          },
        ],
      },
      reel: {
        id: `reel-${id}`,
        title: `${newMaterial.title} in 45s`,
        durationSeconds: 45,
        visualStyle: '3d-infographic',
        narrationScript: `Welcome to the microlearning breakdown for ${newMaterial.title}. Let us explore the core principles.`,
        audioWaveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.3],
        chapters: [
          { id: 'c-1', title: '01. Overview', timestampSeconds: 0, subtitle: `Core overview for ${newMaterial.title}.` },
          { id: 'c-2', title: '02. Takeaways', timestampSeconds: 20, subtitle: 'High-yield test takeaways.' },
        ],
      },
      knowledgeGap: {
        overallMastery: 50,
        weakestArea: 'Core Principles',
        strongestArea: 'Basic Terminology',
        recommendedStudyOrder: ['Core Principles', 'Applied Scenarios'],
        topics: [
          {
            name: 'Core Principles',
            masteryPercentage: 40,
            status: 'critical-gap',
            questionsAttempted: 2,
            recommendedAction: 'Take the verification quiz and review flashcards.',
          },
        ],
      },
    }

    setMaterials((prev) => [created, ...prev])
    return created
  }

  const updateFlashcardConfidence = (
    materialId: string,
    cardId: string,
    confidence: 'hard' | 'medium' | 'easy' | 'mastered'
  ) => {
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id !== materialId) return mat
        const updatedCards = mat.flashcards.map((c) => (c.id === cardId ? { ...c, confidence } : c))
        const mastered = updatedCards.filter((c) => c.confidence === 'mastered' || c.confidence === 'easy').length
        const newProgress = Math.min(100, Math.round((mastered / updatedCards.length) * 100))
        return {
          ...mat,
          flashcards: updatedCards,
          progressPercentage: Math.max(mat.progressPercentage, newProgress),
        }
      })
    )
  }

  const recordQuizScore = (materialId: string, scorePercentage: number) => {
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id !== materialId) return mat
        return {
          ...mat,
          progressPercentage: Math.max(mat.progressPercentage, scorePercentage),
          knowledgeGap: {
            ...mat.knowledgeGap,
            overallMastery: Math.round((mat.knowledgeGap.overallMastery + scorePercentage) / 2),
          },
        }
      })
    )
  }

  const getFeedReels = (): ReelItem[] => {
    const list: ReelItem[] = []

    materials.forEach((mat) => {
      if (mat.subtopics && mat.subtopics.length > 0) {
        mat.subtopics.forEach((sub, sIdx) => {
          list.push({
            id: `reel-${mat.id}-${sub.id || sIdx}`,
            documentId: mat.id,
            curriculumTitle: mat.title,
            subject: mat.subject,
            subtopicId: sub.id,
            subtopicTitle: sub.title,
            description: sub.description,
            learningObjective: sub.learningObjectives?.[0] || 'Understand core curriculum mechanisms',
            videoUrl: sub.videoUrl || (mat.reel?.id ? `https://oudbotvcxcxxjaqrljzb.supabase.co/storage/v1/object/public/generated-videos/video_${mat.id}.mp4` : ''),
            duration: sub.estimatedDurationSeconds || 8,
            status: sub.reelStatus || 'ready',
            audioWaveform: mat.reel?.audioWaveform || [0.3, 0.6, 0.9, 0.7, 0.4, 0.8, 0.5],
            visualStyle: mat.reel?.visualStyle || '3d-infographic',
          })
        })
      } else if (mat.reel) {
        list.push({
          id: `reel-${mat.id}-main`,
          documentId: mat.id,
          curriculumTitle: mat.title,
          subject: mat.subject,
          subtopicTitle: `${mat.title} Overview`,
          description: mat.reel.narrationScript,
          learningObjective: mat.summaryNotes.keyTakeaways?.[0] || 'High-yield curriculum breakdown',
          videoUrl: '',
          duration: mat.reel.durationSeconds || 45,
          status: 'ready',
          audioWaveform: mat.reel.audioWaveform,
          visualStyle: mat.reel.visualStyle,
        })
      }
    })

    return list
  }

  return (
    <StudyContext.Provider
      value={{
        materials,
        activeMaterialId,
        setActiveMaterialId,
        streakDays,
        getMaterialById,
        getFeedReels,
        addMaterial,
        updateFlashcardConfidence,
        recordQuizScore,
      }}
    >
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
}
