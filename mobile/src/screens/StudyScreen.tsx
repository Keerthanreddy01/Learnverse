import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { useStudy } from '../context/StudyContext'
import NotesViewer from '../components/NotesViewer'
import FlashcardDeck from '../components/FlashcardDeck'
import QuizEngine from '../components/QuizEngine'
import ReelPlayer from '../components/ReelPlayer'
import KnowledgeRadar from '../components/KnowledgeRadar'
import SubtopicsList from '../components/SubtopicsList'
import { CurriculumSubtopic } from '../types'
import { ArrowLeft, BookOpen, Layers, HelpCircle, Video, TrendingUp, ListTree, Star, Sparkles } from 'lucide-react-native'

interface StudyScreenProps {
  materialId: string
  initialTab?: 'subtopics' | 'notes' | 'flashcards' | 'quiz' | 'reel' | 'gap'
  onBack: () => void
}

export default function StudyScreen({ materialId, initialTab = 'subtopics', onBack }: StudyScreenProps) {
  const { getMaterialById } = useStudy()
  const [activeTab, setActiveTab] = useState<'subtopics' | 'notes' | 'flashcards' | 'quiz' | 'reel' | 'gap'>(initialTab)
  const [selectedSubtopic, setSelectedSubtopic] = useState<CurriculumSubtopic | null>(null)

  const material = getMaterialById(materialId)

  if (!material) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Course deck not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handlePlaySubtopicReel = (sub: CurriculumSubtopic) => {
    setSelectedSubtopic(sub)
    setActiveTab('reel')
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.navBackBtn} activeOpacity={0.75}>
          <ArrowLeft size={17} color="#181A20" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.navTitleBox}>
          <View style={styles.navSubjectRow}>
            <Sparkles size={10} color="#6C68FF" />
            <Text style={styles.navSubject}>{material.subject.toUpperCase()}</Text>
          </View>
          <Text style={styles.navTitle} numberOfLines={1}>{material.title}</Text>
        </View>
        <View style={styles.navProgressBox}>
          <Star size={11} color="#15803D" fill="#15803D" />
          <Text style={styles.navProgressText}>{material.progressPercentage}%</Text>
        </View>
      </View>

      {/* Segmented Switcher Bar (Playful kid-friendly pill styling with emojis) */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsRow}
        >
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'subtopics' && styles.tabItemActive]}
            onPress={() => setActiveTab('subtopics')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>🗺️</Text>
            <Text style={[styles.tabLabel, activeTab === 'subtopics' && styles.tabLabelActive]}>Missions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'notes' && styles.tabItemActive]}
            onPress={() => setActiveTab('notes')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>📖</Text>
            <Text style={[styles.tabLabel, activeTab === 'notes' && styles.tabLabelActive]}>Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'flashcards' && styles.tabItemActive]}
            onPress={() => setActiveTab('flashcards')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>⚡</Text>
            <Text style={[styles.tabLabel, activeTab === 'flashcards' && styles.tabLabelActive]}>Cards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'quiz' && styles.tabItemActive]}
            onPress={() => setActiveTab('quiz')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>🎯</Text>
            <Text style={[styles.tabLabel, activeTab === 'quiz' && styles.tabLabelActive]}>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reel' && styles.tabItemActive]}
            onPress={() => setActiveTab('reel')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>🍿</Text>
            <Text style={[styles.tabLabel, activeTab === 'reel' && styles.tabLabelActive]}>Reel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'gap' && styles.tabItemActive]}
            onPress={() => setActiveTab('gap')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabEmoji}>🏆</Text>
            <Text style={[styles.tabLabel, activeTab === 'gap' && styles.tabLabelActive]}>Badges</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content Body */}
      <View style={styles.contentBody}>
        {activeTab === 'subtopics' && (
          <SubtopicsList
            subtopics={material.subtopics || []}
            overview={material.overview}
            onPlaySubtopicReel={handlePlaySubtopicReel}
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        )}
        {activeTab === 'notes' && <NotesViewer notes={material.summaryNotes} />}
        {activeTab === 'flashcards' && (
          <FlashcardDeck materialId={material.id} flashcards={material.flashcards} />
        )}
        {activeTab === 'quiz' && <QuizEngine materialId={material.id} quiz={material.quiz} />}
        {activeTab === 'reel' && (
          <ReelPlayer
            reel={
              selectedSubtopic
                ? {
                    ...material.reel,
                    title: `${selectedSubtopic.title} (8s Reel)`,
                    narrationScript: selectedSubtopic.description,
                    chapters: [
                      {
                        id: `chap-${selectedSubtopic.id}`,
                        title: selectedSubtopic.title,
                        timestampSeconds: 0,
                        subtitle: selectedSubtopic.description,
                      },
                    ],
                  }
                : material.reel
            }
            videoUrl="https://res.cloudinary.com/aovh9hgj/video/upload/v1789143357/water_cycle_biology.mp4"
          />
        )}
        {activeTab === 'gap' && <KnowledgeRadar knowledgeGap={material.knowledgeGap} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleBox: {
    flex: 1,
    gap: 2,
  },
  navSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navSubject: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6C68FF',
    letterSpacing: 0.5,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181A20',
  },
  navProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBFDE3',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B4F373',
  },
  navProgressText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '900',
  },
  tabBarContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6DC',
    justifyContent: 'center',
  },
  tabsScrollView: {
    flexGrow: 0,
    height: 52,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    height: 52,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  tabItemActive: {
    backgroundColor: '#B4F373',
    borderColor: '#86EFAC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabEmoji: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 12,
    color: '#767984',
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#181A20',
    fontWeight: '900',
  },
  contentBody: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  notFoundText: {
    ...Typography.titleSmall,
    color: Colors.textMuted,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
})
