'use client'

import React from 'react'
import { KnowledgeGapData } from '@/lib/types/learnverse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Target,
  ListOrdered,
} from 'lucide-react'

interface KnowledgeGapTabProps {
  knowledgeGap: KnowledgeGapData
  title: string
  onSwitchTab?: (tab: 'notes' | 'flashcards' | 'quiz' | 'reel') => void
}

export default function KnowledgeGapTab({ knowledgeGap, title, onSwitchTab }: KnowledgeGapTabProps) {
  const mastery = knowledgeGap.overallMastery

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </span>
            <h2 className="text-xl font-bold font-montserrat text-foreground">
              Adaptive Knowledge-Gap Map
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Continuous diagnostic modeling of your conceptual retention & misconceptions.
          </p>
        </div>

        {/* Circular Mastery Score Dial */}
        <div className="flex items-center gap-4 bg-background/80 px-5 py-3 rounded-2xl border border-border">
          <div className="space-y-0.5 text-right">
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Overall Index</span>
            <span className="text-xs font-mono text-primary">
              {mastery >= 75 ? 'Mastery Tier' : mastery >= 50 ? 'Intermediate' : 'Foundational'}
            </span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-montserrat font-bold text-lg text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
            {mastery}%
          </div>
        </div>
      </div>

      {/* Strongest vs Weakest Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Area */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Strongest Concept
            </div>
            <p className="font-montserrat font-bold text-sm text-foreground">{knowledgeGap.strongestArea}</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              Consistent recall verified across flashcards & quiz attempts.
            </p>
          </CardContent>
        </Card>

        {/* Weakest Area (Critical Gap) */}
        <Card className="bg-rose-500/5 border-rose-500/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
              <AlertCircle className="w-4 h-4" /> Priority Knowledge Gap
            </div>
            <p className="font-montserrat font-bold text-sm text-foreground">{knowledgeGap.weakestArea}</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              Needs targeted revision before exam readiness threshold is reached.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sub-Topic Breakdown */}
      <div className="space-y-3">
        <h3 className="font-montserrat font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Topic Mastery & Misconception Breakdown
        </h3>

        <div className="space-y-3">
          {knowledgeGap.topics.map((topic, idx) => {
            let statusBadge = (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-[10px]">
                Mastered ({topic.masteryPercentage}%)
              </Badge>
            )

            if (topic.status === 'improving') {
              statusBadge = (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[10px]">
                  Improving ({topic.masteryPercentage}%)
                </Badge>
              )
            } else if (topic.status === 'critical-gap' || topic.masteryPercentage < 60) {
              statusBadge = (
                <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 font-mono text-[10px]">
                  Critical Gap ({topic.masteryPercentage}%)
                </Badge>
              )
            }

            return (
              <Card key={idx} className="bg-card border-border p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-montserrat font-bold text-sm text-foreground">{topic.name}</h4>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {topic.questionsAttempted} active recall verification attempts
                    </p>
                  </div>
                  {statusBadge}
                </div>

                <Progress
                  value={topic.masteryPercentage}
                  className={`h-2 ${
                    topic.masteryPercentage >= 75
                      ? 'bg-muted'
                      : topic.masteryPercentage >= 50
                      ? 'bg-muted'
                      : 'bg-muted'
                  }`}
                />

                <div className="p-2.5 rounded-lg bg-background/60 border border-border flex items-start gap-2 text-xs font-mono text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Prescription: </strong>
                    {topic.recommendedAction}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recommended Adaptive Study Sequence */}
      <Card className="bg-gradient-to-r from-card via-background to-card border-border p-5 space-y-3">
        <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-primary" /> Recommended Adaptive Revision Order
        </h4>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-1 font-mono text-xs">
          {knowledgeGap.recommendedStudyOrder.map((step, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="p-3 rounded-xl bg-card border border-border flex-1 flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
                  {sIdx + 1}
                </span>
                <span className="text-foreground font-medium text-xs truncate">{step}</span>
              </div>
              {sIdx < knowledgeGap.recommendedStudyOrder.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block shrink-0 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  )
}
