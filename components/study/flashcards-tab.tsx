'use client'

import React, { useState, useEffect } from 'react'
import { Flashcard } from '@/lib/types/learnverse'
import { useStudy } from '@/lib/context/study-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  Lightbulb,
} from 'lucide-react'

interface FlashcardsTabProps {
  materialId: string
  flashcards: Flashcard[]
}

export default function FlashcardsTab({ materialId, flashcards }: FlashcardsTabProps) {
  const { updateFlashcardConfidence } = useStudy()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentCard = flashcards[currentIndex]
  const totalCards = flashcards.length
  const progress = Math.round(((currentIndex + 1) / totalCards) * 100)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((prev) => !prev)
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalCards])

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
      setShowHint(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsFlipped(false)
      setShowHint(false)
      setIsCompleted(false)
    }
  }

  const handleRate = (confidence: 'hard' | 'medium' | 'easy' | 'mastered') => {
    updateFlashcardConfidence(materialId, currentCard.id, confidence)
    if (confidence === 'mastered' || confidence === 'easy') {
      toast.success('Card marked as mastered!', { duration: 1500 })
    }
    handleNext()
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowHint(false)
    setIsCompleted(false)
  }

  if (isCompleted) {
    const masteredCount = flashcards.filter(
      (c) => c.confidence === 'mastered' || c.confidence === 'easy'
    ).length

    return (
      <Card className="bg-card border-border max-w-xl mx-auto text-center p-8 space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto animate-bounce">
          <Award className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-montserrat text-foreground">Deck Review Complete!</h2>
          <p className="font-mono text-xs text-muted-foreground">
            You reviewed all {totalCards} flashcards in this microlearning deck.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-around font-mono text-xs">
          <div>
            <span className="text-muted-foreground block">Total Cards</span>
            <span className="text-lg font-bold text-foreground">{totalCards}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Mastered</span>
            <span className="text-lg font-bold text-primary">{masteredCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Retention Score</span>
            <span className="text-lg font-bold text-cyan-400">
              {Math.round((masteredCount / totalCards) * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={handleRestart}
            className="bg-primary text-primary-foreground font-mono text-xs font-semibold px-6 hover:scale-105 transition-transform"
          >
            <RotateCw className="w-4 h-4 mr-2" /> Practice Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Deck Info */}
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-primary" />
          Card <strong className="text-foreground">{currentIndex + 1}</strong> of {totalCards}
        </span>
        <Badge variant="outline" className="border-border text-foreground font-mono text-[10px]">
          {currentCard.topic}
        </Badge>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Space to flip • ← → to navigate
        </span>
      </div>

      <Progress value={progress} className="h-1.5 bg-muted" />

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-[340px] [perspective:1000px] cursor-pointer select-none"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-2xl border ${
            isFlipped
              ? 'border-primary/50 shadow-[0_0_25px_hsl(var(--primary)/0.15)] [transform:rotateY(180deg)]'
              : 'border-border bg-card shadow-lg'
          }`}
        >
          {/* FRONT SIDE (Question) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 flex flex-col justify-between rounded-2xl bg-card">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-mono text-[10px]">
                QUESTION
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Click to flip
              </span>
            </div>

            <div className="space-y-4 my-auto">
              <h3 className="text-lg md:text-xl font-bold font-montserrat text-foreground text-center leading-relaxed">
                {currentCard.question}
              </h3>

              {showHint && currentCard.hint && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs font-mono text-primary flex items-center gap-2 max-w-md mx-auto">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>{currentCard.hint}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              {currentCard.hint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowHint((prev) => !prev)
                  }}
                  className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> {showHint ? 'Hide hint' : 'Show hint'}
                </button>
              ) : (
                <span />
              )}
              <span className="text-[11px]">Active Recall Mode</span>
            </div>
          </div>

          {/* BACK SIDE (Answer) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 flex flex-col justify-between rounded-2xl bg-card border-primary/20">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-[10px]">
                ANSWER & SYNTHESIS
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Click to flip back
              </span>
            </div>

            <div className="my-auto space-y-3">
              <p className="text-base md:text-lg font-mono text-foreground text-center leading-relaxed font-medium">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs font-mono text-muted-foreground">
              Rate your confidence below to schedule spaced repetition
            </div>
          </div>
        </div>
      </div>

      {/* Mastery Rating Buttons */}
      <div className="space-y-3">
        <p className="text-center font-mono text-xs text-muted-foreground">
          How well did you know this concept?
        </p>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleRate('hard')}
            className="border-rose-500/30 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 font-mono text-xs py-5"
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Needs Review
          </Button>

          <Button
            variant="outline"
            onClick={() => handleRate('medium')}
            className="border-amber-500/30 hover:border-amber-500 text-amber-400 hover:bg-amber-500/10 font-mono text-xs py-5"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" /> Almost Got It
          </Button>

          <Button
            variant="outline"
            onClick={() => handleRate('mastered')}
            className="border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-mono text-xs py-5"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mastered It!
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous Card
        </Button>

        <Button
          variant="ghost"
          onClick={handleNext}
          className="font-mono text-xs text-foreground hover:text-primary"
        >
          Next Card <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
