import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  X,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  BrainCircuit,
  Trophy,
  Zap,
} from 'lucide-react-native'
import { Quiz } from '../types'

interface HomeQuizModalProps {
  visible: boolean
  quiz: Quiz | null
  onClose: () => void
  onFinishQuiz: (score: number, total: number, earnedXP: number) => void
  onViewLeaderboard: () => void
}

export default function HomeQuizModal({
  visible,
  quiz,
  onClose,
  onFinishQuiz,
  onViewLeaderboard,
}: HomeQuizModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showExplanation, setShowExplanation] = useState<boolean>(false)

  if (!quiz) return null

  const questions = quiz.questions
  const isResults = currentStep >= questions.length
  const currentQ = questions[currentStep]

  const handleSelect = (optionIdx: number) => {
    if (selectedAnswers[currentStep] !== undefined) return
    setSelectedAnswers((prev) => ({ ...prev, [currentStep]: optionIdx }))
    setShowExplanation(true)
  }

  const handleNext = () => {
    setShowExplanation(false)
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      const calculatedScore = questions.reduce((acc, q, idx) => {
        return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc
      }, 0)
      const earnedXP = calculatedScore * 100
      onFinishQuiz(calculatedScore, questions.length, earnedXP)
      setCurrentStep(questions.length)
    }
  }

  const handleRestart = () => {
    setSelectedAnswers({})
    setShowExplanation(false)
    setCurrentStep(0)
  }

  const score = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc
  }, 0)

  const progressPercent = isResults
    ? 100
    : Math.round(((currentStep + (selectedAnswers[currentStep] !== undefined ? 1 : 0)) / questions.length) * 100)

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Light gradient background */}
          <LinearGradient
            colors={['#F9FAF7', '#F1F3EE', '#E7EAF3', '#DDD7F5']}
            locations={[0, 0.4, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Bar */}
          <View style={styles.topHeader}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={16} color="#181A20" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {!isResults ? (
              <View style={styles.contentWrap}>
                {/* Header Badge */}
                <View style={styles.speechRow}>
                  <View style={styles.avatarCircle}>
                    <BrainCircuit size={18} color="#C5F74F" />
                  </View>
                  <View style={styles.speechBubble}>
                    <Text style={styles.speechBubbleTitle}>{quiz.title}</Text>
                    <Text style={styles.speechBubbleText}>
                      Question {currentStep + 1} of {questions.length} • Select the most accurate answer!
                    </Text>
                  </View>
                </View>

                {/* Main Heading */}
                <Text style={styles.mainHeading}>{currentQ.question}</Text>

                {/* Options */}
                <View style={styles.optionsList}>
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentStep] === idx
                    const isAnswered = selectedAnswers[currentStep] !== undefined
                    const isCorrect = idx === currentQ.correctIndex

                    let cardStyle: any = styles.optionCard
                    let circleStyle: any = styles.arrowCircle
                    let circleIcon = <ArrowRight size={15} color="#111318" strokeWidth={2.4} />

                    if (isAnswered) {
                      if (isCorrect) {
                        cardStyle = [styles.optionCard, styles.optionCardCorrect]
                        circleStyle = [styles.arrowCircle, styles.arrowCircleCorrect]
                        circleIcon = <Check size={15} color="#000000" strokeWidth={2.6} />
                      } else if (isSelected) {
                        cardStyle = [styles.optionCard, styles.optionCardWrong]
                        circleStyle = [styles.arrowCircle, styles.arrowCircleWrong]
                        circleIcon = <X size={15} color="#FFFFFF" strokeWidth={2.6} />
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={cardStyle}
                        onPress={() => handleSelect(idx)}
                        activeOpacity={0.88}
                        disabled={isAnswered}
                      >
                        <Text style={styles.optionLabel}>{opt}</Text>
                        <View style={circleStyle}>{circleIcon}</View>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* Explanation */}
                {showExplanation && (
                  <View style={styles.feedbackSection}>
                    <View style={styles.explanationCard}>
                      <Text style={styles.explanationTitle}>
                        {selectedAnswers[currentStep] === currentQ.correctIndex
                          ? '✨ Correct answer!'
                          : '💡 Key Takeaway:'}
                      </Text>
                      <Text style={styles.explanationBody}>{currentQ.explanation}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.continuePillButton}
                      onPress={handleNext}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.continuePillText}>
                        {currentStep < questions.length - 1 ? 'Next Question' : 'View Results & Rank'}
                      </Text>
                      <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              /* Results View */
              <View style={styles.resultsWrap}>
                <View style={styles.speechRow}>
                  <View style={styles.avatarCircle}>
                    <Sparkles size={18} color="#C5F74F" />
                  </View>
                  <View style={styles.speechBubble}>
                    <Text style={styles.speechBubbleText}>
                      Quiz completed! You scored {score} out of {questions.length} (+{score * 100} XP awarded)!
                    </Text>
                  </View>
                </View>

                {/* Score Card */}
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreBigNumber}>{score} / {questions.length}</Text>
                  <Text style={styles.scorePercentageText}>
                    {Math.round((score / questions.length) * 100)}% Accuracy
                  </Text>

                  <View style={styles.rewardXpPill}>
                    <Zap size={13} color="#6C68FF" fill="#6C68FF" />
                    <Text style={styles.rewardXpText}>+{score * 100} XP Added to Leaderboard</Text>
                  </View>
                </View>

                {/* Navigation / Action Buttons */}
                <View style={styles.actionButtonsCol}>
                  <TouchableOpacity
                    style={styles.viewLeaderboardBtn}
                    onPress={() => {
                      onClose()
                      onViewLeaderboard()
                    }}
                    activeOpacity={0.88}
                  >
                    <Trophy size={16} color="#181A20" strokeWidth={2.4} />
                    <Text style={styles.viewLeaderboardText}>View Your Place on Leaderboard</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActionsRow}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={handleRestart}
                      activeOpacity={0.8}
                    >
                      <RotateCcw size={14} color="#181A20" />
                      <Text style={styles.retakeBtnText}>Retake Quiz</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.doneBtn}
                      onPress={onClose}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.doneBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  modalContainer: {
    backgroundColor: '#FAF7F2',
    borderRadius: 26,
    overflow: 'hidden',
    maxHeight: '92%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    zIndex: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#DCE0DC',
    borderRadius: 2,
    marginRight: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B5F43A',
    borderRadius: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  contentWrap: {
    gap: 14,
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  speechBubbleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6C68FF',
    marginBottom: 2,
  },
  speechBubbleText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#282C34',
    fontWeight: '600',
  },
  mainHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#111318',
    textAlign: 'center',
    paddingHorizontal: 6,
    marginVertical: 2,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  optionCardCorrect: {
    borderColor: '#B5F43A',
    backgroundColor: '#F7FEE7',
  },
  optionCardWrong: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  optionLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#1C1F26',
    flex: 1,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B5F43A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircleCorrect: {
    backgroundColor: '#86EFAC',
  },
  arrowCircleWrong: {
    backgroundColor: '#EF4444',
  },
  feedbackSection: {
    gap: 10,
    marginTop: 2,
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#B5F43A',
  },
  explanationTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111318',
    marginBottom: 2,
  },
  explanationBody: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#4B5262',
  },
  continuePillButton: {
    backgroundColor: '#111318',
    borderRadius: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  continuePillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  resultsWrap: {
    gap: 14,
    paddingVertical: 6,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  scoreBigNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111318',
    letterSpacing: -1,
  },
  scorePercentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  rewardXpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
  },
  rewardXpText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#6C68FF',
  },
  actionButtonsCol: {
    gap: 8,
  },
  viewLeaderboardBtn: {
    backgroundColor: '#B4F373',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  viewLeaderboardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181A20',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#181A20',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#181A20',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})
