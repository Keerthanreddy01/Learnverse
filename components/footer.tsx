'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Sparkles, ArrowRight, BookOpen, Layers, HelpCircle, Video } from "lucide-react"
import MaterialUploadModal from "@/components/upload/material-upload-modal"

export default function Footer() {
  return (
    <footer className="w-full px-6 relative py-0 mt-24 h-auto mb-0 bg-card border-t border-border">
      {/* Decorative elements */}
      <div className="absolute top-8 right-6 text-primary/40 text-2xl font-mono">+</div>
      <div className="absolute top-1/2 right-12 text-primary/30 text-lg transform -translate-y-1/2">✦</div>
      <div className="absolute bottom-12 right-20 text-primary/40 text-xl font-mono">+</div>
      <div className="absolute top-16 right-32 text-primary/30 text-sm">✦</div>
      <div className="absolute bottom-8 right-8 text-primary/30 text-lg">✦</div>

      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between py-16 gap-10">
          {/* Left content */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" /> High-Yield Adaptive Study
            </div>
            <h2
              className="text-foreground text-3xl md:text-5xl mb-6 leading-tight font-bold text-center md:text-left"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Learn Smarter, Not Longer.
            </h2>

            <div className="space-y-3 text-muted-foreground font-mono text-xs md:text-sm">
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">•</span>
                <p>Convert heavy lecture PDFs, textbooks, and notes into structured microlearning modules.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">•</span>
                <p>Continuous adaptive tracking isolates knowledge gaps and generates targeted practice.</p>
              </div>
            </div>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-col gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-montserrat font-bold text-sm text-foreground">Summary Notes</span>
              <span className="font-mono text-[11px] text-muted-foreground">High-yield key takeaways & terms</span>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-col gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-montserrat font-bold text-sm text-foreground">3D Flashcards</span>
              <span className="font-mono text-[11px] text-muted-foreground">Active recall spaced repetition</span>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-col gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-montserrat font-bold text-sm text-foreground">Adaptive Quizzes</span>
              <span className="font-mono text-[11px] text-muted-foreground">Instant answer explanations</span>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-col gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                <Video className="w-4 h-4" />
              </div>
              <span className="font-montserrat font-bold text-sm text-foreground">Micro-Reels</span>
              <span className="font-mono text-[11px] text-muted-foreground">8-second visual concept clips</span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="w-full px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h3 className="text-foreground font-montserrat text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" /> Ready to transform your study routine?
            </h3>
            <p className="text-muted-foreground font-mono text-xs">
              Upload any course material and start exploring your adaptive microlearning deck in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="font-mono text-xs border-border">
                Open Dashboard
              </Button>
            </Link>
            <MaterialUploadModal>
              <Button className="bg-primary text-primary-foreground px-6 py-5 rounded-full font-semibold font-mono text-xs hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all duration-300 flex items-center gap-2 cursor-pointer">
                Upload Material <ArrowRight className="w-4 h-4" />
              </Button>
            </MaterialUploadModal>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full px-6 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-xs font-mono">
          <p>© 2026 LearnVerse AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/study/bio-101" className="hover:text-primary transition-colors">Sample Study</Link>
            <span>Adaptive Engine v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
