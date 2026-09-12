import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: React.ReactNode
  accentColor?: string
}

export default function StatCard({
  label,
  value,
  subValue,
  icon,
  accentColor = Colors.primary,
}: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: Colors.border }]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>{icon}</View>
      </View>
      <Text style={[styles.value, { color: Colors.text }]}>{value}</Text>
      {subValue && <Text style={[styles.subValue, { color: accentColor }]}>{subValue}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.sm + 4,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  subValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
})
