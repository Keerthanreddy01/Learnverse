'use client'

import React from 'react'
import Header from '@/components/header'
import RoleGuard from '@/components/auth/role-guard'
import Link from 'next/link'

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={['faculty']}
      fallbackTitle="Faculty Portal Protected"
      fallbackMessage="You are currently signed in with a Student role. Access to the Faculty CMS and Reel Publishing dashboard requires verified Faculty credentials."
    >
      <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col justify-between font-sans antialiased">
        <Header />
        <main className="flex-1 pt-24 pb-16">{children}</main>
        <footer className="border-t border-slate-200 bg-white px-5 py-6 md:px-8 text-slate-600">
          <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                LEARNVERSE ACADEMIC PORTAL
              </div>
              <p className="text-xs text-slate-500">Curriculum Publishing & Diagnostic Assessment Engine</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-600">
              <Link href="/faculty/dashboard" className="hover:text-indigo-600 transition-colors">CMS Dashboard</Link>
              <Link href="/faculty/content" className="hover:text-indigo-600 transition-colors">Content Library</Link>
              <Link href="/faculty/content/new" className="hover:text-indigo-600 transition-colors">Upload Reel</Link>
              <Link href="/faculty/questions" className="hover:text-indigo-600 transition-colors">Question Bank</Link>
            </div>
            <span className="text-xs text-slate-400">© 2026 LearnVerse Education Technologies</span>
          </div>
        </footer>
      </div>
    </RoleGuard>
  )
}
