'use client'

import Link from 'next/link'
import { useStudy } from '@/lib/context/study-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, ArrowRight, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react'

export default function KnowledgeGapWidget() {
  const { materials } = useStudy()

  // Collect critical gaps across all materials
  const criticalGaps: { materialId: string; materialTitle: string; topicName: string; mastery: number; action: string }[] = []

  materials.forEach((mat) => {
    mat.knowledgeGap.topics.forEach((top) => {
      if (top.status === 'critical-gap' || top.masteryPercentage < 60) {
        criticalGaps.push({
          materialId: mat.id,
          materialTitle: mat.title,
          topicName: top.name,
          mastery: top.masteryPercentage,
          action: top.recommendedAction,
        })
      }
    })
  })

  return (
    <div className="rounded-[2rem] border-2 border-[#17213f] bg-white p-6 shadow-[5px_5px_0_#17213f] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-[#ffe2e5] border-2 border-[#17213f] text-rose-500 shadow-[1px_1px_0_#17213f]">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="font-montserrat font-black text-sm text-[#17213f]">
            Knowledge Gaps Identified
          </h4>
        </div>
        <span className="px-2.5 py-0.5 rounded-full border-2 border-[#17213f] bg-[#ffb7dc] text-[10px] font-black text-[#17213f] shadow-[1px_1px_0_#17213f]">
          {criticalGaps.length} Priority Topics
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-[#59627c]">
          Adaptive algorithms detected concept misconceptions requiring targeted review:
        </p>

        {criticalGaps.length === 0 ? (
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#17213f] bg-[#f7f6f1] text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-[#4938d4] mx-auto" />
            <p className="font-montserrat text-xs text-[#17213f] font-black">No Critical Gaps Found!</p>
            <p className="text-[11px] font-bold text-[#59627c]">All concepts currently exceed 60% mastery threshold.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {criticalGaps.slice(0, 3).map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#f7f6f1] border-2 border-[#17213f] shadow-[2px_2px_0_#17213f] hover:bg-[#fff4bd]/40 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-montserrat text-xs font-black text-[#17213f]">{gap.topicName}</h5>
                    <p className="text-[10px] font-bold text-[#59627c] truncate max-w-[200px]">
                      {gap.materialTitle}
                    </p>
                  </div>
                  <span className="text-xs font-black text-rose-500">{gap.mastery}%</span>
                </div>

                <div className="h-2 rounded-full border-2 border-[#17213f] bg-white overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${gap.mastery}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-[#59627c] italic truncate max-w-[180px]">
                    {gap.action}
                  </span>
                  <Link href={`/study/${gap.materialId}`}>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-black text-[#4938d4] hover:text-[#3727bd] hover:bg-white rounded-full">
                      Revise <ArrowRight className="w-2.5 h-2.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
