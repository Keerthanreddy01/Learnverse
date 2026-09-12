import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Colors, Spacing, Typography } from '../constants/theme'
import { VideoReel } from '../types'
import { Play, Pause, RotateCcw, Sparkles, Layers, Volume2, VolumeX, AlertCircle } from 'lucide-react-native'

interface ReelPlayerProps {
  reel: VideoReel
  videoUrl?: string
}

export default function ReelPlayer({ reel, videoUrl }: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const duration = reel.durationSeconds || 8
  const hasValidVideoUrl = Boolean(videoUrl && videoUrl.startsWith('http'))

  // Initialize expo-video player
  const player = useVideoPlayer(hasValidVideoUrl ? (videoUrl as string) : '', (p) => {
    p.loop = true
    p.muted = isMuted
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      if (player && hasValidVideoUrl) {
        try {
          player.play()
        } catch {
          setHasError(true)
        }
      }
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            if (player && hasValidVideoUrl) player.pause()
            return 0
          }
          return Math.min(duration, prev + 1 * speed)
        })
      }, 1000)
    } else {
      if (player && hasValidVideoUrl) {
        try {
          player.pause()
        } catch {}
      }
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, speed, player, hasValidVideoUrl])

  const currentChapter =
    [...reel.chapters]
      .reverse()
      .find((c) => currentTime >= c.timestampSeconds) || reel.chapters[0] || {
        id: 'c-0',
        title: reel.title,
        timestampSeconds: 0,
        subtitle: reel.narrationScript,
      }

  const progressPercent = Math.round((currentTime / duration) * 100)

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]
    setSpeed(next)
  }

  const handleToggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (player && hasValidVideoUrl) {
      try {
        player.muted = next
      } catch {}
    }
  }

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <View style={styles.container}>
      {/* Video Screen Box */}
      <View style={styles.videoScreen}>
        {/* Real Video Player or Fallback Waveform */}
        {hasValidVideoUrl && player ? (
          <VideoView
            style={styles.fullVideo}
            player={player}
            nativeControls={false}
          />
        ) : null}

        {/* Top Screen Overlays */}
        <View style={styles.screenTopRow}>
          <View style={styles.reelTag}>
            <Sparkles size={11} color={Colors.primary} />
            <Text style={styles.reelTagText}>{duration}s Micro-Reel</Text>
          </View>
          <TouchableOpacity
            style={styles.muteBtn}
            onPress={handleToggleMute}
            activeOpacity={0.7}
          >
            {isMuted ? <VolumeX size={14} color="#FFFFFF" /> : <Volume2 size={14} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        {/* Center Waveform & Subtitles (shown when not full video or overlaid) */}
        {!hasValidVideoUrl && (
          <View style={styles.centerContainer}>
            {/* Audio Waveform */}
            <View style={styles.waveformContainer}>
              {(reel.audioWaveform || [0.2, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7]).map((val, idx) => {
                const activeHeight = isPlaying
                  ? Math.min(48, Math.max(12, val * 48 + Math.sin(currentTime * 3 + idx) * 15))
                  : val * 24
                return (
                  <View
                    key={idx}
                    style={[styles.waveBar, { height: activeHeight }]}
                  />
                )
              })}
            </View>

            {/* Subtitle Card */}
            <View style={styles.subtitleCard}>
              <Text style={styles.chapterTag}>{currentChapter.title}</Text>
              <Text style={styles.subtitleText}>"{currentChapter.subtitle}"</Text>
            </View>
          </View>
        )}

        {/* Bottom Screen Controls */}
        <View style={styles.screenBottom}>
          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <Text style={styles.timeText}>
              0:{currentTime < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.timeText}>0:{duration < 10 ? `0${duration}` : duration}</Text>
          </View>

          {/* Buttons Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => setCurrentTime(0)} style={styles.controlBtn}>
              <RotateCcw size={15} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTogglePlay}
              style={styles.playBtn}
              activeOpacity={0.8}
            >
              {isPlaying ? <Pause size={20} color="#000000" /> : <Play size={20} color="#000000" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSpeedToggle} style={styles.speedBtn}>
              <Text style={styles.speedText}>{speed}x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chapter Scrubbers */}
      {reel.chapters && reel.chapters.length > 0 && (
        <View style={styles.chaptersCard}>
          <View style={styles.chaptersHeader}>
            <Layers size={13} color={Colors.primary} />
            <Text style={styles.chaptersTitle}>CHAPTER TIMESTAMPS</Text>
          </View>

          <View style={styles.chapterButtons}>
            {reel.chapters.map((chap) => {
              const isActive = currentChapter.id === chap.id
              return (
                <TouchableOpacity
                  key={chap.id}
                  style={[styles.chapterBtn, isActive && styles.chapterBtnActive]}
                  onPress={() => setCurrentTime(chap.timestampSeconds)}
                >
                  <Text style={[styles.chapterBtnText, isActive && styles.chapterBtnTextActive]}>
                    {chap.title}
                  </Text>
                  <Text style={styles.chapterTime}>
                    0:{chap.timestampSeconds < 10 ? `0${chap.timestampSeconds}` : chap.timestampSeconds}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  videoScreen: {
    height: 380,
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  fullVideo: {
    ...StyleSheet.absoluteFill,
  },
  screenTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  reelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reelTagText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.text,
  },
  muteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    zIndex: 5,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 48,
  },
  waveBar: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  subtitleCard: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: Spacing.sm + 4,
    alignItems: 'center',
    width: '90%',
    gap: 4,
  },
  chapterTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: '700',
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },
  screenBottom: {
    gap: 8,
    zIndex: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  controlBtn: {
    padding: 6,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  speedText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
  chaptersCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chaptersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chaptersTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  chapterButtons: {
    gap: 6,
  },
  chapterBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  chapterBtnActive: {
    borderColor: 'rgba(29, 237, 131, 0.4)',
    backgroundColor: Colors.primaryMuted,
  },
  chapterBtnText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  chapterBtnTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  chapterTime: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textDim,
  },
})
