import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { Sparkles, Flame, BrainCircuit } from 'lucide-react-native'

interface HeaderProps {
  streakDays?: number
  onUploadPress?: () => void
}

export default function Header({ streakDays = 5, onUploadPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <BrainCircuit size={20} color={Colors.primary} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>LearnVerse</Text>
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>AI</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Adaptive Microlearning</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.streakBadge}>
          <Flame size={15} color={Colors.amber} />
          <Text style={styles.streakText}>{streakDays}d</Text>
        </View>

        {onUploadPress && (
          <TouchableOpacity style={styles.uploadBtn} onPress={onUploadPress} activeOpacity={0.8}>
            <Sparkles size={14} color="#000000" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: 'rgba(29, 237, 131, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    ...Typography.titleSmall,
    color: Colors.text,
    fontWeight: '800',
  },
  aiTag: {
    backgroundColor: 'rgba(29, 237, 131, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(29, 237, 131, 0.3)',
  },
  aiTagText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: Colors.amber,
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  uploadBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
})
