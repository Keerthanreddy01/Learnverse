import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import HomeScreen from '../../src/screens/HomeScreen'
import { Colors } from '../../src/constants/theme'

export default function DashboardRoute() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <HomeScreen
        onNavigateToStudy={(id) => router.push(`/study/${id}`)}
        onNavigateToExplore={() => router.push('/(tabs)/explore')}
      />
    </SafeAreaView>
  )
}
