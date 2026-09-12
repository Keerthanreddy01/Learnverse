import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  AppState,
  AppStateStatus,
  ViewToken,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Colors, Spacing, Typography } from '../constants/theme'
import { useStudy } from '../context/StudyContext'
import { ReelItem } from '../types'
import { fetchReelsFromSupabase, pollJobStatus, REAL_VIDEO_ASSETS } from '../services/supabase'
import { TEMPORARY_FEATURED_REELS } from '../constants/featuredReels'
import YouTubeShortPlayer, { YouTubePlayerHandle } from '../components/YouTubeShortPlayer'
import UploadModal from '../components/UploadModal'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Bookmark,
  BookOpen,
  HelpCircle,
  Sparkles,
  Video as VideoIcon,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
} from 'lucide-react-native'

interface ReelsScreenProps {
  onNavigateToStudy: (documentId: string, tab?: 'subtopics' | 'notes' | 'flashcards' | 'quiz' | 'reel' | 'gap') => void
  isScreenFocused?: boolean
}

import ReelQuizCard from '../components/ReelQuizCard'

export type FeedItem =
  | { type: 'reel'; data: ReelItem; id: string }
  | { type: 'quiz'; id: string }

export default function ReelsScreen({ onNavigateToStudy, isScreenFocused = true }: ReelsScreenProps) {
  const { getFeedReels, materials } = useStudy()
  const { height, width } = useWindowDimensions()
  const flatListRef = useRef<FlatList<FeedItem>>(null)

  // Start immediately with the two temporary YouTube reels so there is zero blank delay
  const [reels, setReels] = useState<ReelItem[]>(TEMPORARY_FEATURED_REELS)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Map of reel id → imperative ref for YouTube players
  const ytPlayerRefs = useRef<Record<string, YouTubePlayerHandle | null>>({})

  // Interleave the 3-Question Quiz & Competition Leaderboard directly after the 4 featured reels
  const feedItems = React.useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []
    if (reels.length >= 4) {
      items.push({ type: 'reel', data: reels[0], id: reels[0].id })
      items.push({ type: 'reel', data: reels[1], id: reels[1].id })
      items.push({ type: 'reel', data: reels[2], id: reels[2].id })
      items.push({ type: 'reel', data: reels[3], id: reels[3].id })
      // 3-Question Retention Quiz + Competition Leaderboard placed right after the 4 reels
      items.push({ type: 'quiz', id: 'checkpoint-quiz-states-of-matter' })
      for (let i = 4; i < reels.length; i++) {
        items.push({ type: 'reel', data: reels[i], id: reels[i].id })
      }
    } else if (reels.length >= 2) {
      items.push({ type: 'reel', data: reels[0], id: reels[0].id })
      items.push({ type: 'reel', data: reels[1], id: reels[1].id })
      items.push({ type: 'quiz', id: 'checkpoint-quiz-states-of-matter' })
      for (let i = 2; i < reels.length; i++) {
        items.push({ type: 'reel', data: reels[i], id: reels[i].id })
      }
    } else {
      reels.forEach((r) => items.push({ type: 'reel', data: r, id: r.id }))
      items.push({ type: 'quiz', id: 'checkpoint-quiz-states-of-matter' })
    }
    return items
  }, [reels])

  // Load real reels from Supabase + StudyContext with Temporary featured reels always at top
  const loadReelsData = useCallback(async () => {
    try {
      const remoteReels = await fetchReelsFromSupabase()
      const localReels = getFeedReels()

      const map = new Map<string, ReelItem>()

      // 1. Always pin the temporary featured reels at top
      TEMPORARY_FEATURED_REELS.forEach((r) => {
        map.set(r.id, r)
      })

      // 2. Append local reels from uploaded documents (using direct MP4 streams)
      localReels.forEach((r, idx) => {
        const fallbackUrl = REAL_VIDEO_ASSETS[idx % REAL_VIDEO_ASSETS.length]
        if (!map.has(r.id)) {
          map.set(r.id, {
            ...r,
            sourceType: 'direct',
            videoUrl:
              r.videoUrl && r.videoUrl.startsWith('http') && !r.videoUrl.includes('youtube.com')
                ? r.videoUrl
                : fallbackUrl,
            isGenerated: true,
            status: r.status || 'ready',
          })
        }
      })

      // 3. Append remote Supabase-generated reels (using direct MP4 streams)
      remoteReels.forEach((r, idx) => {
        if (!map.has(r.id)) {
          const fallbackUrl = REAL_VIDEO_ASSETS[idx % REAL_VIDEO_ASSETS.length]
          map.set(r.id, {
            ...r,
            sourceType: 'direct',
            videoUrl:
              r.videoUrl && r.videoUrl.startsWith('http') && !r.videoUrl.includes('youtube.com')
                ? r.videoUrl
                : fallbackUrl,
          })
        }
      })

      const combined = Array.from(map.values())
      setReels(combined)
    } catch (err) {
      console.warn('[ReelsScreen Load Error]:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getFeedReels])

  useEffect(() => {
    loadReelsData()
  }, [loadReelsData, materials])

  // Polling for reels in 'generating' status
  useEffect(() => {
    const generatingReels = reels.filter((r) => r.status === 'generating')
    if (generatingReels.length === 0) return

    const pollTimer = setInterval(async () => {
      let hasUpdates = false
      const updatedList = await Promise.all(
        reels.map(async (reel) => {
          if (reel.status === 'generating' && reel.id) {
            const jobId = reel.id.replace('reel-', '')
            const res = await pollJobStatus(jobId)
            if (res.status === 'ready' || res.status === 'completed') {
              hasUpdates = true
              return {
                ...reel,
                status: 'ready' as const,
                videoUrl: res.videoUrl || reel.videoUrl,
              }
            } else if (res.status === 'failed') {
              hasUpdates = true
              return {
                ...reel,
                status: 'failed' as const,
              }
            }
          }
          return reel
        })
      )

      if (hasUpdates) {
        setReels(updatedList)
      }
    }, 6000)

    return () => clearInterval(pollTimer)
  }, [reels])

  const handleRefresh = () => {
    setRefreshing(true)
    loadReelsData()
  }

  const prevActiveIndexRef = useRef(0)

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const firstVisible = viewableItems[0]
        if (firstVisible.index !== null && firstVisible.index !== undefined) {
          const newIndex = firstVisible.index
          const prevIndex = prevActiveIndexRef.current

          // Pause outgoing YouTube player
          if (prevIndex !== newIndex) {
            const prevItem = feedItems[prevIndex]
            if (prevItem?.type === 'reel' && prevItem.data.sourceType === 'youtube') {
              ytPlayerRefs.current[prevItem.data.id]?.pause()
            }
            // Play incoming YouTube player
            const nextItem = feedItems[newIndex]
            if (nextItem?.type === 'reel' && nextItem.data.sourceType === 'youtube') {
              setTimeout(() => {
                ytPlayerRefs.current[nextItem.data.id]?.play()
              }, 200)
            }
          }

          prevActiveIndexRef.current = newIndex
          setActiveIndex(newIndex)
        }
      }
    }
  ).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingTitle}>Loading your learning reels…</Text>
        <Text style={styles.loadingSubtitle}>Connecting to microlearning stream</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          if (item.type === 'quiz') {
            return (
              <ReelQuizCard
                itemHeight={height}
                itemWidth={width}
                onContinue={() => {
                  flatListRef.current?.scrollToIndex({
                    index: Math.min(index + 1, feedItems.length - 1),
                    animated: true,
                  })
                }}
              />
            )
          }

          return (
            <View style={{ height, width }}>
              <ReelCard
                item={item.data}
                isActive={index === activeIndex}
                isScreenFocused={isScreenFocused}
                itemHeight={height}
                itemWidth={width}
                onNavigateToStudy={onNavigateToStudy}
                ytPlayerRef={(handle) => {
                  ytPlayerRefs.current[item.data.id] = handle
                }}
                onRetryReel={() => {
                  setReels((prev) =>
                    prev.map((r) => (r.id === item.data.id ? { ...r, status: 'generating' } : r))
                  )
                }}
              />

              {/* Banner on 2nd reel notifying of upcoming quiz checkpoint */}
              {index === 1 && (
                <TouchableOpacity
                  style={styles.upcomingQuizBadge}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({ index: 2, animated: true })
                  }}
                  activeOpacity={0.85}
                >
                  <Sparkles size={13} color="#1DED83" />
                  <Text style={styles.upcomingQuizBadgeText}>Next: Quiz Checkpoint (Swipe Up)</Text>
                  <ChevronRight size={13} color="#1DED83" />
                </TouchableOpacity>
              )}
            </View>
          )
        }}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={height}
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      <UploadModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(id) => onNavigateToStudy(id)}
      />
    </View>
  )
}

interface ReelCardProps {
  item: ReelItem
  isActive: boolean
  isScreenFocused?: boolean
  itemHeight: number
  itemWidth: number
  onNavigateToStudy: (documentId: string, tab?: 'subtopics' | 'notes' | 'flashcards' | 'quiz' | 'reel' | 'gap') => void
  /** Callback that gives the parent access to the YouTube player imperative handle */
  ytPlayerRef: (handle: YouTubePlayerHandle | null) => void
  onRetryReel: () => void
}

function ReelCard({
  item,
  isActive,
  isScreenFocused = true,
  itemHeight,
  itemWidth,
  onNavigateToStudy,
  ytPlayerRef,
  onRetryReel,
}: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  // YouTube autoplay requires muted start on iOS — start muted, user can unmute via button
  const [isMuted, setIsMuted] = useState(item.sourceType === 'youtube')
  // Internal ref to this card's YouTube player handle
  const localYtRef = useRef<YouTubePlayerHandle | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showTapIndicator, setShowTapIndicator] = useState(false)
  const [progress, setProgress] = useState(0)

  const isGenerating = item.status === 'generating'
  const isFailed = item.status === 'failed'
  const isReady = item.status === 'ready' || !item.status

  const isYouTube = item.sourceType === 'youtube' && Boolean(item.youtubeVideoId)
  const hasValidDirectMp4 =
    !isYouTube &&
    Boolean(
      item.videoUrl &&
        item.videoUrl.startsWith('http') &&
        !item.videoUrl.includes('youtube.com')
    )

  // Explicitly identify the fourth reel to scale it up
  const isFourthReel =
    item.id === 'featured-reel-4' ||
    Boolean(item.videoUrl && item.videoUrl.includes('Video_Project_6'))

  const shouldPlay = isActive && isScreenFocused && isPlaying && isReady

  // ONLY initialize native expo-video player for valid direct MP4 URLs (NEVER for YouTube URLs)
  const player = useVideoPlayer(hasValidDirectMp4 && isReady ? item.videoUrl : '', (p) => {
    p.loop = true
    p.muted = isMuted
    if (shouldPlay) {
      p.play()
    } else {
      p.pause()
    }
  })

  // Handle active index transitions, tab focus changes, and background app state
  useEffect(() => {
    const appSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        setIsPlaying(false)
        if (player && hasValidDirectMp4) {
          try {
            player.pause()
          } catch {}
        }
        if (isYouTube) {
          localYtRef.current?.pause()
        }
      }
    })

    if (isActive && isScreenFocused && isReady) {
      setIsPlaying(true)
      if (player && hasValidDirectMp4) {
        try {
          player.play()
        } catch {}
      }
      if (isYouTube) {
        localYtRef.current?.play()
      }
    } else {
      // STOP immediately when leaving the reels section, switching tabs, or scrolling away!
      setIsPlaying(false)
      if (player && hasValidDirectMp4) {
        try {
          player.pause()
        } catch {}
      }
      if (isYouTube) {
        localYtRef.current?.pause()
      }
    }

    return () => appSub.remove()
  }, [isActive, isScreenFocused, isReady, hasValidDirectMp4, player, isYouTube])

  // Video progress indicator update
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && isPlaying && isReady) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 100 / ((item.duration || 15) * 10)
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isActive, isPlaying, isReady, item.duration])

  const handleTogglePlay = () => {
    if (!isReady) return
    const next = !isPlaying
    setIsPlaying(next)
    setShowTapIndicator(true)
    setTimeout(() => setShowTapIndicator(false), 800)

    if (player && hasValidDirectMp4) {
      try {
        if (next) player.play()
        else player.pause()
      } catch {}
    }
  }

  const handleToggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (player && hasValidDirectMp4) {
      try {
        player.muted = next
      } catch {}
    }
    // Also control mute on the YouTube WebView player
    if (localYtRef.current) {
      if (next) localYtRef.current.mute()
      else localYtRef.current.unmute()
    }
  }

  return (
    <View style={[styles.reelCard, { height: itemHeight, width: itemWidth }]}>
      {/* Video Canvas Touch Area */}
      <TouchableOpacity
        style={styles.videoTouchArea}
        activeOpacity={1}
        onPress={handleTogglePlay}
      >
        {/* State A: Generating Reel */}
        {isGenerating ? (
          <LinearGradient
            colors={['#0F172A', '#1E1B4B', '#09090B']}
            style={styles.statusStateCanvas}
          >
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateTitle}>Your learning reel is being generated…</Text>
            <Text style={styles.stateSubtitle}>
              Synthesizing 8s motion-graphics video for "{item.subtopicTitle}"
            </Text>
            <View style={styles.generatingBarTrack}>
              <View style={styles.generatingBarFill} />
            </View>
          </LinearGradient>
        ) : isFailed ? (
          /* State B: Failed Reel */
          <LinearGradient
            colors={['#180A0A', '#2D1215', '#09090B']}
            style={styles.statusStateCanvas}
          >
            <View style={styles.failedBadge}>
              <AlertTriangle size={32} color="#EF4444" />
            </View>
            <Text style={styles.stateTitle}>This reel could not be loaded.</Text>
            <Text style={styles.stateSubtitle}>
              There was an issue rendering or fetching the video asset.
            </Text>
            <View style={styles.failedButtonsRow}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={onRetryReel}
                activeOpacity={0.8}
              >
                <RefreshCw size={14} color="#000000" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ) : isYouTube ? (
          /* State C1: YouTube IFrame API embed — fullscreen, muted autoplay */
          <YouTubeShortPlayer
            ref={(handle) => {
              localYtRef.current = handle
              ytPlayerRef(handle)
            }}
            videoId={item.youtubeVideoId!}
            isActive={isActive && isPlaying}
            isMuted={isMuted}
          />
        ) : hasValidDirectMp4 && player ? (
          /* State C2: Native direct MP4 playback via expo-video */
          <VideoView
            style={[
              styles.fullVideo,
              isFourthReel && styles.fourthReelScaledVideo,
            ]}
            player={player}
            nativeControls={false}
            contentFit={isFourthReel ? 'cover' : 'contain'}
          />
        ) : (
          /* State D: Fallback Visual Canvas */
          <LinearGradient
            colors={['#0D0D1A', '#1A1633', '#0F172A']}
            style={styles.visualCanvas}
          >
            <View style={styles.ambientGlowTop} />
            <View style={styles.ambientGlowBottom} />
            <View style={styles.centerInfographic}>
              <View style={styles.badgePulseRing}>
                <View style={styles.badgeInnerGlow}>
                  <Sparkles size={36} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.canvasSubtopicTag}>
                <Text style={styles.canvasSubtopicText}>{item.subtopicTitle}</Text>
              </View>
              <Text style={styles.narrationExcerpt} numberOfLines={3}>
                "{item.description || item.learningObjective}"
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Center Tap Feedback Indicator */}
        {showTapIndicator && isReady && (
          <View style={styles.tapIndicatorCircle}>
            {isPlaying ? (
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Subtle Gradient Shadow for Top & Bottom text legibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)', '#000000']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Top Header Overlay */}
      <View style={styles.topOverlay}>
        <View style={styles.curriculumPill}>
          <Sparkles size={12} color={Colors.primary} />
          <Text style={styles.curriculumPillText} numberOfLines={1}>
            {item.subject ? `${item.subject} • ` : ''}
            {item.curriculumTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.muteBtn}
          onPress={handleToggleMute}
          activeOpacity={0.75}
        >
          {isMuted ? (
            <VolumeX size={16} color="#FFFFFF" />
          ) : (
            <Volume2 size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Right Action Sidebar */}
      <View style={styles.rightSidebar}>

        {/* Bookmark / Save */}
        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => setIsSaved(!isSaved)}
          activeOpacity={0.8}
        >
          <View style={[styles.sideIconBox, isSaved && styles.sideIconBoxSaved]}>
            <Bookmark
              size={20}
              color={isSaved ? Colors.primary : '#FFFFFF'}
              fill={isSaved ? Colors.primary : 'transparent'}
            />
          </View>
          <Text style={styles.sideBtnLabel}>Save</Text>
        </TouchableOpacity>

        {/* Jump to Full Study Deck */}
        {item.sourceDocumentId || item.documentId ? (
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => onNavigateToStudy((item.sourceDocumentId || item.documentId)!, 'subtopics')}
            activeOpacity={0.8}
          >
            <View style={styles.sideIconBox}>
              <BookOpen size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.sideBtnLabel}>Study</Text>
          </TouchableOpacity>
        ) : null}

        {/* Jump to Quiz */}
        {item.sourceDocumentId || item.documentId ? (
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => onNavigateToStudy((item.sourceDocumentId || item.documentId)!, 'quiz')}
            activeOpacity={0.8}
          >
            <View style={[styles.sideIconBox, styles.sideIconBoxQuiz]}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <Text style={styles.sideBtnLabel}>Quiz</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Bottom Metadata Overlay */}
      <View style={styles.bottomOverlay}>
        <View style={styles.subtopicBadgeRow}>
          <View style={styles.reelTag}>
            <Text style={styles.reelTagText}>{item.duration || 15}s Micro-Reel</Text>
          </View>
          <View style={styles.statusTag}>
            <Text style={styles.statusTagText}>Featured Microlearning</Text>
          </View>
          {item.sourceDocumentId || item.documentId ? (
            <View style={styles.userMaterialTag}>
              <FileText size={10} color={Colors.cyan} />
              <Text style={styles.userMaterialTagText}>Generated from your material</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.subtopicHeading}>{item.subtopicTitle}</Text>

        {item.learningObjective ? (
          <Text style={styles.learningObjectiveText} numberOfLines={2}>
            🎯 {item.learningObjective}
          </Text>
        ) : item.description ? (
          <Text style={styles.learningObjectiveText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {(item.sourceDocumentId || item.documentId) && (
          <TouchableOpacity
            style={styles.studyCtaBar}
            onPress={() => onNavigateToStudy((item.sourceDocumentId || item.documentId)!, 'notes')}
            activeOpacity={0.85}
          >
            <BookOpen size={13} color="#000000" />
            <Text style={styles.studyCtaBarText}>Open Study Deck & Notes</Text>
            <ChevronRight size={13} color="#000000" />
          </TouchableOpacity>
        )}

        {/* Bottom Playback Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#000000',
    gap: Spacing.sm,
  },
  loadingTitle: {
    ...Typography.titleSmall,
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: Spacing.md,
  },
  loadingSubtitle: {
    ...Typography.bodyMuted,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  reelCard: {
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  videoTouchArea: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    ...StyleSheet.absoluteFill,
  },
  fourthReelScaledVideo: {
    ...StyleSheet.absoluteFill,
    transform: [{ scale: 1.45 }],
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 5,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 5,
  },
  statusStateCanvas: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  stateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  stateSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '85%',
  },
  generatingBarTrack: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  generatingBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  failedBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  failedButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: 10,
    borderRadius: 16,
  },
  retryBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  visualCanvas: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(92, 84, 232, 0.18)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(29, 237, 131, 0.12)',
  },
  centerInfographic: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    width: '90%',
  },
  badgePulseRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(92, 84, 232, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeInnerGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(29, 237, 131, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  canvasSubtopicTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  canvasSubtopicText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  narrationExcerpt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tapIndicatorCircle: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 15,
  },
  topOverlay: {
    position: 'absolute',
    top: 52,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  curriculumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: '75%',
  },
  curriculumPillText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  rightSidebar: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 130,
    alignItems: 'center',
    gap: Spacing.md,
    zIndex: 10,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 4,
  },
  sideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIconBoxLiked: {
    borderColor: 'rgba(255, 77, 109, 0.6)',
    backgroundColor: 'rgba(255, 77, 109, 0.2)',
  },
  sideIconBoxSaved: {
    borderColor: 'rgba(29, 237, 131, 0.6)',
    backgroundColor: 'rgba(29, 237, 131, 0.2)',
  },
  sideIconBoxQuiz: {
    borderColor: 'rgba(29, 237, 131, 0.4)',
  },
  sideBtnLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 38,
    left: Spacing.md,
    right: 74,
    gap: 6,
    zIndex: 10,
  },
  subtopicBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  reelTag: {
    backgroundColor: 'rgba(29, 237, 131, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(29, 237, 131, 0.4)',
  },
  reelTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  statusTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  userMaterialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
  },
  userMaterialTagText: {
    color: Colors.cyan,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  subtopicHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  learningObjectiveText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  studyCtaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  studyCtaBarText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
    flex: 1,
    marginLeft: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 6,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  upcomingQuizBadge: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 17, 24, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(29, 237, 131, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 50,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upcomingQuizBadgeText: {
    color: '#1DED83',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
})
