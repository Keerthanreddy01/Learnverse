import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Colors, Spacing } from '../constants/theme'
import {
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  Sparkles,
  Radio,
  BookOpen,
  ChevronRight,
  Share2,
  Video,
} from 'lucide-react-native'

interface Workshop {
  id: string
  title: string
  subtitle: string
  instructor: string
  instructorRole: string
  instructorAvatar: string
  category: string
  date: string
  time: string
  seatsTotal: number
  seatsEnrolled: number
  badge: string
  badgeBg: string
  badgeText: string
  accentColor: string
  tag: string
  xpReward: number
  perks: string[]
  isLiveSoon?: boolean
}

const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 'ws-rocket-101',
    title: 'Rocket Science & Orbital Mechanics 101',
    subtitle: 'Build multi-stage thrust calculations & simulate orbital injection live.',
    instructor: 'Prof. Anita Sharma',
    instructorRole: 'ISRO Research Fellow • Senior Physics Lead',
    instructorAvatar: '🚀',
    category: 'Physics & Aerospace',
    date: 'Tomorrow, Sept 13',
    time: '5:00 PM - 6:30 PM IST',
    seatsTotal: 40,
    seatsEnrolled: 29,
    badge: '🔴 LIVE IN 18 HRS',
    badgeBg: '#FFE5E5',
    badgeText: '#E63946',
    accentColor: '#FF6B6B',
    tag: 'Aerospace',
    xpReward: 350,
    isLiveSoon: true,
    perks: [
      'Interactive 3D rocket staging sandbox',
      'Live Q&A with real aerospace engineers',
      'Verified Certificate & 350 XP badge',
    ],
  },
  {
    id: 'ws-crispr-bio',
    title: 'CRISPR Gene Editing & Future Bio-Hacking',
    subtitle: 'Demystify Cas9 molecular scissors and engineer simulated DNA sequences.',
    instructor: 'Dr. Raghavendra Swamy',
    instructorRole: 'Genomics Specialist • MIT Bio-Innovations',
    instructorAvatar: '🧬',
    category: 'Genetics & Biotechnology',
    date: 'Saturday, Sept 14',
    time: '11:00 AM - 1:00 PM IST',
    seatsTotal: 50,
    seatsEnrolled: 44,
    badge: '⚡ MASTERCLASS',
    badgeBg: '#EAF9D9',
    badgeText: '#2D6A4F',
    accentColor: '#48CAE4',
    tag: 'Genetics',
    xpReward: 500,
    isLiveSoon: false,
    perks: [
      'Hands-on virtual gene splicing toolkit',
      'Lab protocol PDF & ethics discussion',
      'Exclusive Masterclass Diploma & 500 XP',
    ],
  },
]

export default function WorkshopsScreen() {
  const [workshops, setWorkshops] = useState<Workshop[]>(INITIAL_WORKSHOPS)
  const [enrolledIds, setEnrolledIds] = useState<Record<string, boolean>>({})
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my'>('all')

  const toggleEnrollment = (workshop: Workshop) => {
    const isEnrolled = !!enrolledIds[workshop.id]

    if (isEnrolled) {
      // Unenroll
      setEnrolledIds((prev) => ({ ...prev, [workshop.id]: false }))
      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === workshop.id ? { ...w, seatsEnrolled: Math.max(0, w.seatsEnrolled - 1) } : w
        )
      )
      Alert.alert('Unenrolled', `You have unenrolled from "${workshop.title}".`)
    } else {
      // Enroll
      setEnrolledIds((prev) => ({ ...prev, [workshop.id]: true }))
      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === workshop.id ? { ...w, seatsEnrolled: w.seatsEnrolled + 1 } : w
        )
      )
      Alert.alert(
        '🎉 Enrollment Confirmed!',
        `You are enrolled in "${workshop.title}"!\n\n📅 ${workshop.date} at ${workshop.time}.\nA calendar reminder and live studio link have been saved to your student profile.`
      )
    }
  }

  const enrolledCount = Object.values(enrolledIds).filter(Boolean).length
  const displayedWorkshops = selectedFilter === 'my'
    ? workshops.filter((w) => !!enrolledIds[w.id])
    : workshops

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Apricot Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTopRow}>
            <View style={styles.liveIndicator}>
              <Radio size={14} color="#E63946" />
              <Text style={styles.liveIndicatorText}>STUDENT WORKSHOPS</Text>
            </View>
            <View style={styles.enrolledCounterPill}>
              <Text style={styles.enrolledCounterText}>
                {enrolledCount} Enrolled
              </Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Live{"\n"}Workshops</Text>
            <Text style={styles.heroSubtitle}>
              Join faculty-led interactive masterclasses, solve hands-on challenges, and earn XP.
            </Text>
          </View>

          {/* Quick Filter Switcher */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'all' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'all' && styles.filterTabTextActive,
                ]}
              >
                All Workshops ({workshops.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'my' && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter('my')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'my' && styles.filterTabTextActive,
                ]}
              >
                My Enrolled ({enrolledCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Workshops List */}
        <View style={styles.listSection}>
          {displayedWorkshops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎟️</Text>
              <Text style={styles.emptyTitle}>No workshops enrolled yet</Text>
              <Text style={styles.emptySubtitle}>
                Browse available live masterclasses above and click "Enroll Now" to secure your free seat!
              </Text>
              <TouchableOpacity
                style={styles.browseAllBtn}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={styles.browseAllBtnText}>Browse Available Workshops</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayedWorkshops.map((workshop) => {
              const isEnrolled = !!enrolledIds[workshop.id]
              const seatsLeft = workshop.seatsTotal - workshop.seatsEnrolled
              const progressPct = Math.min(
                100,
                Math.round((workshop.seatsEnrolled / workshop.seatsTotal) * 100)
              )

              return (
                <View key={workshop.id} style={styles.workshopCard}>
                  {/* Top Badge & Category */}
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.badgePill,
                        { backgroundColor: workshop.badgeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgePillText,
                          { color: workshop.badgeText },
                        ]}
                      >
                        {workshop.badge}
                      </Text>
                    </View>

                    <View style={styles.xpPill}>
                      <Sparkles size={12} color="#706CFF" />
                      <Text style={styles.xpPillText}>+{workshop.xpReward} XP</Text>
                    </View>
                  </View>

                  {/* Title & Subtitle */}
                  <Text style={styles.cardTitle}>{workshop.title}</Text>
                  <Text style={styles.cardSubtitle}>{workshop.subtitle}</Text>

                  {/* Instructor Pill */}
                  <View style={styles.instructorBox}>
                    <View style={styles.instructorAvatarWrapper}>
                      <Text style={styles.instructorEmoji}>
                        {workshop.instructorAvatar}
                      </Text>
                    </View>
                    <View style={styles.instructorMeta}>
                      <Text style={styles.instructorName}>
                        {workshop.instructor}
                      </Text>
                      <Text style={styles.instructorRole}>
                        {workshop.instructorRole}
                      </Text>
                    </View>
                  </View>

                  {/* Date, Time & Mode Meta */}
                  <View style={styles.metaDetailsGrid}>
                    <View style={styles.metaRow}>
                      <Calendar size={14} color="#848792" />
                      <Text style={styles.metaText}>{workshop.date}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Clock size={14} color="#848792" />
                      <Text style={styles.metaText}>{workshop.time}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Video size={14} color="#848792" />
                      <Text style={styles.metaText}>HD Live Interactive Studio</Text>
                    </View>
                  </View>

                  {/* Seats Progress Bar */}
                  <View style={styles.seatsSection}>
                    <View style={styles.seatsRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Users size={12} color="#848792" />
                        <Text style={styles.seatsLabel}>
                          {workshop.seatsEnrolled} / {workshop.seatsTotal} seats reserved
                        </Text>
                      </View>
                      <Text style={styles.seatsLeftText}>
                        {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully Booked'}
                      </Text>
                    </View>
                    <View style={styles.seatsTrack}>
                      <View
                        style={[
                          styles.seatsFill,
                          {
                            width: `${progressPct}%`,
                            backgroundColor: progressPct > 80 ? '#FF8A48' : '#706CFF',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Key Perks Checklist */}
                  <View style={styles.perksBox}>
                    <Text style={styles.perksHeading}>WORKSHOP PERKS:</Text>
                    {workshop.perks.map((perk, pIdx) => (
                      <View key={pIdx} style={styles.perkItem}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button: Enroll or Enrolled */}
                  <TouchableOpacity
                    style={[
                      styles.enrollBtn,
                      isEnrolled && styles.enrolledBtn,
                    ]}
                    onPress={() => toggleEnrollment(workshop)}
                    activeOpacity={0.85}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle2 size={16} color="#000000" />
                        <Text style={styles.enrolledBtnText}>
                          Enrolled (Click to manage)
                        </Text>
                      </>
                    ) : (
                      <>
                        <Award size={16} color="#FFFFFF" />
                        <Text style={styles.enrollBtnText}>
                          Enroll Now • Free
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EE',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBanner: {
    backgroundColor: '#FFA770', // Warm apricot peach matching courses screen
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#FFA770',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E63946',
    letterSpacing: 0.5,
  },
  enrolledCounterPill: {
    backgroundColor: '#1C1F26',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  enrolledCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1C1F26',
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#2A2D34',
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 18,
    opacity: 0.9,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 24,
    padding: 3,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D404A',
  },
  filterTabTextActive: {
    color: '#1C1F26',
    fontWeight: '900',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  workshopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E4DD',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#706CFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1F26',
    lineHeight: 23,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#696C75',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 17,
  },
  instructorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9F8F5',
    padding: 10,
    borderRadius: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F0ECE4',
  },
  instructorAvatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DD',
  },
  instructorEmoji: {
    fontSize: 18,
  },
  instructorMeta: {
    flex: 1,
  },
  instructorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1F26',
  },
  instructorRole: {
    fontSize: 10,
    color: '#848792',
    fontWeight: '600',
    marginTop: 1,
  },
  metaDetailsGrid: {
    marginTop: 14,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52555E',
  },
  seatsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE4',
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  seatsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#848792',
  },
  seatsLeftText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1F26',
  },
  seatsTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFECE6',
    overflow: 'hidden',
  },
  seatsFill: {
    height: '100%',
    borderRadius: 3,
  },
  perksBox: {
    backgroundColor: '#FAFAF8',
    borderRadius: 14,
    padding: 10,
    marginTop: 14,
    gap: 6,
  },
  perksHeading: {
    fontSize: 9,
    fontWeight: '900',
    color: '#848792',
    letterSpacing: 0.5,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 11,
    color: '#3D404A',
    fontWeight: '600',
  },
  enrollBtn: {
    marginTop: 16,
    backgroundColor: '#1C1F26',
    borderRadius: 22,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  enrollBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  enrolledBtn: {
    backgroundColor: '#B4F373', // Lime green pill matching active tab
    borderWidth: 1,
    borderColor: '#98E04E',
  },
  enrolledBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DD',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1F26',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#848792',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  browseAllBtn: {
    marginTop: 16,
    backgroundColor: '#1C1F26',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  browseAllBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
})
