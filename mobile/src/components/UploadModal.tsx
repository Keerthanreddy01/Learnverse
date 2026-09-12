import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Colors, Spacing, Typography } from '../constants/theme'
import { useStudy } from '../context/StudyContext'
import {
  Sparkles,
  X,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  BrainCircuit,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Video,
  Layers,
} from 'lucide-react-native'

interface UploadModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: (newMaterialId: string) => void
}

interface AttachedFile {
  name: string
  size?: number
  uri?: string
  mimeType?: string
}

export default function UploadModal({ visible, onClose, onSuccess }: UploadModalProps) {
  const { addMaterial } = useStudy()
  const [activeTab, setActiveTab] = useState<'pdf' | 'image' | 'link'>('pdf')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [selectedFile, setSelectedFile] = useState<AttachedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressStep, setProgressStep] = useState('')

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type:
          activeTab === 'pdf'
            ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            : activeTab === 'image'
            ? ['image/*']
            : ['*/*'],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        setSelectedFile({
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        })

        // Auto-fill module title and subject from filename
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .trim()
        if (cleanName) {
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1))
        }
        if (!subject) {
          setSubject(
            cleanName.toLowerCase().includes('bio')
              ? 'Biology'
              : cleanName.toLowerCase().includes('chem')
              ? 'Chemistry'
              : cleanName.toLowerCase().includes('phys')
              ? 'Physics'
              : 'Curriculum Study'
          )
        }
      }
    } catch (err) {
      console.warn('Document picker error:', err)
    }
  }

  const handleQuickFill = (type: 'bio' | 'cs' | 'physics') => {
    if (type === 'bio') {
      setTitle('Genetics & CRISPR Cas-9 Editing')
      setSubject('Molecular Biology')
      setSelectedFile({
        name: 'CRISPR_Cas9_Genome_Editing_Guide.pdf',
        size: 3.4 * 1024 * 1024,
      })
    } else if (type === 'cs') {
      setTitle('Neural Networks & Backpropagation')
      setSubject('Computer Science')
      setSelectedFile({
        name: 'Deep_Learning_Neural_Nets.pdf',
        size: 2.1 * 1024 * 1024,
      })
    } else {
      setTitle('Quantum Mechanics & Wave Functions')
      setSubject('Physics')
      setSelectedFile({
        name: 'Quantum_Mechanics_Principles.pdf',
        size: 4.6 * 1024 * 1024,
      })
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
  }

  const handleSynthesize = () => {
    const finalTitle =
      title.trim() ||
      (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Curriculum Study Deck')
    const finalSubject = subject.trim() || 'General Science'

    setIsProcessing(true)
    setProgressStep('Ingesting PDF & executing OCR parsing...')

    const steps = [
      'Extracting modular subtopics & core axioms...',
      'Synthesizing 45s microlearning video reel script...',
      'Formulating active-recall flashcards & diagrams...',
      'Generating diagnostic verification quiz...',
    ]

    let stepIdx = 0
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgressStep(steps[stepIdx])
        stepIdx++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          const created = addMaterial({
            title: finalTitle,
            subject: finalSubject,
            type: activeTab,
            sourceFileName: selectedFile?.name,
          })
          setIsProcessing(false)
          setTitle('')
          setSubject('')
          setSelectedFile(null)
          onClose()
          onSuccess(created.id)
        }, 400)
      }
    }, 450)
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerBadge}>
                <Sparkles size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Upload PDF Curriculum</Text>
                <Text style={styles.headerSubtitle}>Generate Subtopics, Video Reels & Quizzes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <BrainCircuit size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingTitle}>Synthesizing Microlearning</Text>
              <Text style={styles.processingStepText}>{progressStep}</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Source Mode Tabs */}
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'pdf' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('pdf')}
                >
                  <FileText size={14} color={activeTab === 'pdf' ? '#000000' : Colors.textMuted} />
                  <Text style={[styles.tabText, activeTab === 'pdf' && styles.tabTextActive]}>
                    PDF Document
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'image' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('image')}
                >
                  <ImageIcon size={14} color={activeTab === 'image' ? '#000000' : Colors.textMuted} />
                  <Text style={[styles.tabText, activeTab === 'image' && styles.tabTextActive]}>
                    Scan Notes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'link' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('link')}
                >
                  <LinkIcon size={14} color={activeTab === 'link' ? '#000000' : Colors.textMuted} />
                  <Text style={[styles.tabText, activeTab === 'link' && styles.tabTextActive]}>
                    Web URL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Main PDF Upload Dropzone / Attached File View */}
              {selectedFile ? (
                <View style={styles.attachedFileBox}>
                  <View style={styles.fileIconWrap}>
                    <FileText size={20} color="#EF4444" />
                  </View>
                  <View style={styles.fileMetaWrap}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <View style={styles.fileSubRow}>
                      <Text style={styles.fileSizeText}>
                        {selectedFile.size
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : 'Attached'}
                      </Text>
                      <View style={styles.statusPill}>
                        <CheckCircle2 size={11} color="#10B981" />
                        <Text style={styles.statusPillText}>Ready for AI</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFileBtn}
                    onPress={handleClearFile}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadDropzone}
                  onPress={handlePickDocument}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropzoneIconBox}>
                    <UploadCloud size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.dropzoneTitle}>Tap to Browse PDF File</Text>
                  <Text style={styles.dropzoneSubtitle}>
                    Upload textbooks, syllabus, lecture notes or slides (up to 30MB)
                  </Text>
                  <View style={styles.browsePillBtn}>
                    <Text style={styles.browsePillText}>Select Document from Device</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* AI Deliverables Highlights */}
              <View style={styles.deliverablesCard}>
                <Text style={styles.deliverablesTitle}>AI Auto-Generation Engine:</Text>
                <View style={styles.deliverablesGrid}>
                  <View style={styles.deliverableItem}>
                    <Layers size={13} color="#B4F373" />
                    <Text style={styles.deliverableText}>Modular Subtopics</Text>
                  </View>
                  <View style={styles.deliverableItem}>
                    <Video size={13} color="#ABB4FE" />
                    <Text style={styles.deliverableText}>45s Video Reel</Text>
                  </View>
                  <View style={styles.deliverableItem}>
                    <Sparkles size={13} color="#FFA770" />
                    <Text style={styles.deliverableText}>3D Flashcards & Quiz</Text>
                  </View>
                </View>
              </View>

              {/* Quick Fill Sample Section */}
              <View style={styles.quickFillSection}>
                <Text style={styles.quickFillLabel}>Or test with pre-loaded textbook samples:</Text>
                <View style={styles.pillsRow}>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      {
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      },
                    ]}
                    onPress={() => handleQuickFill('bio')}
                  >
                    <Text style={[styles.pillText, { color: Colors.emerald }]}>CRISPR Bio PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.pill,
                      {
                        borderColor: 'rgba(6, 182, 212, 0.4)',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      },
                    ]}
                    onPress={() => handleQuickFill('cs')}
                  >
                    <Text style={[styles.pillText, { color: Colors.cyan }]}>Neural Nets PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.pill,
                      {
                        borderColor: 'rgba(245, 158, 11, 0.4)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      },
                    ]}
                    onPress={() => handleQuickFill('physics')}
                  >
                    <Text style={[styles.pillText, { color: Colors.amber }]}>Quantum PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title & Subject Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MODULE / CHAPTER TITLE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Chapter 4: Photosynthesis & Light Reactions"
                  placeholderTextColor={Colors.textDim}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SUBJECT / COURSE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Molecular Biology"
                  placeholderTextColor={Colors.textDim}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSynthesize}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Generate Subtopics & Video Reel</Text>
                <ArrowRight size={16} color="#000000" strokeWidth={2.5} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    maxHeight: '90%',
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    paddingBottom: Spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: 99,
  },
  formContainer: {
    gap: 14,
    paddingBottom: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 11.5,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  uploadDropzone: {
    borderWidth: 1.5,
    borderColor: 'rgba(180, 243, 115, 0.35)',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(180, 243, 115, 0.04)',
    gap: 8,
  },
  dropzoneIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  dropzoneSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  browsePillBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    marginTop: 4,
  },
  browsePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  attachedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(180, 243, 115, 0.4)',
    padding: 12,
    gap: 12,
  },
  fileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileMetaWrap: {
    flex: 1,
    gap: 3,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  fileSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileSizeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  removeFileBtn: {
    padding: 8,
  },
  deliverablesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  deliverablesTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deliverablesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  deliverableItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  deliverableText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  quickFillSection: {
    gap: 6,
  },
  quickFillLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pillText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.textMuted,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 13,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '800',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  processingTitle: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginTop: 8,
  },
  processingStepText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.primary,
  },
})
