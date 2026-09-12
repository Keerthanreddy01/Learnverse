'use client'

import React, { useState, useEffect } from 'react'
import { CurriculumSubtopic, ReelStatus } from '@/lib/types/learnverse'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Film,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Loader2,
  BookOpen,
  ArrowRight,
  Layers,
  AlertCircle,
} from 'lucide-react'

interface SubtopicsTabProps {
  documentId: string
  documentTitle: string
  subject: string
  overview?: string
  subtopics: CurriculumSubtopic[]
  onSelectSubtopicReel: (subtopic: CurriculumSubtopic) => void
  onSubtopicUpdated?: (updatedSubtopics: CurriculumSubtopic[]) => void
}

export default function SubtopicsTab({
  documentId,
  documentTitle,
  subject,
  overview,
  subtopics: initialSubtopics,
  onSelectSubtopicReel,
  onSubtopicUpdated,
}: SubtopicsTabProps) {
  const [subtopics, setSubtopics] = useState<CurriculumSubtopic[]>(initialSubtopics)
  const [activeGeneratingJobs, setActiveGeneratingJobs] = useState<Record<string, { jobId: string; progress: number; step: string; stageNumber: number; totalStages: number }>>({})

  useEffect(() => {
    setSubtopics(initialSubtopics)

    // Automatically resume polling for any subtopic currently generating on mount or prop updates
    const pendingJobs: Record<string, { jobId: string; progress: number; step: string; stageNumber: number; totalStages: number }> = {}
    initialSubtopics.forEach((s) => {
      if (s.reelStatus === 'generating' && s.reelJobId) {
        pendingJobs[s.id] = {
          jobId: s.reelJobId,
          progress: 15,
          step: 'Synthesizing video reel...',
          stageNumber: 1,
          totalStages: 5,
        }
      }
    })
    if (Object.keys(pendingJobs).length > 0) {
      setActiveGeneratingJobs((prev) => ({ ...pendingJobs, ...prev }))
    }
  }, [initialSubtopics])

  // Poll status for any active generation jobs
  useEffect(() => {
    const jobKeys = Object.keys(activeGeneratingJobs)
    if (jobKeys.length === 0) return

    const interval = setInterval(async () => {
      for (const subtopicId of jobKeys) {
        const { jobId } = activeGeneratingJobs[subtopicId]
        const markPollingFailure = (message: string) => {
          setActiveGeneratingJobs((prev) => {
            const copy = { ...prev }
            delete copy[subtopicId]
            return copy
          })
          setSubtopics((prev) => {
            const updated = prev.map((s) =>
              s.id === subtopicId
                ? { ...s, reelStatus: 'failed' as ReelStatus, errorMessage: message }
                : s
            )
            onSubtopicUpdated?.(updated)
            return updated
          })
          toast.error('Reel Generation Failed', { description: message })
        }

        try {
          const controller = new AbortController()
          const requestTimeout = setTimeout(() => controller.abort(), 10_000)
          const res = await fetch(`/api/video/status/${jobId}`, { signal: controller.signal })
          clearTimeout(requestTimeout)
          if (!res.ok) {
            markPollingFailure(`Could not read generation status (HTTP ${res.status}).`)
            continue
          }
          const data = await res.json()

          if (!data || !data.status) {
            markPollingFailure('Generation status response was invalid.')
            continue
          }

          if (data.status === 'processing') {
            setActiveGeneratingJobs((prev) => ({
              ...prev,
              [subtopicId]: {
                jobId,
                progress: data.progress || 35,
                step: data.currentStep || 'Synthesizing...',
                stageNumber: data.stageNumber || 1,
                totalStages: data.totalStages || 5,
              },
            }))
          } else if (data.status === 'ready') {
            // Remove from active jobs and update subtopic
            setActiveGeneratingJobs((prev) => {
              const copy = { ...prev }
              delete copy[subtopicId]
              return copy
            })

            setSubtopics((prev) => {
              const updated = prev.map((s) => {
                if (s.id !== subtopicId) return s
                return {
                  ...s,
                  reelStatus: 'ready' as ReelStatus,
                  reel: data.reel || {
                    id: `reel-${subtopicId}`,
                    title: s.title,
                    durationSeconds: data.durationSeconds || 8,
                    narrationScript: `Focused breakdown for ${s.title}`,
                    visualStyle: '3d-infographic' as const,
                    videoUrl: data.videoUrl,
                    audioUrl: data.audioUrl,
                    chapters: data.chapters || [],
                    audioWaveform: [0.2, 0.5, 0.8, 0.9, 0.7, 0.6, 0.9, 0.8, 0.4, 0.7, 0.9, 0.5, 0.3],
                  },
                }
              })
              if (onSubtopicUpdated) onSubtopicUpdated(updated)
              return updated
            })

            const targetSub = subtopics.find((s) => s.id === subtopicId)
            toast.success('Subtopic Reel Ready!', {
              description: `Real educational MP4 generated for "${targetSub?.title || 'Subtopic'}"`,
            })
          } else if (data.status === 'failed') {
            setActiveGeneratingJobs((prev) => {
              const copy = { ...prev }
              delete copy[subtopicId]
              return copy
            })

            setSubtopics((prev) => {
              const updated = prev.map((s) => {
                if (s.id !== subtopicId) return s
                return {
                  ...s,
                  reelStatus: 'failed' as ReelStatus,
                  errorMessage: data.errorMessage || 'Failed to render subtopic MP4 video',
                }
              })
              if (onSubtopicUpdated) onSubtopicUpdated(updated)
              return updated
            })

            toast.error('Reel Generation Failed', {
              description: data.errorMessage || 'Could not complete video generation',
            })
          }
        } catch (error: any) {
          markPollingFailure(error?.name === 'AbortError' ? 'Generation status request timed out.' : 'Could not read generation status.')
        }
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [activeGeneratingJobs, onSubtopicUpdated, subtopics])

  const handleGenerateReel = async (subtopic: CurriculumSubtopic) => {
    if (!documentId || !subtopic.id) {
      toast.error('Cannot Generate Reel', {
        description: 'Document or subtopic ID is missing or invalid.',
      })
      return
    }

    const cleanSourceText = (subtopic.sourceText || subtopic.description || '').trim()
    if (!cleanSourceText || cleanSourceText.length < 5) {
      toast.error('Insufficient Subtopic Content', {
        description: 'This subtopic lacks source text. Please provide valid curriculum material.',
      })
      return
    }

    // Optimistic UI state
    setSubtopics((prev) =>
      prev.map((s) => (s.id === subtopic.id ? { ...s, reelStatus: 'generating' as ReelStatus } : s))
    )

    try {
      const res = await fetch(`/api/curriculum/${documentId}/subtopics/${subtopic.id}/generate`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to start video synthesis')
      }

      setActiveGeneratingJobs((prev) => ({
        ...prev,
        [subtopic.id]: {
          jobId: data.jobId,
          progress: 15,
          step: 'Queued in video pipeline...',
          stageNumber: 1,
          totalStages: 5,
        },
      }))

      toast.info('Video Pipeline Started', {
        description: `Synthesizing focused 8s reel for "${subtopic.title}"...`,
      })
    } catch (err: any) {
      console.error('[Generate Subtopic Error]:', err)
      setSubtopics((prev) =>
        prev.map((s) =>
          s.id === subtopic.id
            ? { ...s, reelStatus: err?.message?.includes('Please wait') ? ('not_started' as ReelStatus) : ('failed' as ReelStatus), errorMessage: err?.message }
            : s
        )
      )
      toast.error('Generation Failed', {
        description: err?.message || 'Could not start generation job.',
      })
    }
  }

  const readyCount = subtopics.filter((s) => s.reelStatus === 'ready').length

  return (
    <div className="learn-subtopics space-y-6 max-w-4xl mx-auto">
      {/* Curriculum Document Header / Executive Overview Card */}
      <Card className="learn-outline-card border p-6 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                Curriculum Subtopic Outline
              </span>
            </div>

              <Badge variant="outline" className="learn-outline-badge font-mono text-xs">
              {readyCount} of {subtopics.length} Reels Generated
            </Badge>
          </div>

          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            {overview ||
              `AI-extracted modular breakdown for ${documentTitle}. Select any subtopic below to generate its dedicated, high-retention 8-second educational video reel.`}
          </p>
        </div>
      </Card>

      {/* Subtopics List */}
      <div className="space-y-4">
        {subtopics.map((sub, idx) => {
          const isGenerating = sub.reelStatus === 'generating' || Boolean(activeGeneratingJobs[sub.id])
          const jobInfo = activeGeneratingJobs[sub.id]
          const isReady = sub.reelStatus === 'ready'
          const isFailed = sub.reelStatus === 'failed'

          return (
            <Card
              key={sub.id}
              className={`learn-subtopic-card border transition-all duration-200 overflow-hidden ${
                isReady
                  ? 'border-emerald-500/40 bg-card hover:border-emerald-500/60'
                  : isGenerating
                  ? 'border-primary/50 bg-primary/[0.02] shadow-[0_0_15px_hsl(var(--primary)/0.1)]'
                  : isFailed
                  ? 'border-destructive/40 bg-destructive/5'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Top Row: Number, Title, and Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="learn-subtopic-number px-2 py-0.5 rounded font-mono text-[11px] font-bold border">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <h3 className="font-montserrat font-bold text-base text-[#17213f]">
                        {sub.title}
                      </h3>
                    </div>
                    <p className="font-mono text-xs text-[#4b5563] font-medium">{sub.description}</p>
                  </div>

                  {/* Status Indicator */}
                  <div className="self-start sm:self-auto shrink-0">
                    {isReady ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reel Ready
                      </Badge>
                    ) : isGenerating ? (
                      <Badge className="bg-primary/10 text-primary border border-primary/30 font-mono text-xs flex items-center gap-1.5 py-1 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Video...
                      </Badge>
                    ) : isFailed ? (
                      <Badge variant="destructive" className="font-mono text-xs flex items-center gap-1.5 py-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Generation Failed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-border text-muted-foreground bg-muted/40 py-1"
                      >
                        Not Started
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Middle Row: Learning Objectives Checklist */}
                {sub.learningObjectives && sub.learningObjectives.length > 0 && (
                  <div className="learn-objectives p-3.5 rounded-xl border border-[#c4cadb] bg-[#f7f6f1] space-y-2.5">
                    <span className="text-[11px] text-[#4b5563] uppercase tracking-wider font-black block">
                      Target Learning Objectives:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sub.learningObjectives.map((obj, oIdx) => (
                        <li
                          key={oIdx}
                          className="text-xs text-[#111827] font-bold flex items-start gap-2 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[#111827]">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Row: Duration Info & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#4b5563] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#4938d4]" />
                    <span>Estimated: 8s Reel</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReady ? (
                      <Button
                        type="button"
                        onClick={() => onSelectSubtopicReel(sub)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-semibold px-4 cursor-pointer shadow-sm hover:scale-105 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Watch Subtopic Reel
                      </Button>
                    ) : isGenerating ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-28 sm:w-36">
                            <Progress value={jobInfo?.progress || 10} className="h-2 bg-muted" />
                          </div>
                          <span className="font-mono text-xs font-bold text-primary">
                            {jobInfo?.progress || 10}%
                          </span>
                        </div>
                        <Button
                          disabled
                          className="font-mono text-xs bg-muted text-foreground border border-border flex items-center gap-1.5"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />{' '}
                          <span>{jobInfo?.step || `Stage ${jobInfo?.stageNumber || 1}/${jobInfo?.totalStages || 5}: Processing...`}</span>
                        </Button>
                      </div>
                    ) : isFailed ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => handleGenerateReel(sub)}
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 font-mono text-xs cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry Reel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleGenerateReel(sub)}
                        className="bg-primary text-primary-foreground font-mono text-xs font-semibold px-4 hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                      >
                        <Film className="w-3.5 h-3.5 mr-1.5" /> Generate Reel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Error Callout if failed */}
                {isFailed && sub.errorMessage && (
                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 font-mono text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{sub.errorMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
