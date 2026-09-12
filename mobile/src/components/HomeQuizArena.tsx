import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import {
  Trophy,
  Zap,
  Sparkles,
  ArrowRight,
  Plus,
  Crown,
  Flame,
  CheckCircle,
  Clock3,
  Layers,
  HelpCircle,
} from 'lucide-react-native'
import { Quiz } from '../types'
import QuizUploadModal from './QuizUploadModal'
import HomeQuizModal from './HomeQuizModal'

// Pre-loaded high yield quizzes matching the video reels curriculum
const DEFAULT_PRELOADED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-states-of-matter',
    title: '3 States of Matter & Phase Dynamics',
    totalQuestions: 3,
    passingScore: 2,
    questions: [
      {
        id: 'som-1',
        topic: 'Physical Chemistry',
        question: 'What characterizes the arrangement and motion of molecules in a gas?',
        options: [
          'High kinetic energy, moving freely with large spaces between them',
          'Vibrating tightly within rigid fixed crystal lattices',
          'Packed closely together with zero ability to compress',
          'Fixed volume with immovable molecular positions',
        ],
        correctIndex: 0,
        explanation: 'In gases, high thermal kinetic energy allows particles to move freely with large intermolecular spaces.',
      },
      {
        id: 'som-2',
        topic: 'Phase Change',
        question: 'How does solar thermal energy cause liquid water to evaporate?',
        options: [
          'It solidifies molecules into cold dense ice crystals',
          'It provides kinetic energy to break bonds and escape into the air',
          'It stops all atmospheric wind currents',
          'It changes hydrogen atoms into helium',
        ],
        correctIndex: 1,
        explanation: 'Heat transfers thermal energy to molecules, enabling them to break intermolecular bonds and transition into gas.',
      },
      {
        id: 'som-3',
        topic: 'Thermodynamics',
        question: 'Which state of matter has a fixed volume but conforms to the shape of its container?',
        options: ['Liquid', 'Solid', 'Gas', 'Plasma'],
        correctIndex: 0,
        explanation: 'Liquids have a definite volume because particles stay close, but can slide past one another to take container shape.',
      },
    ],
  },
  {
    id: 'quiz-photosynthesis-cycle',
    title: 'Photosynthesis & Hydrologic Cycle',
    totalQuestions: 3,
    passingScore: 2,
    questions: [
      {
        id: 'bio-1',
        topic: 'Cellular Biology',
        question: 'What is the primary energy transformation occurring in plant photosynthesis?',
        options: [
          'Solar photons into chemical energy (glucose & ATP)',
          'Thermal friction directly into nuclear radiation',
          'Mechanical pressure into static electricity',
          'Sound waves into atmospheric moisture',
        ],
        correctIndex: 0,
        explanation: 'Chlorophyll molecules capture solar photons to synthesize chemical bonds in glucose and ATP.',
      },
      {
        id: 'bio-2',
        topic: 'Earth Science',
        question: 'What drives the global movement of moisture in the water cycle?',
        options: [
          'Solar radiation heating the atmosphere and ocean surfaces',
          'Earth’s magnetic core magnetism',
          'Lunar orbital tides only',
          'Underground volcanic seismic waves',
        ],
        correctIndex: 0,
        explanation: 'Solar thermal heating powers evaporation, transpiration, and atmospheric convective circulation.',
      },
      {
        id: 'bio-3',
        topic: 'Plant Physiology',
        question: 'By what mechanism do plants release excess water vapor into the air?',
        options: ['Transpiration via leaf stomata', 'Root absorption', 'Cell wall crystallization', 'Petal condensation'],
        correctIndex: 0,
        explanation: 'Transpiration releases water vapor through open leaf stomata into the atmosphere.',
      },
    ],
  },
  {
    id: 'quiz-kinetic-physics',
    title: 'Kinetic Theory & Molecular Heat',
    totalQuestions: 3,
    passingScore: 2,
    questions: [
      {
        id: 'kin-1',
        topic: 'Thermal Physics',
        question: 'What happens to average molecular speed as temperature increases?',
        options: [
          'Average molecular speed increases proportionally',
          'Molecules completely halt and freeze',
          'Speed drops to zero at boiling point',
          'Mass of the molecules doubles',
        ],
        correctIndex: 0,
        explanation: 'Temperature is a direct measure of average molecular kinetic energy; higher temp means faster motion.',
      },
      {
        id: 'kin-2',
        topic: 'Thermodynamics',
        question: 'In which state of matter are intermolecular forces the strongest?',
        options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
        correctIndex: 0,
        explanation: 'Solids have the strongest intermolecular forces holding particles in fixed, structured arrangements.',
      },
      {
        id: 'kin-3',
        topic: 'Phase Change',
        question: 'What is the phase transition from gas directly into solid known as?',
        options: ['Deposition', 'Sublimation', 'Condensation', 'Vaporization'],
        correctIndex: 0,
        explanation: 'Deposition is the thermodynamic process where gas transitions directly to solid without passing through liquid.',
      },
    ],
  },
]

// Leaderboard podium participants
const PODIUM_USERS = [
  { rank: 1, name: 'Sophia Chen', score: 2980, avatar: '👩‍🔬', badge: 'Gold' },
  { rank: 2, name: 'Alex Rivera', score: 2840, avatar: '👨‍🎓', badge: 'Silver' },
  { rank: 3, name: 'Liam Patel', score: 2690, avatar: '🧑‍💻', badge: 'Bronze' },
]

const COMPETITION_TIER = [
  { rank: 5, name: 'Emma Watson', score: 2420, avatar: '👩‍🏫', streak: '4d' },
  { rank: 6, name: 'Noah Tanaka', score: 2310, avatar: '🧑‍🔬', streak: '7d' },
  { rank: 7, name: 'Maya Sen', score: 2150, avatar: '👩‍💻', streak: '2d' },
]

export default function HomeQuizArena() {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'leaderboard'>('quizzes')
  const [quizzes, setQuizzes] = useState<Quiz[]>(DEFAULT_PRELOADED_QUIZZES)
  const [activePlayingQuiz, setActivePlayingQuiz] = useState<Quiz | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Dynamic user stats that update as user completes quizzes
  const [userScore, setUserScore] = useState(2550)
  const [userRank, setUserRank] = useState(4)
  const [completedQuizCount, setCompletedQuizCount] = useState(2)

  const handleSaveQuiz = (newQuiz: Quiz, startImmediately = false) => {
    setQuizzes((prev) => [newQuiz, ...prev])
    if (startImmediately) {
      setActivePlayingQuiz(newQuiz)
    }
  }

  const handleFinishQuiz = (score: number, total: number, earnedXP: number) => {
    setUserScore((prev) => prev + earnedXP)
    setCompletedQuizCount((prev) => prev + 1)
    if (score === total && userRank > 1) {
      setUserRank((prev) => Math.max(1, prev - 1))
    }
  }

  return (
    <View style={styles.arenaContainer}>
      {/* Widget Header & Segmented Pill Controls */}
      <View style={styles.arenaHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionHeading}>Quiz & Leaderboard Arena</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>ACTIVE</Text>
          </View>
        </View>

        {/* Tab Switcher & Upload Action */}
        <View style={styles.controlsRow}>
          <View style={styles.tabToggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'quizzes' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('quizzes')}
              activeOpacity={0.8}
            >
              <Zap size={12} color={activeTab === 'quizzes' ? '#181A20' : '#8A8D98'} fill={activeTab === 'quizzes' ? '#181A20' : 'none'} />
              <Text style={[styles.toggleBtnText, activeTab === 'quizzes' && styles.toggleBtnTextActive]}>
                Quizzes ({quizzes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'leaderboard' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('leaderboard')}
              activeOpacity={0.8}
            >
              <Trophy size={12} color={activeTab === 'leaderboard' ? '#181A20' : '#8A8D98'} />
              <Text style={[styles.toggleBtnText, activeTab === 'leaderboard' && styles.toggleBtnTextActive]}>
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.uploadQuizBtn}
            onPress={() => setIsUploadModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={13} color="#181A20" strokeWidth={2.4} />
            <Text style={styles.uploadQuizBtnText}>Upload Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab 1: Quizzes List View */}
      {activeTab === 'quizzes' ? (
        <View style={styles.quizzesListWrap}>
          {quizzes.map((quiz, index) => {
            const isCustom = quiz.id.startsWith('quiz-custom')
            return (
              <View key={quiz.id} style={styles.quizCard}>
                <View style={styles.quizCardTop}>
                  <View style={styles.quizBadgeGroup}>
                    <View style={[styles.typeBadge, isCustom && styles.typeBadgeCustom]}>
                      <Text style={[styles.typeBadgeText, isCustom && styles.typeBadgeTextCustom]}>
                        {isCustom ? 'CUSTOM UPLOAD' : 'PRE-LOADED SPRINT'}
                      </Text>
                    </View>
                    <View style={styles.xpTag}>
                      <Zap size={10} color="#6C68FF" fill="#6C68FF" />
                      <Text style={styles.xpTagText}>+{quiz.totalQuestions * 100} XP</Text>
                    </View>
                  </View>

                  <View style={styles.questionCountBadge}>
                    <Text style={styles.questionCountText}>{quiz.totalQuestions} Questions</Text>
                  </View>
                </View>

                <Text style={styles.quizCardTitle}>{quiz.title}</Text>
                <Text style={styles.quizCardSubtitle}>
                  {quiz.questions[0]?.topic || 'Physical Science'} • Spaced recall challenge
                </Text>

                <View style={styles.quizCardFooter}>
                  <View style={styles.estimatedTimeRow}>
                    <Clock3 size={11} color="#8A8D98" />
                    <Text style={styles.estimatedTimeText}>~3 mins</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.startQuizPillBtn}
                    onPress={() => setActivePlayingQuiz(quiz)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.startQuizPillText}>Start Quiz</Text>
                    <ArrowRight size={13} color="#181A20" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        /* Tab 2: Leaderboard Competition View */
        <View style={styles.leaderboardSectionWrap}>
          {/* Top 3 Podium Card */}
          <View style={styles.podiumCard}>
            <View style={styles.podiumHeader}>
              <View style={styles.podiumTitleRow}>
                <Crown size={14} color="#FFB800" />
                <Text style={styles.podiumHeading}>Top Science Olympiad Ranks</Text>
              </View>
              <Text style={styles.podiumSeasonText}>Weekly Season 4</Text>
            </View>

            <View style={styles.podiumRow}>
              {/* 2nd Place */}
              <View style={[styles.podiumColumn, styles.podiumCol2]}>
                <Text style={styles.podiumAvatarEmoji}>{PODIUM_USERS[1].avatar}</Text>
                <View style={styles.silverBadge}>
                  <Text style={styles.badgeNum}>2</Text>
                </View>
                <Text style={styles.podiumContenderName} numberOfLines={1}>{PODIUM_USERS[1].name}</Text>
                <Text style={styles.podiumContenderPoints}>{PODIUM_USERS[1].score} pts</Text>
                <View style={[styles.pillarBlock, styles.pillarBlock2]}>
                  <Text style={styles.pillarNum}>2ND</Text>
                </View>
              </View>

              {/* 1st Place */}
              <View style={[styles.podiumColumn, styles.podiumCol1]}>
                <Crown size={18} color="#FFB800" style={{ marginBottom: -2 }} />
                <Text style={styles.podiumAvatarEmoji}>{PODIUM_USERS[0].avatar}</Text>
                <View style={styles.goldBadge}>
                  <Text style={styles.badgeNum}>1</Text>
                </View>
                <Text style={[styles.podiumContenderName, styles.nameGold]} numberOfLines={1}>
                  {PODIUM_USERS[0].name}
                </Text>
                <Text style={styles.scoreGold}>{PODIUM_USERS[0].score} pts</Text>
                <View style={[styles.pillarBlock, styles.pillarBlock1]}>
                  <Text style={styles.pillarNumGold}>1ST</Text>
                </View>
              </View>

              {/* 3rd Place */}
              <View style={[styles.podiumColumn, styles.podiumCol3]}>
                <Text style={styles.podiumAvatarEmoji}>{PODIUM_USERS[2].avatar}</Text>
                <View style={styles.bronzeBadge}>
                  <Text style={styles.badgeNum}>3</Text>
                </View>
                <Text style={styles.podiumContenderName} numberOfLines={1}>{PODIUM_USERS[2].name}</Text>
                <Text style={styles.podiumContenderPoints}>{PODIUM_USERS[2].score} pts</Text>
                <View style={[styles.pillarBlock, styles.pillarBlock3]}>
                  <Text style={styles.pillarNum}>3RD</Text>
                </View>
              </View>
            </View>
          </View>

          {/* User's Place Highlighted Card */}
          <View style={styles.userPlacementCard}>
            <View style={styles.userPlacementRow}>
              <View style={styles.userRankBadge}>
                <Text style={styles.userRankNum}>#{userRank}</Text>
              </View>
              <View style={styles.userInfoCol}>
                <View style={styles.userNameBadgeRow}>
                  <Text style={styles.userNameLabel}>You (Jacob)</Text>
                  <View style={styles.youPill}>
                    <Text style={styles.youPillText}>YOU</Text>
                  </View>
                </View>
                <Text style={styles.userPlacementSubtitle}>
                  {completedQuizCount} Quizzes Completed • Top 5% Contender
                </Text>
              </View>
              <View style={styles.pointsCol}>
                <Text style={styles.userPointsNumber}>{userScore}</Text>
                <Text style={styles.userPointsLabel}>POINTS</Text>
              </View>
            </View>

            <View style={styles.userStatMetricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Streak</Text>
                <Text style={[styles.metricItemVal, { color: '#FF7A00' }]}>5 Days 🔥</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Accuracy</Text>
                <Text style={styles.metricItemVal}>98%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Tier</Text>
                <Text style={styles.metricItemVal}>Diamond 💎</Text>
              </View>
            </View>
          </View>

          {/* Tier Competitors list */}
          <View style={styles.contendersListCard}>
            <Text style={styles.contendersHeaderLabel}>Active League Contenders</Text>
            {COMPETITION_TIER.map((item) => (
              <View key={item.rank} style={styles.contenderRowItem}>
                <Text style={styles.contenderRankText}>#{item.rank}</Text>
                <Text style={styles.contenderAvatarEmoji}>{item.avatar}</Text>
                <View style={styles.contenderNameMetaCol}>
                  <Text style={styles.contenderTitle}>{item.name}</Text>
                  <Text style={styles.contenderStreak}>{item.streak} daily streak</Text>
                </View>
                <Text style={styles.contenderPointsText}>{item.score} pts</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Modals for Quiz Upload and Play */}
      <QuizUploadModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveQuiz={handleSaveQuiz}
      />

      <HomeQuizModal
        visible={activePlayingQuiz !== null}
        quiz={activePlayingQuiz}
        onClose={() => setActivePlayingQuiz(null)}
        onFinishQuiz={handleFinishQuiz}
        onViewLeaderboard={() => setActiveTab('leaderboard')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  arenaContainer: {
    gap: 12,
  },
  arenaHeader: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181A20',
    letterSpacing: -0.2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8FBE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tabToggleGroup: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EFEBE4',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 11,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#767984',
  },
  toggleBtnTextActive: {
    color: '#181A20',
  },
  uploadQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B4F373',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 13,
  },
  uploadQuizBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#181A20',
  },

  /* Quizzes list */
  quizzesListWrap: {
    gap: 10,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  quizCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  typeBadgeCustom: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6C68FF',
    letterSpacing: 0.4,
  },
  typeBadgeTextCustom: {
    color: '#D97706',
  },
  xpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  questionCountBadge: {
    backgroundColor: '#F7F8F5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  questionCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#767984',
  },
  quizCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#181A20',
    marginTop: 2,
  },
  quizCardSubtitle: {
    fontSize: 11.5,
    color: '#767984',
    fontWeight: '500',
  },
  quizCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F0E8',
  },
  estimatedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: 11,
    color: '#8A8D98',
    fontWeight: '600',
  },
  startQuizPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B4F373',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
  },
  startQuizPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#181A20',
  },

  /* Leaderboard view */
  leaderboardSectionWrap: {
    gap: 10,
  },
  podiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  podiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  podiumHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#181A20',
  },
  podiumSeasonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C68FF',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  podiumColumn: {
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
  podiumAvatarEmoji: {
    fontSize: 22,
    marginBottom: 3,
  },
  goldBadge: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: 3,
  },
  silverBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: 3,
  },
  bronzeBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: 3,
  },
  badgeNum: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumContenderName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 1,
  },
  nameGold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  podiumContenderPoints: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  scoreGold: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFB800',
    marginBottom: 6,
  },
  pillarBlock: {
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarBlock1: {
    height: 60,
    backgroundColor: '#FFD700',
  },
  pillarBlock2: {
    height: 44,
    backgroundColor: '#E2E8F0',
  },
  pillarBlock3: {
    height: 34,
    backgroundColor: '#FDE68A',
  },
  pillarNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  pillarNumGold: {
    fontSize: 11,
    fontWeight: '900',
    color: '#78350F',
  },

  /* User Placement Card */
  userPlacementCard: {
    backgroundColor: '#181A20',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  userPlacementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userRankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#B4F373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRankNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#181A20',
  },
  userInfoCol: {
    flex: 1,
    gap: 2,
  },
  userNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  youPill: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userPlacementSubtitle: {
    fontSize: 10.5,
    color: '#9CA3AF',
  },
  pointsCol: {
    alignItems: 'flex-end',
  },
  userPointsNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B4F373',
  },
  userPointsLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  userStatMetricsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    gap: 8,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  metricItemLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  metricItemVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },

  /* Contenders list */
  contendersListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    gap: 8,
  },
  contendersHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 2,
  },
  contenderRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  contenderRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    width: 20,
  },
  contenderAvatarEmoji: {
    fontSize: 16,
  },
  contenderNameMetaCol: {
    flex: 1,
  },
  contenderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#181A20',
  },
  contenderStreak: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  contenderPointsText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#181A20',
  },
})
