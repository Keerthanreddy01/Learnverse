import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { Flashcard } from '../types'
import { useStudy } from '../context/StudyContext'
import { RotateCw, CheckCircle2, XCircle, HelpCircle, Lightbulb, Award, ArrowLeft, ArrowRight } from 'lucide-react-native'

interface FlashcardDeckProps {
  materialId: string
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ materialId, flashcards }: FlashcardDeckProps) {
  const { updateFlashcardConfidence } = useStudy()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentCard = flashcards[currentIndex]
  const totalCards = flashcards.length

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
      setShowHint(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsFlipped(false)
      setShowHint(false)
      setIsCompleted(false)
    }
  }

  const handleRate = (confidence: 'hard' | 'medium' | 'easy' | 'mastered') => {
    updateFlashcardConfidence(materialId, currentCard.id, confidence)
    handleNext()
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowHint(false)
    setIsCompleted(false)
  }

  if (isCompleted) {
    const masteredCount = flashcards.filter(
      (c) => c.confidence === 'mastered' || c.confidence === 'easy'
    ).length

    return (
      <View style={styles.completedContainer}>
        <View style={styles.trophyBadge}>
          <Award size={36} color={Colors.primary} />
        </View>
        <Text style={styles.completedTitle}>Deck Complete!</Text>
        <Text style={styles.completedSubtitle}>
          You reviewed all {totalCards} flashcards in this deck.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Total</Text>
            <Text style={styles.statBoxVal}>{totalCards}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Mastered</Text>
            <Text style={[styles.statBoxVal, { color: Colors.primary }]}>{masteredCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Retention</Text>
            <Text style={[styles.statBoxVal, { color: Colors.cyan }]}>
              {Math.round((masteredCount / totalCards) * 100)}%
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.8}>
          <RotateCw size={16} color="#000000" />
          <Text style={styles.restartBtnText}>Practice Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Top Deck Info */}
      <View style={styles.topBar}>
        <Text style={styles.cardCounter}>
          CARD <Text style={{ color: Colors.text }}>{currentIndex + 1}</Text> OF {totalCards}
        </Text>
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{currentCard.topic}</Text>
        </View>
      </View>

      {/* Interactive Card */}
      <TouchableOpacity
        style={[
          styles.flashcard,
          isFlipped ? styles.flashcardFlipped : styles.flashcardFront,
        ]}
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.modeBadge, { backgroundColor: isFlipped ? 'rgba(16, 185, 129, 0.15)' : Colors.primaryMuted }]}>
            <Text style={[styles.modeText, { color: isFlipped ? Colors.emerald : Colors.primary }]}>
              {isFlipped ? 'ANSWER & SYNTHESIS' : 'QUESTION'}
            </Text>
          </View>
          <View style={styles.flipHint}>
            <RotateCw size={11} color={Colors.textMuted} />
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardText}>
            {isFlipped ? currentCard.answer : currentCard.question}
          </Text>

          {!isFlipped && showHint && currentCard.hint && (
            <View style={styles.hintBox}>
              <Lightbulb size={13} color={Colors.primary} />
              <Text style={styles.hintText}>{currentCard.hint}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          {!isFlipped && currentCard.hint ? (
            <TouchableOpacity
              onPress={() => setShowHint(!showHint)}
              style={styles.hintToggle}
            >
              <Lightbulb size={12} color={Colors.primary} />
              <Text style={styles.hintToggleText}>{showHint ? 'Hide hint' : 'Show hint'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.recallModeText}>Active Recall Mode</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Self-Rating Mastery Buttons */}
      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Rate your confidence:</Text>
        <View style={styles.ratingRow}>
          <TouchableOpacity
            style={[styles.ratingBtn, { borderColor: 'rgba(244, 63, 94, 0.4)' }]}
            onPress={() => handleRate('hard')}
          >
            <XCircle size={15} color={Colors.rose} />
            <Text style={[styles.ratingText, { color: Colors.rose }]}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingBtn, { borderColor: 'rgba(245, 158, 11, 0.4)' }]}
            onPress={() => handleRate('medium')}
          >
            <HelpCircle size={15} color={Colors.amber} />
            <Text style={[styles.ratingText, { color: Colors.amber }]}>Almost</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingBtn, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}
            onPress={() => handleRate('mastered')}
          >
            <CheckCircle2 size={15} color={Colors.emerald} />
            <Text style={[styles.ratingText, { color: Colors.emerald }]}>Mastered</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Stepper Controls */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={14} color={currentIndex === 0 ? Colors.textDim : Colors.text} />
          <Text style={[styles.navBtnText, { color: currentIndex === 0 ? Colors.textDim : Colors.text }]}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
          <Text style={[styles.navBtnText, { color: Colors.primary }]}>Next</Text>
          <ArrowRight size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCounter: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    fontWeight: '700',
  },
  topicBadge: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topicText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  flashcard: {
    height: 260,
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
  },
  flashcardFront: {
    borderColor: Colors.border,
  },
  flashcardFlipped: {
    borderColor: 'rgba(29, 237, 131, 0.5)',
    backgroundColor: '#161616',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHintText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  cardText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'center',
  },
  hintText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  cardFooter: {
    alignItems: 'center',
  },
  hintToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintToggleText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
  },
  recallModeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textDim,
  },
  ratingSection: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  ratingLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  completedContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  trophyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: 'rgba(29, 237, 131, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
  },
  completedSubtitle: {
    ...Typography.bodyMuted,
    textAlign: 'center',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  statBox: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  statBoxVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 24,
  },
  restartBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'monospace',
  },
})
