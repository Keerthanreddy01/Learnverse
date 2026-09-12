'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { UserRole } from '@/lib/types/roles'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowRight, UserCheck, RefreshCw } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackTitle?: string
  fallbackMessage?: string
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackTitle = 'Restricted Access',
  fallbackMessage,
}: RoleGuardProps) {
  const { profile, loading, switchDemoRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3 bg-[#f7f6f1] text-[#17213f]">
        <RefreshCw className="w-6 h-6 text-[#4938d4] animate-spin" />
        <p className="font-mono text-xs font-bold text-[#59627c]">Verifying authorizations…</p>
      </div>
    )
  }

  const userRole = profile?.role || 'student'
  const isAuthorized = allowedRoles.includes(userRole)

  if (!isAuthorized) {
    const isFacultyRequired = allowedRoles.includes('faculty')
    const targetDashboard = userRole === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 md:p-6 bg-[#f7f6f1]">
        <div className="max-w-md w-full rounded-[2.2rem] border-2 border-[#17213f] bg-white shadow-[8px_8px_0_#17213f] p-8 text-center space-y-6 text-[#17213f]">
          <div className="w-14 h-14 rounded-2xl bg-[#fff4bd] border-2 border-[#17213f] shadow-[3px_3px_0_#17213f] flex items-center justify-center mx-auto text-[#17213f]">
            <ShieldAlert className="w-7 h-7 text-[#4938d4]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black font-montserrat text-[#17213f]">
              {fallbackTitle}
            </h2>
            <p className="text-xs font-bold text-[#59627c] leading-relaxed">
              {fallbackMessage ||
                (isFacultyRequired
                  ? 'This section is reserved for verified Faculty members to author and publish curriculum reels.'
                  : 'This section is designed for enrolled Students.')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fff4bd] border-2 border-[#17213f] shadow-[2px_2px_0_#17213f] text-xs font-bold flex items-center justify-between">
            <span className="text-[#59627c]">Current Active Role:</span>
            <span className="capitalize font-black px-2.5 py-0.5 rounded-full bg-white border-2 border-[#17213f] text-[#17213f]">
              {userRole}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link href={targetDashboard}>
              <Button className="w-full rounded-full border-2 border-[#17213f] bg-[#4938d4] hover:bg-[#3727bd] text-white text-xs font-black py-5 shadow-[4px_4px_0_#17213f] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                Go to Your {userRole === 'faculty' ? 'Faculty' : 'Student'} Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            {/* In dev/demo mode: allow instant one-click switch */}
            <Button
              variant="outline"
              onClick={() => switchDemoRole(isFacultyRequired ? 'faculty' : 'student')}
              className="w-full rounded-full border-2 border-[#17213f] bg-[#c9ff4d] hover:bg-[#d7ff78] text-[#17213f] text-xs font-black py-5 shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#17213f]" />
              Switch to {isFacultyRequired ? 'Faculty' : 'Student'} Mode
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
