import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StudyProvider } from '../src/context/StudyContext'
import { AuthProvider } from '../src/context/AuthContext'
import { Colors } from '../src/constants/theme'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider><StudyProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="study/[id]" options={{ headerShown: false }} />
        </Stack>
      </StudyProvider></AuthProvider>
    </SafeAreaProvider>
  )
}
