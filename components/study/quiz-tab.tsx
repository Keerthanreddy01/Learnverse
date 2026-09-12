'use client'

import React, { useState } from 'react'
import { Quiz } from '@/lib/types/learnverse'
import { useStudy } from '@/lib/context/study-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCw,
  Award,
  Sparkles,
  Info,
} from 'lucide-react'

interface QuizTabProps {
  materialId: string
  quiz: Quiz
}

export default function QuizTab({ materialId, quiz }: QuizTabProps) {
  const { recordQuizScore } = useStudy()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return
    setIsAnswerSubmitted(true)
    const newAnswers = [...userAnswers, selectedOption]
    setUserAnswers(newAnswers)

    const isCorrect = selectedOption === currentQ.correctIndex
    if (isCorrect) {
      toast.success('Correct Answer!', { duration: 1500 })
    } else {
      toast.error('Incorrect — Check the explanation below', { duration: 1500 })
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerSubmitted(false)
    } else {
      // Calculate score and complete
      const finalAnswers = [...userAnswers]
      let correctCount = 0
      quiz.questions.forEach((q, idx) => {
        if (finalAnswers[idx] === q.correctIndex) {
          correctCount++
        }
      })
      const scorePercent = Math.round((correctCount / totalQuestions) * 100)
      recordQuizScore(materialId, scorePercent)
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerSubmitted(false)
    setUserAnswers([])
    setIsCompleted(false)
  }

  if (isCompleted) {
    let correctCount = 0
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })
    const scorePercent = Math.round((correctCount / totalQuestions) * 100)
    const passed = scorePercent >= quiz.passingScore

    return (
      <Card className="bg-card border-border max-w-xl mx-auto text-center p-8 space-y-6">
        <div
          className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
            passed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-montserrat text-foreground">
            {passed ? 'Assessment Passed!' : 'Knowledge Gap Detected'}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {passed
              ? 'You have demonstrated solid conceptual mastery of this microlearning unit.'
              : 'Some core concepts require revision. Review your detailed answer breakdown below.'}
          </p>
        </div>

        {/* Score Summary Box */}
        <div className="p-4 rounded-xl bg-background border border-border grid grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <span className="text-muted-foreground block">Score</span>
            <span className={`text-xl font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scorePercent}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Correct</span>
            <span className="text-xl font-bold text-foreground">
              {correctCount} / {totalQuestions}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Required</span>
            <span className="text-xl font-bold text-muted-foreground">{quiz.passingScore}%</span>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3 text-left pt-2">
          <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Detailed Review Breakdown:
          </h4>
          {quiz.questions.map((q, idx) => {
            const isUserCorrect = userAnswers[idx] === q.correctIndex
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border font-mono text-xs space-y-1.5 ${
                  isUserCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Q{idx + 1}. {q.question}
                  </span>
                  {isUserCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Correct: </strong>
                  {q.options[q.correctIndex]}
                </p>
                <p className="text-[10px] text-muted-foreground italic">{q.explanation}</p>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            onClick={handleRestart}
            className="bg-primary text-primary-foreground font-mono text-xs font-semibold px-6 hover:scale-105 transition-transform"
          >
            <RotateCw className="w-4 h-4 mr-2" /> Retake Quiz
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-primary" />
          Question <strong className="text-foreground">{currentIndex + 1}</strong> of {totalQuestions}
        </span>
        <Badge variant="outline" className="border-border text-foreground font-mono text-[10px]">
          Topic: {currentQ.topic}
        </Badge>
        <span className="text-[11px] text-muted-foreground">Passing: {quiz.passingScore}%</span>
      </div>

      <Progress value={progress} className="h-1.5 bg-muted" />

      {/* Question Card */}
      <Card className="bg-card border-border p-6 md:p-8 space-y-6">
        <h3 className="text-base md:text-lg font-bold font-montserrat text-foreground leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx
            const isCorrect = idx === currentQ.correctIndex

            let optionStyle = 'border-border bg-background/60 hover:border-primary/40 text-foreground/90'
            if (isAnswerSubmitted) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-semibold'
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-rose-500/60 bg-rose-500/10 text-rose-400'
              } else {
                optionStyle = 'border-border/40 opacity-50 bg-background/30'
              }
            } else if (isSelected) {
              optionStyle = 'border-primary bg-primary/10 text-primary font-semibold'
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-xl border text-left font-mono text-xs md:text-sm transition-all duration-200 flex items-start gap-3 cursor-pointer ${optionStyle}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Post-Submit Rationale Box */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
              <Info className="w-4 h-4 text-primary" /> Concept Explanation:
            </div>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-border">
          {!isAnswerSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="bg-primary text-primary-foreground font-mono text-xs font-semibold px-6 hover:scale-105 transition-all cursor-pointer"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-primary text-primary-foreground font-mono text-xs font-semibold px-6 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Assessment'}{' '}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
