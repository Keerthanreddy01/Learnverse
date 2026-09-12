'use client'

import Link from 'next/link'
import MaterialUploadModal from '@/components/upload/material-upload-modal'
import { useStudy } from '@/lib/context/study-context'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, BookOpen, BrainCircuit, ChevronDown, Flame, Gamepad2, Layers, Play, Sparkles, Star, UploadCloud } from 'lucide-react'

const modes = [
  { label: 'Story notes', icon: BookOpen, color: 'mint' },
  { label: 'Flip cards', icon: Layers, color: 'sky' },
  { label: 'Quick quizzes', icon: Gamepad2, color: 'lemon' },
]

const faqs = ['Can I learn from my school PDF?', 'What programs can the children work in?', 'How does my learning buddy help me?']

export default function Home() {
  const { materials } = useStudy()

  return (
    <main className="learn-home min-h-screen overflow-hidden text-[#17213f]">
      <nav className="learn-nav mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="LearnVerse home">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#17213f] bg-[#c9ff4d] shadow-[3px_3px_0_#17213f]"><BrainCircuit className="h-5 w-5" /></span>
          <span className="font-montserrat text-lg font-black tracking-tight">LEARNVERSE</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-bold md:flex"><Link href="/dashboard">Courses</Link><Link href="#how-it-works">How it works</Link><Link href="#questions">Questions</Link></div>
        <div className="flex items-center gap-3"><Link href="/login" className="hidden text-sm font-bold sm:block">Log in</Link><Link href="/dashboard"><Button className="rounded-full border-2 border-[#17213f] bg-[#4938d4] px-4 font-bold text-white shadow-[3px_3px_0_#17213f] hover:bg-[#3727bd]">Start learning <ArrowUpRight className="ml-1 h-4 w-4" /></Button></Link></div>
      </nav>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-12 md:px-8 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#17213f] bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#17213f]"><Sparkles className="h-3.5 w-3.5 text-[#4938d4]" /> Learn, play, remember</div>
            <h1 className="font-montserrat text-[clamp(3.4rem,8vw,7.8rem)] font-black leading-[0.88] tracking-[-0.07em]">Big ideas.<br /><span className="relative inline-block text-[#4938d4]">Tiny steps.<span className="absolute -bottom-2 left-1 right-0 h-3 -rotate-2 rounded-full bg-[#c9ff4d]" /></span></h1>
            <p className="mt-7 max-w-lg text-base font-medium leading-7 text-[#48516b] md:text-lg">LearnVerse turns notes, lessons, and curious questions into fun little learning quests you can actually finish.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><MaterialUploadModal><Button className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] px-6 py-6 text-sm font-black text-[#17213f] shadow-[4px_4px_0_#17213f] transition-transform hover:-translate-y-1 hover:bg-[#d7ff78]"><UploadCloud className="mr-2 h-4 w-4" /> Upload a lesson</Button></MaterialUploadModal><Link href="/study/bio-101"><Button variant="outline" className="rounded-full border-2 border-[#17213f] bg-white px-6 py-6 text-sm font-black shadow-[3px_3px_0_#17213f] hover:bg-[#fff4bd]"><Play className="mr-2 h-4 w-4 fill-current" /> Try a sample</Button></Link></div>
            <div className="mt-8 flex items-center gap-3 text-xs font-bold text-[#59627c]"><span className="flex -space-x-2"><span className="h-8 w-8 rounded-full border-2 border-white bg-[#ffb7dc]" /><span className="h-8 w-8 rounded-full border-2 border-white bg-[#9be8ff]" /><span className="h-8 w-8 rounded-full border-2 border-white bg-[#c9ff4d]" /></span>Made for curious minds, ages 8 to 18</div>
          </div>
          <div className="relative min-h-[430px] md:min-h-[500px]"><div className="absolute inset-x-5 top-8 bottom-0 rotate-2 rounded-[2.5rem] border-2 border-[#17213f] bg-[#ffb7dc] shadow-[8px_8px_0_#17213f]" /><div className="absolute inset-x-0 top-0 bottom-5 -rotate-3 rounded-[2.5rem] border-2 border-[#17213f] bg-[#4938d4] shadow-[8px_8px_0_#17213f]" /><div className="absolute inset-x-6 top-7 bottom-0 overflow-hidden rounded-[2.2rem] border-2 border-[#17213f] bg-[#c9ff4d]"><div className="absolute left-6 top-6 rounded-full border-2 border-[#17213f] bg-white px-3 py-1 text-xs font-black shadow-[2px_2px_0_#17213f]">TODAY&apos;S QUEST</div><div className="absolute right-6 top-6 flex items-center gap-1 rounded-full border-2 border-[#17213f] bg-[#ffb7dc] px-3 py-1 text-xs font-black shadow-[2px_2px_0_#17213f]"><Flame className="h-3.5 w-3.5" /> 5 day streak</div><img src="/jack-front.png" alt="LearnVerse learning buddy" className="absolute bottom-[-8px] left-1/2 w-[88%] max-w-[450px] -translate-x-1/2" /><div className="absolute bottom-8 left-6 right-6 rounded-2xl border-2 border-[#17213f] bg-white p-4 shadow-[4px_4px_0_#17213f]"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider"><span>Plant power</span><span className="text-[#4938d4]">2 min left</span></div><div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-[#17213f] bg-[#e5e7ef]"><div className="h-full w-[72%] bg-[#4938d4]" /></div></div></div></div>
        </div>
      </section>

      <section className="border-y-2 border-[#17213f] bg-[#fff4bd]"><div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-3 px-5 py-5 md:justify-between md:px-8"><span className="text-xs font-black uppercase tracking-[0.18em]">Your learning playground</span><div className="flex flex-wrap justify-center gap-2">{modes.map(({ label, icon: Icon, color }) => <span key={label} className={`learn-pill ${color}`}><Icon className="h-4 w-4" /> {label}</span>)}</div></div></section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-5 py-20 md:px-8"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><span className="learn-eyebrow">HOW IT WORKS</span><h2 className="mt-4 font-montserrat text-4xl font-black leading-tight md:text-5xl">Turn “ugh” into “oh!”</h2><p className="mt-4 max-w-sm leading-7 text-[#59627c]">One friendly space for schoolwork, side quests, and the moments when a tricky idea finally clicks.</p><Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 font-black text-[#4938d4] hover:underline">See your dashboard <ArrowUpRight className="h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-3">{[['01', 'Bring your thing', 'Upload a PDF, notes, or lesson link.', 'mint'], ['02', 'Pick your path', 'Read, flip, quiz, or watch a quick reel.', 'sky'], ['03', 'Level up', 'See what you know and what to try next.', 'lemon']].map(([num, title, copy, color]) => <div key={num} className={`learn-step ${color}`}><span className="learn-number">{num}</span><h3 className="mt-14 font-montserrat text-xl font-black">{title}</h3><p className="mt-3 text-sm font-medium leading-6 text-[#48516b]">{copy}</p><ArrowUpRight className="mt-8 h-5 w-5" /></div>)}</div></div></section>

      <section className="bg-[#17213f] px-5 py-20 text-white md:px-8"><div className="mx-auto max-w-[1180px]"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="learn-eyebrow light">PICK A QUEST</span><h2 className="mt-4 font-montserrat text-4xl font-black md:text-5xl">What are you curious about?</h2></div><span className="max-w-xs text-sm leading-6 text-[#cbd1e4]">Start with a sample deck, then make your own when inspiration strikes.</span></div><div className="mt-10 grid gap-4 md:grid-cols-3">{materials.slice(0, 3).map((material, index) => <Link href={`/study/${material.id}`} key={material.id} className={`learn-course ${['mint', 'sky', 'pink'][index]}`}><span className="flex items-center justify-between text-xs font-black uppercase tracking-wider"><span>{material.subject}</span><ArrowUpRight className="h-4 w-4" /></span><h3 className="mt-14 font-montserrat text-2xl font-black leading-tight">{material.title}</h3><span className="mt-8 inline-flex items-center gap-2 text-sm font-bold"><Star className="h-4 w-4 fill-current" /> {material.flashcards.length} ways to practice</span></Link>)}</div></div></section>

      <section id="questions" className="mx-auto max-w-[800px] px-5 py-20 md:px-8"><div className="text-center"><span className="learn-eyebrow">GOOD QUESTIONS</span><h2 className="mt-4 font-montserrat text-4xl font-black">Wondering how it works?</h2></div><div className="mt-10 divide-y-2 divide-[#17213f] border-y-2 border-[#17213f]">{faqs.map((faq) => <div key={faq} className="flex items-center justify-between py-5 text-left font-bold"><span>{faq}</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17213f] text-white"><ChevronDown className="h-4 w-4" /></span></div>)}</div></section>

      <footer className="border-t-2 border-[#17213f] bg-[#c9ff4d] px-5 py-10 md:px-8"><div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-6 md:flex-row md:items-center"><div><div className="font-montserrat text-xl font-black">LEARNVERSE</div><p className="mt-1 text-sm font-bold">Big ideas. Tiny steps.</p></div><div className="flex flex-wrap gap-5 text-sm font-bold"><Link href="/dashboard">Dashboard</Link><Link href="/study/bio-101">Sample study</Link><Link href="#questions">Questions</Link></div><span className="text-xs font-bold">© 2026 LearnVerse</span></div></footer>
    </main>
  )
}
