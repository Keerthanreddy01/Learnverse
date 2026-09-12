'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReelRecord, ReelDifficulty, ReelStatus, ReelQuestion } from '@/lib/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import QuestionFormModal from '@/components/faculty/question-form-modal'
import {
  ArrowLeft,
  Film,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react'

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate', 'All Grades']
const SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Mathematics', 'Computer Science', 'History', 'Literature']

export default function EditFacultyContentPage() {
  const params = useParams()
  const router = useRouter()
  const reelId = params.id as string

  const [reel, setReel] = useState<ReelRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [grade, setGrade] = useState('Grade 11')
  const [subject, setSubject] = useState('Biology')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<ReelDifficulty>('medium')
  const [status, setStatus] = useState<ReelStatus>('draft')
  const [question, setQuestion] = useState<ReelQuestion | null>(null)

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)

  const loadReel = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reels/${reelId}`)
      const data = await res.json()
      if (data.success && data.reel) {
        const r: ReelRecord = data.reel
        setReel(r)
        setTitle(r.title || '')
        setDescription(r.description || '')
        setGrade(r.grade || 'Grade 11')
        setSubject(r.subject || 'Biology')
        setChapter(r.chapter || '')
        setTopic(r.topic || '')
        setDifficulty(r.difficulty || 'medium')
        setStatus(r.status || 'draft')
        setQuestion(r.question || null)
      } else {
        toast.error('Reel not found')
      }
    } catch (err) {
      toast.error('Failed to load reel details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reelId) loadReel()
  }, [reelId])

  const handleSave = async () => {
    if (!title.trim() || !topic.trim()) {
      toast.error('Title and topic are required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/reels/${reelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          grade,
          subject,
          chapter: chapter.trim() || null,
          topic: topic.trim(),
          difficulty,
          status,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Reel updated successfully')
        router.push('/faculty/content')
      } else {
        toast.error(data.error || 'Failed to update reel')
      }
    } catch {
      toast.error('Network error updating reel')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveQuestion = async (qData: Partial<ReelQuestion>) => {
    try {
      const res = await fetch(`/api/reels/${reelId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qData),
      })
      const data = await res.json()
      if (data.success) {
        setQuestion(data.question)
        toast.success('Diagnostic question linked successfully')
      }
    } catch {
      toast.error('Failed to link question')
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 text-center font-mono text-xs text-muted-foreground">
        Loading reel details…
      </div>
    )
  }

  if (!reel) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 text-center space-y-3 font-mono text-xs">
        <p className="text-foreground font-bold">Reel not found</p>
        <Link href="/faculty/content">
          <Button variant="outline" size="sm">Back to Library</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/faculty/content"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Content Library
        </Link>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`font-mono text-[10px] ${
              status === 'published'
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
            }`}
          >
            {status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] border-purple-500/30 text-purple-400">
            ID: {reel.id}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-montserrat text-foreground tracking-tight">
          Edit Reel & Diagnostic Assessment
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Modify curriculum tagging and configure the post-reel comprehension check.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Video Player & Question Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <Label className="font-mono text-xs text-muted-foreground block">
                Current Video Preview
              </Label>
              <div className="relative aspect-[9/16] max-h-[440px] mx-auto rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center">
                <video
                  src={reel.video_url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground text-center">
                Duration: {reel.duration_seconds} seconds
              </p>
            </CardContent>
          </Card>

          {/* Question Box */}
          <Card className="bg-card border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="font-montserrat font-bold text-sm text-foreground">
                  Diagnostic Question
                </h3>
              </div>
              <Badge
                variant="outline"
                className={`font-mono text-[10px] ${
                  question
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {question ? 'Active' : 'Missing'}
              </Badge>
            </div>

            {question ? (
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-2 font-mono text-xs">
                <p className="font-semibold text-foreground">{question.question_text}</p>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  {question.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-1.5 rounded flex items-center justify-between ${
                        opt === question.correct_answer
                          ? 'text-emerald-400 font-bold bg-emerald-500/10'
                          : ''
                      }`}
                    >
                      <span>• {opt}</span>
                      {opt === question.correct_answer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <p className="pt-2 border-t border-border text-[10px] text-muted-foreground italic">
                    {question.explanation}
                  </p>
                )}

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsQuestionModalOpen(true)}
                    className="w-full text-xs font-mono border-border hover:border-amber-500/40"
                  >
                    Edit Attached Question
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsQuestionModalOpen(true)}
                className="w-full border-dashed border-border hover:border-amber-500/50 font-mono text-xs py-4 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" /> Attach Diagnostic Question
              </Button>
            )}
          </Card>
        </div>

        {/* Right: Metadata Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card border-border p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-muted-foreground">Reel Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-border font-mono text-xs text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-muted-foreground">Description / Summary</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-border font-mono text-xs text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Target Grade</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-background border border-border text-foreground font-mono text-xs rounded-md p-2 focus:outline-none"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Subject</Label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-border text-foreground font-mono text-xs rounded-md p-2 focus:outline-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Chapter / Unit</Label>
                <Input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="bg-background border-border font-mono text-xs text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background border-border font-mono text-xs text-foreground"
                />
              </div>
            </div>

            {/* Difficulty & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Difficulty</Label>
                <div className="flex items-center gap-2">
                  {(['easy', 'medium', 'hard'] as ReelDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-mono capitalize transition-all cursor-pointer ${
                        difficulty === d
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Publication Status</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-mono capitalize transition-all cursor-pointer ${
                      status === 'draft'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-mono capitalize transition-all cursor-pointer ${
                      status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Link href="/faculty/content">
                <Button variant="ghost" className="font-mono text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                disabled={saving}
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold px-6 py-5 rounded-full hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        reelId={reelId}
        reelTitle={title}
        initialQuestion={question}
        onSave={handleSaveQuestion}
      />
    </div>
  )
}
