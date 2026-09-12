'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Award,
  CheckCircle2,
  XCircle,
  Film,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  HelpCircle,
  GraduationCap,
} from 'lucide-react'

export default function StudentProgressPage() {
  const { profile } = useAuth()
  const studentId = profile?.id || 'student-demo-user'

  const [progressData, setProgressData] = useState<{
    completedCount: number
    totalAnswers: number
    correctAnswers: number
    accuracyPercent: number
    answers: any[]
  }>({
    completedCount: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    accuracyPercent: 0,
    answers: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        // Load answer history and activity from our local store / API
        const res = await fetch('/api/reels')
        const data = await res.json()
        const reels = data.reels || []

        // In demo mode or connected DB, query answers
        const mockAnswers = [
          {
            id: 'ans-1',
            reel_id: 'faculty-reel-1',
            reel_title: 'Cellular Respiration & ATP Synthase Engine',
            question: 'What primary electrochemical gradient directly powers the rotation of the ATP synthase rotor?',
            selected_answer: 'Proton (H+) gradient across the inner membrane',
            is_correct: true,
            explanation: 'Chemiosmosis: protons flow through F0 rotor powering ATP synthesis.',
            answered_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'ans-2',
            reel_id: 'faculty-reel-2',
            reel_title: 'Hydrologic Cycle: Solar Evaporation & Phase Shifts',
            question: 'During evaporation, what molecular change happens to water?',
            selected_answer: 'Liquid phase transitions to vapor as kinetic energy overcomes surface tension',
            is_correct: true,
            explanation: 'Solar heat increases average molecular kinetic energy until surface tension breaks.',
            answered_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 'ans-3',
            reel_id: 'faculty-reel-3',
            reel_title: 'Newtonian Gravitation & Orbital Equilibrium',
            question: 'Is an astronaut in low Earth orbit experiencing zero gravity?',
            selected_answer: 'True',
            is_correct: false,
            explanation: 'Gravity is still ~90% as strong; apparent weightlessness is caused by continuous free fall.',
            answered_at: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
        ]

        const correct = mockAnswers.filter((a) => a.is_correct).length
        const total = mockAnswers.length
        const acc = total > 0 ? Math.round((correct / total) * 100) : 0

        setProgressData({
          completedCount: 3,
          totalAnswers: total,
          correctAnswers: correct,
          accuracyPercent: acc,
          answers: mockAnswers,
        })
      } catch (err) {
        console.error('Failed to load progress:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 pt-24 pb-16 space-y-8 w-full">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-montserrat tracking-tight text-foreground">
                Your Learning Mastery & Progress
              </h1>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px] bg-cyan-500/10">
                {profile?.grade || 'Grade 11'}
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Tracking your microlearning reel completions, diagnostic question accuracy, and conceptual weak areas.
            </p>
          </div>

          <Link href="/student/reels">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono text-xs font-bold rounded-full px-5 py-5 flex items-center gap-1.5 cursor-pointer">
              <Film className="w-4 h-4" /> Continue Reels Feed
            </Button>
          </Link>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <Card className="bg-card border-border p-5 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Reels Watched</span>
            <div className="flex items-baseline justify-between">
              <span className="font-montserrat text-3xl font-black text-foreground">
                {progressData.completedCount}
              </span>
              <Film className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">Across enrolled subjects</p>
          </Card>

          <Card className="bg-card border-border p-5 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Questions Answered</span>
            <div className="flex items-baseline justify-between">
              <span className="font-montserrat text-3xl font-black text-foreground">
                {progressData.correctAnswers} / {progressData.totalAnswers}
              </span>
              <HelpCircle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">Diagnostic comprehension checks</p>
          </Card>

          <Card className="bg-card border-border p-5 space-y-1">
            <span className="text-muted-foreground block text-[11px]">Overall Accuracy</span>
            <div className="flex items-baseline justify-between">
              <span className="font-montserrat text-3xl font-black text-emerald-400">
                {progressData.accuracyPercent}%
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <Progress value={progressData.accuracyPercent} className="h-1.5 bg-muted mt-2" />
          </Card>
        </div>

        {/* Answer History Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat font-bold text-base text-foreground">
              Recent Diagnostic Question History
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              Instant recall assessments
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {progressData.answers.map((ans) => (
              <Card
                key={ans.id}
                className={`p-4 rounded-xl border transition-all ${
                  ans.is_correct
                    ? 'border-emerald-500/30 bg-card'
                    : 'border-rose-500/30 bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
                      {ans.reel_title}
                    </span>
                    <h4 className="font-montserrat font-bold text-sm text-foreground">
                      {ans.question}
                    </h4>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-muted-foreground">Your answer:</span>
                      <strong className={ans.is_correct ? 'text-emerald-400' : 'text-rose-400'}>
                        {ans.selected_answer}
                      </strong>
                    </div>

                    <p className="text-[11px] text-muted-foreground italic pt-1">
                      💡 {ans.explanation}
                    </p>
                  </div>

                  <div className="shrink-0 pt-1">
                    {ans.is_correct ? (
                      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Correct
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400 text-[10px]">
                        <XCircle className="w-3 h-3 mr-1" /> Revision Needed
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
