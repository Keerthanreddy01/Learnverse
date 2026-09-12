import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Trophy,
  Crown,
  Zap,
} from 'lucide-react-native'

interface ReelQuizCardProps {
  itemHeight: number
  itemWidth: number
  onContinue: () => void
}

interface Question {
  id: number
  bubbleText: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    bubbleText: 'Let’s test your retention! 🔬 Check your understanding of the 3 States of Matter.',
    question: 'What distinguishes particles in a gas compared to particles in a solid or liquid?',
    options: [
      'Gas particles have high kinetic energy and move freely with large spaces between them',
      'Gas particles are locked in fixed crystalline vibrating lattices',
      'Gas particles have zero kinetic energy and cannot compress',
      'Gas particles are heavier and sink to form a rigid shape',
    ],
    correctIndex: 0,
    explanation:
      'In gases, particles possess high thermal kinetic energy, allowing them to overcome intermolecular bonds and freely fill any container.',
  },
  {
    id: 2,
    bubbleText: 'Phase transitions next! 💧 How does water transition into vapor?',
    question: 'How does solar thermal energy drive liquid water into evaporation?',
    options: [
      'It freezes surface water into dense ice crystals',
      'It gives molecules kinetic energy to break intermolecular bonds and vaporize',
      'It halts atmospheric wind currents and compresses water',
      'It forces water molecules into nuclear fission',
    ],
    correctIndex: 1,
    explanation:
      'Solar radiation warms water molecules, providing sufficient kinetic energy to overcome surface tension and escape into the air as vapor.',
  },
  {
    id: 3,
    bubbleText: 'Final question! ⚡ Test your mastery of macroscopic properties.',
    question: 'Which state of matter has a definite volume but no fixed shape, taking the shape of its container?',
    options: [
      'Liquid',
      'Solid',
      'Gas',
      'Plasma',
    ],
    correctIndex: 0,
    explanation:
      'Liquids have a fixed volume because particles stay close together, but they can slide past one another to adapt to any container shape.',
  },
]

const OPTION_BADGES = [
  { letter: 'A', bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' },
  { letter: 'B', bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  { letter: 'C', bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  { letter: 'D', bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
]

// Mock competition leaderboard participants
const LEADERBOARD_PODIUM = [
  { rank: 1, name: 'Sophia Chen', score: 2980, avatar: '👩‍🔬', accuracy: '100%', time: '12s', badge: 'Gold' },
  { rank: 2, name: 'Alex Rivera', score: 2840, avatar: '👨‍🎓', accuracy: '100%', time: '18s', badge: 'Silver' },
  { rank: 3, name: 'Liam Patel', score: 2690, avatar: '🧑‍💻', accuracy: '100%', time: '22s', badge: 'Bronze' },
]

const OTHER_RANKINGS = [
  { rank: 5, name: 'Emma Watson', score: 2420, avatar: '👩‍🏫', accuracy: '67%', streak: '4d' },
  { rank: 6, name: 'Noah Tanaka', score: 2310, avatar: '🧑‍🔬', accuracy: '67%', streak: '7d' },
  { rank: 7, name: 'Maya Sen', score: 2150, avatar: '👩‍💻', accuracy: '33%', streak: '2d' },
]

export default function ReelQuizCard({ itemHeight, itemWidth, onContinue }: ReelQuizCardProps) {
  const [currentStep, setCurrentStep] = useState<number>(0) // 0, 1, 2 = Questions; 3 = Leaderboard Results
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showExplanation, setShowExplanation] = useState<boolean>(false)

  const isResults = currentStep >= QUIZ_QUESTIONS.length
  const currentQ = QUIZ_QUESTIONS[currentStep]

  const handleSelect = (optionIdx: number) => {
    if (selectedAnswers[currentStep] !== undefined) return
    setSelectedAnswers((prev) => ({ ...prev, [currentStep]: optionIdx }))
    setShowExplanation(true)
  }

  const handleNext = () => {
    setShowExplanation(false)
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setCurrentStep(QUIZ_QUESTIONS.length)
    }
  }

  const handleRestart = () => {
    setSelectedAnswers({})
    setShowExplanation(false)
    setCurrentStep(0)
  }

  // Calculate score
  const score = QUIZ_QUESTIONS.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc
  }, 0)

  // Dynamic user ranking details based on score
  const userRankNumber = score === 3 ? 4 : score === 2 ? 6 : 8
  const userTotalPoints = 2300 + score * 120
  const userEarnedXP = score * 100

  return (
    <View style={[styles.container, { height: itemHeight, width: itemWidth }]}>
      {/* Light gradient background with subtle warm ambient glow */}
      <LinearGradient
        colors={['#FAF9F6', '#F5F3ED', '#EEF2F6', '#E4E0F7']}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header: 3-Segment Progress Bar + Skip Pill */}
      <View style={styles.topHeader}>
        <View style={styles.segmentedProgressRow}>
          {QUIZ_QUESTIONS.map((_, qIdx) => {
            const isDone =
              isResults ||
              currentStep > qIdx ||
              (currentStep === qIdx && selectedAnswers[qIdx] !== undefined)
            const isCurrent = !isResults && currentStep === qIdx

            return (
              <View key={qIdx} style={styles.segmentTrack}>
                <View
                  style={[
                    styles.segmentFill,
                    isDone && styles.segmentFillDone,
                    isCurrent && styles.segmentFillActive,
                  ]}
                />
              </View>
            )
          })}
        </View>

        <TouchableOpacity
          onPress={onContinue}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
          style={styles.skipPill}
        >
          <Text style={styles.skipButtonText}>{isResults ? 'Done ➔' : 'Skip ➔'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isResults ? (
          /* Step 1, 2 & 3: Question View */
          <View style={styles.contentWrap}>
            {/* Friendly Mascot Avatar + Speech Bubble Card */}
            <View style={styles.speechRow}>
              <View style={styles.mascotWrapper}>
                <View style={styles.mascotAvatarCircle}>
                  <Text style={styles.mascotEmoji}>🤖</Text>
                </View>
                <View style={styles.mascotNameBadge}>
                  <Text style={styles.mascotNameText}>SPARKY</Text>
                </View>
              </View>
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>{currentQ.bubbleText}</Text>
              </View>
            </View>

            {/* Question Counter Pill & XP Badge Row */}
            <View style={styles.questionBadgeRow}>
              <View style={styles.questionPill}>
                <Text style={styles.questionPillText}>
                  🎯 QUESTION {currentStep + 1} OF {QUIZ_QUESTIONS.length}
                </Text>
              </View>
              <View style={styles.xpRewardPill}>
                <Sparkles size={11} color="#FF8A48" />
                <Text style={styles.xpRewardPillText}>+100 XP</Text>
              </View>
            </View>

            {/* Main Centered Bold Heading */}
            <Text style={styles.mainHeading}>{currentQ.question}</Text>

            {/* Pill Option Cards with Friendly A, B, C, D letter badges */}
            <View style={styles.optionsList}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentStep] === idx
                const isAnswered = selectedAnswers[currentStep] !== undefined
                const isCorrect = idx === currentQ.correctIndex
                const badge = OPTION_BADGES[idx] || OPTION_BADGES[0]

                let cardStyle: any = styles.optionCard
                let circleStyle: any = styles.arrowCircle
                let circleIcon = <ArrowRight size={15} color="#111318" strokeWidth={2.4} />

                if (isAnswered) {
                  if (isCorrect) {
                    cardStyle = [styles.optionCard, styles.optionCardCorrect]
                    circleStyle = [styles.arrowCircle, styles.arrowCircleCorrect]
                    circleIcon = <Check size={16} color="#FFFFFF" strokeWidth={2.8} />
                  } else if (isSelected) {
                    cardStyle = [styles.optionCard, styles.optionCardWrong]
                    circleStyle = [styles.arrowCircle, styles.arrowCircleWrong]
                    circleIcon = <X size={16} color="#FFFFFF" strokeWidth={2.8} />
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
                    {/* Friendly Option Letter Pill (A, B, C, D) */}
                    <View
                      style={[
                        styles.letterBadge,
                        {
                          backgroundColor:
                            isAnswered && isCorrect
                              ? '#10B981'
                              : isAnswered && isSelected
                              ? '#EF4444'
                              : badge.bg,
                          borderColor:
                            isAnswered && isCorrect
                              ? '#059669'
                              : isAnswered && isSelected
                              ? '#DC2626'
                              : badge.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.letterBadgeText,
                          {
                            color:
                              isAnswered && (isCorrect || isSelected)
                                ? '#FFFFFF'
                                : badge.text,
                          },
                        ]}
                      >
                        {badge.letter}
                      </Text>
                    </View>

                    {/* Option Text */}
                    <Text
                      style={[
                        styles.optionLabel,
                        isAnswered && isCorrect && styles.optionLabelCorrect,
                      ]}
                    >
                      {opt}
                    </Text>

                    {/* Right-side status icon */}
                    <View style={circleStyle}>{circleIcon}</View>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Friendly Explanation Card + Next Action Trigger */}
            {showExplanation && (
              <View style={styles.feedbackSection}>
                <View
                  style={[
                    styles.explanationCard,
                    selectedAnswers[currentStep] === currentQ.correctIndex
                      ? styles.explanationCardCorrect
                      : styles.explanationCardWrong,
                  ]}
                >
                  <Text style={styles.explanationTitle}>
                    {selectedAnswers[currentStep] === currentQ.correctIndex
                      ? '🎉 Brilliant deduction!'
                      : '💡 Science Takeaway:'}
                  </Text>
                  <Text style={styles.explanationBody}>{currentQ.explanation}</Text>
                </View>

                <TouchableOpacity
                  style={styles.continuePillButton}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continuePillText}>
                    {currentStep < QUIZ_QUESTIONS.length - 1
                      ? 'Next Question ➔'
                      : 'See Leaderboard 🏆'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Step 4: Leaderboard & Competition View */
          <View style={styles.leaderboardWrap}>
            {/* Friendly Mascot Congratulations Speech Bubble */}
            <View style={styles.speechRow}>
              <View style={styles.mascotWrapper}>
                <View style={styles.mascotAvatarCircle}>
                  <Text style={styles.mascotEmoji}>🏆</Text>
                </View>
                <View style={styles.mascotNameBadge}>
                  <Text style={styles.mascotNameText}>SPARKY</Text>
                </View>
              </View>
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>
                  Awesome work! 🎉 You answered {score} / {QUIZ_QUESTIONS.length} correctly (+{userEarnedXP} XP). Check your place on the live podium!
                </Text>
              </View>
            </View>

            {/* Competition Podium Card */}
            <View style={styles.podiumContainer}>
              <View style={styles.podiumHeaderRow}>
                <View style={styles.trophyBadge}>
                  <Trophy size={14} color="#181A20" strokeWidth={2.4} />
                  <Text style={styles.trophyBadgeText}>SCIENCE SPRINT ARENA</Text>
                </View>
                <View style={styles.liveTagRow}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveTagText}>LIVE COMPETITION</Text>
                </View>
              </View>

              {/* 3 Podiums: 2nd, 1st, 3rd with neat heights */}
              <View style={styles.podiumColumnsRow}>
                {/* 2nd Place */}
                <View style={[styles.podiumCol, styles.podiumCol2]}>
                  <Text style={styles.podiumAvatar}>{LEADERBOARD_PODIUM[1].avatar}</Text>
                  <View style={styles.podiumMedalBadgeSilver}>
                    <Text style={styles.podiumMedalText}>2</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD_PODIUM[1].name}</Text>
                  <Text style={styles.podiumScore}>{LEADERBOARD_PODIUM[1].score} pts</Text>
                  <View style={[styles.podiumPillar, styles.pillar2]}>
                    <Text style={styles.pillarRankLabel}>2ND</Text>
                  </View>
                </View>

                {/* 1st Place (Center / Tallest) */}
                <View style={[styles.podiumCol, styles.podiumCol1]}>
                  <Crown size={22} color="#FFB800" strokeWidth={2.4} style={styles.crownIcon} />
                  <Text style={styles.podiumAvatar}>{LEADERBOARD_PODIUM[0].avatar}</Text>
                  <View style={styles.podiumMedalBadgeGold}>
                    <Text style={styles.podiumMedalText}>1</Text>
                  </View>
                  <Text style={[styles.podiumName, styles.podiumNameGold]} numberOfLines={1}>
                    {LEADERBOARD_PODIUM[0].name}
                  </Text>
                  <Text style={styles.podiumScoreGold}>{LEADERBOARD_PODIUM[0].score} pts</Text>
                  <View style={[styles.podiumPillar, styles.pillar1]}>
                    <Text style={styles.pillarRankLabelGold}>1ST</Text>
                  </View>
                </View>

                {/* 3rd Place */}
                <View style={[styles.podiumCol, styles.podiumCol3]}>
                  <Text style={styles.podiumAvatar}>{LEADERBOARD_PODIUM[2].avatar}</Text>
                  <View style={styles.podiumMedalBadgeBronze}>
                    <Text style={styles.podiumMedalText}>3</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD_PODIUM[2].name}</Text>
                  <Text style={styles.podiumScore}>{LEADERBOARD_PODIUM[2].score} pts</Text>
                  <View style={[styles.podiumPillar, styles.pillar3]}>
                    <Text style={styles.pillarRankLabel}>3RD</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Highlighted "Your Placement" Card */}
            <View style={styles.userPlaceCard}>
              <View style={styles.userPlaceHeader}>
                <View style={styles.userRankTag}>
                  <Text style={styles.userRankTagText}>YOUR STANDING</Text>
                </View>
                <View style={styles.xpBonusBadge}>
                  <Zap size={11} color="#6C68FF" fill="#6C68FF" />
                  <Text style={styles.xpBonusText}>+{userEarnedXP} XP Earned</Text>
                </View>
              </View>

              <View style={styles.userPlaceRow}>
                <View style={styles.userRankCircle}>
                  <Text style={styles.userRankNumber}>#{userRankNumber}</Text>
                </View>
                <View style={styles.userDetailsCol}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userNameText}>You (Jacob)</Text>
                    <View style={styles.youIndicatorBadge}>
                      <Text style={styles.youIndicatorText}>YOU</Text>
                    </View>
                  </View>
                  <Text style={styles.userSubtitleText}>
                    {score === 3 ? 'Top 5% of all learners today 🔥' : 'Great effort! Top 15% league 🚀'}
                  </Text>
                </View>
                <View style={styles.userPointsBox}>
                  <Text style={styles.userPointsBig}>{userTotalPoints}</Text>
                  <Text style={styles.userPointsSub}>POINTS</Text>
                </View>
              </View>

              {/* Stat breakdown pills */}
              <View style={styles.userStatsRow}>
                <View style={styles.userStatPill}>
                  <Text style={styles.userStatLabel}>Accuracy</Text>
                  <Text style={styles.userStatValue}>
                    {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
                  </Text>
                </View>
                <View style={styles.userStatPill}>
                  <Text style={styles.userStatLabel}>Correct</Text>
                  <Text style={styles.userStatValue}>{score}/{QUIZ_QUESTIONS.length}</Text>
                </View>
                <View style={styles.userStatPill}>
                  <Text style={styles.userStatLabel}>Streak</Text>
                  <Text style={[styles.userStatValue, { color: '#FF7A00' }]}>5 Days 🔥</Text>
                </View>
              </View>
            </View>

            {/* Other Contenders List */}
            <View style={styles.contendersCard}>
              <Text style={styles.contendersTitle}>Competitors in this Tier</Text>
              {OTHER_RANKINGS.map((item) => (
                <View key={item.rank} style={styles.contenderItem}>
                  <Text style={styles.contenderRank}>#{item.rank}</Text>
                  <Text style={styles.contenderAvatar}>{item.avatar}</Text>
                  <View style={styles.contenderInfo}>
                    <Text style={styles.contenderName}>{item.name}</Text>
                    <Text style={styles.contenderMeta}>{item.streak} streak • {item.accuracy} acc</Text>
                  </View>
                  <Text style={styles.contenderScore}>{item.score} pts</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.resultsActionsRow}>
              <TouchableOpacity
                style={styles.retakePillButton}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <RotateCcw size={15} color="#111318" />
                <Text style={styles.retakePillText}>Retake Quiz</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomDarkContinueButton}
                onPress={onContinue}
                activeOpacity={0.88}
              >
                <Text style={styles.bottomDarkContinueText}>Continue to Reels</Text>
                <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8F5',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 8,
    zIndex: 10,
    gap: 12,
  },
  segmentedProgressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  segmentTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E8E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    width: '0%',
    borderRadius: 3,
    backgroundColor: '#B5F43A',
  },
  segmentFillActive: {
    width: '50%',
    backgroundColor: '#FFB800',
  },
  segmentFillDone: {
    width: '100%',
    backgroundColor: '#10B981',
  },
  skipPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E2E6DC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B3E45',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 110,
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrap: {
    width: '100%',
    gap: 14,
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mascotWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  mascotAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0E1FD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#706CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  mascotEmoji: {
    fontSize: 22,
  },
  mascotNameBadge: {
    backgroundColor: '#1C1F26',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  mascotNameText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B4F373',
    letterSpacing: 0.4,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  speechBubbleText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#282C34',
    fontWeight: '600',
  },
  questionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  questionPill: {
    backgroundColor: '#EAEFE2',
    borderWidth: 1,
    borderColor: '#D4DEC8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  questionPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#2D3A1B',
    letterSpacing: 0.4,
  },
  xpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF2E8',
    borderWidth: 1,
    borderColor: '#FFE0CC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  xpRewardPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FF8A48',
  },
  mainHeading: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: '#111318',
    textAlign: 'center',
    paddingHorizontal: 6,
    marginVertical: 2,
    letterSpacing: -0.4,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#EBE7DF',
    gap: 10,
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionCardWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  optionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1C1F26',
    flex: 1,
  },
  optionLabelCorrect: {
    fontWeight: '800',
    color: '#065F46',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B4F373', // Lime green button
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  arrowCircleCorrect: {
    backgroundColor: '#10B981',
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
    borderRadius: 18,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#B4F373',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#EBE7DF',
  },
  explanationCardCorrect: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  explanationCardWrong: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111318',
    marginBottom: 3,
  },
  explanationBody: {
    fontSize: 12,
    lineHeight: 17,
    color: '#4B5262',
    fontWeight: '500',
  },
  continuePillButton: {
    backgroundColor: '#111318',
    borderRadius: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  continuePillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Leaderboard Styles */
  leaderboardWrap: {
    width: '100%',
    gap: 14,
  },
  podiumContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E4DD',
  },
  podiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trophyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B4F373',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  trophyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#181A20',
    letterSpacing: 0.5,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  podiumColumnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 10,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCol1: {
    marginBottom: 0,
  },
  podiumCol2: {
    marginBottom: 0,
  },
  podiumCol3: {
    marginBottom: 0,
  },
  crownIcon: {
    marginBottom: -4,
  },
  podiumAvatar: {
    fontSize: 26,
    marginBottom: 4,
  },
  podiumMedalBadgeGold: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  podiumMedalBadgeSilver: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  podiumMedalBadgeBronze: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginBottom: 4,
  },
  podiumMedalText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumNameGold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  podiumScore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  podiumScoreGold: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 8,
  },
  podiumPillar: {
    width: '100%',
    borderRadius: 14,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillar1: {
    height: 75,
    backgroundColor: '#FFE566',
    borderWidth: 1,
    borderColor: '#F6CF33',
  },
  pillar2: {
    height: 55,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillar3: {
    height: 42,
    backgroundColor: '#FED7AA',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  pillarRankLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  pillarRankLabelGold: {
    fontSize: 12,
    fontWeight: '900',
    color: '#78350F',
  },

  /* User Place Card */
  userPlaceCard: {
    backgroundColor: '#181A20',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  userPlaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userRankTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  userRankTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B4F373',
    letterSpacing: 0.5,
  },
  xpBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECECFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpBonusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C68FF',
  },
  userPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  userRankCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#B4F373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRankNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#181A20',
  },
  userDetailsCol: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  youIndicatorBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  youIndicatorText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userSubtitleText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  userPointsBox: {
    alignItems: 'flex-end',
  },
  userPointsBig: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B4F373',
  },
  userPointsSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  userStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  userStatPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  userStatLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
  },
  userStatValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Contenders Card */
  contendersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E4DD',
  },
  contendersTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1F26',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contenderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3ED',
    gap: 10,
  },
  contenderRank: {
    fontSize: 12,
    fontWeight: '800',
    color: '#848792',
    width: 24,
  },
  contenderAvatar: {
    fontSize: 18,
  },
  contenderInfo: {
    flex: 1,
  },
  contenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1F26',
  },
  contenderMeta: {
    fontSize: 10,
    color: '#848792',
    fontWeight: '500',
  },
  contenderScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1F26',
  },

  /* Results Actions */
  resultsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  retakePillButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E6DC',
    borderRadius: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  retakePillText: {
    color: '#111318',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomDarkContinueButton: {
    flex: 1.3,
    backgroundColor: '#111318',
    borderRadius: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomDarkContinueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
})
