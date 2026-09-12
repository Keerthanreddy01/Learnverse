'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ReelRecord } from '@/lib/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Film,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  FileEdit,
  Eye,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

export default function FacultyContentLibraryPage() {
  const { profile } = useAuth()
  const [reels, setReels] = useState<ReelRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadReels = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reels')
      const data = await res.json()
      if (data.success) {
        setReels(data.reels || [])
      }
    } catch (err) {
      console.error('Failed to load reels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReels()
  }, [])

  const handleToggleStatus = async (reel: ReelRecord) => {
    const nextStatus = reel.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Reel ${nextStatus === 'published' ? 'published' : 'unpublished'}`)
        loadReels()
      }
    } catch {
      toast.error('Failed to change status')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const res = await fetch(`/api/reels/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Reel deleted')
        loadReels()
      }
    } catch {
      toast.error('Failed to delete reel')
    }
  }

  // Filter logic
  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || r.subject === subjectFilter
    const matchesGrade = gradeFilter === 'all' || r.grade === gradeFilter

    return matchesSearch && matchesStatus && matchesSubject && matchesGrade
  })

  const uniqueSubjects = ['all', ...Array.from(new Set(reels.map((r) => r.subject)))]
  const uniqueGrades = ['all', ...Array.from(new Set(reels.map((r) => r.grade).filter(Boolean)))]

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/faculty/dashboard"
              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> CMS
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-xs text-purple-400 font-bold">Content Library</span>
          </div>
          <h1 className="text-2xl font-bold font-montserrat text-foreground tracking-tight mt-1">
            Reels Content Management
          </h1>
        </div>

        <Link href="/faculty/content/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold rounded-full px-5 py-5 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-md">
            <UploadCloud className="w-4 h-4" /> Upload New Reel
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border p-4 space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by title, topic, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-background border border-border text-foreground text-xs rounded-lg p-2 focus:outline-none capitalize"
            >
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'all' ? 'All Subjects' : sub}
                </option>
              ))}
            </select>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-background border border-border text-foreground text-xs rounded-lg p-2 focus:outline-none"
            >
              {uniqueGrades.map((g) => (
                <option key={g} value={g || 'all'}>
                  {g === 'all' ? 'All Grades' : g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Content List */}
      <div className="space-y-3">
        {filteredReels.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3 font-mono text-xs">
            <Film className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-montserrat font-bold text-foreground text-sm">No reels match your criteria</h3>
            <p className="text-muted-foreground">Adjust your filters or upload a new educational reel.</p>
            <Link href="/faculty/content/new">
              <Button size="sm" className="bg-purple-600 text-white font-mono text-xs mt-2">
                Upload Reel
              </Button>
            </Link>
          </div>
        ) : (
          filteredReels.map((reel, idx) => (
            <Card
              key={reel.id ? `${reel.id}-${idx}` : `reel-${idx}`}
              className="bg-card border-border hover:border-purple-500/40 transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 rounded-xl bg-black border border-border overflow-hidden shrink-0 relative flex items-center justify-center">
                    <video
                      src={reel.video_url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Film className="w-5 h-5 text-white/80" />
                    </div>
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 px-1 rounded text-white">
                      {reel.duration_seconds}s
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          reel.status === 'published'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {reel.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
                        {reel.grade || 'All Grades'}
                      </Badge>
                      <span className="font-semibold text-purple-400">{reel.subject}</span>
                    </div>

                    <h3 className="font-montserrat font-bold text-base text-foreground">
                      {reel.title}
                    </h3>
                    <p className="text-muted-foreground text-[11px] line-clamp-1">
                      Topic: <span className="text-foreground">{reel.topic}</span>
                      {reel.chapter ? ` • Chapter: ${reel.chapter}` : ''}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        {reel.question ? 'Diagnostic Q Active' : 'No Question'}
                      </span>
                      <span>•</span>
                      <span className="capitalize">Difficulty: {reel.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(reel)}
                      className={`font-mono text-xs h-8 ${
                        reel.status === 'published'
                          ? 'border-border text-muted-foreground hover:text-amber-400'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {reel.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>

                    <Link href={`/faculty/content/${reel.id}`}>
                      <Button size="sm" variant="outline" className="font-mono text-xs h-8 border-border hover:border-purple-500/40">
                        <FileEdit className="w-3.5 h-3.5 mr-1" /> Edit & Qs
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/student/reels">
                      <Button size="sm" variant="ghost" className="font-mono text-[11px] h-7 text-muted-foreground hover:text-cyan-400">
                        <Eye className="w-3 h-3 mr-1" /> Preview Live
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(reel.id, reel.title)}
                      className="font-mono text-[11px] h-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
