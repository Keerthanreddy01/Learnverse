import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { KnowledgeGapData } from '../types'
import { BrainCircuit, CheckCircle2, AlertCircle, Sparkles, Target, ListOrdered } from 'lucide-react-native'

interface KnowledgeRadarProps {
  knowledgeGap: KnowledgeGapData
}

export default function KnowledgeRadar({ knowledgeGap }: KnowledgeRadarProps) {
  const mastery = knowledgeGap.overallMastery

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Mastery Dial Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreInfo}>
          <View style={styles.badgeRow}>
            <BrainCircuit size={16} color={Colors.primary} />
            <Text style={styles.scoreLabel}>Adaptive Knowledge Index</Text>
          </View>
          <Text style={styles.scoreTier}>
            {mastery >= 75 ? 'Mastery Tier' : mastery >= 50 ? 'Intermediate' : 'Foundational'}
          </Text>
        </View>
        <View style={styles.dialBox}>
          <Text style={styles.dialText}>{mastery}%</Text>
        </View>
      </View>

      {/* Strongest & Weakest Callouts */}
      <View style={styles.calloutRow}>
        <View style={[styles.calloutCard, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
          <View style={styles.calloutHeader}>
            <CheckCircle2 size={13} color={Colors.emerald} />
            <Text style={[styles.calloutTag, { color: Colors.emerald }]}>STRONGEST</Text>
          </View>
          <Text style={styles.calloutTitle} numberOfLines={2}>{knowledgeGap.strongestArea}</Text>
        </View>

        <View style={[styles.calloutCard, { borderColor: 'rgba(244, 63, 94, 0.3)', backgroundColor: 'rgba(244, 63, 94, 0.05)' }]}>
          <View style={styles.calloutHeader}>
            <AlertCircle size={13} color={Colors.rose} />
            <Text style={[styles.calloutTag, { color: Colors.rose }]}>PRIORITY GAP</Text>
          </View>
          <Text style={styles.calloutTitle} numberOfLines={2}>{knowledgeGap.weakestArea}</Text>
        </View>
      </View>

      {/* Topic Breakdown */}
      <View style={styles.topicsSection}>
        <View style={styles.sectionHeaderRow}>
          <Target size={14} color={Colors.primary} />
          <Text style={styles.sectionHeader}>TOPIC MASTERY BREAKDOWN</Text>
        </View>

        {knowledgeGap.topics.map((topic, idx) => {
          const isMastered = topic.masteryPercentage >= 75
          const isCritical = topic.status === 'critical-gap' || topic.masteryPercentage < 60
          const statusColor = isMastered ? Colors.emerald : isCritical ? Colors.rose : Colors.amber

          return (
            <View key={idx} style={styles.topicCard}>
              <View style={styles.topicTopRow}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={[styles.topicMastery, { color: statusColor }]}>{topic.masteryPercentage}%</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${topic.masteryPercentage}%`, backgroundColor: statusColor }]} />
              </View>

              <View style={styles.prescriptionBox}>
                <Sparkles size={11} color={Colors.primary} />
                <Text style={styles.prescriptionText}>{topic.recommendedAction}</Text>
              </View>
            </View>
          )
        })}
      </View>

      {/* Recommended Study Sequence */}
      <View style={styles.sequenceCard}>
        <View style={styles.sectionHeaderRow}>
          <ListOrdered size={14} color={Colors.primary} />
          <Text style={styles.sectionHeader}>ADAPTIVE REVISION SEQUENCE</Text>
        </View>

        <View style={styles.stepsList}>
          {knowledgeGap.recommendedStudyOrder.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  scoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreInfo: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  scoreTier: {
    ...Typography.titleSmall,
    color: Colors.text,
  },
  dialBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  dialText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  calloutRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  calloutCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.sm + 4,
    gap: 4,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calloutTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  topicsSection: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  topicCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  topicMastery: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  prescriptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    padding: Spacing.xs + 2,
    borderRadius: 6,
  },
  prescriptionText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    flex: 1,
  },
  sequenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  stepsList: {
    gap: Spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  stepText: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'monospace',
    flex: 1,
  },
})
