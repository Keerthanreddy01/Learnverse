import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useNavigation } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import ReelsScreen from '../../src/screens/ReelsScreen'

export default function ReelsRoute() {
  const router = useRouter()
  const pathname = usePathname()
  const navigation = useNavigation()
  const [isFocused, setIsFocused] = useState(true)

  useEffect(() => {
    const unsubFocus = navigation.addListener('focus', () => setIsFocused(true))
    const unsubBlur = navigation.addListener('blur', () => setIsFocused(false))
    return () => {
      unsubFocus()
      unsubBlur()
    }
  }, [navigation])

  // Screen is actively viewed if tab is focused AND pathname matches reels
  const isScreenActive = isFocused && (pathname === '/reels' || pathname.endsWith('/reels'))

  return (
    <View style={styles.container}>
      <ReelsScreen
        isScreenFocused={isScreenActive}
        onNavigateToStudy={(id, tab) => {
          setIsFocused(false)
          if (tab) {
            router.push({
              pathname: '/study/[id]',
              params: { id, tab },
            })
          } else {
            router.push(`/study/${id}`)
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
})
