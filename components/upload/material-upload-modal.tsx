'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useStudy } from '@/lib/context/study-context'
import { toast } from 'sonner'
import { StudyMaterial, CurriculumSubtopic } from '@/lib/types/learnverse'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Layers,
  HelpCircle,
  Video,
  ListTree,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react'

interface MaterialUploadModalProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function MaterialUploadModal({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MaterialUploadModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen
  const setIsOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setUncontrolledOpen

  const { addExistingMaterial } = useStudy()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'file' | 'image' | 'link'>('file')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(0) // 0 to 4 (stages 1 to 5)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const [failedStageText, setFailedStageText] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const STAGES = [
    {
      stageNumber: 1,
      name: 'Uploading document',
      percent: 20,
      activity: 'Transferring PDF document to server...',
      icon: Upload,
    },
    {
      stageNumber: 2,
      name: 'Reading document',
      percent: 40,
      activity: 'Extracting clean text & validating content structure...',
      icon: FileText,
    },
    {
      stageNumber: 3,
      name: 'Analyzing curriculum',
      percent: 60,
      activity: 'Gemini (gemini-3.6-flash) decomposing into modular subtopics...',
      icon: BrainCircuit,
    },
    {
      stageNumber: 4,
      name: 'Preparing subtopics',
      percent: 80,
      activity: 'Generating structured learning objectives & outline metadata...',
      icon: ListTree,
    },
    {
      stageNumber: 5,
      name: 'Saving curriculum',
      percent: 100,
      activity: 'Saving curriculum records & subtopics to storage...',
      icon: Layers,
    },
  ]

  const setSelectedUploadFile = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')
    const isAccepted = activeTab === 'file' ? isPdf : isImage

    if (!isAccepted) {
      setUploadError(activeTab === 'file' ? 'Please select a PDF curriculum document.' : 'Please select an image file.')
      setSelectedFile(null)
      setSelectedFileName(null)
      return
    }

    if (activeTab === 'file' && file.size > 50 * 1024 * 1024) {
      setUploadError('The PDF must be 50MB or smaller.')
      setSelectedFile(null)
      setSelectedFileName(null)
      return
    }

    setUploadError(null)
    setHasFailed(false)
    setFailedStageText(null)
    setSelectedFile(file)
    setSelectedFileName(file.name)
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedUploadFile(e.target.files[0])
    }
  }

  const handleSampleFill = (sampleType: 'bio' | 'cs' | 'physics') => {
    if (sampleType === 'bio') {
      setTitle('Genetics & CRISPR Cas-9 Editing')
      setSubject('Molecular Biology')
      setSelectedFileName('CRISPR_Mechanism_Lecture_Notes.pdf')
    } else if (sampleType === 'cs') {
      setTitle('Neural Networks & Backpropagation')
      setSubject('Machine Learning')
      setUrlInput('https://arxiv.org/abs/2301.backprop-notes')
    } else {
      setTitle('Quantum Mechanics & Wave Functions')
      setSubject('Physics')
      setSelectedFileName('Schrodinger_Wave_Equation.png')
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'file' | 'image' | 'link')
    setSelectedFile(null)
    setSelectedFileName(null)
    setUploadError(null)
    setHasFailed(false)
    setFailedStageText(null)
  }

  const handleStartProcessing = async () => {
    const finalTitle = title.trim() || 'Untitled Study Material'
    const finalSubject = subject.trim() || 'General Science'

    if (activeTab === 'file' && !selectedFile) {
      setUploadError('Select a PDF before extracting subtopics.')
      return
    }

    // Reset progress state
    setUploadError(null)
    setHasFailed(false)
    setFailedStageText(null)
    setIsCompleted(false)
    setIsProcessing(true)

    // Stage 1/5: Uploading document
    setCurrentStageIndex(0)
    console.log('[Curriculum] Stage 1/5: Uploading document')

    // Progressive stage transitions while waiting for server response
    const stage2Timer = setTimeout(() => {
      setCurrentStageIndex(1)
      console.log('[Curriculum] Stage 2/5: Reading document')
    }, 1200)

    const stage3Timer = setTimeout(() => {
      setCurrentStageIndex(2)
      console.log('[Curriculum] Stage 3/5: Analyzing curriculum')
    }, 2800)

    try {
      const formData = new FormData()
      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile)
      }
      formData.append('title', finalTitle)
      formData.append('subject', finalSubject)

      const response = await fetch('/api/curriculum/upload', {
        method: 'POST',
        body: formData,
      })

      clearTimeout(stage2Timer)
      clearTimeout(stage3Timer)

      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success || !result.documentId) {
        const errorStage = result.failedStage || (currentStageIndex === 0 ? 'Stage 1/5' : currentStageIndex === 1 ? 'Stage 2/5' : 'Stage 3/5')
        const rawErr = result.error || `Upload failed with status ${response.status}`
        throw { stage: errorStage, message: rawErr }
      }

      // Stage 4/5: Preparing subtopics
      setCurrentStageIndex(3)
      console.log('[Curriculum] Stage 4/5: Preparing subtopics')
      await new Promise((res) => setTimeout(res, 400))

      // Stage 5/5: Saving curriculum
      setCurrentStageIndex(4)
      console.log('[Curriculum] Stage 5/5: Saving curriculum')

      const documentId = result.documentId
      const subtopics: CurriculumSubtopic[] = result.subtopics || []

      // Create study material bundle in context
      const newStudyMaterial: StudyMaterial = {
        id: documentId,
        title: result.title || finalTitle,
        subject: result.subject || finalSubject,
        subjectColor: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
        type: activeTab === 'image' ? 'image' : activeTab === 'link' ? 'link' : 'pdf',
        sourceFileName: selectedFileName || `${finalTitle.replace(/\s+/g, '_')}.pdf`,
        uploadDate: 'Just now',
        estimatedStudyTimeMinutes: Math.ceil(subtopics.length * 2.5),
        progressPercentage: 10,
        overview: result.overview,
        subtopics,
        summaryNotes: {
          title: `${finalTitle} — Key Concept Synthesis`,
          readingTimeMinutes: Math.ceil(subtopics.length * 1.5),
          keyTakeaways: subtopics.map((s) => s.description),
          keyTerms: subtopics.map((s) => ({
            term: s.title,
            definition: s.description,
            importance: 'high' as const,
          })),
          sections: subtopics.map((s, idx) => ({
            heading: `${idx + 1}. ${s.title}`,
            summary: s.description,
            bulletPoints: s.learningObjectives,
            keyTakeaway: s.learningObjectives[0] || 'Core understanding',
          })),
        },
        flashcards: subtopics.map((s) => ({
          id: `fc-${s.id}`,
          topic: s.title,
          question: `What is the core focus of "${s.title}"?`,
          answer: s.description,
          hint: `Think about ${finalSubject}`,
          confidence: 'unrated' as const,
        })),
        quiz: {
          id: `quiz-${documentId}`,
          title: `${finalTitle} Verification Quiz`,
          totalQuestions: subtopics.length,
          passingScore: 60,
          questions: subtopics.map((s) => ({
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
        reel: {
          id: `reel-${documentId}`,
          title: `${finalTitle} Outline Overview`,
          durationSeconds: 45,
          narrationScript: `Welcome to the curriculum outline for ${finalTitle}. Select any subtopic from the outline to generate its custom 8-second microlearning reel.`,
          visualStyle: '3d-infographic',
          chapters: subtopics.map((s, idx) => ({
            id: `c-${s.id}`,
            title: s.title,
            timestampSeconds: idx * 15,
            subtitle: s.description,
          })),
          audioWaveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.95, 0.7, 0.4, 0.6, 0.85, 0.9, 0.75, 0.5, 0.3],
        },
        knowledgeGap: {
          overallMastery: 50,
          weakestArea: subtopics[1]?.title || subtopics[0]?.title || 'Core Concepts',
          strongestArea: subtopics[0]?.title || 'Introduction',
          recommendedStudyOrder: subtopics.map((s) => s.title),
          topics: subtopics.map((s, idx) => ({
            name: s.title,
            masteryPercentage: idx === 0 ? 70 : 40,
            status: idx === 0 ? ('improving' as const) : ('critical-gap' as const),
            questionsAttempted: 2,
            recommendedAction: `Watch the subtopic reel and review objectives.`,
          })),
        },
      }

      addExistingMaterial(newStudyMaterial)

      setIsCompleted(true)
      await new Promise((res) => setTimeout(res, 600))

      setIsProcessing(false)
      setIsOpen(false)
      resetForm()
      toast.success('Curriculum Subtopics Ready!', {
        description: `Identified ${subtopics.length} logical learning subtopics for "${finalTitle}"`,
      })
      router.push(`/study/${documentId}?tab=subtopics`)
    } catch (err: any) {
      clearTimeout(stage2Timer)
      clearTimeout(stage3Timer)

      const failingStage = err?.stage || `Stage ${currentStageIndex + 1}/5`
      const errorMessage =
        err?.message ||
        'Could not connect to the curriculum synthesis service. Please check your connection and retry.'

      console.error(`[Curriculum] FAILED at ${failingStage}: ${errorMessage}`)

      setHasFailed(true)
      setFailedStageText(failingStage)
      setUploadError(errorMessage)
      // Keep isProcessing true so the failure UI with readable error is clearly shown with retry options, preserving form values
      toast.error(`Extraction Failed at ${failingStage}`, {
        description: errorMessage,
      })
    }
  }

  const resetForm = () => {
    setTitle('')
    setSubject('')
    setUrlInput('')
    setSelectedFileName(null)
    setSelectedFile(null)
    setIsProcessing(false)
    setIsCompleted(false)
    setHasFailed(false)
    setFailedStageText(null)
    setCurrentStageIndex(0)
    setUploadError(null)
  }

  const currentStage = STAGES[currentStageIndex] || STAGES[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent
        className="w-[95vw] sm:max-w-[620px] md:max-w-[680px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl font-montserrat tracking-normal text-slate-800"
        style={{ fontFamily: 'var(--font-montserrat), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <div className="p-5 sm:p-6 pb-4 bg-white border-b border-slate-100 shrink-0 font-montserrat">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/80 text-indigo-600 shadow-xs">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold font-montserrat text-slate-900 tracking-tight">
                  Upload & Extract Curriculum Subtopics
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed mt-0.5 font-montserrat">
                  Upload lecture slides, PDFs, or notes. LearnVerse decomposes the curriculum into focused subtopics for on-demand reel generation.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {isProcessing ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 overflow-y-auto flex-1 bg-slate-50/50 font-montserrat">
            {/* Top Icon Badge */}
            <div className="relative">
              {hasFailed ? (
                <div className="w-16 h-16 rounded-2xl border border-rose-200 flex items-center justify-center bg-rose-50 text-rose-600 shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
              ) : isCompleted ? (
                <div className="w-16 h-16 rounded-2xl border border-emerald-200 flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl border border-indigo-100 flex items-center justify-center bg-indigo-50/90 shadow-sm animate-pulse">
                  <BrainCircuit className="w-8 h-8 text-indigo-600 animate-spin-slow" />
                </div>
              )}
            </div>

            {/* Main Progress Card */}
            <div className="space-y-3.5 max-w-lg w-full bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm text-left font-montserrat">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider font-montserrat">
                <span className="flex items-center gap-2 text-slate-800 font-montserrat">
                  {hasFailed ? (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-2.5 py-0.5 font-bold font-montserrat">
                      Failed at {failedStageText || `Stage ${currentStage.stageNumber}/5`}
                    </Badge>
                  ) : isCompleted ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5 font-bold flex items-center gap-1 font-montserrat">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-0.5 font-bold font-montserrat">
                      Stage {currentStage.stageNumber}/5 — {currentStage.name}
                    </Badge>
                  )}
                </span>
                <span className={`font-bold text-sm font-montserrat ${hasFailed ? 'text-rose-600' : isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {hasFailed ? `${currentStage.percent}%` : isCompleted ? '100%' : `${currentStage.percent}%`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasFailed
                      ? 'bg-rose-500'
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`}
                  style={{ width: `${isCompleted ? 100 : currentStage.percent}%` }}
                />
              </div>

              {/* Status / Activity Message */}
              {hasFailed ? (
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-800 space-y-1 font-montserrat">
                  <p className="text-xs font-semibold font-montserrat">Processing Encountered an Error</p>
                  <p className="text-xs text-rose-700 font-montserrat">{uploadError || 'The synthesis pipeline failed. Please retry.'}</p>
                </div>
              ) : isCompleted ? (
                <p className="text-xs font-medium text-emerald-700 pt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Curriculum subtopics extracted successfully! Redirecting...
                </p>
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 font-montserrat">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                  <span className="font-medium font-montserrat truncate">{currentStage.activity}</span>
                </div>
              )}
            </div>

            {/* 5-Stage Numbered Indicator Grid */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-lg text-[11px] font-medium text-slate-700">
              {STAGES.map((s, idx) => {
                const IconComponent = s.icon
                const isStepCompleted = isCompleted || (!hasFailed && idx < currentStageIndex)
                const isStepActive = !hasFailed && !isCompleted && idx === currentStageIndex
                const isStepFailed = hasFailed && idx === currentStageIndex

                return (
                  <div
                    key={s.stageNumber}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isStepFailed
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : isStepCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isStepActive
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    {isStepCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isStepFailed ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <IconComponent className={`w-4 h-4 ${isStepActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    )}
                    <span className="text-[10px] font-semibold leading-tight line-clamp-1">
                      {s.stageNumber}/5 {s.name.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Action Bar when in Failure */}
            {hasFailed && (
              <div className="flex items-center justify-center gap-3 pt-2 w-full max-w-lg font-montserrat">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsProcessing(false)
                    setHasFailed(false)
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-montserrat"
                >
                  Edit Inputs
                </Button>
                <Button
                  type="button"
                  onClick={handleStartProcessing}
                  className="rounded-xl bg-[#17213f] hover:bg-[#25335e] text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm font-montserrat"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Extraction
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white font-montserrat">
            {/* Quick Demo Pre-fill Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-montserrat">
              <span className="text-slate-500 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium font-montserrat">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quick fill sample:
              </span>
              <button
                type="button"
                onClick={() => handleSampleFill('bio')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer font-montserrat"
              >
                CRISPR Bio
              </button>
              <button
                type="button"
                onClick={() => handleSampleFill('cs')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/90 hover:bg-sky-100 hover:border-sky-300 transition-all cursor-pointer font-montserrat"
              >
                Neural Nets
              </button>
              <button
                type="button"
                onClick={() => handleSampleFill('physics')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer font-montserrat"
              >
                Quantum Physics
              </button>
            </div>

            {/* Input Mode Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full font-montserrat">
              <TabsList className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 h-auto font-montserrat">
                <TabsTrigger
                  value="file"
                  className="font-semibold text-xs sm:text-sm py-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 flex items-center justify-center gap-2 cursor-pointer font-montserrat"
                >
                  <FileText className="w-4 h-4 text-indigo-500" /> PDF / Slides
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="font-semibold text-xs sm:text-sm py-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 flex items-center justify-center gap-2 cursor-pointer font-montserrat"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" /> Scanned Notes
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="font-semibold text-xs sm:text-sm py-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 flex items-center justify-center gap-2 cursor-pointer font-montserrat"
                >
                  <LinkIcon className="w-4 h-4 text-sky-500" /> Web Link / Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-3 font-montserrat">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-all cursor-pointer relative bg-slate-50/60 hover:bg-indigo-50/20 group font-montserrat"
                >
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-600 shadow-xs group-hover:text-indigo-600 group-hover:border-indigo-300 group-hover:scale-105 transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    {selectedFileName ? (
                      <div className="space-y-1 bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl w-full max-w-sm mx-auto shadow-2xs">
                        <p className="font-bold text-xs sm:text-sm text-emerald-900 flex items-center justify-center gap-2 truncate font-montserrat">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {selectedFileName}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600 font-montserrat">Click or drop another file to replace</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-xs sm:text-sm text-slate-800 font-montserrat">
                          Drag & drop PDF slides, lecture notes, or textbooks
                        </p>
                        <p className="text-xs text-slate-400 font-normal font-montserrat">Supported: PDF (up to 50MB)</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-indigo-600 shadow-2xs mt-1 font-montserrat">
                          Browse Local PDF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-3 font-montserrat">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-all cursor-pointer relative bg-slate-50/60 hover:bg-indigo-50/20 group font-montserrat"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-600 shadow-xs group-hover:text-indigo-600 group-hover:border-indigo-300 group-hover:scale-105 transition-all">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    {selectedFileName ? (
                      <div className="space-y-1 bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl w-full max-w-sm mx-auto shadow-2xs">
                        <p className="font-bold text-xs sm:text-sm text-emerald-900 flex items-center justify-center gap-2 truncate font-montserrat">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {selectedFileName}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600 font-montserrat">Click or drop another image to replace</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-xs sm:text-sm text-slate-800 font-montserrat">Drop scanned whiteboard or handwritten notes</p>
                        <p className="text-xs text-slate-400 font-normal font-montserrat">High-contrast OCR pipeline turns handwriting into structured notes</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-emerald-600 shadow-2xs mt-1 font-montserrat">
                          Browse Image / Scan
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-3 font-montserrat">
                <div className="space-y-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 font-montserrat">
                  <Label className="text-xs font-bold text-slate-700 font-montserrat">Paste Educational Article, arXiv, or Lecture URL</Label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="https://en.wikipedia.org/wiki/... or https://arxiv.org/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="pl-9 bg-white border-slate-200 rounded-xl text-xs sm:text-sm font-montserrat h-10"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 font-montserrat">
              <div className="space-y-1.5">
                <Label htmlFor="mat-title" className="text-xs font-bold text-slate-700 font-montserrat">
                  Module Title *
                </Label>
                <Input
                  id="mat-title"
                  placeholder="e.g. Cellular Respiration & ATP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-montserrat h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mat-subject" className="text-xs font-bold text-slate-700 font-montserrat">
                  Subject / Course
                </Label>
                <Input
                  id="mat-subject"
                  placeholder="e.g. Biology 101 or Computer Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-montserrat h-10"
                />
              </div>
            </div>

            {/* Deliverables Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs text-slate-700 font-montserrat">
              <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider font-montserrat">Will extract:</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-montserrat flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Subtopics Outline
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs font-montserrat flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Learning Objectives
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs font-montserrat flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> On-Demand Reels
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 shrink-0 border-t border-slate-100 font-montserrat">
              {uploadError && (
                <p role="alert" className="mr-auto max-w-xs sm:max-w-md text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 font-montserrat">
                  {uploadError}
                </p>
              )}
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer font-montserrat shadow-2xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleStartProcessing}
                className="rounded-xl bg-[#17213f] hover:bg-[#25335e] text-white px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg font-montserrat hover:translate-y-[-1px]"
              >
                Extract Subtopics <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
