import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Typography } from '../constants/theme'
import { CurriculumSubtopic } from '../types'
import {
  Sparkles,
  Play,
  Video,
  ChevronRight,
  Star,
  Zap,
  Award,
  Trophy,
  Lightbulb,
  Rocket,
  Flame,
  CheckCircle2,
  Layers,
  HelpCircle,
} from 'lucide-react-native'

interface SubtopicsListProps {
  subtopics: CurriculumSubtopic[]
  overview?: string
  onPlaySubtopicReel: (subtopic: CurriculumSubtopic) => void
  onNavigateToTab?: (tab: 'notes' | 'flashcards' | 'quiz') => void
}

// Playful theme colors and emojis for chapters
const CHAPTER_THEMES = [
  {
    gradient: ['#FEF9C3', '#FEF08A'],
    badgeBg: '#FDE047',
    tagColor: '#854D0E',
    emoji: '🌟',
    accent: '#CA8A04',
    pillBg: '#FEF08A',
  },
  {
    gradient: ['#EDE9FE', '#DDD6FE'],
    badgeBg: '#C4B5FD',
    tagColor: '#5B21B6',
    emoji: '⚡',
    accent: '#7C3AED',
    pillBg: '#DDD6FE',
  },
  {
    gradient: ['#FFEDD5', '#FED7AA'],
    badgeBg: '#FDBA74',
    tagColor: '#9A3412',
    emoji: '🚀',
    accent: '#EA580C',
    pillBg: '#FED7AA',
  },
  {
    gradient: ['#DCFCE7', '#BBF7D0'],
    badgeBg: '#86EFAC',
    tagColor: '#166534',
    emoji: '🌿',
    accent: '#16A34A',
    pillBg: '#BBF7D0',
  },
]

export default function SubtopicsList({
  subtopics,
  overview,
  onPlaySubtopicReel,
  onNavigateToTab,
}: SubtopicsListProps) {
  if (!subtopics || subtopics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyTitle}>Your Adventure is Loading!</Text>
        <Text style={styles.emptySubtitle}>
          Upload a curriculum document to auto-generate colorful chapters and microlearning reels!
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Fun AI Study Buddy / Quest Briefing Card */}
      <View style={styles.buddyCard}>
        <LinearGradient
          colors={['#FFFDF0', '#F0F9FF', '#F5F3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.buddyRow}>
          <View style={styles.buddyAvatarBox}>
            <Text style={styles.buddyAvatarEmoji}>🤖</Text>
            <View style={styles.sparkleDot}>
              <Sparkles size={10} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.buddySpeechBubble}>
            <View style={styles.bubbleHeaderRow}>
              <Text style={styles.buddyName}>SPARKY THE SCIENCE BUDDY</Text>
              <View style={styles.xpBadge}>
                <Zap size={10} color="#6C68FF" fill="#6C68FF" />
                <Text style={styles.xpBadgeText}>+{subtopics.length * 100} XP</Text>
              </View>
            </View>
            <Text style={styles.buddyText}>
              {overview
                ? `Hey explorer! 🚀 In this quest: ${overview}`
                : "Welcome to your learning quest! Watch 8s power reels, master each chapter, and unlock your golden badge!"}
            </Text>
          </View>
        </View>

        {/* Quest Rewards Badges */}
        <View style={styles.rewardBadgesRow}>
          <View style={styles.rewardBadge}>
            <Star size={12} color="#EAB308" fill="#EAB308" />
            <Text style={styles.rewardBadgeText}>{subtopics.length} Fun Chapters</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Video size={12} color="#3B82F6" />
            <Text style={styles.rewardBadgeText}>8s Power Reels</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Trophy size={12} color="#10B981" />
            <Text style={styles.rewardBadgeText}>Earn Trophy 🏆</Text>
          </View>
        </View>
      </View>

      {/* 2. Quest Path Header */}
      <View style={styles.questHeaderRow}>
        <View style={styles.questTitleCol}>
          <View style={styles.questTagPill}>
            <Text style={styles.questTagText}>LEVEL 1 ADVENTURE</Text>
          </View>
          <Text style={styles.questHeading}>Learning Mission Map 🗺️</Text>
        </View>
        <View style={styles.chapterCountPill}>
          <Text style={styles.chapterCountText}>{subtopics.length} Chapters</Text>
        </View>
      </View>

      {/* 3. Subtopics Gamified Cards */}
      {subtopics.map((sub, idx) => {
        const theme = CHAPTER_THEMES[idx % CHAPTER_THEMES.length]
        return (
          <View key={sub.id || idx} style={styles.subtopicCard}>
            {/* Top Chapter Header Banner */}
            <View style={styles.chapterHeaderBanner}>
              <View style={styles.chapterBadgeRow}>
                <View style={[styles.chapterNumberBadge, { backgroundColor: theme.badgeBg }]}>
                  <Text style={styles.chapterEmoji}>{theme.emoji}</Text>
                  <Text style={[styles.chapterNumberText, { color: theme.tagColor }]}>
                    CHAPTER {idx + 1}
                  </Text>
                </View>
                <View style={styles.reelTagPill}>
                  <Play size={10} color="#181A20" fill="#181A20" />
                  <Text style={styles.reelTagText}>8s Reel</Text>
                </View>
              </View>

              <View style={styles.xpRewardPill}>
                <Zap size={11} color="#6C68FF" fill="#6C68FF" />
                <Text style={styles.xpRewardText}>+100 XP</Text>
              </View>
            </View>

            {/* Title & Kid-friendly summary */}
            <Text style={styles.chapterTitle}>{sub.title}</Text>
            <Text style={styles.chapterDescription}>{sub.description}</Text>

            {/* Mission Goals (Learning Objectives) */}
            {sub.learningObjectives && sub.learningObjectives.length > 0 && (
              <View style={styles.missionGoalsBox}>
                <View style={styles.goalsTitleRow}>
                  <Lightbulb size={13} color="#F59E0B" />
                  <Text style={styles.goalsHeading}>MISSION GOALS:</Text>
                </View>
                {sub.learningObjectives.map((obj, oIdx) => (
                  <View key={oIdx} style={styles.goalRow}>
                    <View style={styles.goalCheckCircle}>
                      <CheckCircle2 size={13} color="#15803D" />
                    </View>
                    <Text style={styles.goalText}>{obj}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Interactive Action Buttons */}
            <View style={styles.actionsRow}>
              {/* Big Bouncy Watch Reel Button */}
              <TouchableOpacity
                style={styles.watchReelBigBtn}
                onPress={() => onPlaySubtopicReel(sub)}
                activeOpacity={0.88}
              >
                <View style={styles.playIconCircle}>
                  <Play size={13} color="#181A20" fill="#181A20" />
                </View>
                <Text style={styles.watchReelBigText}>Watch 8s Reel!</Text>
                <Text style={styles.popcornEmoji}>🍿</Text>
              </TouchableOpacity>

              {/* Quick Practice Flashcards companion button */}
              {onNavigateToTab && (
                <TouchableOpacity
                  style={styles.practiceCardsBtn}
                  onPress={() => onNavigateToTab('flashcards')}
                  activeOpacity={0.8}
                >
                  <Layers size={13} color="#181A20" />
                  <Text style={styles.practiceCardsText}>Cards</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181A20',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#767984',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* AI Buddy Card */
  buddyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  buddyAvatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buddyAvatarEmoji: {
    fontSize: 24,
  },
  sparkleDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#6C68FF',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddySpeechBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    gap: 4,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buddyName: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#6C68FF',
    letterSpacing: 0.5,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6C68FF',
  },
  buddyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#1F2937',
    fontWeight: '600',
  },
  rewardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  rewardBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#374151',
  },

  /* Quest Header */
  questHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  questTitleCol: {
    gap: 3,
  },
  questTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EDDE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  questTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3F4D2A',
    letterSpacing: 0.5,
  },
  questHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.3,
  },
  chapterCountPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  chapterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },

  /* Subtopic Cards */
  subtopicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  chapterHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chapterNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  chapterEmoji: {
    fontSize: 12,
  },
  chapterNumberText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  reelTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  reelTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#181A20',
  },
  xpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  xpRewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C68FF',
  },
  chapterTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.2,
  },
  chapterDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4B5563',
    fontWeight: '500',
  },

  /* Mission Goals Box */
  missionGoalsBox: {
    backgroundColor: '#F8FAF5',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8DC',
    gap: 6,
  },
  goalsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  goalsHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  goalCheckCircle: {
    marginTop: 2,
  },
  goalText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },

  /* Action Buttons */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  watchReelBigBtn: {
    flex: 1,
    backgroundColor: '#B4F373',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  playIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchReelBigText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#181A20',
  },
  popcornEmoji: {
    fontSize: 14,
  },
  practiceCardsBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
  },
  practiceCardsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#181A20',
  },
})
