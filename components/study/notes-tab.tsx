'use client'

import React, { useState } from 'react'
import { SummaryNotes } from '@/lib/types/learnverse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  FileText,
} from 'lucide-react'

interface NotesTabProps {
  notes: SummaryNotes
  subject: string
}

export default function NotesTab({ notes, subject }: NotesTabProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyNotes = () => {
    const text = `${notes.title}\n\nKey Takeaways:\n${notes.keyTakeaways.map((t) => `• ${t}`).join('\n')}\n\n${notes.sections.map((s) => `${s.heading}\n${s.summary}\n${s.bulletPoints.map((b) => `- ${b}`).join('\n')}`).join('\n\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Notes copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Notes Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold font-montserrat text-foreground">{notes.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" /> {notes.readingTimeMinutes} min high-yield read
            </span>
            <span>•</span>
            <span className="text-primary font-medium">{notes.sections.length} Core Sections</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyNotes}
          className="font-mono text-xs border-border hover:border-primary/50 text-foreground flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Synthesis'}
        </Button>
      </div>

      {/* Key Takeaways Box */}
      <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-background border-emerald-500/30">
        <CardHeader className="p-5 pb-3 flex flex-row items-center gap-2 space-y-0">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <CardTitle className="text-base font-bold font-montserrat text-foreground">
            Executive Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <ul className="space-y-2.5">
            {notes.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs md:text-sm font-mono text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-foreground/90">{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* High-Yield Key Glossary Terms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          <h3 className="font-montserrat font-bold text-sm text-foreground uppercase tracking-wider">
            High-Yield Glossary & Terminology
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.keyTerms.map((term, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-montserrat font-bold text-sm text-primary">{term.term}</h4>
                <Badge
                  variant="outline"
                  className={`font-mono text-[9px] uppercase ${
                    term.importance === 'high'
                      ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                      : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                  }`}
                >
                  {term.importance} yield
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">{term.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Structured Sections */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-montserrat font-bold text-sm text-foreground uppercase tracking-wider">
            Structured Core Decomposition
          </h3>
        </div>

        {notes.sections.map((sec, idx) => (
          <Card key={idx} className="bg-card border-border overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base font-bold font-montserrat text-foreground flex items-center justify-between">
                <span>{sec.heading}</span>
                <span className="text-[10px] font-mono font-normal text-muted-foreground">Section {idx + 1}</span>
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground mt-1">{sec.summary}</p>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <ul className="space-y-2">
                {sec.bulletPoints.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2.5 text-xs md:text-sm font-mono text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="text-foreground/90 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>

              {sec.keyTakeaway && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs font-mono text-primary">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Exam Pro-Tip: </span>
                    <span className="text-foreground/90">{sec.keyTakeaway}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
