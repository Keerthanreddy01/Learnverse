'use client'

import React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  LayoutDashboard,
  UploadCloud,
  BrainCircuit,
  Film,
  School,
  LogOut,
  User,
  GraduationCap,
  ChevronDown,
} from "lucide-react"
import MaterialUploadModal from "@/components/upload/material-upload-modal"

export default function Header() {
  const { profile, signOut, switchDemoRole } = useAuth()
  const role = profile?.role || 'student'
  const isFaculty = role === 'faculty'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f6f1]/95 backdrop-blur-md border-b-2 border-[#17213f] text-[#17213f]">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Brand matching landing page */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="LearnVerse Home">
          <div className="w-9 h-9 rounded-full bg-[#c9ff4d] border-2 border-[#17213f] shadow-[2px_2px_0_#17213f] flex items-center justify-center text-[#17213f] transition-all group-hover:scale-105">
            <BrainCircuit className="w-5 h-5 text-[#17213f]" />
          </div>
          <div className="flex flex-col">
            <span className="font-montserrat font-black text-lg text-[#17213f] tracking-tight flex items-center gap-1.5">
              LEARNVERSE <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full bg-[#4938d4] text-white border border-[#17213f]">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-black text-[#17213f]">
          <Link href="/" className="hover:text-[#4938d4] transition-colors">
            Overview
          </Link>

          {isFaculty ? (
            <>
              <Link href="/faculty/dashboard" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5 text-[#4938d4]">
                <School className="w-3.5 h-3.5" /> Faculty CMS
              </Link>
              <Link href="/faculty/content" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" /> Content Library
              </Link>
              <Link href="/faculty/questions" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5">
                Questions
              </Link>
            </>
          ) : (
            <>
              <Link href="/student/dashboard" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" /> Study Deck
              </Link>
              <Link href="/student/reels" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5 text-[#4938d4]">
                <Film className="w-3.5 h-3.5" /> Reels Feed
              </Link>
              <Link href="/student/progress" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5">
                Progress
              </Link>
            </>
          )}

          <Link href="/study/bio-101" className="hover:text-[#4938d4] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4938d4]" /> Sample Study
          </Link>
        </nav>

        {/* Actions & Role Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher Pill */}
          <button
            type="button"
            onClick={() => switchDemoRole(isFaculty ? 'student' : 'faculty')}
            title={`Click to switch role to ${isFaculty ? 'Student' : 'Faculty'}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer hover:opacity-95 ${
              isFaculty
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'bg-emerald-500 text-white border border-emerald-600'
            }`}
          >
            {isFaculty ? <School className="w-3.5 h-3.5 text-indigo-300" /> : <GraduationCap className="w-3.5 h-3.5 text-emerald-100" />}
            <span className="capitalize">{role}</span>
            <span className="text-[10px] opacity-70 font-sans font-normal">(switch)</span>
          </button>

          {isFaculty ? (
            <Link href="/faculty/content/new">
              <Button
                size="sm"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload Reel
              </Button>
            </Link>
          ) : (
            <MaterialUploadModal>
              <Button
                size="sm"
                className="rounded-lg border-2 border-[#17213f] bg-[#c9ff4d] hover:bg-[#d7ff78] text-[#17213f] px-3.5 py-1 text-xs font-black shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload Lesson
              </Button>
            </MaterialUploadModal>
          )}

          {/* User info / Login */}
          <Link href="/login" title="Account settings">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700"
            >
              <User className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
