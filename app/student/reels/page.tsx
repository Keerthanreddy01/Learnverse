'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { useStudy } from '@/lib/context/study-context'
import { ReelRecord, ReelQuestion } from '@/lib/types/roles'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  BookOpen,
  ArrowRight,
  School,
  BrainCircuit,
  Film,
} from 'lucide-react'

export default function StudentReelsFeedPage() {
  const { profile } = useAuth()
  const { materials } = useStudy()

  const studentGrade = profile?.grade || 'Grade 11'
  const studentId = profile?.id || 'student-demo-user'

  const [feedReels, setFeedReels] = useState<ReelRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  // Interactive Question Card State
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [answerExplanation, setAnswerExplanation] = useState<string | null>(null)

  // Social states
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set())
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set())

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Fetch faculty published reels + Combine with AI-generated reels
  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true)
        const res = await fetch('/api/reels?status=published')
        const data = await res.json()
        let publishedFacultyReels: ReelRecord[] = []

        if (data.success && data.reels) {
          publishedFacultyReels = data.reels
        }

        // 1. Sort faculty reels: matching grade first, then others
        const matchingGrade = publishedFacultyReels.filter(
          (r) => !r.grade || r.grade === studentGrade || r.grade === 'All Grades'
        )
        const otherGrade = publishedFacultyReels.filter(
          (r) => r.grade && r.grade !== studentGrade && r.grade !== 'All Grades'
        )

        // 2. Synthesize AI-generated reels from StudyContext materials
        const aiReels: ReelRecord[] = []
        materials.forEach((mat) => {
          if (mat.subtopics) {
            mat.subtopics.forEach((sub) => {
              if (sub.reel && sub.reel.videoUrl) {
                aiReels.push({
                  id: `ai-reel-${sub.id}`,
                  title: sub.title,
                  description: sub.description,
                  video_url: sub.reel.videoUrl,
                  thumbnail_url: null,
                  source_type: 'ai_generated',
                  created_by: studentId,
                  student_id: studentId,
                  grade: studentGrade,
                  subject: mat.subject,
                  chapter: mat.title,
                  topic: sub.title,
                  difficulty: 'medium',
                  language: 'English',
                  duration_seconds: sub.reel.durationSeconds || 15,
                  status: 'published',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  question: {
                    id: `q-ai-${sub.id}`,
                    reel_id: `ai-reel-${sub.id}`,
                    question_text: `Which core takeaway is synthesized in ${sub.title}?`,
                    question_type: 'multiple_choice',
                    options: [
                      'Active synthesis and structured principle decomposition',
                      'Unstructured speculative theory without practical validation',
                      'Passive repetition without testing recall',
                      'Non-contextual vocabulary memorization',
                    ],
                    correct_answer: 'Active synthesis and structured principle decomposition',
                    explanation: 'Microlearning decompiles complex curriculum units into verified, testable principles.',
                    difficulty: 'medium',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                })
              }
            })
          }
        })

        // Combine: Grade match faculty reels -> AI reels -> Other faculty reels
        const combined = [...matchingGrade, ...aiReels, ...otherGrade]
        setFeedReels(combined)
      } catch (err) {
        console.error('Failed to load reels feed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [studentGrade, materials, studentId])

  const currentReel = feedReels[currentIndex]

  // Track video progress and trigger question on reel completion
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        const pct = (video.currentTime / video.duration) * 100
        setVideoProgress(pct)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      // Record completed watch
      if (currentReel) {
        fetch(`/api/reels/${currentReel.id}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            watch_duration_seconds: currentReel.duration_seconds,
            completed: true,
          }),
        }).catch(() => {})
      }

      // If reel has a question, auto-open question card
      if (currentReel?.question) {
        setShowQuestionModal(true)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentReel, studentId])

  // Reset states on reel switch
  useEffect(() => {
    setIsPlaying(true)
    setVideoProgress(0)
    setShowQuestionModal(false)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setIsAnswerCorrect(null)
    setAnswerExplanation(null)

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex])

  const handleNextReel = () => {
    if (currentIndex < feedReels.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      toast.info('You have reached the end of your reels feed!')
    }
  }

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleToggleMute = () => {
    if (!videoRef.current) return
    const next = !isMuted
    videoRef.current.muted = next
    setIsMuted(next)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentReel?.question) return

    try {
      const res = await fetch(`/api/reels/${currentReel.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          question_id: currentReel.question.id,
          selected_answer: selectedOption,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setAnswerSubmitted(true)
        setIsAnswerCorrect(data.isCorrect)
        setAnswerExplanation(data.explanation)

        if (data.isCorrect) {
          toast.success('Correct! Micro-concept locked in memory.', { icon: '🎯' })
        } else {
          toast.error('Incorrect — review the concept explanation', { icon: '💡' })
        }
      }
    } catch {
      toast.error('Failed to submit answer')
    }
  }

  const toggleLike = (id: string) => {
    const next = new Set(likedReels)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setLikedReels(next)
  }

  const toggleSave = (id: string) => {
    const next = new Set(savedReels)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSavedReels(next)
    toast.success(next.has(id) ? 'Reel saved to library' : 'Reel removed from saved')
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col justify-between selection:bg-cyan-500/30">
      <Header />

      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 pt-20 pb-8">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-muted-foreground space-y-3">
            <Film className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <p>Curating your personalized curriculum reels…</p>
          </div>
        ) : !currentReel ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card max-w-md font-mono text-xs space-y-3">
            <Film className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="font-montserrat font-bold text-foreground text-sm">No reels currently available</h3>
            <p className="text-muted-foreground">Upload a curriculum PDF to generate AI micro-reels, or check back once faculty publish new content.</p>
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground font-mono text-xs mt-2">
                Go to Study Deck
              </Button>
            </Link>
          </div>
        ) : (
          <div className="relative w-full max-w-[420px] h-[82vh] max-h-[820px] rounded-2xl overflow-hidden bg-zinc-950 border border-border shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between">
            {/* Background Video Player */}
            <div className="absolute inset-0 z-0 bg-black cursor-pointer" onClick={handleTogglePlay}>
              <video
                ref={videoRef}
                src={currentReel.video_url}
                playsInline
                autoPlay
                muted={isMuted}
                loop={false}
                className="w-full h-full object-cover"
              />

              {/* Play / Pause Tap Overlay Indicator */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Gradient overlays for readability */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Top Navigation & Info Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between pointer-events-auto">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`font-mono text-[10px] ${
                    currentReel.source_type === 'faculty'
                      ? 'border-purple-500/50 text-purple-300 bg-purple-950/60'
                      : 'border-cyan-500/50 text-cyan-300 bg-cyan-950/60'
                  }`}
                >
                  {currentReel.source_type === 'faculty' ? 'Faculty Verified' : 'Personalized AI Reel'}
                </Badge>

                <Badge variant="outline" className="font-mono text-[10px] border-white/20 text-white/80 bg-black/40">
                  {currentReel.subject}
                </Badge>

                {currentReel.grade && (
                  <span className="font-mono text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    {currentReel.grade}
                  </span>
                )}
              </div>

              {/* Mute Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Action Sidebar */}
            <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 pointer-events-auto">
              {/* Like */}
              <button
                type="button"
                onClick={() => toggleLike(currentReel.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                    likedReels.has(currentReel.id)
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                      : 'bg-black/60 border-white/20 text-white group-hover:scale-105'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${likedReels.has(currentReel.id) ? 'fill-rose-500' : ''}`} />
                </div>
                <span className="font-mono text-[10px] text-white/80">
                  {likedReels.has(currentReel.id) ? '121' : '120'}
                </span>
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={() => toggleSave(currentReel.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                    savedReels.has(currentReel.id)
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-black/60 border-white/20 text-white group-hover:scale-105'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${savedReels.has(currentReel.id) ? 'fill-primary' : ''}`} />
                </div>
                <span className="font-mono text-[10px] text-white/80">Save</span>
              </button>

              {/* Diagnostic Question Trigger */}
              {currentReel.question && (
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(true)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                  title="Answer reel diagnostic question"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 flex items-center justify-center animate-pulse group-hover:scale-105">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] text-amber-300 font-bold">Quiz</span>
                </button>
              )}

              {/* Study Deck Jump */}
              <Link href="/dashboard" title="Open full study deck">
                <div className="w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] text-white/80 block text-center mt-1">Study</span>
              </Link>
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 p-4 space-y-2 pointer-events-auto">
              <div className="pr-16 space-y-1">
                <span className="font-mono text-[11px] text-cyan-400 font-semibold block">
                  {currentReel.topic}
                </span>
                <h2 className="font-montserrat font-bold text-base text-white tracking-tight leading-snug">
                  {currentReel.title}
                </h2>
                {currentReel.description && (
                  <p className="font-mono text-[11px] text-white/75 line-clamp-2">
                    {currentReel.description}
                  </p>
                )}
              </div>

              {/* Reel Progress Bar */}
              <div className="pt-2">
                <Progress value={videoProgress} className="h-1 bg-white/20" />
              </div>

              {/* Reel Pagination Arrows */}
              <div className="flex items-center justify-between text-[11px] font-mono text-white/70 pt-1">
                <span>Reel {currentIndex + 1} of {feedReels.length}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrevReel}
                    className="p-1 rounded bg-black/50 border border-white/10 hover:border-white/30 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentIndex === feedReels.length - 1}
                    onClick={handleNextReel}
                    className="p-1 rounded bg-black/50 border border-white/10 hover:border-white/30 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* INTERACTIVE QUESTION CARD POPUP OVERLAY */}
            {/* ======================================================== */}
            {showQuestionModal && currentReel.question && (
              <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-5 flex flex-col justify-between font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <HelpCircle className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        Comprehension Check
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionModal(false)}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="font-montserrat font-bold text-sm sm:text-base text-white leading-snug">
                    {currentReel.question.question_text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {currentReel.question.options.map((opt, i) => {
                      const isSelected = selectedOption === opt
                      let optClass = 'border-white/15 bg-white/5 text-white/80 hover:border-white/30'

                      if (answerSubmitted) {
                        if (opt === currentReel.question?.correct_answer) {
                          optClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                        } else if (isSelected) {
                          optClass = 'border-rose-500 bg-rose-500/20 text-rose-300'
                        } else {
                          optClass = 'border-white/10 bg-black/40 text-white/40'
                        }
                      } else if (isSelected) {
                        optClass = 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-semibold'
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={answerSubmitted}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${optClass}`}
                        >
                          <span className="text-xs leading-tight">{opt}</span>
                          {answerSubmitted && opt === currentReel.question?.correct_answer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                          )}
                          {answerSubmitted && isSelected && !isAnswerCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Explanation feedback block */}
                  {answerSubmitted && (
                    <div
                      className={`p-3 rounded-xl border space-y-1.5 ${
                        isAnswerCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-rose-500/30 bg-rose-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {isAnswerCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Concept Clarification:
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed italic">
                        {answerExplanation || currentReel.question.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Question Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {!answerSubmitted ? (
                    <Button
                      disabled={!selectedOption}
                      onClick={handleSubmitAnswer}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono text-xs font-bold py-5 rounded-xl cursor-pointer"
                    >
                      Verify Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowQuestionModal(false)
                        handleNextReel()
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-bold py-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Next Reel <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
