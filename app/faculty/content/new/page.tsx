'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ReelDifficulty, ReelStatus, ReelQuestion } from '@/lib/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import QuestionFormModal from '@/components/faculty/question-form-modal'
import {
  UploadCloud,
  Film,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react'

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate', 'All Grades']
const SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Mathematics', 'Computer Science', 'History', 'Literature']

export default function NewFacultyContentPage() {
  const router = useRouter()
  const { profile } = useAuth()

  // File states
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('')
  const [detectedDuration, setDetectedDuration] = useState<number>(15)

  // Upload status states
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadStage, setUploadStage] = useState<string>('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Metadata form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [grade, setGrade] = useState('Grade 11')
  const [subject, setSubject] = useState('Biology')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<ReelDifficulty>('medium')
  const [language, setLanguage] = useState('English')

  // Optional Question modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [attachedQuestion, setAttachedQuestion] = useState<Partial<ReelQuestion> | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Handle video selection & auto-detect duration
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('video/') && !file.name.endsWith('.mp4')) {
      toast.error('Please upload an MP4 video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds 100MB limit')
      return
    }

    setVideoFile(file)
    const localUrl = URL.createObjectURL(file)
    setVideoPreviewUrl(localUrl)
    setUploadError(null)

    // Detect duration using hidden video element
    const tempVideo = document.createElement('video')
    tempVideo.preload = 'metadata'
    tempVideo.src = localUrl
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration && !isNaN(tempVideo.duration)) {
        const rounded = Math.max(5, Math.round(tempVideo.duration))
        setDetectedDuration(rounded)
      }
    }
  }

  const handleSaveReel = async (targetStatus: ReelStatus) => {
    if (!videoFile && !videoPreviewUrl) {
      toast.error('Please select an MP4 video file to upload')
      return
    }

    if (!title.trim() || !topic.trim()) {
      toast.error('Please fill in the title and topic')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      let finalVideoUrl = videoPreviewUrl

      // 1. Upload Video if fresh file
      if (videoFile) {
        setUploadStage('Stage 1/2: Uploading video file to secure faculty storage…')
        setUploadProgress(30)

        const formData = new FormData()
        formData.append('file', videoFile)
        formData.append('facultyUserId', profile?.id || 'faculty-demo')
        formData.append('contentId', `reel-${Date.now()}`)
        formData.append('fileType', 'video')

        const uploadRes = await fetch('/api/faculty/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadRes.json()
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Video file upload failed')
        }

        finalVideoUrl = uploadData.url
        setUploadProgress(75)
      }

      // 2. Save Reel Record to Database
      setUploadStage('Stage 2/2: Persisting reel metadata and curriculum taxonomy…')
      setUploadProgress(90)

      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          video_url: finalVideoUrl,
          source_type: 'faculty',
          created_by: profile?.id || 'faculty-demo',
          grade,
          subject,
          chapter: chapter.trim() || null,
          topic: topic.trim(),
          difficulty,
          language,
          duration_seconds: detectedDuration,
          status: targetStatus,
          question: attachedQuestion,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save reel')
      }

      setUploadProgress(100)
      toast.success(
        targetStatus === 'published'
          ? 'Reel successfully published to student feed!'
          : 'Reel saved as draft!'
      )
      router.push('/faculty/content')
    } catch (err: any) {
      console.error('Reel upload error:', err)
      setUploadError(err?.message || 'Upload encountered an error')
      toast.error(err?.message || 'Failed to complete upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/faculty/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS
        </Link>
        <Badge variant="outline" className="font-mono text-[10px] border-purple-500/30 bg-purple-500/10 text-purple-400">
          Faculty Studio • New Upload
        </Badge>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-montserrat text-foreground tracking-tight">
          Upload Educational Reel
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Distribute verified microlearning videos to students matched by grade and curriculum subtopic.
        </p>
      </div>

      {/* Upload Progress State Banner */}
      {isUploading && (
        <Card className="bg-card border-purple-500/40 p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold">{uploadStage}</span>
            <span className="text-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2 bg-muted" />
        </Card>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <Card className="bg-destructive/10 border-destructive/40 p-4 font-mono text-xs space-y-2 text-destructive">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" /> Upload Encountered An Error
          </div>
          <p className="text-foreground/80">{uploadError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSaveReel('published')}
            className="font-mono text-xs border-destructive/40 hover:bg-destructive/20 mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Upload
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video Dropzone & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <Label className="font-mono text-xs text-muted-foreground block">
                Video Asset (MP4 Required)
              </Label>

              {videoPreviewUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-[9/16] max-h-[440px] mx-auto rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground p-2 rounded-lg bg-background border border-border">
                    <span>Detected Duration: <strong className="text-foreground">{detectedDuration}s</strong></span>
                    <label className="text-primary hover:underline cursor-pointer">
                      Replace Video
                      <input
                        type="file"
                        accept="video/mp4,video/*"
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-purple-500/50 rounded-2xl cursor-pointer bg-background/50 hover:bg-background transition-all space-y-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="font-bold text-foreground">Click to upload MP4 video</p>
                    <p className="text-muted-foreground text-[11px]">Recommended: 9:16 vertical format, 15 to 45s, under 100MB</p>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Interactive Question Attachment Box */}
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
                  attachedQuestion
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {attachedQuestion ? 'Attached' : 'None'}
              </Badge>
            </div>

            <p className="font-mono text-xs text-muted-foreground">
              Add a quick MCQ or True/False prompt. Students answer immediately after watching this reel to verify comprehension.
            </p>

            {attachedQuestion ? (
              <div className="p-3 rounded-lg bg-background border border-border font-mono text-xs space-y-1">
                <p className="font-semibold text-foreground truncate">{attachedQuestion.question_text}</p>
                <p className="text-[11px] text-emerald-400">Answer: {attachedQuestion.correct_answer}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsQuestionModalOpen(true)}
                    className="text-[11px] h-7 font-mono"
                  >
                    Edit Question
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAttachedQuestion(null)}
                    className="text-[11px] h-7 font-mono text-destructive hover:text-destructive"
                  >
                    Remove
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

        {/* Right Column: Metadata Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card border-border p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                Reel Title *
              </Label>
              <Input
                placeholder="e.g. Cellular Respiration: ATP Synthase Rotary Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-border font-mono text-xs text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                Short Summary / Takeaway
              </Label>
              <Textarea
                rows={2}
                placeholder="Key concept distilled in this microlearning unit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-border font-mono text-xs text-foreground"
              />
            </div>

            {/* Curriculum Classification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">
                  Assigned Grade Level *
                </Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-background border border-border text-foreground font-mono text-xs rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">
                  Subject *
                </Label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-border text-foreground font-mono text-xs rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">
                  Chapter / Unit (Optional)
                </Label>
                <Input
                  placeholder="e.g. Unit 3: Bioenergetics"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="bg-background border-border font-mono text-xs text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">
                  Specific Topic *
                </Label>
                <Input
                  placeholder="e.g. Chemiosmosis & Electron Transport"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background border-border font-mono text-xs text-foreground"
                />
              </div>
            </div>

            {/* Difficulty and Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Difficulty Rating</Label>
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
                <Label className="font-mono text-xs text-muted-foreground">Duration (Seconds)</Label>
                <Input
                  type="number"
                  value={detectedDuration}
                  onChange={(e) => setDetectedDuration(Number(e.target.value))}
                  className="bg-background border-border font-mono text-xs text-foreground"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => handleSaveReel('draft')}
                className="w-full sm:w-auto border-border font-mono text-xs hover:border-purple-500/40"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                disabled={isUploading}
                onClick={() => handleSaveReel('published')}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold px-6 py-5 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> Publish to Students
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        reelId="new-reel"
        reelTitle={title || 'New Reel'}
        initialQuestion={attachedQuestion as any}
        onSave={(q) => setAttachedQuestion(q)}
      />
    </div>
  )
}
