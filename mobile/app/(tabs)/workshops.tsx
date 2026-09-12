import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import WorkshopsScreen from '../../src/screens/WorkshopsScreen'
import { Colors } from '../../src/constants/theme'

export default function WorkshopsRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <WorkshopsScreen />
    </SafeAreaView>
  )
}
