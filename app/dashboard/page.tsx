'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import StatsOverview from '@/components/dashboard/stats-overview'
import KnowledgeGapWidget from '@/components/dashboard/knowledge-gap-widget'
import MaterialUploadModal from '@/components/upload/material-upload-modal'
import { useStudy } from '@/lib/context/study-context'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Search,
  BookOpen,
  Layers,
  HelpCircle,
  Video,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  BrainCircuit,
  Film,
  School,
} from 'lucide-react'

export default function DashboardPage() {
  const { materials } = useStudy()
  const { profile } = useAuth()
  const isFaculty = profile?.role === 'faculty'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  const subjects = ['all', ...Array.from(new Set(materials.map((m) => m.subject)))]

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || mat.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-24 pb-16 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold font-montserrat tracking-tight text-foreground">
                Study Command Center
              </h1>
              <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px] bg-primary/10">
                Adaptive v1.0
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Review synthesized lecture decks, isolate knowledge gaps, and practice active recall.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isFaculty ? (
              <Link href="/faculty/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold rounded-full px-4 py-5 flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <School className="w-4 h-4" /> Faculty Studio CMS
                </Button>
              </Link>
            ) : (
              <Link href="/student/reels">
                <Button
                  variant="outline"
                  className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs rounded-full px-4 py-5 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Film className="w-4 h-4" /> Watch Reels Feed
                </Button>
              </Link>
            )}

            <MaterialUploadModal>
              <Button className="bg-primary text-primary-foreground font-mono text-xs font-semibold rounded-full px-5 py-5 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all flex items-center gap-2 cursor-pointer">
                <PlusCircle className="w-4 h-4" /> Upload Material
              </Button>
            </MaterialUploadModal>
          </div>
        </div>

        {/* High-Level Stats Overview */}
        <StatsOverview />

        {/* Main Content Layout: Materials Grid + Sidebar Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Materials Section (2 Cols on Large) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Subject Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search materials by title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border font-mono text-xs"
                />
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer capitalize whitespace-nowrap ${
                      selectedSubject === sub
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials List */}
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
                  <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto" />
                  <h3 className="font-montserrat font-bold text-foreground text-sm">No study materials match your search</h3>
                  <p className="font-mono text-xs text-muted-foreground">Try clearing your filters or synthesize a new PDF/note.</p>
                  <MaterialUploadModal>
                    <Button variant="outline" size="sm" className="font-mono text-xs border-border mt-2">
                      Upload New Material
                    </Button>
                  </MaterialUploadModal>
                </div>
              ) : (
                filteredMaterials.map((mat) => {
                  const masteredCount = mat.flashcards.filter(
                    (c) => c.confidence === 'mastered' || c.confidence === 'easy'
                  ).length

                  return (
                    <Card
                      key={mat.id}
                      className="bg-card border-border hover:border-primary/50 transition-all duration-200 group overflow-hidden"
                    >
                      <CardContent className="p-5 space-y-4">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`font-mono text-[10px] ${mat.subjectColor}`}>
                                {mat.subject}
                              </Badge>
                              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                {mat.type === 'pdf' ? (
                                  <FileText className="w-3 h-3 text-primary" />
                                ) : mat.type === 'image' ? (
                                  <ImageIcon className="w-3 h-3 text-amber-400" />
                                ) : (
                                  <LinkIcon className="w-3 h-3 text-cyan-400" />
                                )}
                                {mat.sourceFileName || mat.sourceUrl || `${mat.type.toUpperCase()} Source`}
                              </span>
                            </div>

                            <Link href={`/study/${mat.id}`}>
                              <h3 className="font-montserrat font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer">
                                {mat.title}
                              </h3>
                            </Link>
                          </div>

                          <Link href={`/study/${mat.id}`}>
                            <Button
                              size="sm"
                              className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 font-mono text-xs font-semibold rounded-full px-4 transition-all whitespace-nowrap"
                            >
                              Study Deck <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>

                        {/* Progress Bar & Sub-stats */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Mastery Progress</span>
                            <span className="text-foreground font-semibold">{mat.progressPercentage}%</span>
                          </div>
                          <Progress value={mat.progressPercentage} className="h-2 bg-muted" />
                        </div>

                        {/* Microlearning Quick Jump Modality Buttons */}
                        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/study/${mat.id}?tab=notes`}>
                              <span className="px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted text-foreground/80 hover:text-primary border border-border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                                <BookOpen className="w-3 h-3 text-emerald-400" /> Notes
                              </span>
                            </Link>
                            <Link href={`/study/${mat.id}?tab=flashcards`}>
                              <span className="px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted text-foreground/80 hover:text-primary border border-border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                                <Layers className="w-3 h-3 text-cyan-400" /> {mat.flashcards.length} Cards ({masteredCount} Mastered)
                              </span>
                            </Link>
                            <Link href={`/study/${mat.id}?tab=quiz`}>
                              <span className="px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted text-foreground/80 hover:text-primary border border-border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                                <HelpCircle className="w-3 h-3 text-amber-400" /> {mat.quiz.questions.length} Q Quiz
                              </span>
                            </Link>
                            <Link href={`/study/${mat.id}?tab=reel`}>
                              <span className="px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted text-foreground/80 hover:text-primary border border-border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                                <Video className="w-3 h-3 text-purple-400" /> 8s Reel
                              </span>
                            </Link>
                          </div>

                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {mat.estimatedStudyTimeMinutes} min session
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Sidebar: Knowledge Gaps & Study Tips */}
          <div className="space-y-6">
            <KnowledgeGapWidget />

            {/* Microlearning Habits Card */}
            <Card className="bg-card/70 border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-montserrat font-bold text-sm text-foreground">Adaptive Study Tip</h4>
              </div>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                Reviewing 5 flashcards right before taking the quiz strengthens neural pathways by forcing active recall under varying context cues.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
