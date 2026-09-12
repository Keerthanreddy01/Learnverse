import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileScreen from '../../src/screens/ProfileScreen'
import { Colors } from '../../src/constants/theme'

export default function ProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <ProfileScreen />
    </SafeAreaView>
  )
}
