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
import UploadModal from '../components/UploadModal'
import { GraduationCapIllustration } from '../components/Illustrations'
import {
  ChevronLeft,
  BookOpen,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Plus,
  Compass,
  Dna,
} from 'lucide-react-native'

interface ExploreScreenProps {
  onNavigateToStudy: (id: string) => void
}

const CATEGORIES = [
  { id: 'all', label: 'All Subjects', icon: '✨' },
  { id: 'lit', label: 'Literature', icon: '📚' },
  { id: 'math', label: 'Math', icon: '🧮' },
  { id: 'bio', label: 'Biology', icon: '🧬' },
  { id: 'chem', label: 'Chemistry', icon: '🧪' },
  { id: 'cs', label: 'Computer Science', icon: '💻' },
]

export default function ExploreScreen({ onNavigateToStudy }: ExploreScreenProps) {
  const { materials } = useStudy()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const filteredMaterials = materials.filter((m) => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'lit') return m.subject.toLowerCase().includes('lit') || m.subject.toLowerCase().includes('english')
    if (selectedCategory === 'math') return m.subject.toLowerCase().includes('math') || m.subject.toLowerCase().includes('geometry')
    if (selectedCategory === 'bio') return m.subject.toLowerCase().includes('bio') || m.subject.toLowerCase().includes('science')
    return true
  })

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Orange Apricot Header: "My courses" */}
        <View style={styles.heroBanner}>
          {/* Top Row with Back and Upload */}
          <View style={styles.bannerTopRow}>
            <View style={styles.backPill}>
              <ChevronLeft size={20} color="#181A20" />
            </View>
            <TouchableOpacity
              style={styles.bannerUploadBtn}
              onPress={() => setIsUploadOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.bannerUploadBtnText}>Upload PDF</Text>
            </TouchableOpacity>
          </View>

          {/* 3D Graduation Cap Artwork */}
          <View style={styles.capWrapper}>
            <GraduationCapIllustration width={120} height={120} />
          </View>

          {/* Title & Stats */}
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>My{"\n"}courses</Text>

            <View style={styles.bannerStatsRow}>
              <View style={styles.statPill}>
                <BookOpen size={13} color="#FFFFFF" />
                <Text style={styles.statPillText}>12 Subjects</Text>
              </View>
              <View style={styles.statPill}>
                <Bookmark size={13} color="#FFFFFF" />
                <Text style={styles.statPillText}>43 Lessons</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* 3. Course Cards List */}
        <View style={styles.coursesList}>
          {/* Card A: Dark Slate Hero Card (Geometry in Action) */}
          <TouchableOpacity
            style={styles.darkCourseCard}
            onPress={() => (materials[0] ? onNavigateToStudy(materials[0].id) : setIsUploadOpen(true))}
            activeOpacity={0.9}
          >
            {/* Top Row: Icon + External Link */}
            <View style={styles.cardTopRow}>
              <View style={styles.darkCardIconCircle}>
                <Compass size={18} color="#FFA770" />
              </View>
              <View style={styles.darkCardExternalCircle}>
                <ExternalLink size={14} color="#A0A4AF" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={styles.darkCardTag}>GEOMETRY IN ACTION</Text>
              <Text style={styles.darkCardTitle}>
                Creative approaches to plane shapes
              </Text>
            </View>

            {/* Bottom Row: Avatar stack + Action Arrow */}
            <View style={styles.cardBottomRow}>
              <View style={styles.avatarStack}>
                <View style={[styles.miniAvatar, { backgroundColor: '#FFA770' }]}>
                  <Text style={styles.miniAvatarText}>👱🏻</Text>
                </View>
                <View style={[styles.miniAvatar, { backgroundColor: '#706CFF', marginLeft: -8 }]}>
                  <Text style={styles.miniAvatarText}>👩🏻</Text>
                </View>
                <View style={[styles.miniAvatar, { backgroundColor: '#10B981', marginLeft: -8 }]}>
                  <Text style={styles.miniAvatarText}>👦🏽</Text>
                </View>
                <Text style={styles.avatarCountText}>+43</Text>
              </View>

              <View style={styles.whiteArrowCircle}>
                <ArrowRight size={17} color="#181A20" strokeWidth={2.4} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card B: Soft Lavender Hero Card (Microcosm in Cell Biology) */}
          <TouchableOpacity
            style={styles.lavenderCourseCard}
            onPress={() => (materials[1] ? onNavigateToStudy(materials[1].id) : onNavigateToStudy(materials[0]?.id || 'bio-101'))}
            activeOpacity={0.9}
          >
            {/* Top Row: Icon + External Link */}
            <View style={styles.cardTopRow}>
              <View style={styles.lavenderCardIconCircle}>
                <Dna size={18} color="#181A20" />
              </View>
              <View style={styles.lavenderCardExternalCircle}>
                <ExternalLink size={14} color="#181A20" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={styles.lavenderCardTag}>THE MICROCOSM AROUND US</Text>
              <Text style={styles.lavenderCardTitle}>
                Discoveries in cell biology
              </Text>
            </View>

            {/* Bottom Row: Avatar stack + Action Arrow */}
            <View style={styles.cardBottomRow}>
              <View style={styles.avatarStack}>
                <View style={[styles.miniAvatar, { backgroundColor: '#FFD54F' }]}>
                  <Text style={styles.miniAvatarText}>👧🏼</Text>
                </View>
                <View style={[styles.miniAvatar, { backgroundColor: '#FFA770', marginLeft: -8 }]}>
                  <Text style={styles.miniAvatarText}>🧑🏻</Text>
                </View>
                <Text style={[styles.avatarCountText, { color: '#181A20' }]}>+12</Text>
              </View>

              <View style={styles.whiteArrowCircle}>
                <ArrowRight size={17} color="#181A20" strokeWidth={2.4} />
              </View>
            </View>
          </TouchableOpacity>

          {/* User's Dynamic Uploaded Courses */}
          {filteredMaterials.map((mat, idx) => {
            if (idx === 0) return null
            return (
              <TouchableOpacity
                key={mat.id}
                style={styles.cleanCourseCard}
                onPress={() => onNavigateToStudy(mat.id)}
                activeOpacity={0.88}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.cleanCardIconCircle, { backgroundColor: '#FFF1E8' }]}>
                    <BookOpen size={16} color="#FF8A48" />
                  </View>
                  <Text style={styles.progressSmallBadge}>{mat.progressPercentage}% done</Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cleanCardTag}>{mat.subject.toUpperCase()}</Text>
                  <Text style={styles.cleanCardTitle}>{mat.title}</Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.studyTimeNote}>⏱️ {mat.estimatedStudyTimeMinutes} min study</Text>
                  <View style={styles.darkArrowCircle}>
                    <ArrowRight size={14} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Upload Modal */}
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
    paddingBottom: 130,
    gap: 16,
  },
  heroBanner: {
    backgroundColor: '#FFA770',
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181A20',
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 16,
  },
  bannerUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  capWrapper: {
    position: 'absolute',
    right: 14,
    bottom: 16,
  },
  bannerContent: {
    gap: 14,
    maxWidth: '65%',
  },
  bannerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#181A20',
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181A20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryPillsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 9.5,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  categoryPillActive: {
    backgroundColor: '#181A20',
    borderColor: '#181A20',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181A20',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  coursesList: {
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 4,
  },
  darkCourseCard: {
    backgroundColor: '#22262E',
    borderRadius: 30,
    padding: 22,
    minHeight: 185,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkCardExternalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: 6,
    marginVertical: 12,
  },
  darkCardTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFA770',
    letterSpacing: 0.6,
  },
  darkCardTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22262E',
  },
  miniAvatarText: {
    fontSize: 15,
  },
  avatarCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  whiteArrowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lavenderCourseCard: {
    backgroundColor: '#ABB4FE',
    borderRadius: 30,
    padding: 22,
    minHeight: 185,
    justifyContent: 'space-between',
    shadowColor: '#ABB4FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  lavenderCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lavenderCardExternalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lavenderCardTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: 0.6,
  },
  lavenderCardTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#181A20',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  cleanCourseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    gap: 8,
  },
  cleanCardIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSmallBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#706CFF',
  },
  cleanCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#848792',
    letterSpacing: 0.5,
  },
  cleanCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181A20',
  },
  studyTimeNote: {
    fontSize: 11,
    fontWeight: '600',
    color: '#848792',
  },
  darkArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
