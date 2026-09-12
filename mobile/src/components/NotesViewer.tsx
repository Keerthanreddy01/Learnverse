import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { SummaryNotes } from '../types'
import {
  CheckCircle2,
  Bookmark,
  Lightbulb,
  Clock,
  BookOpen,
  Sparkles,
  Star,
  BrainCircuit,
  Zap,
} from 'lucide-react-native'

interface NotesViewerProps {
  notes: SummaryNotes
}

export default function NotesViewer({ notes }: NotesViewerProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTitleRow}>
          <View style={styles.bookIconBadge}>
            <Text style={styles.bookIconEmoji}>📖</Text>
          </View>
          <View style={styles.titleTextCol}>
            <Text style={styles.headerTitle}>{notes.title}</Text>
            <View style={styles.readTimeRow}>
              <Clock size={11} color="#6C68FF" />
              <Text style={styles.readTimeText}>
                {notes.readingTimeMinutes} min quick read • Easy to learn! 🌟
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Key Takeaways Card */}
      <View style={styles.takeawaysCard}>
        <View style={styles.sectionHeaderRow}>
          <Lightbulb size={16} color="#D97706" />
          <Text style={styles.sectionHeader}>BIG DISCOVERIES & SUPERPOWERS 💡</Text>
        </View>
        {notes.keyTakeaways.map((takeaway, idx) => (
          <View key={idx} style={styles.takeawayRow}>
            <View style={styles.starBulletBox}>
              <Star size={11} color="#15803D" fill="#15803D" />
            </View>
            <Text style={styles.takeawayText}>{takeaway}</Text>
          </View>
        ))}
      </View>

      {/* 3. High-Yield Glossary / Superpower Words */}
      {notes.keyTerms && notes.keyTerms.length > 0 && (
        <View style={styles.glossarySection}>
          <View style={styles.sectionHeaderRow}>
            <BrainCircuit size={16} color="#6C68FF" />
            <Text style={[styles.sectionHeader, { color: '#6C68FF' }]}>
              SUPERPOWER SCIENCE WORDS 🧠
            </Text>
          </View>
          {notes.keyTerms.map((term, idx) => (
            <View key={idx} style={styles.termCard}>
              <View style={styles.termHeader}>
                <View style={styles.termTitleRow}>
                  <Text style={styles.termEmoji}>✨</Text>
                  <Text style={styles.termName}>{term.term}</Text>
                </View>
                <View
                  style={[
                    styles.yieldBadge,
                    {
                      backgroundColor:
                        term.importance === 'high' ? '#FEE2E2' : '#E0F2FE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.yieldText,
                      {
                        color:
                          term.importance === 'high' ? '#DC2626' : '#0284C7',
                      },
                    ]}
                  >
                    {term.importance === 'high' ? '🔥 HIGH YIELD' : '💡 KEY TERM'}
                  </Text>
                </View>
              </View>
              <Text style={styles.termDefinition}>{term.definition}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. Structured Story Sections */}
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionHeaderRow}>
          <Sparkles size={16} color="#181A20" />
          <Text style={[styles.sectionHeader, { color: '#181A20' }]}>
            CHAPTER BREAKDOWN 🚀
          </Text>
        </View>
        {notes.sections.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionNumBadge}>
                <Text style={styles.sectionNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            </View>

            <Text style={styles.sectionSummary}>{section.summary}</Text>

            <View style={styles.bulletList}>
              {section.bulletPoints.map((point, pIdx) => (
                <View key={pIdx} style={styles.bulletRow}>
                  <Text style={styles.bulletEmoji}>👉</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>

            {section.keyTakeaway && (
              <View style={styles.proTipBox}>
                <View style={styles.proTipIconCircle}>
                  <Zap size={12} color="#181A20" fill="#181A20" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proTipLabel}>KID SECRET TIP</Text>
                  <Text style={styles.proTipText}>{section.keyTakeaway}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
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
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIconEmoji: {
    fontSize: 22,
  },
  titleTextCol: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6C68FF',
  },
  takeawaysCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    padding: 16,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  starBulletBox: {
    marginTop: 2,
  },
  takeawayText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#14532D',
    fontWeight: '600',
    flex: 1,
  },
  glossarySection: {
    gap: 10,
  },
  termCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termEmoji: {
    fontSize: 13,
  },
  termName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#181A20',
  },
  yieldBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  yieldText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  termDefinition: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#4B5563',
    fontWeight: '500',
  },
  sectionsContainer: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B4F373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#181A20',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181A20',
    flex: 1,
  },
  sectionSummary: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4B5563',
    fontWeight: '500',
  },
  bulletList: {
    backgroundColor: '#F9FAF7',
    borderRadius: 14,
    padding: 10,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletEmoji: {
    fontSize: 12,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  proTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  proTipIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  proTipLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  proTipText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#78350F',
    fontWeight: '600',
  },
})
