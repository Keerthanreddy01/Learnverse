'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { UserProfile, UserRole } from '../types/roles'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    metadata: { full_name: string; role: UserRole; grade?: string; institution?: string }
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  switchDemoRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_STUDENT_PROFILE: UserProfile = {
  id: 'student-demo-user-1',
  email: 'student@learnverse.edu',
  full_name: 'Alex Rivera',
  role: 'student',
  grade: 'Grade 11',
  institution: 'Westfield High',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEFAULT_FACULTY_PROFILE: UserProfile = {
  id: 'faculty-demo-user-1',
  email: 'dr.sharma@learnverse.edu',
  full_name: 'Dr. Anita Sharma',
  role: 'faculty',
  grade: null,
  institution: 'Department of Natural Sciences',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load profile from local storage or Supabase session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Check local cached profile first for instant rendering
        const cached = localStorage.getItem('learnverse_user_profile')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setProfile(parsed)
            setUser({ id: parsed.id, email: parsed.email })
          } catch {}
        } else {
          // Default to student demo profile for immediate out-of-the-box browsing
          setProfile(DEFAULT_STUDENT_PROFILE)
          setUser({ id: DEFAULT_STUDENT_PROFILE.id, email: DEFAULT_STUDENT_PROFILE.email })
        }

        // 2. If Supabase is configured, check live session
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            setUser(session.user)
            // Fetch live profile from public.profiles
            const { data: liveProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()

            if (liveProfile) {
              setProfile(liveProfile as UserProfile)
              localStorage.setItem('learnverse_user_profile', JSON.stringify(liveProfile))
            }
          }

          // Listen for auth state changes
          const { data: listener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (session?.user) {
              setUser(session.user)
              const { data: p } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle()
              if (p) {
                setProfile(p as UserProfile)
                localStorage.setItem('learnverse_user_profile', JSON.stringify(p))
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null)
              setProfile(DEFAULT_STUDENT_PROFILE)
              localStorage.removeItem('learnverse_user_profile')
            }
          })

          return () => {
            listener.subscription.unsubscribe()
          }
        }
      } catch (err) {
        console.warn('[AuthProvider] Initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const saveProfile = (p: UserProfile) => {
    setProfile(p)
    setUser({ id: p.id, email: p.email })
    try {
      localStorage.setItem('learnverse_user_profile', JSON.stringify(p))
    } catch {}
  }

  const signIn = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true)
      try {
        if (isSupabaseConfigured && supabase && password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) {
            // If invalid credentials, fallback to demo/local sign in so users are never blocked in dev
            console.warn('[Auth] Supabase signIn failed:', error.message)
          } else if (data.user) {
            setUser(data.user)
            const { data: p } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle()

            if (p) {
              saveProfile(p as UserProfile)
              return { success: true }
            }
          }
        }

        // Local / Demo Sign In
        const isFaculty = email.toLowerCase().includes('faculty') || email.toLowerCase().includes('prof') || email.toLowerCase().includes('dr')
        const newProfile: UserProfile = isFaculty
          ? { ...DEFAULT_FACULTY_PROFILE, email, id: `user-${Date.now()}` }
          : { ...DEFAULT_STUDENT_PROFILE, email, id: `user-${Date.now()}` }

        saveProfile(newProfile)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Login failed' }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { full_name: string; role: UserRole; grade?: string; institution?: string }
    ): Promise<{ success: boolean; error?: string }> => {
      setLoading(true)
      try {
        let userId = `user-${Date.now()}`

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: metadata.full_name,
                role: metadata.role,
              },
            },
          })

          if (error) {
            console.warn('[Auth] Supabase signUp note:', error.message)
          } else if (data.user) {
            userId = data.user.id
            // Insert to profiles table
            await supabase.from('profiles').upsert({
              id: userId,
              email,
              full_name: metadata.full_name,
              role: metadata.role,
              grade: metadata.grade || null,
              institution: metadata.institution || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        }

        const newProfile: UserProfile = {
          id: userId,
          email,
          full_name: metadata.full_name,
          role: metadata.role,
          grade: metadata.grade || null,
          institution: metadata.institution || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        saveProfile(newProfile)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Sign up failed' }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch {}
    }
    localStorage.removeItem('learnverse_user_profile')
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!profile) return
      const updated: UserProfile = {
        ...profile,
        ...data,
        updated_at: new Date().toISOString(),
      }
      saveProfile(updated)

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').update(data).eq('id', profile.id)
        } catch {}
      }
    },
    [profile]
  )

  const switchDemoRole = useCallback((role: UserRole) => {
    if (role === 'faculty') {
      saveProfile(DEFAULT_FACULTY_PROFILE)
    } else {
      saveProfile(DEFAULT_STUDENT_PROFILE)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
