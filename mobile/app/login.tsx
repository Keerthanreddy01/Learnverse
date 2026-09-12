import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, GraduationCap, ArrowRight, LockKeyhole, Mail, Sparkles, Users } from 'lucide-react-native'
import { Colors } from '../src/constants/theme'
import { useAuth } from '../src/context/AuthContext'

type Mode = 'student' | 'faculty'

export default function LoginScreen() {
  const router = useRouter()
  const { quickLogin, facultyLogin } = useAuth()
  const [mode, setMode] = useState<Mode>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const goStudent = () => {
    quickLogin()
    router.replace('/(tabs)')
  }
  const goFaculty = () => {
    facultyLogin(name || email.split('@')[0])
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#6C63FF', '#978BFF']} style={styles.hero}>
            <View style={styles.glowOne} /><View style={styles.glowTwo} />
            <View style={styles.brandRow}><View style={styles.brandIcon}><BookOpen size={22} color="#5C54E8" /></View><Text style={styles.brand}>LearnVerse</Text></View>
            <View style={styles.heroCopy}>
              <View style={styles.heroBadge}><Sparkles size={14} color="#FFF3C4" /><Text style={styles.heroBadgeText}>LEARN • GROW • SHINE</Text></View>
              <Text style={styles.heroTitle}>Your next big idea{`\n`}starts here.</Text>
              <Text style={styles.heroText}>A friendly space for curious minds and inspiring teachers.</Text>
            </View>
            <View style={styles.heroIllustration}><GraduationCap size={64} color="#FFFFFF" strokeWidth={1.6} /><View style={styles.star}><Sparkles size={16} color="#F6C95B" /></View></View>
          </LinearGradient>

          <View style={styles.sheet}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Choose how you would like to continue.</Text>
            <View style={styles.switcher}>
              <TouchableOpacity onPress={() => setMode('student')} style={[styles.switchOption, mode === 'student' && styles.switchActive]}>
                <Users size={17} color={mode === 'student' ? Colors.primary : Colors.textMuted} /><Text style={[styles.switchText, mode === 'student' && styles.switchTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('faculty')} style={[styles.switchOption, mode === 'faculty' && styles.switchActive]}>
                <GraduationCap size={17} color={mode === 'faculty' ? Colors.primary : Colors.textMuted} /><Text style={[styles.switchText, mode === 'faculty' && styles.switchTextActive]}>Faculty</Text>
              </TouchableOpacity>
            </View>

            {mode === 'student' ? <View style={styles.studentPanel}>
              <View style={styles.gradeBadge}><Text style={styles.gradeBadgeText}>GRADE 7</Text></View>
              <Text style={styles.panelTitle}>Ready for today’s adventure?</Text>
              <Text style={styles.panelText}>Jump into your lessons, keep your streak going, and unlock new achievements.</Text>
              <TouchableOpacity style={styles.quickButton} onPress={goStudent} activeOpacity={0.88} accessibilityRole="button">
                <View style={styles.quickIcon}><Sparkles size={19} color="#5C54E8" /></View><Text style={styles.quickButtonText}>Quick Login</Text><ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.hint}>No password needed for the demo student account.</Text>
            </View> : <View style={styles.studentPanel}>
              <Text style={styles.panelTitle}>Faculty sign in</Text><Text style={styles.panelText}>Access your learning workspace and student tools.</Text>
              <View style={styles.input}><Users size={18} color={Colors.textMuted} /><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.textMuted} style={styles.inputText} /></View>
              <View style={styles.input}><Mail size={18} color={Colors.textMuted} /><TextInput value={email} onChangeText={setEmail} placeholder="School email" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" style={styles.inputText} /></View>
              <View style={styles.input}><LockKeyhole size={18} color={Colors.textMuted} /><TextInput placeholder="Password" placeholderTextColor={Colors.textMuted} secureTextEntry style={styles.inputText} /></View>
              <TouchableOpacity style={styles.quickButton} onPress={goFaculty} activeOpacity={0.88}><Text style={styles.quickButtonText}>Sign in as faculty</Text><ArrowRight size={20} color="#FFFFFF" /></TouchableOpacity>
            </View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: '#F6F5FF' }, content: { flexGrow: 1 },
  hero: { minHeight: 330, padding: 24, overflow: 'hidden' }, glowOne: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.12)', right: -80, top: -85 }, glowTwo: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.1)', left: -45, bottom: -30 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, brand: { fontSize: 20, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.4 }, heroCopy: { marginTop: 36, maxWidth: '77%' }, heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }, heroBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF3C4', letterSpacing: 1 }, heroTitle: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -1, color: '#FFFFFF' }, heroText: { marginTop: 10, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.84)' }, heroIllustration: { position: 'absolute', right: 27, bottom: 22, width: 100, height: 100, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }, star: { position: 'absolute', right: -8, top: -8, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 8 },
  sheet: { flex: 1, backgroundColor: '#F6F5FF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -22, padding: 24, paddingBottom: 34 }, title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.7 }, subtitle: { marginTop: 5, fontSize: 14, color: Colors.textMuted }, switcher: { flexDirection: 'row', backgroundColor: '#ECEBFA', borderRadius: 16, padding: 4, marginTop: 23 }, switchOption: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 11, borderRadius: 12 }, switchActive: { backgroundColor: '#FFFFFF', shadowColor: '#39346A', shadowOpacity: 0.09, shadowRadius: 8, elevation: 2 }, switchText: { color: Colors.textMuted, fontWeight: '700', fontSize: 14 }, switchTextActive: { color: Colors.text }, studentPanel: { marginTop: 22 }, gradeBadge: { alignSelf: 'flex-start', backgroundColor: '#E6E4FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 10 }, gradeBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }, panelTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 }, panelText: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 18 }, quickButton: { minHeight: 56, borderRadius: 18, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: Colors.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 3 }, quickIcon: { width: 30, height: 30, backgroundColor: '#FFFFFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, quickButtonText: { flex: 1, marginLeft: 11, color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, hint: { marginTop: 12, textAlign: 'center', color: Colors.textMuted, fontSize: 12 }, input: { height: 52, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E4F3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 10 }, inputText: { flex: 1, color: Colors.text, fontSize: 14 },
})
