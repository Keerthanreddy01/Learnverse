import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Plus,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ArrowRight,
  Zap,
} from 'lucide-react-native'
import { Quiz, QuizQuestion } from '../types'

interface QuizUploadModalProps {
  visible: boolean
  onClose: () => void
  onSaveQuiz: (quiz: Quiz, startImmediately?: boolean) => void
}

export default function QuizUploadModal({ visible, onClose, onSaveQuiz }: QuizUploadModalProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'manual'>('upload')
  const [quizTitle, setQuizTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [pickedFile, setPickedFile] = useState<{ name: string; size?: number } | null>(null)
  const [notesText, setNotesText] = useState('')
  const [isSynthesizing, setIsSynthesizing] = useState(false)

  // Custom question editor state for manual mode or generated preview
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-custom-1',
      topic: 'Matter & Physics',
      question: 'Which state of matter has particles vibrating in fixed lattice positions?',
      options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
      correctIndex: 0,
      explanation: 'Solids have tightly bound atoms vibrating in fixed crystal structures with fixed volume and shape.',
    },
    {
      id: 'q-custom-2',
      topic: 'Thermal Dynamics',
      question: 'What is the temperature at which liquid water transitions to vapor at 1 atm?',
      options: ['0°C', '50°C', '100°C', '200°C'],
      correctIndex: 2,
      explanation: 'Water boils and undergoes phase change into steam at 100°C (212°F) under standard pressure.',
    },
    {
      id: 'q-custom-3',
      topic: 'Kinetic Theory',
      question: 'What happens to gas particle collisions as temperature increases?',
      options: ['Frequency and speed increase', 'Particles stop moving', 'Pressure drops to zero', 'Particles freeze into ice'],
      correctIndex: 0,
      explanation: 'Higher thermal energy translates to higher kinetic velocity, leading to more energetic collisions.',
    },
  ])

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        setPickedFile({ name: file.name, size: file.size })
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        if (!quizTitle) {
          setQuizTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) + ' Quiz')
        }
        if (!subject) {
          setSubject('Physical Science')
        }
      }
    } catch (err) {
      console.warn('Picker error:', err)
    }
  }

  const handleQuickPreset = (preset: 'matter' | 'biology' | 'olympiad') => {
    if (preset === 'matter') {
      setQuizTitle('States of Matter & Molecular Kinetics')
      setSubject('Physics & Chemistry')
      setNotesText('States of matter notes: Solid particles vibrate in fixed lattices. Liquids slide past one another. Gases move rapidly with large gaps. Evaporation requires heat energy.')
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          topic: 'States of Matter',
          question: 'What happens to gas volume when placed into a larger closed container?',
          options: ['It expands to fill the entire container', 'It shrinks to a small corner', 'It immediately freezes', 'It converts into liquid'],
          correctIndex: 0,
          explanation: 'Gas particles possess high kinetic energy and move freely to fill any enclosed space uniformly.',
        },
        {
          id: `q-${Date.now()}-2`,
          topic: 'Phase Change',
          question: 'What is the latent heat required to change liquid into gas called?',
          options: ['Heat of Vaporization', 'Heat of Fusion', 'Absolute Zero', 'Specific Gravity'],
          correctIndex: 0,
          explanation: 'The latent heat of vaporization is the energy required to overcome intermolecular bonds for phase change.',
        },
        {
          id: `q-${Date.now()}-3`,
          topic: 'Kinetic Physics',
          question: 'How does lowering the temperature affect molecular kinetic motion?',
          options: ['Slows particle movement down', 'Increases molecular velocity', 'Causes particles to explode', 'No effect on kinetic energy'],
          correctIndex: 0,
          explanation: 'Temperature is directly proportional to average kinetic energy; cooling reduces molecular motion.',
        },
      ])
    } else if (preset === 'biology') {
      setQuizTitle('Cellular Photosynthesis & Transpiration')
      setSubject('Biology')
      setNotesText('Chloroplasts use solar photons, water, and CO2 to produce glucose and release O2.')
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          topic: 'Photosynthesis',
          question: 'Which organelle carries out light-dependent reactions in plant cells?',
          options: ['Chloroplast', 'Mitochondria', 'Golgi apparatus', 'Ribosome'],
          correctIndex: 0,
          explanation: 'Chloroplasts contain chlorophyll pigments that absorb photons for photosynthesis.',
        },
        {
          id: `q-${Date.now()}-2`,
          topic: 'Transpiration',
          question: 'Through which microscopic plant pores does water vapor escape?',
          options: ['Stomata', 'Xylem vessels', 'Phloem tubes', 'Cuticle cells'],
          correctIndex: 0,
          explanation: 'Stomata on leaves open and close to regulate gas exchange and transpiration.',
        },
        {
          id: `q-${Date.now()}-3`,
          topic: 'Bioenergetics',
          question: 'What chemical molecule serves as cellular energy currency?',
          options: ['ATP', 'DNA', 'RNA', 'Hemoglobin'],
          correctIndex: 0,
          explanation: 'Adenosine triphosphate (ATP) captures chemical energy from cellular respiration and photosynthesis.',
        },
      ])
    } else {
      setQuizTitle('Olympiad General Science Sprint')
      setSubject('General Science')
      setNotesText('Olympiad review covering mechanics, chemical bonds, and thermodynamic laws.')
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          topic: 'Thermodynamics',
          question: 'What does the First Law of Thermodynamics state?',
          options: ['Energy cannot be created or destroyed', 'Entropy always decreases', 'Absolute zero can easily be reached', 'Mass is never conserved'],
          correctIndex: 0,
          explanation: 'Energy is conserved; it can only be transformed from one state into another.',
        },
        {
          id: `q-${Date.now()}-2`,
          topic: 'Chemical Bonds',
          question: 'Which bond forms through the electrostatic attraction between oppositely charged ions?',
          options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
          correctIndex: 0,
          explanation: 'Ionic bonds form when electrons are transferred between atoms, forming attracting cations and anions.',
        },
        {
          id: `q-${Date.now()}-3`,
          topic: 'Physics',
          question: 'What is the standard acceleration due to gravity on Earth’s surface?',
          options: ['9.8 m/s²', '3.14 m/s²', '100 m/s²', '1.6 m/s²'],
          correctIndex: 0,
          explanation: 'Earth’s standard gravitational acceleration at sea level is approximately 9.8 m/s².',
        },
      ])
    }
  }

  const handleSaveAndPlay = (startNow: boolean) => {
    const finalTitle = quizTitle.trim() || (pickedFile ? pickedFile.name.replace(/\.[^/.]+$/, '') : 'Custom Student Quiz')
    const finalSubject = subject.trim() || 'General Science'

    const newQuiz: Quiz = {
      id: `quiz-custom-${Date.now()}`,
      title: finalTitle,
      totalQuestions: questions.length,
      passingScore: Math.ceil(questions.length * 0.6),
      questions: questions.map((q) => ({
        ...q,
        topic: finalSubject,
      })),
    }

    onSaveQuiz(newQuiz, startNow)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <View style={styles.quizIconBadge}>
                <Sparkles size={16} color="#181A20" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Create / Upload Quiz</Text>
                <Text style={styles.sheetSubtitle}>Upload documents, notes or custom questions</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#181A20" />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeTabsRow}>
            <TouchableOpacity
              style={[styles.modeTab, activeMode === 'upload' && styles.modeTabActive]}
              onPress={() => setActiveMode('upload')}
              activeOpacity={0.8}
            >
              <UploadCloud size={14} color={activeMode === 'upload' ? '#181A20' : '#8A8D98'} />
              <Text style={[styles.modeTabText, activeMode === 'upload' && styles.modeTabTextActive]}>
                Upload Document / Notes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, activeMode === 'manual' && styles.modeTabActive]}
              onPress={() => setActiveMode('manual')}
              activeOpacity={0.8}
            >
              <FileText size={14} color={activeMode === 'manual' ? '#181A20' : '#8A8D98'} />
              <Text style={[styles.modeTabText, activeMode === 'manual' && styles.modeTabTextActive]}>
                Questions ({questions.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Quick Presets for Instant Testing */}
            <View style={styles.presetsSection}>
              <Text style={styles.fieldLabel}>⚡ Quick Auto-Fill Quiz Presets</Text>
              <View style={styles.presetButtonsRow}>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => handleQuickPreset('matter')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetBtnText}>🧪 States of Matter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => handleQuickPreset('biology')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetBtnText}>🌿 Photosynthesis</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => handleQuickPreset('olympiad')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetBtnText}>🏆 Olympiad Science</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quiz Title & Subject Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Quiz Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 3 States of Matter & Phase Dynamics"
                placeholderTextColor="#9CA3AF"
                value={quizTitle}
                onChangeText={setQuizTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Subject / Topic</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Physical Chemistry, Thermodynamics"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {activeMode === 'upload' ? (
              <View style={styles.uploadSection}>
                <Text style={styles.fieldLabel}>Document or PDF Upload</Text>
                <TouchableOpacity
                  style={styles.uploadDropzone}
                  onPress={handlePickDocument}
                  activeOpacity={0.85}
                >
                  <UploadCloud size={28} color="#6C68FF" />
                  <Text style={styles.dropzoneTitle}>
                    {pickedFile ? pickedFile.name : 'Tap to select PDF or Document'}
                  </Text>
                  <Text style={styles.dropzoneSubtitle}>
                    {pickedFile
                      ? `${Math.round((pickedFile.size || 0) / 1024)} KB • Document Attached`
                      : 'Supports PDF, Word, and text study files'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Or Paste Study Notes / Q&A</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Paste lecture notes, study outline, or topic summary here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  value={notesText}
                  onChangeText={setNotesText}
                />
              </View>
            ) : (
              /* Questions Preview and Editor */
              <View style={styles.questionsSection}>
                <Text style={styles.fieldLabel}>Generated Questions ({questions.length})</Text>
                {questions.map((q, qIdx) => (
                  <View key={q.id} style={styles.questionCard}>
                    <View style={styles.questionCardHeader}>
                      <Text style={styles.questionNumberText}>Question {qIdx + 1}</Text>
                      <View style={styles.correctPill}>
                        <Text style={styles.correctPillText}>Correct: Option {q.correctIndex + 1}</Text>
                      </View>
                    </View>
                    <Text style={styles.questionTextPreview}>{q.question}</Text>
                    <View style={styles.optionsPreviewList}>
                      {q.options.map((opt, optIdx) => (
                        <View
                          key={optIdx}
                          style={[
                            styles.optionPreviewPill,
                            optIdx === q.correctIndex && styles.optionPreviewPillCorrect,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionPreviewText,
                              optIdx === q.correctIndex && styles.optionPreviewTextCorrect,
                            ]}
                          >
                            {optIdx + 1}. {opt}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => handleSaveAndPlay(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save to Quizzes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playNowBtn}
              onPress={() => handleSaveAndPlay(true)}
              activeOpacity={0.88}
            >
              <Zap size={15} color="#181A20" fill="#181A20" />
              <Text style={styles.playNowBtnText}>Play Quiz Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6DC',
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quizIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B4F373',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#181A20',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#767984',
    fontWeight: '500',
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
  modeTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#EFEBE4',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#181A20',
  },
  modeTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#767984',
  },
  modeTabTextActive: {
    color: '#181A20',
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  presetsSection: {
    marginBottom: 14,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  presetBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#181A20',
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4B5262',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#181A20',
    borderWidth: 1,
    borderColor: '#ECE6DC',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadSection: {
    marginBottom: 14,
  },
  uploadDropzone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4CEFF',
    borderStyle: 'dashed',
    gap: 6,
  },
  dropzoneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181A20',
    textAlign: 'center',
  },
  dropzoneSubtitle: {
    fontSize: 11,
    color: '#767984',
    fontWeight: '500',
  },
  questionsSection: {
    marginBottom: 14,
    gap: 10,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DC',
    gap: 8,
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#181A20',
  },
  correctPill: {
    backgroundColor: '#E8FBE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  correctPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  questionTextPreview: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  optionsPreviewList: {
    gap: 4,
    marginTop: 2,
  },
  optionPreviewPill: {
    backgroundColor: '#F7F8F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  optionPreviewPillCorrect: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  optionPreviewText: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  optionPreviewTextCorrect: {
    color: '#15803D',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE6DC',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE6DC',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181A20',
  },
  playNowBtn: {
    flex: 1.3,
    backgroundColor: '#B4F373',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  playNowBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181A20',
  },
})
