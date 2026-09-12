import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import StudyScreen from '../../src/screens/StudyScreen'
import { Colors } from '../../src/constants/theme'

export default function StudyRoute() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>()
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'bottom']}>
      <StudyScreen
        materialId={id || 'bio-101'}
        initialTab={(tab as any) || 'subtopics'}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  )
}
