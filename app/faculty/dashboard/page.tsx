'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ReelRecord, FacultyStats } from '@/lib/types/roles'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Film,
  UploadCloud,
  CheckCircle2,
  Clock,
  Eye,
  HelpCircle,
  PlusCircle,
  School,
  ArrowRight,
  TrendingUp,
  FileEdit,
  Sparkles,
} from 'lucide-react'

export default function FacultyDashboardPage() {
  const { profile } = useAuth()
  const [reels, setReels] = useState<ReelRecord[]>([])
  const [stats, setStats] = useState<FacultyStats>({
    totalReels: 0,
    publishedReels: 0,
    draftReels: 0,
    totalViews: 0,
    avgQuestionAccuracy: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [reelsRes, statsRes] = await Promise.all([
        fetch('/api/reels'),
        fetch(`/api/faculty/stats?faculty_id=${profile?.id || 'faculty-demo-id'}`),
      ])

      const reelsData = await reelsRes.json()
      const statsData = await statsRes.json()

      if (reelsData.success) {
        setReels(reelsData.reels || [])
      }
      if (statsData.success) {
        setStats(statsData.stats)
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [profile])

  const handleTogglePublish = async (reel: ReelRecord) => {
    const nextStatus = reel.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Reel ${nextStatus === 'published' ? 'published to students!' : 'moved to drafts'}`)
        loadData()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 space-y-8 text-slate-900 font-sans">
      {/* Top Professional Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 via-purple-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <School className="w-3.5 h-3.5 text-indigo-600" /> Faculty Management Studio
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">Curriculum Publishing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {profile?.full_name || 'Dr. Anita Sharma'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              Author curriculum micro-reels, attach interactive diagnostic questions, and distribute targeted learning units to students across grade levels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/faculty/content/new">
              <Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer">
                <UploadCloud className="w-4 h-4" /> Upload Reel
              </Button>
            </Link>
            <Link href="/student/reels">
              <Button variant="outline" className="rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer">
                <Eye className="w-4 h-4 text-slate-500" /> Student Feed
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Uploaded</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{stats.totalReels}</span>
            <span className="text-[11px] font-medium text-slate-400">Total videos</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Published Live</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{stats.publishedReels}</span>
            <span className="text-[11px] font-medium text-emerald-600">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Draft</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{stats.draftReels}</span>
            <span className="text-[11px] font-medium text-amber-600">Pending</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Student Views</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{stats.totalViews}</span>
            <span className="text-[11px] font-medium text-blue-600">Impressions</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg Accuracy</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{stats.avgQuestionAccuracy}%</span>
            <span className="text-[11px] font-medium text-indigo-600">Quiz pass</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Content Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-base text-slate-900">Recent Curriculum Reels</h2>
            </div>
            <Link href="/faculty/content" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All ({reels.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {reels.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 bg-white space-y-3">
                <Film className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-sm text-slate-900">No reels uploaded yet</p>
                <p className="text-xs text-slate-500">Upload your first MP4 micro-reel to start distributing curriculum units.</p>
                <Link href="/faculty/content/new">
                  <Button size="sm" className="rounded-lg bg-indigo-600 text-white font-medium text-xs mt-2 shadow-sm">
                    Upload Reel
                  </Button>
                </Link>
              </div>
            ) : (
              reels.slice(0, 5).map((reel, idx) => (
                <div
                  key={reel.id ? `${reel.id}-${idx}` : `faculty-reel-${idx}`}
                  className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-4 space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                            reel.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          {reel.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700">
                          {reel.grade || 'All Grades'}
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded-md">
                          {reel.subject}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-slate-900">
                        {reel.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Topic: {reel.topic} {reel.chapter ? `• ${reel.chapter}` : ''}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePublish(reel)}
                        className={`rounded-lg font-medium text-xs border transition-colors ${
                          reel.status === 'published'
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {reel.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>

                      <Link href={`/faculty/content/${reel.id}`}>
                        <Button size="sm" variant="ghost" className="rounded-lg border border-slate-200 font-medium text-xs text-slate-700 hover:bg-slate-50">
                          <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-500" /> Edit & Qs
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Reel Bottom Meta */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" /> {reel.duration_seconds}s
                      <span className="mx-1 text-slate-300">•</span>
                      <HelpCircle className="w-3 h-3 text-indigo-500" />
                      {reel.question ? '1 Question Attached' : 'No Question Attached'}
                    </span>

                    <span className="capitalize">
                      Difficulty: <strong className="text-slate-700 font-medium">{reel.difficulty}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Professional Authoring Tip Card */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-sm text-slate-900">Curriculum Best Practices</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload bite-sized MP4 reels (15 to 45 seconds). When you assign a <strong>Grade</strong> and <strong>Subject</strong>, the reel is immediately made discoverable to students matching that level.
            </p>
            <Link href="/faculty/content/new" className="block pt-1">
              <Button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <PlusCircle className="w-3.5 h-3.5" /> Create New Reel
              </Button>
            </Link>
          </div>

          {/* Diagnostic Question Bank Teaser */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h4 className="font-semibold text-sm text-slate-900">Diagnostic Question Bank</h4>
              </div>
              <Link href="/faculty/questions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Manage
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each reel prompts students with a quick multiple-choice or true/false check. Instant explanations help close conceptual gaps immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
