'use client'

import React, { useState, useEffect } from 'react'
import { ReelQuestion, QuestionType, ReelDifficulty } from '@/lib/types/roles'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { HelpCircle, CheckCircle2, Sparkles, Plus, Trash2 } from 'lucide-react'

interface QuestionFormModalProps {
  isOpen: boolean
  onClose: () => void
  reelId: string
  reelTitle: string
  initialQuestion?: ReelQuestion | null
  onSave: (question: Partial<ReelQuestion>) => void
}

export default function QuestionFormModal({
  isOpen,
  onClose,
  reelId,
  reelTitle,
  initialQuestion,
  onSave,
}: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
  const [options, setOptions] = useState<string[]>([
    'Option A',
    'Option B',
    'Option C',
    'Option D',
  ])
  const [correctAnswer, setCorrectAnswer] = useState('Option A')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<ReelDifficulty>('medium')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question_text || '')
      setQuestionType(initialQuestion.question_type || 'multiple_choice')
      setOptions(
        initialQuestion.options && initialQuestion.options.length > 0
          ? initialQuestion.options
          : initialQuestion.question_type === 'true_false'
          ? ['True', 'False']
          : ['Option A', 'Option B', 'Option C', 'Option D']
      )
      setCorrectAnswer(initialQuestion.correct_answer || '')
      setExplanation(initialQuestion.explanation || '')
      setDifficulty(initialQuestion.difficulty || 'medium')
    } else {
      setQuestionText('')
      setQuestionType('multiple_choice')
      setOptions(['', '', '', ''])
      setCorrectAnswer('')
      setExplanation('')
      setDifficulty('medium')
    }
    setPreviewMode(false)
  }, [initialQuestion, isOpen])

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type)
    if (type === 'true_false') {
      setOptions(['True', 'False'])
      setCorrectAnswer('True')
    } else {
      setOptions(['', '', '', ''])
      setCorrectAnswer('')
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options]
    const oldVal = updated[index]
    updated[index] = value
    setOptions(updated)

    // If the changed option was previously the correct answer, update it
    if (correctAnswer === oldVal) {
      setCorrectAnswer(value)
    }
  }

  const handleSave = () => {
    if (!questionText.trim()) {
      toast.error('Please enter the question text')
      return
    }

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean)
    if (questionType === 'multiple_choice' && cleanOptions.length < 2) {
      toast.error('Please provide at least two options for multiple choice')
      return
    }

    if (!correctAnswer || !cleanOptions.includes(correctAnswer)) {
      toast.error('Please select a valid correct answer from the provided options')
      return
    }

    onSave({
      reel_id: reelId,
      question_text: questionText.trim(),
      question_type: questionType,
      options: cleanOptions,
      correct_answer: correctAnswer,
      explanation: explanation.trim() || null,
      difficulty,
    })

    toast.success('Question saved for this reel!')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] border-purple-500/30 bg-purple-500/10 text-purple-400">
              Interactive Micro-Assessment
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground capitalize">
              {difficulty}
            </Badge>
          </div>
          <DialogTitle className="font-montserrat font-bold text-lg text-foreground">
            {initialQuestion ? 'Edit Reel Question' : 'Add Interactive Question'}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Attached to reel: <span className="text-foreground font-semibold">"{reelTitle}"</span>
          </DialogDescription>
        </DialogHeader>

        {previewMode ? (
          /* Student Preview View */
          <div className="p-4 rounded-xl bg-background border border-border space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold">STUDENT PERSPECTIVE PREVIEW</span>
              <Button size="sm" variant="outline" onClick={() => setPreviewMode(false)} className="text-[11px] h-7">
                Exit Preview
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h4 className="font-montserrat font-bold text-sm text-foreground">
                {questionText || 'Your question prompt will appear here'}
              </h4>

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      opt === correctAnswer
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-border bg-background/50 text-muted-foreground'
                    }`}
                  >
                    <span>{opt || `Option ${i + 1}`}</span>
                    {opt === correctAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>

              {explanation && (
                <div className="pt-2 border-t border-border text-[11px] text-muted-foreground italic">
                  <strong>Explanation:</strong> {explanation}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Editor View */
          <div className="space-y-4 font-mono text-xs">
            {/* Question Type Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-background border border-border">
              <button
                type="button"
                onClick={() => handleTypeChange('multiple_choice')}
                className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                  questionType === 'multiple_choice'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Multiple Choice (MCQ)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('true_false')}
                className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                  questionType === 'true_false'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                True / False
              </button>
            </div>

            {/* Question Prompt */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-mono text-xs">Question Prompt</Label>
              <Textarea
                rows={2}
                placeholder="e.g. What electrochemical force drives ATP rotary synthesis?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>

            {/* Options List */}
            <div className="space-y-2">
              <Label className="text-muted-foreground font-mono text-xs flex items-center justify-between">
                <span>Options (Click check to set correct answer)</span>
                <span className="text-emerald-400 text-[10px]">
                  Correct: {correctAnswer || 'None chosen'}
                </span>
              </Label>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(opt)}
                    title="Mark as correct answer"
                    className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      correctAnswer && correctAnswer === opt && opt !== ''
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'border-border text-muted-foreground hover:border-emerald-500/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    disabled={questionType === 'true_false'}
                    className="bg-background border-border text-xs flex-1"
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-mono text-xs">
                Explanation (Shown to students after they answer)
              </Label>
              <Textarea
                rows={2}
                placeholder="Explain why the answer is correct and reinforce the key topic concept..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center justify-between pt-1">
              <Label className="text-muted-foreground font-mono text-xs">Difficulty Level</Label>
              <div className="flex items-center gap-1.5">
                {(['easy', 'medium', 'hard'] as ReelDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-all cursor-pointer ${
                      difficulty === d
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="font-mono text-xs border-border"
          >
            {previewMode ? 'Back to Editor' : 'Preview Student Card'}
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="font-mono text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold px-4"
            >
              Save Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
