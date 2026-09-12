import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { StudyMaterial } from '../types'
import { Clock, Layers, FileText, ChevronRight } from 'lucide-react-native'

interface MaterialCardProps {
  material: StudyMaterial
  onPress: () => void
}

export default function MaterialCard({ material, onPress }: MaterialCardProps) {
  const masteredCards = material.flashcards.filter(
    (c) => c.confidence === 'mastered' || c.confidence === 'easy'
  ).length

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.headerRow}>
        <View style={[styles.subjectBadge, { backgroundColor: `${material.subjectColor}20` }]}>
          <Text style={[styles.subjectText, { color: material.subjectColor }]}>{material.subject}</Text>
        </View>
        <View style={styles.timeRow}>
          <Clock size={11} color={Colors.textMuted} />
          <Text style={styles.timeText}>{material.estimatedStudyTimeMinutes}m</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {material.title}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${material.progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{material.progressPercentage}%</Text>
      </View>

      {/* Footer Pill Row */}
      <View style={styles.footerRow}>
        <View style={styles.metaPill}>
          <Layers size={11} color={Colors.primary} />
          <Text style={styles.metaText}>{material.flashcards.length} Cards ({masteredCards} Mastered)</Text>
        </View>

        <View style={styles.studyCta}>
          <Text style={styles.studyCtaText}>Study</Text>
          <ChevronRight size={14} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  studyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  studyCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
})
