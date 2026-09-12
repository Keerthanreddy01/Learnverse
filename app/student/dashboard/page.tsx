'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import StatsOverview from '@/components/dashboard/stats-overview'
import KnowledgeGapWidget from '@/components/dashboard/knowledge-gap-widget'
import MaterialUploadModal from '@/components/upload/material-upload-modal'
import { useStudy } from '@/lib/context/study-context'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Search,
  BookOpen,
  Layers,
  HelpCircle,
  Video,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  BrainCircuit,
  Film,
  GraduationCap,
} from 'lucide-react'

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate']

export default function StudentDashboardPage() {
  const { materials } = useStudy()
  const { profile, updateProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  const currentGrade = profile?.grade || 'Grade 11'

  const subjects = ['all', ...Array.from(new Set(materials.map((m) => m.subject)))]

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || mat.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="learn-home min-h-screen bg-[#f7f6f1] text-[#17213f] flex flex-col justify-between">
      <Header />

      <main className="max-w-[1240px] mx-auto px-4 md:px-6 pt-24 pb-16 space-y-8 flex-1">
        {/* Top Header Banner with Student Grade Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2rem] border-2 border-[#17213f] bg-[#fff4bd] shadow-[6px_6px_0_#17213f]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] px-3 py-1 text-xs font-black shadow-[2px_2px_0_#17213f] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4938d4]" /> Student Study Deck
              </span>

              {/* Grade Selector Pill */}
              <div className="flex items-center gap-1.5 pl-2">
                <GraduationCap className="w-4 h-4 text-[#4938d4]" />
                <select
                  value={currentGrade}
                  onChange={(e) => updateProfile({ grade: e.target.value })}
                  className="bg-white border-2 border-[#17213f] text-[#17213f] font-black text-xs rounded-full px-3 py-1 shadow-[2px_2px_0_#17213f] focus:outline-none cursor-pointer"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-montserrat tracking-tight text-[#17213f]">
              Welcome back, {profile?.full_name || 'Alex Rivera'}!
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#59627c] max-w-xl">
              Review synthesized curriculum decks, isolate knowledge gaps, and watch grade-matched faculty micro-reels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/student/reels">
              <Button
                variant="outline"
                className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] hover:bg-[#d7ff78] text-[#17213f] font-black text-xs px-5 py-5 flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all"
              >
                <Film className="w-4 h-4" /> Watch Reels Feed
              </Button>
            </Link>

            <MaterialUploadModal>
              <Button className="rounded-full border-2 border-[#17213f] bg-[#4938d4] hover:bg-[#3727bd] text-white font-black text-xs px-5 py-5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer shadow-[3px_3px_0_#17213f]">
                <PlusCircle className="w-4 h-4" /> Upload Material
              </Button>
            </MaterialUploadModal>
          </div>
        </div>

        {/* High-Level Stats Overview */}
        <StatsOverview />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Materials Section (2 Cols on Large) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Subject Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#59627c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search materials by title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-2 border-[#17213f] rounded-xl text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f]"
                />
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-full font-black text-xs transition-all cursor-pointer capitalize whitespace-nowrap border-2 border-[#17213f] ${
                      selectedSubject === sub
                        ? 'bg-[#4938d4] text-white shadow-[2px_2px_0_#17213f]'
                        : 'bg-white text-[#17213f] hover:bg-[#fff4bd]'
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
                <div className="p-12 text-center rounded-[2rem] border-2 border-dashed border-[#17213f] bg-white space-y-3">
                  <BrainCircuit className="w-10 h-10 text-[#59627c] mx-auto" />
                  <h3 className="font-montserrat font-black text-[#17213f] text-sm">No study materials match your search</h3>
                  <p className="text-xs font-bold text-[#59627c]">Upload a new PDF to synthesize notes, cards, and micro-reels.</p>
                  <MaterialUploadModal>
                    <Button variant="outline" size="sm" className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] text-[#17213f] font-black text-xs mt-2 shadow-[2px_2px_0_#17213f]">
                      Upload New Material
                    </Button>
                  </MaterialUploadModal>
                </div>
              ) : (
                filteredMaterials.map((mat, idx) => {
                  const masteredCount = mat.flashcards.filter(
                    (c) => c.confidence === 'mastered' || c.confidence === 'easy'
                  ).length

                  return (
                    <div
                      key={mat.id ? `${mat.id}-${idx}` : `mat-${idx}`}
                      className="rounded-[1.8rem] border-2 border-[#17213f] bg-white p-5 space-y-4 shadow-[4px_4px_0_#17213f] hover:shadow-[6px_6px_0_#17213f] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border-2 border-[#17213f] bg-[#9be8ff] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#17213f]">
                              {mat.subject}
                            </span>
                            <span className="text-[11px] font-bold text-[#59627c] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#4938d4]" />
                              {mat.sourceFileName || `${mat.type.toUpperCase()} Source`}
                            </span>
                          </div>

                          <Link href={`/study/${mat.id}`}>
                            <h3 className="font-montserrat font-black text-base md:text-lg text-[#17213f] hover:text-[#4938d4] transition-colors cursor-pointer">
                              {mat.title}
                            </h3>
                          </Link>
                        </div>

                        <Link href={`/study/${mat.id}`}>
                          <Button
                            size="sm"
                            className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] hover:bg-[#d7ff78] text-[#17213f] font-black text-xs px-4 shadow-[2px_2px_0_#17213f] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                          >
                            Study Deck <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#59627c]">
                          <span>Mastery Progress</span>
                          <span className="text-[#17213f] font-black">{mat.progressPercentage}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full border-2 border-[#17213f] bg-[#e5e7ef]">
                          <div
                            className="h-full bg-[#4938d4]"
                            style={{ width: `${mat.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Modality Quick Jumps */}
                      <div className="pt-3 border-t-2 border-[#17213f]/10 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#59627c]">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/study/${mat.id}?tab=notes`}>
                            <span className="px-2.5 py-1 rounded-full bg-[#f7f6f1] hover:bg-[#fff4bd] text-[#17213f] border-2 border-[#17213f] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                              <BookOpen className="w-3 h-3 text-[#17213f]" /> Notes
                            </span>
                          </Link>
                          <Link href={`/study/${mat.id}?tab=flashcards`}>
                            <span className="px-2.5 py-1 rounded-full bg-[#f7f6f1] hover:bg-[#fff4bd] text-[#17213f] border-2 border-[#17213f] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                              <Layers className="w-3 h-3 text-[#17213f]" /> {mat.flashcards.length} Cards ({masteredCount} Mastered)
                            </span>
                          </Link>
                          <Link href={`/study/${mat.id}?tab=quiz`}>
                            <span className="px-2.5 py-1 rounded-full bg-[#f7f6f1] hover:bg-[#fff4bd] text-[#17213f] border-2 border-[#17213f] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                              <HelpCircle className="w-3 h-3 text-[#17213f]" /> {mat.quiz.questions.length} Q Quiz
                            </span>
                          </Link>
                          <Link href={`/study/${mat.id}?tab=reel`}>
                            <span className="px-2.5 py-1 rounded-full bg-[#f7f6f1] hover:bg-[#fff4bd] text-[#17213f] border-2 border-[#17213f] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                              <Video className="w-3 h-3 text-[#17213f]" /> AI Reel
                            </span>
                          </Link>
                        </div>

                        <span className="text-[11px] font-bold text-[#59627c] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {mat.estimatedStudyTimeMinutes} min session
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Sidebar: Knowledge Gaps & Featured Reels */}
          <div className="space-y-6">
            <KnowledgeGapWidget />

            {/* Micro-Reels Teaser Card in Lime */}
            <div className="rounded-[2rem] border-2 border-[#17213f] bg-[#c9ff4d] p-6 shadow-[5px_5px_0_#17213f] space-y-3">
              <div className="flex items-center gap-2 text-[#17213f]">
                <Film className="w-4 h-4 text-[#4938d4]" />
                <h4 className="font-montserrat font-black text-sm text-[#17213f]">Curriculum Reels Feed</h4>
              </div>
              <p className="text-xs font-bold text-[#17213f]/80 leading-relaxed">
                Watch 15-second visual microlearning reels uploaded by faculty and matched to your enrolled grade.
              </p>
              <Link href="/student/reels">
                <Button className="w-full rounded-full border-2 border-[#17213f] bg-[#17213f] hover:bg-[#3727bd] text-white text-xs font-black py-4 shadow-[3px_3px_0_#17213f] cursor-pointer">
                  Open Reels Player
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching landing page */}
      <footer className="border-t-2 border-[#17213f] bg-[#c9ff4d] px-5 py-8 md:px-8 text-[#17213f]">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="font-montserrat text-lg font-black tracking-tight">LEARNVERSE</div>
            <p className="text-xs font-bold text-[#17213f]/80">Big ideas. Tiny steps.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-bold">
            <Link href="/student/dashboard" className="hover:underline">Study Deck</Link>
            <Link href="/student/reels" className="hover:underline">Reels Feed</Link>
            <Link href="/student/progress" className="hover:underline">Progress</Link>
          </div>
          <span className="text-xs font-bold">© 2026 LearnVerse</span>
        </div>
      </footer>
    </div>
  )
}
