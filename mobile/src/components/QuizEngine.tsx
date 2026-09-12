import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StyleProp, ViewStyle } from 'react-native'
import { Colors, Spacing, Typography } from '../constants/theme'
import { Quiz } from '../types'
import { useStudy } from '../context/StudyContext'
import { CheckCircle2, XCircle, Award, RotateCw, HelpCircle, Info, ArrowRight } from 'lucide-react-native'

interface QuizEngineProps {
  materialId: string
  quiz: Quiz
}

export default function QuizEngine({ materialId, quiz }: QuizEngineProps) {
  const { recordQuizScore } = useStudy()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length

  const handleSelect = (idx: number) => {
    if (!isSubmitted) {
      setSelectedOption(idx)
    }
  }

  const handleSubmit = () => {
    if (selectedOption === null) return
    setIsSubmitted(true)
    setUserAnswers((prev) => [...prev, selectedOption])
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsSubmitted(false)
    } else {
      let correctCount = 0
      const finalAnswers = [...userAnswers, selectedOption!]
      quiz.questions.forEach((q, idx) => {
        if (finalAnswers[idx] === q.correctIndex) {
          correctCount++
        }
      })
      const score = Math.round((correctCount / totalQuestions) * 100)
      recordQuizScore(materialId, score)
      setIsCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsSubmitted(false)
    setUserAnswers([])
    setIsCompleted(false)
  }

  if (isCompleted) {
    let correctCount = 0
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })
    const score = Math.round((correctCount / totalQuestions) * 100)
    const passed = score >= quiz.passingScore

    return (
      <ScrollView contentContainerStyle={styles.completedContainer} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.trophyBadge,
            { backgroundColor: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)' },
          ]}
        >
          {passed ? <Award size={36} color={Colors.emerald} /> : <XCircle size={36} color={Colors.rose} />}
        </View>

        <Text style={styles.completedTitle}>
          {passed ? 'Assessment Passed!' : 'Knowledge Gap Identified'}
        </Text>
        <Text style={styles.completedSubtitle}>
          {passed
            ? 'Strong conceptual retrieval verified.'
            : 'Targeted revision recommended for weak concepts.'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Score</Text>
            <Text style={[styles.statBoxVal, { color: passed ? Colors.emerald : Colors.rose }]}>
              {score}%
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Correct</Text>
            <Text style={styles.statBoxVal}>{correctCount}/{totalQuestions}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Required</Text>
            <Text style={[styles.statBoxVal, { color: Colors.textMuted }]}>{quiz.passingScore}%</Text>
          </View>
        </View>

        {/* Detailed Review Breakdown */}
        <View style={styles.reviewList}>
          <Text style={styles.reviewHeader}>QUESTION BREAKDOWN</Text>
          {quiz.questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctIndex
            return (
              <View
                key={idx}
                style={[
                  styles.reviewCard,
                  { borderColor: isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' },
                ]}
              >
                <View style={styles.reviewCardHeader}>
                  <Text style={styles.reviewQText}>Q{idx + 1}. {q.question}</Text>
                  {isCorrect ? <CheckCircle2 size={16} color={Colors.emerald} /> : <XCircle size={16} color={Colors.rose} />}
                </View>
                <Text style={styles.reviewAnsText}>
                  <Text style={{ color: Colors.textMuted }}>Correct: </Text>
                  {q.options[q.correctIndex]}
                </Text>
                <Text style={styles.reviewExplText}>{q.explanation}</Text>
              </View>
            )
          })}
        </View>

        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.8}>
          <RotateCw size={16} color="#000000" />
          <Text style={styles.restartBtnText}>Retake Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      {/* Quiz Top Info */}
      <View style={styles.topBar}>
        <Text style={styles.counterText}>
          QUESTION <Text style={{ color: Colors.text }}>{currentIndex + 1}</Text> OF {totalQuestions}
        </Text>
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{currentQ.topic}</Text>
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQ.question}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx
            const isCorrect = idx === currentQ.correctIndex

            let optionStyle: StyleProp<ViewStyle> = styles.optionBtn
            let textColor = Colors.text

            if (isSubmitted) {
              if (isCorrect) {
                optionStyle = [styles.optionBtn, styles.optionCorrect]
                textColor = Colors.emerald
              } else if (isSelected && !isCorrect) {
                optionStyle = [styles.optionBtn, styles.optionIncorrect]
                textColor = Colors.rose
              } else {
                optionStyle = [styles.optionBtn, { opacity: 0.4 }]
              }
            } else if (isSelected) {
              optionStyle = [styles.optionBtn, styles.optionSelected]
              textColor = Colors.primary
            }

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleSelect(idx)}
                disabled={isSubmitted}
                activeOpacity={0.75}
              >
                <View style={styles.optionLetter}>
                  <Text style={[styles.optionLetterText, { color: textColor }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                {isSubmitted && isCorrect && <CheckCircle2 size={16} color={Colors.emerald} />}
                {isSubmitted && isSelected && !isCorrect && <XCircle size={16} color={Colors.rose} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Post Submit Explanation */}
        {isSubmitted && (
          <View style={styles.explanationBox}>
            <View style={styles.explanationHeader}>
              <Info size={13} color={Colors.primary} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
          </View>
        )}

        {/* Submit / Next Button */}
        <View style={styles.submitRow}>
          {!isSubmitted ? (
            <TouchableOpacity
              style={[styles.submitBtn, selectedOption === null && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={selectedOption === null}
            >
              <Text style={styles.submitBtnText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleNext}>
              <Text style={styles.submitBtnText}>
                {currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
              </Text>
              <ArrowRight size={14} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
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
  counterText: {
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
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  questionText: {
    ...Typography.titleSmall,
    color: Colors.text,
    lineHeight: 22,
  },
  optionsList: {
    gap: Spacing.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  optionCorrect: {
    borderColor: Colors.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  optionIncorrect: {
    borderColor: Colors.rose,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  optionLetter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionText: {
    ...Typography.body,
    fontSize: 13,
    flex: 1,
  },
  explanationBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Spacing.sm + 2,
    gap: 4,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  explanationTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: '700',
  },
  explanationText: {
    ...Typography.bodyMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  submitRow: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 20,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  completedContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  trophyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginVertical: Spacing.xs,
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
  reviewList: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  reviewHeader: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    gap: 4,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reviewQText: {
    ...Typography.titleSmall,
    fontSize: 13,
    flex: 1,
  },
  reviewAnsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.text,
  },
  reviewExplText: {
    ...Typography.bodyMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: Spacing.sm,
  },
  restartBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'monospace',
  },
})
