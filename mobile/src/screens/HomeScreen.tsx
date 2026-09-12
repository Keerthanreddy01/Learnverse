import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Colors, Spacing } from '../constants/theme'
import { useStudy } from '../context/StudyContext'
import { useAuth } from '../context/AuthContext'
import UploadModal from '../components/UploadModal'
import HomeQuizArena from '../components/HomeQuizArena'
import { OlympiadTrophy, MemojiAvatar } from '../components/Illustrations'
import {
  Bell,
  ArrowRight,
  Plus,
  BookOpen,
  Clock3,
  MoreHorizontal,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
  UploadCloud,
} from 'lucide-react-native'

interface HomeScreenProps {
  onNavigateToStudy: (materialId: string) => void
  onNavigateToExplore?: () => void
}

export default function HomeScreen({ onNavigateToStudy, onNavigateToExplore }: HomeScreenProps) {
  const { materials } = useStudy()
  const { user } = useAuth()
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const activeCourse = materials[0]

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: 3D Memoji + Greeting + Upload / Notification */}
        <View style={styles.topHeader}>
          <View style={styles.userGreetingRow}>
            <MemojiAvatar size={44} />
            <View style={styles.greetingTextBox}>
              <Text style={styles.greetingTitle}>Hello, {user?.name?.split(' ')[0] || 'Jacob'}</Text>
              <View style={styles.progressSubtitleRow}>
                <Zap size={12} color="#6C68FF" fill="#6C68FF" />
                <Text style={styles.progressSubtitleText}>Progress: 76%</Text>
              </View>
            </View>
          </View>

          <View style={styles.topHeaderActions}>
            <TouchableOpacity
              style={styles.uploadHeaderPill}
              onPress={() => setIsUploadOpen(true)}
              activeOpacity={0.8}
            >
              <UploadCloud size={13} color="#181A20" strokeWidth={2.4} />
              <Text style={styles.uploadHeaderPillText}>Upload PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setIsUploadOpen(true)}
              activeOpacity={0.8}
            >
              <Bell size={17} color="#181A20" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Featured Olympiad Hero Card */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.92}
          onPress={() => (activeCourse ? onNavigateToStudy(activeCourse.id) : setIsUploadOpen(true))}
        >
          {/* Background Decorative Math & Sparkles */}
          <View style={styles.doodleMath}>
            <Text style={styles.doodleMathText}>y = ?</Text>
          </View>
          <View style={styles.doodleStar1}>
            <Sparkles size={16} color="#FFD54F" />
          </View>
          <View style={styles.doodleStar2}>
            <Sparkles size={12} color="#FFFFFF" />
          </View>

          {/* 3D Gold Trophy Artwork on Right */}
          <View style={styles.trophyWrapper}>
            <OlympiadTrophy width={120} height={120} />
          </View>

          {/* Hero Card Text & Action Button on Left */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>A series of{"\n"}Olympiads</Text>
            <Text style={styles.heroSubtitle}>
              A series of Olympiads for erudite people from all over the world
            </Text>

            {/* Circular Dark Arrow Button */}
            <View style={styles.heroActionBtn}>
              <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Side-by-Side Quick Metrics (Lessons & Hours) */}
        <View style={styles.metricsRow}>
          {/* Left Card: Lessons */}
          <View style={[styles.metricCard, { backgroundColor: '#FFF2E8' }]}>
            <View style={styles.metricBadgeRow}>
              <View style={[styles.metricIconBadge, { backgroundColor: '#FFE4D2' }]}>
                <Layers size={12} color="#FF8A48" />
              </View>
              <Text style={styles.metricLabelText}>Lessons</Text>
            </View>
            <Text style={styles.metricBigNumber}>78</Text>
          </View>

          {/* Right Card: Hours */}
          <View style={[styles.metricCard, { backgroundColor: '#EEF2FF' }]}>
            <View style={styles.metricBadgeRow}>
              <View style={[styles.metricIconBadge, { backgroundColor: '#DDE2FF' }]}>
                <Clock3 size={12} color="#6C68FF" />
              </View>
              <Text style={styles.metricLabelText}>Hours</Text>
            </View>
            <Text style={styles.metricBigNumber}>43</Text>
          </View>
        </View>

        {/* 3. Dedicated AI PDF Upload & Synthesis Widget */}
        <TouchableOpacity
          style={styles.uploadBannerCard}
          onPress={() => setIsUploadOpen(true)}
          activeOpacity={0.88}
        >
          <View style={styles.uploadBannerLeft}>
            <View style={styles.uploadBannerIconBox}>
              <UploadCloud size={22} color="#181A20" strokeWidth={2.4} />
            </View>
            <View style={styles.uploadBannerTextCol}>
              <View style={styles.uploadTagRow}>
                <Sparkles size={10} color="#181A20" strokeWidth={2.4} />
                <Text style={styles.uploadTagText}>AI REEL & SUBTOPICS</Text>
              </View>
              <Text style={styles.uploadBannerTitle}>Upload PDF Curriculum</Text>
              <Text style={styles.uploadBannerSubtitle}>
                Auto-generate subtopics, video reels & flashcards
              </Text>
            </View>
          </View>
          <View style={styles.uploadBannerArrowBtn}>
            <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* 4. Quiz Arena & Leaderboard Competition Widget */}
        <HomeQuizArena />

        {/* 4. Continue Learning & Course Outline */}
        <View style={styles.continueSection}>
          <View style={styles.continueHeader}>
            <Text style={styles.sectionHeading}>Continue learning</Text>
            <TouchableOpacity onPress={onNavigateToExplore} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {activeCourse ? (
            <TouchableOpacity
              style={styles.continueCourseCard}
              onPress={() => onNavigateToStudy(activeCourse.id)}
              activeOpacity={0.88}
            >
              <View style={styles.courseCoverBox}>
                <BookOpen size={22} color="#FFFFFF" />
              </View>
              <View style={styles.courseDetails}>
                <Text style={styles.courseSubjectTag}>{activeCourse.subject.toUpperCase()}</Text>
                <Text style={styles.courseTitleText} numberOfLines={1}>
                  {activeCourse.title}
                </Text>
                <View style={styles.courseProgressBarTrack}>
                  <View
                    style={[
                      styles.courseProgressBarFill,
                      { width: `${activeCourse.progressPercentage || 45}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.courseArrowBtn}>
                <ChevronRight size={15} color="#181A20" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.uploadPromptCard}
              onPress={() => setIsUploadOpen(true)}
              activeOpacity={0.85}
            >
              <Plus size={18} color="#6C68FF" />
              <Text style={styles.uploadPromptTitle}>Upload PDF Curriculum</Text>
              <Text style={styles.uploadPromptSubtitle}>Generate interactive flashcards, notes & reels</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* PDF Upload Modal */}
      <UploadModal
        visible={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(id) => onNavigateToStudy(id)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 110,
    gap: 18,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingTextBox: {
    gap: 2,
  },
  greetingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.3,
  },
  progressSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressSubtitleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#767984',
  },
  topHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B4F373',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 99,
  },
  uploadHeaderPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#181A20',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DC',
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4D6D',
  },
  heroCard: {
    backgroundColor: '#6C68FF',
    borderRadius: 28,
    padding: 22,
    minHeight: 215,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#6C68FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 7,
  },
  doodleMath: {
    position: 'absolute',
    right: 130,
    bottom: 42,
  },
  doodleMathText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  doodleStar1: {
    position: 'absolute',
    top: 20,
    right: 94,
  },
  doodleStar2: {
    position: 'absolute',
    top: 64,
    right: 30,
  },
  trophyWrapper: {
    position: 'absolute',
    right: 8,
    bottom: 10,
  },
  heroContent: {
    maxWidth: '65%',
    gap: 9,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 16,
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  metricBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabelText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#181A20',
  },
  metricBigNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  uploadBannerCard: {
    backgroundColor: '#EDFDE6',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#C2F29F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#181A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  uploadBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#B4F373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBannerTextCol: {
    flex: 1,
    gap: 2,
  },
  uploadTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(24, 26, 32, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  uploadTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: 0.3,
  },
  uploadBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.3,
  },
  uploadBannerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B6B38',
    lineHeight: 15,
  },
  uploadBannerArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  performanceSection: {
    gap: 10,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.3,
  },
  moreBtn: {
    padding: 4,
  },
  progressSegmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  segmentedBarRow: {
    flexDirection: 'row',
    height: 42,
    gap: 6,
  },
  barSegment: {
    height: '100%',
    borderRadius: 14,
  },
  segmentLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  segmentLabelItem: {
    gap: 2,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 3,
  },
  segmentMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#181A20',
  },
  segmentSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#848792',
  },
  continueSection: {
    gap: 10,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6C68FF',
  },
  continueCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  courseCoverBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFA770',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseDetails: {
    flex: 1,
    gap: 3,
  },
  courseSubjectTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#848792',
    letterSpacing: 0.5,
  },
  courseTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181A20',
  },
  courseProgressBarTrack: {
    height: 3.5,
    backgroundColor: '#F0ECE4',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  courseProgressBarFill: {
    height: '100%',
    backgroundColor: '#6C68FF',
    borderRadius: 2,
  },
  courseArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2DEFE',
    borderStyle: 'dashed',
    gap: 5,
  },
  uploadPromptTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181A20',
  },
  uploadPromptSubtitle: {
    fontSize: 10.5,
    color: '#848792',
  },
})
