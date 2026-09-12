'use client'

import { useStudy } from '@/lib/context/study-context'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, BookOpen, Layers, Award, Target, TrendingUp } from 'lucide-react'

export default function StatsOverview() {
  const { materials, streakDays } = useStudy()

  const totalMaterials = materials.length
  const totalCards = materials.reduce((acc, m) => acc + m.flashcards.length, 0)
  const masteredCards = materials.reduce(
    (acc, m) => acc + m.flashcards.filter((c) => c.confidence === 'mastered' || c.confidence === 'easy').length,
    0
  )
  const averageMastery = Math.round(
    materials.reduce((acc, m) => acc + m.knowledgeGap.overallMastery, 0) / (totalMaterials || 1)
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Daily Streak Card */}
      <div className="rounded-2xl border-2 border-[#17213f] bg-white p-4 shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-[#59627c] tracking-wider">Study Streak</span>
          <div className="w-8 h-8 rounded-full bg-[#fff4bd] border-2 border-[#17213f] shadow-[1px_1px_0_#17213f] flex items-center justify-center text-[#17213f]">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black font-montserrat text-[#17213f]">{streakDays}</span>
          <span className="text-xs font-black text-amber-600">Days</span>
        </div>
        <p className="mt-1 text-[11px] font-bold text-[#59627c]">Keep daily habit active</p>
      </div>

      {/* Materials Count */}
      <div className="rounded-2xl border-2 border-[#17213f] bg-white p-4 shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-[#59627c] tracking-wider">Decks Active</span>
          <div className="w-8 h-8 rounded-full bg-[#c9ff4d] border-2 border-[#17213f] shadow-[1px_1px_0_#17213f] flex items-center justify-center text-[#17213f]">
            <BookOpen className="w-4 h-4 text-[#17213f]" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black font-montserrat text-[#17213f]">{totalMaterials}</span>
          <span className="text-xs font-black text-emerald-600">Courses</span>
        </div>
        <p className="mt-1 text-[11px] font-bold text-[#59627c]">Synthesized micro-modules</p>
      </div>

      {/* Flashcards Mastered */}
      <div className="rounded-2xl border-2 border-[#17213f] bg-white p-4 shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-[#59627c] tracking-wider">Recall Mastered</span>
          <div className="w-8 h-8 rounded-full bg-[#9be8ff] border-2 border-[#17213f] shadow-[1px_1px_0_#17213f] flex items-center justify-center text-[#17213f]">
            <Layers className="w-4 h-4 text-[#17213f]" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black font-montserrat text-[#17213f]">{masteredCards}</span>
          <span className="text-xs font-bold text-[#59627c]">/ {totalCards} Cards</span>
        </div>
        <p className="mt-1 text-[11px] font-black text-[#4938d4]">
          {totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}% retention rate
        </p>
      </div>

      {/* Average Mastery Score */}
      <div className="rounded-2xl border-2 border-[#17213f] bg-white p-4 shadow-[3px_3px_0_#17213f] hover:-translate-y-0.5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-[#59627c] tracking-wider">Knowledge Index</span>
          <div className="w-8 h-8 rounded-full bg-[#ffb7dc] border-2 border-[#17213f] shadow-[1px_1px_0_#17213f] flex items-center justify-center text-[#17213f]">
            <TrendingUp className="w-4 h-4 text-[#17213f]" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black font-montserrat text-[#17213f]">{averageMastery}%</span>
          <span className="text-xs font-black text-rose-500">Avg</span>
        </div>
        <p className="mt-1 text-[11px] font-bold text-[#59627c]">Adaptive gap confidence</p>
      </div>
    </div>
  )
}
