'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import SubtopicsTab from '@/components/study/subtopics-tab'
import NotesTab from '@/components/study/notes-tab'
import FlashcardsTab from '@/components/study/flashcards-tab'
import QuizTab from '@/components/study/quiz-tab'
import ReelTab from '@/components/study/reel-tab'
import KnowledgeGapTab from '@/components/study/knowledge-gap-tab'
import MaterialUploadModal from '@/components/upload/material-upload-modal'
import { useStudy } from '@/lib/context/study-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CurriculumSubtopic } from '@/lib/types/learnverse'
import {
  ArrowLeft,
  BookOpen,
  Layers,
  HelpCircle,
  Video,
  TrendingUp,
  Clock,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  PlusCircle,
  ListTree,
  AlertCircle,
  Upload,
  Loader2,
} from 'lucide-react'
import { INITIAL_STUDY_MATERIALS } from '@/lib/mock-data'

const BUILT_IN_MATERIAL_IDS = new Set(INITIAL_STUDY_MATERIALS.map((m) => m.id))

export default function StudyHubPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getMaterialById, materials, updateMaterialSubtopics, addExistingMaterial, removeMaterial } = useStudy()

  const materialId = (params?.id as string) || 'bio-101'
  const isBuiltIn = BUILT_IN_MATERIAL_IDS.has(materialId)
  
  const [loadingDoc, setLoadingDoc] = useState<boolean>(!isBuiltIn)
  const [docNotFound, setDocNotFound] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'subtopics')
  const [selectedSubtopic, setSelectedSubtopic] = useState<CurriculumSubtopic | null>(null)

  // Validate dynamic documents against the backend/Supabase
  useEffect(() => {
    let isMounted = true

    if (isBuiltIn) {
      setLoadingDoc(false)
      setDocNotFound(false)
      return
    }

    async function verifyDocument() {
      setLoadingDoc(true)
      try {
        const res = await fetch(`/api/curriculum/${materialId}`)
        if (!isMounted) return

        if (!res.ok) {
          // Document does not exist on backend / Supabase
          setDocNotFound(true)
          removeMaterial(materialId)
          setLoadingDoc(false)
          return
        }

        const data = await res.json()
        if (!isMounted) return

        if (data.studyMaterial) {
          addExistingMaterial(data.studyMaterial)
          setDocNotFound(false)
        } else if (!data.document) {
          setDocNotFound(true)
          removeMaterial(materialId)
        }
      } catch {
        if (isMounted) {
          // If fetch fails and we don't have local material, show not found
          const local = getMaterialById(materialId)
          if (!local) {
            setDocNotFound(true)
          }
        }
      } finally {
        if (isMounted) {
          setLoadingDoc(false)
        }
      }
    }

    verifyDocument()

    return () => {
      isMounted = false
    }
  }, [materialId, isBuiltIn])

  const material = getMaterialById(materialId) || (isBuiltIn ? INITIAL_STUDY_MATERIALS.find((m) => m.id === materialId) : undefined)

  const hasSubtopics = Boolean(material?.subtopics && material.subtopics.length > 0)
  const defaultTab = hasSubtopics ? 'subtopics' : 'notes'

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['subtopics', 'notes', 'flashcards', 'quiz', 'reel', 'gap'].includes(tabParam)) {
      setActiveTab(tabParam)
    } else if (!tabParam) {
      setActiveTab(defaultTab)
    }
  }, [searchParams, defaultTab])

  // Select initial subtopic if available
  useEffect(() => {
    if (material?.subtopics && material.subtopics.length > 0 && !selectedSubtopic) {
      const readySub = material.subtopics.find((s) => s.reelStatus === 'ready' && s.reel)
      setSelectedSubtopic(readySub || material.subtopics[0])
    }
  }, [material, selectedSubtopic])

  const handleTabChange = (val: string) => {
    if (!material) return
    setActiveTab(val)
    router.replace(`/study/${material.id}?tab=${val}`, { scroll: false })
  }

  const handleSelectSubtopicReel = (subtopic: CurriculumSubtopic) => {
    setSelectedSubtopic(subtopic)
    handleTabChange('reel')
  }

  const handleSubtopicsUpdated = (updatedSubtopics: CurriculumSubtopic[]) => {
    if (!material) return
    updateMaterialSubtopics(material.id, updatedSubtopics)
  }

  // Loading state while verifying document
  if (loadingDoc) {
    return (
      <div className="learn-study w-full min-h-screen flex flex-col justify-between">
        <div>
          <Header />
          <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-16 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4 max-w-md p-8 rounded-2xl bg-card border border-border shadow-lg animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold font-montserrat text-foreground">
                  Loading Curriculum Deck
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Verifying subtopics and active generation status...
                </p>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  // Document not found / stale document state
  if (docNotFound || !material) {
    return (
      <div className="learn-study w-full min-h-screen flex flex-col justify-between">
        <div>
          <Header />
          <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-16 flex flex-col items-center justify-center min-h-[65vh]">
            <div className="text-center space-y-6 max-w-lg p-8 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto text-destructive shadow-sm">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold font-montserrat text-foreground">
                  Document No Longer Exists
                </h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Curriculum document with ID <span className="text-foreground font-semibold">"{materialId}"</span> was not found in the database. Please upload the PDF again to extract subtopics and generate video reels.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <MaterialUploadModal>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs gap-2 cursor-pointer shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    Upload PDF Again
                  </Button>
                </MaterialUploadModal>

                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto font-mono text-xs gap-2 cursor-pointer border-border hover:bg-muted">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  const activeReel = selectedSubtopic?.reel || material.reel

  return (
    <div className="learn-study w-full min-h-screen flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-20 pb-16 space-y-6">
          {/* Breadcrumbs & Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Quick Switcher Between Materials */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                Active Deck:
              </span>
              {materials.map((m) => (
                <Link key={m.id} href={`/study/${m.id}?tab=${activeTab}`}>
                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                      m.id === material.id
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m.title.length > 22 ? `${m.title.substring(0, 20)}...` : m.title}
                  </button>
                </Link>
              ))}

              <MaterialUploadModal>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-card border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-3 h-3" /> New
                </button>
              </MaterialUploadModal>
            </div>
          </div>

          {/* Module Banner Card */}
          <div className="learn-study-banner p-6 rounded-2xl border space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`font-sans font-bold text-xs ${material.subjectColor}`}>
                    {material.subject}
                  </Badge>
                  <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                    {material.type === 'pdf' ? (
                      <FileText className="w-3.5 h-3.5 text-primary" />
                    ) : material.type === 'image' ? (
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    {material.sourceFileName || material.sourceUrl || 'Microlearning Module'}
                  </span>
                  <span className="text-xs font-sans text-muted-foreground">• {material.uploadDate}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold font-montserrat text-foreground tracking-tight">
                  {material.title}
                </h1>

                {material.overview && (
                  <p className="font-sans text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {material.overview}
                  </p>
                )}
              </div>

              {/* Estimated study time & Mastery badge */}
              <div className="learn-study-stat flex items-center gap-3 p-3 rounded-xl border self-start">
                <div className="text-right font-sans">
                  <span className="text-[10px] text-muted-foreground block font-medium">Session Duration</span>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-primary" /> {material.estimatedStudyTimeMinutes} min
                  </span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-right font-sans">
                  <span className="text-[10px] text-muted-foreground block font-medium">Mastery Score</span>
                  <span className="text-xs font-bold text-primary">
                    {material.knowledgeGap.overallMastery}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-sans font-medium text-muted-foreground">
                <span>Microlearning Mastery Progress</span>
                <span className="text-foreground font-bold">{material.progressPercentage}%</span>
              </div>
              <Progress value={material.progressPercentage} className="h-2 bg-muted" />
            </div>
          </div>

          {/* Core Microlearning Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
            <TabsList className="learn-study-tabs w-full grid grid-cols-6 p-1.5 border rounded-xl h-auto">
              <TabsTrigger
                value="subtopics"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Subtopics</span> Outline
              </TabsTrigger>

              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Summary</span> Notes
              </TabsTrigger>

              <TabsTrigger
                value="flashcards"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D</span> Flashcards ({material.flashcards.length})
              </TabsTrigger>

              <TabsTrigger
                value="quiz"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verification</span> Quiz
              </TabsTrigger>

              <TabsTrigger
                value="reel"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">8s</span> Reel
              </TabsTrigger>

              <TabsTrigger
                value="gap"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-sans font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Knowledge</span> Gap
              </TabsTrigger>
            </TabsList>

            {/* Tab 0: Subtopics Outline */}
            <TabsContent value="subtopics" className="space-y-4 focus-visible:outline-none">
              <SubtopicsTab
                documentId={material.id}
                documentTitle={material.title}
                subject={material.subject}
                overview={material.overview}
                subtopics={material.subtopics || []}
                onSelectSubtopicReel={handleSelectSubtopicReel}
                onSubtopicUpdated={handleSubtopicsUpdated}
              />
            </TabsContent>

            {/* Tab 1: Summary Notes */}
            <TabsContent value="notes" className="space-y-4 focus-visible:outline-none">
              <NotesTab notes={material.summaryNotes} subject={material.subject} />
            </TabsContent>

            {/* Tab 2: 3D Flashcards */}
            <TabsContent value="flashcards" className="space-y-4 focus-visible:outline-none">
              <FlashcardsTab materialId={material.id} flashcards={material.flashcards} />
            </TabsContent>

            {/* Tab 3: Interactive Quiz */}
            <TabsContent value="quiz" className="space-y-4 focus-visible:outline-none">
              <QuizTab materialId={material.id} quiz={material.quiz} />
            </TabsContent>

            {/* Tab 4: Narrated Video Reel */}
            <TabsContent value="reel" className="space-y-4 focus-visible:outline-none">
              <ReelTab
                reel={activeReel}
                title={material.title}
                subtopicTitle={selectedSubtopic?.title}
                learningObjectives={selectedSubtopic?.learningObjectives}
                onBackToOutline={() => handleTabChange('subtopics')}
              />
            </TabsContent>

            {/* Tab 5: Adaptive Knowledge Gap */}
            <TabsContent value="gap" className="space-y-4 focus-visible:outline-none">
              <KnowledgeGapTab
                knowledgeGap={material.knowledgeGap}
                title={material.title}
                onSwitchTab={(tab) => handleTabChange(tab)}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Footer />
    </div>
  )
}
