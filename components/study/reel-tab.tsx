'use client'

import React, { useState, useEffect, useRef } from 'react'
import { VideoReel } from '@/lib/types/learnverse'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Video,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Download,
  Film,
  ArrowLeft,
} from 'lucide-react'

interface ReelTabProps {
  reel: VideoReel
  title: string
  onBackToOutline?: () => void
  subtopicTitle?: string
  learningObjectives?: string[]
}

export default function ReelTab({
  reel,
  title,
  onBackToOutline,
  subtopicTitle,
  learningObjectives,
}: ReelTabProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(reel.durationSeconds || 8)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  const hasRealVideo = Boolean(reel.videoUrl)

  // Real HTML5 Video Event Listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(Math.round(video.duration))
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [reel.videoUrl])

  // Fallback timer simulation when no real MP4 exists
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !hasRealVideo) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return Math.min(duration, prev + 1 * playbackSpeed)
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, playbackSpeed, hasRealVideo])

  const currentChapter =
    [...(reel.chapters || [])]
      .reverse()
      .find((c) => currentTime >= c.timestampSeconds) || reel.chapters?.[0] || {
        id: 'c-1',
        title: '01. Overview',
        timestampSeconds: 0,
        subtitle: subtopicTitle || 'Core Concept Analysis',
      }

  const progressPercent = Math.min(100, Math.round((currentTime / (duration || 1)) * 100))

  const togglePlay = () => {
    if (hasRealVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (hasRealVideo && videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
    const newSpeed = speeds[nextIdx]
    setPlaybackSpeed(newSpeed)
    if (hasRealVideo && videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }

  const toggleMute = () => {
    const nextMute = !isMuted
    setIsMuted(nextMute)
    if (hasRealVideo && videoRef.current) {
      videoRef.current.muted = nextMute
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Reel Header - Styled to match LearnVerse Neo-Brutalist Paper Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border-2 border-[#17213f] shadow-[5px_5px_0_#17213f]">
        <div className="space-y-1.5">
          {onBackToOutline && (
            <button
              type="button"
              onClick={onBackToOutline}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#17213f] bg-[#fff4bd] border-2 border-[#17213f] px-3.5 py-1.5 rounded-full shadow-[2px_2px_0_#17213f] hover:-translate-y-0.5 transition-transform mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Subtopics Outline
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#c9ff4d] text-[#17213f] border-2 border-[#17213f] shadow-[2px_2px_0_#17213f]">
              <Film className="w-4 h-4" />
            </span>
            <h3 className="font-montserrat font-extrabold text-lg md:text-xl text-[#17213f] tracking-tight">
              {subtopicTitle ? `${subtopicTitle} Reel` : reel.title}
            </h3>
          </div>
          <p className="font-sans text-xs md:text-sm text-[#59627c] font-medium">
            {hasRealVideo
              ? 'Rendered H.264 educational explainer MP4 video • 8 Seconds Microlearning'
              : 'Synthesized 8s audiovisual concept breakdown'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hasRealVideo && (
            <a href={reel.videoUrl} download target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="font-sans text-xs font-bold border-2 border-[#17213f] bg-white text-[#17213f] hover:bg-[#fff4bd] shadow-[2px_2px_0_#17213f] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download MP4
              </Button>
            </a>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-[#17213f] bg-[#c9ff4d] text-[#17213f] font-sans font-extrabold text-xs shadow-[2px_2px_0_#17213f]">
            {hasRealVideo ? 'MP4 VIDEO' : 'INTERACTIVE REEL'}
          </span>
        </div>
      </div>

      {/* Reel Player Box (Vertical Handheld Viewport with Studio Border Frame) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Left/Center: Video Screen */}
        <div className="md:col-span-3 rounded-3xl bg-[#090D16] border-3 border-[#17213f] p-4 md:p-5 relative overflow-hidden shadow-[7px_7px_0_#17213f] flex flex-col justify-between aspect-[9/14] md:aspect-[9/13.5] max-w-sm mx-auto w-full">
          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16]/90 via-transparent to-[#090D16]/50 pointer-events-none z-10" />

          {/* Real HTML5 Video Element if available */}
          {hasRealVideo && (
            <video
              ref={videoRef}
              src={reel.videoUrl}
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
              onClick={togglePlay}
            />
          )}

          {/* Top Overlay Studio Tag & Mute Control */}
          <div className="relative z-20 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#17213f]/85 backdrop-blur-md border border-white/20 font-mono text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#c9ff4d] animate-pulse" />
              {hasRealVideo ? 'LearnVerse 8s Reel' : 'LearnVerse Interactive'}
            </span>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-[#17213f]/85 backdrop-blur-md border border-white/20 text-white hover:text-[#c9ff4d] hover:border-[#c9ff4d] transition-all cursor-pointer shadow-sm"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Graphic only when no real video exists */}
          {!hasRealVideo && (
            <div className="relative z-20 my-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-1.5 h-16">
                {(reel.audioWaveform || []).map((val, idx) => {
                  const isWaveActive = isPlaying
                  const heightPercent = isWaveActive
                    ? Math.min(100, Math.max(20, val * 100 + Math.sin(currentTime * 3 + idx) * 30))
                    : val * 40

                  return (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full bg-gradient-to-t from-[#c9ff4d]/40 to-[#c9ff4d] transition-all duration-200"
                      style={{ height: `${heightPercent}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Bottom Area: Live Subtitle/Chapter Heading + Video Controls */}
          <div className="relative z-20 mt-auto space-y-3 pt-2">
            {/* Live Subtitle / Chapter Box - Placed at the bottom to never obstruct the animation */}
            <div className="px-4 py-2.5 rounded-2xl bg-[#0F172A]/90 backdrop-blur-md border border-white/20 text-center space-y-0.5 shadow-2xl transition-all">
              <span className="text-[10px] font-mono text-[#c9ff4d] font-black uppercase tracking-wider block">
                {currentChapter.title}
              </span>
              <p className="font-montserrat font-bold text-xs md:text-sm text-white/95 leading-snug line-clamp-2">
                "{currentChapter.subtitle}"
              </p>
            </div>

            {/* High-Contrast Timeline Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/90 px-0.5">
                <span>0:{currentTime < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)}</span>
                <span className="text-white/60">0:{duration < 10 ? `0${duration}` : duration}</span>
              </div>
              <div
                className="w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const seekTime = (clickX / rect.width) * duration
                  handleSeek(seekTime)
                }}
              >
                <div
                  className="h-full bg-[#c9ff4d] transition-all duration-100 rounded-full shadow-[0_0_10px_#c9ff4d]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSeek(0)}
                className="h-8 px-2.5 text-white/80 hover:text-white hover:bg-white/15 font-mono text-xs cursor-pointer rounded-lg"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                <span className="text-[10px]">Replay</span>
              </Button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-13 h-13 rounded-full bg-[#c9ff4d] text-[#17213f] border-2 border-[#17213f] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-[3px_3px_0_#17213f] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={handleSpeedToggle}
                className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-white font-mono text-xs font-bold hover:bg-white/25 hover:text-[#c9ff4d] transition-colors cursor-pointer"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Chapter Markers, Objectives & Full Script (Neo-Brutalist Theme) */}
        <div className="md:col-span-2 space-y-4">
          {learningObjectives && learningObjectives.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border-2 border-[#17213f] shadow-[4px_4px_0_#17213f] space-y-3">
              <h4 className="font-montserrat font-black text-xs uppercase tracking-wider text-[#17213f] flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#fff4bd] border border-[#17213f]">
                  <Sparkles className="w-3.5 h-3.5 text-[#17213f]" />
                </span>
                Target Learning Objectives
              </h4>
              <ul className="space-y-2">
                {learningObjectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#f7f6f1] border border-[#d6d3c7] font-mono text-xs text-[#17213f] flex items-start gap-2.5 font-medium leading-relaxed"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#c9ff4d] border border-[#17213f] text-[#17213f] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scene Keyframes Panel */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#17213f] shadow-[4px_4px_0_#17213f] space-y-3">
            <h4 className="font-montserrat font-black text-xs uppercase tracking-wider text-[#17213f] flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#9be8ff] border border-[#17213f]">
                <Layers className="w-3.5 h-3.5 text-[#17213f]" />
              </span>
              Scene Keyframes
            </h4>

            <div className="space-y-2">
              {(reel.chapters || []).map((chap) => {
                const isActive = currentChapter.id === chap.id
                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => handleSeek(chap.timestampSeconds)}
                    className={`w-full text-left p-3 rounded-xl border-2 font-mono text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'border-[#17213f] bg-[#c9ff4d] text-[#17213f] font-bold shadow-[2px_2px_0_#17213f] translate-x-0.5'
                        : 'border-[#e2e0d8] bg-[#f7f6f1] text-[#59627c] hover:border-[#17213f] hover:text-[#17213f] hover:bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="block font-bold">{chap.title}</span>
                      {chap.subtitle && (
                        <span className="block text-[11px] opacity-80 font-medium truncate max-w-[190px]">
                          {chap.subtitle}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/70 border border-[#17213f]/30 text-[10px] font-extrabold shrink-0">
                      0:{chap.timestampSeconds < 10 ? `0${chap.timestampSeconds}` : chap.timestampSeconds}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Narration Script Panel */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#17213f] shadow-[4px_4px_0_#17213f] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-montserrat font-black text-xs uppercase tracking-wider text-[#17213f] flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#ffb7dc] border border-[#17213f]">
                  <FileText className="w-3.5 h-3.5 text-[#17213f]" />
                </span>
                Narration Script
              </h4>
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                className="font-mono text-xs font-bold text-[#17213f] bg-[#f7f6f1] hover:bg-[#fff4bd] border border-[#17213f] px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
              >
                {showTranscript ? 'Collapse' : 'Expand'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f7f6f1] border border-[#d6d3c7]">
              <p
                className={`font-mono text-xs text-[#17213f] leading-relaxed ${
                  showTranscript ? '' : 'line-clamp-4'
                }`}
              >
                {reel.narrationScript}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
