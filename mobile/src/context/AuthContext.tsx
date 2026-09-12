import React, { createContext, useContext, useState } from 'react'

export type AccountRole = 'student' | 'faculty'

export interface AppUser {
  name: string
  role: AccountRole
  grade?: string
}

interface AuthContextValue {
  user: AppUser | null
  quickLogin: () => void
  facultyLogin: (name?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)

  const quickLogin = () => setUser({ name: 'Student', role: 'student', grade: 'Grade 7' })
  const facultyLogin = (name?: string) => setUser({ name: name?.trim() || 'Faculty', role: 'faculty' })
  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, quickLogin, facultyLogin, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
