'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { StudyMaterial, Flashcard, QuizQuestion, CurriculumSubtopic } from '../types/learnverse'
import { INITIAL_STUDY_MATERIALS } from '../mock-data'

interface StudyContextType {
  materials: StudyMaterial[]
  activeMaterialId: string | null
  setActiveMaterialId: (id: string | null) => void
  streakDays: number
  getMaterialById: (id: string) => StudyMaterial | undefined
  addMaterial: (newMaterial: Partial<StudyMaterial> & { title: string; subject: string; type: 'pdf' | 'image' | 'link' | 'text' }) => StudyMaterial
  addExistingMaterial: (material: StudyMaterial) => void
  removeMaterial: (materialId: string) => void
  updateMaterialSubtopics: (materialId: string, subtopics: CurriculumSubtopic[]) => void
  updateFlashcardConfidence: (materialId: string, cardId: string, confidence: 'hard' | 'medium' | 'easy' | 'mastered') => void
  recordQuizScore: (materialId: string, scorePercentage: number) => void
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS)
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null)
  const [streakDays, setStreakDays] = useState<number>(5)

  // Load from local storage if available on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem('learnverse_materials')
      if (saved) {
        setMaterials(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const saveMaterials = (newMaterials: StudyMaterial[]) => {
    setMaterials(newMaterials)
    try {
      localStorage.setItem('learnverse_materials', JSON.stringify(newMaterials))
    } catch {
      // Ignore
    }
  }

  const getMaterialById = (id: string) => {
    return materials.find((m) => m.id === id)
  }

  const addMaterial = (newMaterial: Partial<StudyMaterial> & { title: string; subject: string; type: 'pdf' | 'image' | 'link' | 'text' }): StudyMaterial => {
    const id = `mat-${Date.now()}`
    const created: StudyMaterial = {
      id,
      title: newMaterial.title,
      subject: newMaterial.subject || 'General Study',
      subjectColor: 'from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30',
      type: newMaterial.type,
      sourceFileName: newMaterial.sourceFileName || (newMaterial.type === 'pdf' ? `${newMaterial.title.replace(/\s+/g, '_')}.pdf` : undefined),
      sourceUrl: newMaterial.sourceUrl,
      uploadDate: 'Just now',
      estimatedStudyTimeMinutes: Math.floor(Math.random() * 10) + 8,
      progressPercentage: 10,
      overview: newMaterial.overview,
      subtopics: newMaterial.subtopics,
      summaryNotes: newMaterial.summaryNotes || {
        title: `${newMaterial.title} — Key Concept Synthesis`,
        readingTimeMinutes: 4,
        keyTakeaways: [
          `Key core principles synthesized directly from ${newMaterial.title}.`,
          'Microlearning modules automatically organized into concise logical sequences.',
          'Adaptive review intervals scheduled based on initial concept difficulty.',
        ],
        keyTerms: [
          {
            term: 'Foundational Theory',
            definition: 'The fundamental theoretical framework established in the uploaded document.',
            importance: 'high',
          },
          {
            term: 'Core Mechanism',
            definition: 'The operational process defining how the subject elements interact.',
            importance: 'medium',
          },
        ],
        sections: [
          {
            heading: '1. Overview & Core Hypothesis',
            summary: `Introductory summary distilled from ${newMaterial.title}.`,
            bulletPoints: [
              'Systematic decomposition into bite-sized actionable principles.',
              'Critical definitions, relationships, and cause-and-effect pathways identified.',
            ],
            keyTakeaway: 'Master the foundational terminology first before moving to synthesis.',
          },
          {
            heading: '2. Deep Dive & Applications',
            summary: 'Practical applications and typical exam/assessment scenarios.',
            bulletPoints: [
              'Primary mechanisms and step-by-step progression.',
              'Frequently misunderstood edge cases and common mistakes.',
            ],
            keyTakeaway: 'Test your understanding against the generated flashcards and quiz.',
          },
        ],
      },
      flashcards: newMaterial.flashcards || [
        {
          id: `fc-${id}-1`,
          topic: 'Fundamental Concept',
          question: `What is the central purpose and thesis of "${newMaterial.title}"?`,
          answer: 'To provide a structured, comprehensive explanation of the key phenomena and their practical applications.',
          hint: 'Think about the core subject matter.',
          confidence: 'unrated',
        },
        {
          id: `fc-${id}-2`,
          topic: 'Key Mechanism',
          question: 'What are the main stages or phases outlined in this study material?',
          answer: 'Preparation/Foundation stage -> Active Processing mechanism -> Evaluation and Output.',
          hint: 'Break it down into beginning, middle, and end.',
          confidence: 'unrated',
        },
        {
          id: `fc-${id}-3`,
          topic: 'Practical Application',
          question: 'How do you apply these principles to solve complex problems in this domain?',
          answer: 'By systematically identifying input variables, applying standard rules, and verifying boundary conditions.',
          hint: 'Focus on the problem-solving workflow.',
          confidence: 'unrated',
        },
      ],
      quiz: newMaterial.quiz || {
        id: `quiz-${id}`,
        title: `${newMaterial.title} Verification Quiz`,
        totalQuestions: 2,
        passingScore: 50,
        questions: [
          {
            id: `q-${id}-1`,
            topic: 'Core Understanding',
            question: `Which of the following best describes the primary focus of "${newMaterial.title}"?`,
            options: [
              'Comprehensive microlearning synthesis and conceptual clarity',
              'Historical anecdotes without practical application',
              'Unstructured raw lecture data without verification',
              'Random practice prompts without explanations',
            ],
            correctIndex: 0,
            explanation: 'The microlearning synthesis extracts structured concepts with verified answers.',
          },
          {
            id: `q-${id}-2`,
            topic: 'Application',
            question: 'What is the most effective way to retain the synthesized knowledge gaps?',
            options: [
              'Passive re-reading of the entire text 5 times',
              'Active recall with flashcards, interactive quiz, and visual micro-reels',
              'Ignoring difficult concepts until the final exam',
              'Memorizing keywords without contextual definitions',
            ],
            correctIndex: 1,
            explanation: 'Active recall and spaced repetition microlearning dramatically outperform passive reading.',
          },
        ],
      },
      reel: newMaterial.reel || {
        id: `reel-${id}`,
        title: `${newMaterial.title} in 45 Seconds`,
        durationSeconds: 45,
        visualStyle: '3d-infographic',
        narrationScript: `Welcome to the microlearning breakdown for ${newMaterial.title}. We have extracted the three most critical concepts you need to know today. Let us dive in.`,
        audioWaveform: [0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.7, 0.85, 0.9, 0.6, 0.4, 0.3],
        chapters: [
          { id: 'c-1', title: '01. Key Concept', timestampSeconds: 0, subtitle: `Core introduction to ${newMaterial.title}.` },
          { id: 'c-2', title: '02. Crucial Mechanism', timestampSeconds: 15, subtitle: 'Step-by-step breakdown of the primary process.' },
          { id: 'c-3', title: '03. Exam Takeaway', timestampSeconds: 30, subtitle: 'Essential points to lock in memory for tests.' },
        ],
      },
      knowledgeGap: newMaterial.knowledgeGap || {
        overallMastery: 50,
        weakestArea: 'Core Mechanisms',
        strongestArea: 'Introductory Terminology',
        recommendedStudyOrder: ['Core Mechanisms', 'Application Scenarios', 'Term Definitions'],
        topics: [
          {
            name: 'Introductory Terminology',
            masteryPercentage: 75,
            status: 'improving',
            questionsAttempted: 4,
            recommendedAction: 'Good foundation. Review flashcards once to solidify.',
          },
          {
            name: 'Core Mechanisms',
            masteryPercentage: 35,
            status: 'critical-gap',
            questionsAttempted: 3,
            recommendedAction: 'Take the interactive quiz and review summary notes section 2.',
          },
        ],
      },
    }

    const updated = [created, ...materials]
    saveMaterials(updated)
    return created
  }

  const addExistingMaterial = (material: StudyMaterial) => {
    const filtered = materials.filter((m) => m.id !== material.id)
    const updated = [material, ...filtered]
    saveMaterials(updated)
  }

  const removeMaterial = (materialId: string) => {
    const updated = materials.filter((m) => m.id !== materialId)
    saveMaterials(updated)
  }

  const updateMaterialSubtopics = (materialId: string, subtopics: CurriculumSubtopic[]) => {
    const updated = materials.map((m) => {
      if (m.id !== materialId) return m
      return {
        ...m,
        subtopics,
      }
    })
    saveMaterials(updated)
  }

  const updateFlashcardConfidence = (
    materialId: string,
    cardId: string,
    confidence: 'hard' | 'medium' | 'easy' | 'mastered'
  ) => {
    const updated = materials.map((mat) => {
      if (mat.id !== materialId) return mat
      const updatedCards = mat.flashcards.map((card) => {
        if (card.id !== cardId) return card
        return { ...card, confidence }
      })
      const masteredCount = updatedCards.filter((c) => c.confidence === 'mastered' || c.confidence === 'easy').length
      const newProgress = Math.min(100, Math.round((masteredCount / updatedCards.length) * 100))
      return {
        ...mat,
        flashcards: updatedCards,
        progressPercentage: Math.max(mat.progressPercentage, newProgress),
      }
    })
    saveMaterials(updated)
  }

  const recordQuizScore = (materialId: string, scorePercentage: number) => {
    const updated = materials.map((mat) => {
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
    saveMaterials(updated)
  }

  return (
    <StudyContext.Provider
      value={{
        materials,
        activeMaterialId,
        setActiveMaterialId,
        streakDays,
        getMaterialById,
        addMaterial,
        addExistingMaterial,
        removeMaterial,
        updateMaterialSubtopics,
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
