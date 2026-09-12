import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import ExploreScreen from '../../src/screens/ExploreScreen'
import { Colors } from '../../src/constants/theme'

export default function ExploreRoute() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <ExploreScreen onNavigateToStudy={(id) => router.push(`/study/${id}`)} />
    </SafeAreaView>
  )
}
