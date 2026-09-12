'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ReelRecord } from '@/lib/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  Search,
  CheckCircle2,
  FileEdit,
  ArrowLeft,
  School,
  ExternalLink,
} from 'lucide-react'

export default function FacultyQuestionsBankPage() {
  const [reels, setReels] = useState<ReelRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reels')
        const data = await res.json()
        if (data.success) {
          setReels(data.reels || [])
        }
      } catch (err) {
        console.error('Failed to load reels:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const reelsWithQuestions = reels.filter((r) => Boolean(r.question))
  const filtered = reelsWithQuestions.filter((r) => {
    const q = r.question!
    const query = searchQuery.toLowerCase()
    return (
      q.question_text.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query) ||
      r.subject.toLowerCase().includes(query)
    )
  })

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/faculty/dashboard"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> CMS
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-xs text-amber-400 font-bold">Diagnostic Question Bank</span>
          </div>
          <h1 className="text-2xl font-bold font-montserrat text-foreground tracking-tight mt-1">
            Reel Question Bank
          </h1>
        </div>

        <Link href="/faculty/content">
          <Button variant="outline" className="font-mono text-xs border-border hover:border-purple-500/40">
            View Reels ({reels.length})
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="bg-card border-border p-4 font-mono text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search questions by prompt, topic, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border text-xs"
          />
        </div>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3 font-mono text-xs">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-montserrat font-bold text-foreground text-sm">No questions match your query</h3>
            <p className="text-muted-foreground">Attach diagnostic questions to your uploaded reels to build your question bank.</p>
          </div>
        ) : (
          filtered.map((r, idx) => {
            const q = r.question!
            return (
              <Card key={q.id ? `${q.id}-${idx}` : `q-${idx}`} className="bg-card border-border hover:border-amber-500/40 transition-all p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10">
                        {q.question_type === 'true_false' ? 'True / False' : 'Multiple Choice'}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground capitalize">
                        {q.difficulty}
                      </Badge>
                      <span className="text-purple-400 font-semibold">{r.subject}</span>
                      <span className="text-muted-foreground">({r.grade || 'All Grades'})</span>
                    </div>

                    <h3 className="font-montserrat font-bold text-base text-foreground pt-1">
                      {q.question_text}
                    </h3>
                  </div>

                  <Link href={`/faculty/content/${r.id}`}>
                    <Button size="sm" variant="outline" className="font-mono text-xs border-border hover:border-purple-500/40 shrink-0">
                      <FileEdit className="w-3.5 h-3.5 mr-1.5" /> Edit Reel & Question
                    </Button>
                  </Link>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 font-mono text-xs">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        opt === q.correct_answer
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-border bg-background/50 text-muted-foreground'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {opt === q.correct_answer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation and Connected Reel Info */}
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="truncate">
                    Connected to reel: <strong className="text-foreground">{r.title}</strong>
                  </span>
                  {q.explanation && (
                    <span className="italic truncate max-w-md">"{q.explanation}"</span>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
