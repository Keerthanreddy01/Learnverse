'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { UserRole } from '@/lib/types/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  BrainCircuit,
  GraduationCap,
  Sparkles,
  ArrowRight,
  School,
  Lock,
  Mail,
  User,
  Zap,
  ArrowUpRight,
  BookOpen,
  Flame,
  Layers,
  Gamepad2,
  Film,
  CheckCircle2,
} from 'lucide-react'

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate', 'Postgraduate']

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, switchDemoRole } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [grade, setGrade] = useState('Grade 11')
  const [institution, setInstitution] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleQuickLogin = (role: UserRole) => {
    switchDemoRole(role)
    toast.success(`Welcome! Logged in as ${role === 'faculty' ? 'Faculty Member' : 'Student Learner'}`)
    router.push(role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const demoEmail = selectedRole === 'faculty' ? 'dr.sharma@learnverse.edu' : 'alex.student@learnverse.edu'
        const res = await signIn(email || demoEmail, password || 'password123')
        if (res.success) {
          toast.success(`Welcome back! Signed in as ${selectedRole}`)
          router.push(selectedRole === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')
        } else {
          toast.error(res.error || 'Authentication error')
        }
      } else {
        const res = await signUp(
          email || `${selectedRole}_${Date.now()}@learnverse.edu`,
          password || 'password123',
          {
            full_name: fullName || (selectedRole === 'faculty' ? 'Faculty Member' : 'Student Learner'),
            role: selectedRole,
            grade: selectedRole === 'student' ? grade : undefined,
            institution: institution || (selectedRole === 'faculty' ? 'Department of Science' : undefined),
          }
        )

        if (res.success) {
          toast.success(`Account registered as ${selectedRole}!`)
          router.push(selectedRole === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')
        } else {
          toast.error(res.error || 'Failed to register')
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Authentication error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="learn-home min-h-screen flex flex-col justify-between text-[#17213f] bg-[#f7f6f1] selection:bg-[#c9ff4d]">
      {/* Top Navbar matching landing page */}
      <nav className="learn-nav mx-auto w-full flex max-w-[1180px] items-center justify-between px-5 py-5 md:px-8 border-b-2 border-[#17213f]">
        <Link href="/" className="flex items-center gap-3" aria-label="LearnVerse home">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#17213f] bg-[#c9ff4d] shadow-[3px_3px_0_#17213f]">
            <BrainCircuit className="h-5 w-5 text-[#17213f]" />
          </span>
          <span className="font-montserrat text-lg font-black tracking-tight text-[#17213f]">LEARNVERSE</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-bold md:flex">
          <Link href="/dashboard" className="hover:text-[#4938d4] transition-colors">Courses</Link>
          <Link href="/study/bio-101" className="hover:text-[#4938d4] transition-colors">Sample study</Link>
          <Link href="/" className="hover:text-[#4938d4] transition-colors">Overview</Link>
        </div>

        {/* Instant Fast-Track Nav Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            onClick={() => handleQuickLogin('student')}
            className="rounded-full border-2 border-[#17213f] bg-[#c9ff4d] px-3.5 py-1.5 text-xs font-black text-[#17213f] shadow-[3px_3px_0_#17213f] hover:bg-[#d7ff78] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Student
          </Button>
          <Button
            size="sm"
            onClick={() => handleQuickLogin('faculty')}
            className="rounded-full border-2 border-[#17213f] bg-[#ffb7dc] px-3.5 py-1.5 text-xs font-black text-[#17213f] shadow-[3px_3px_0_#17213f] hover:bg-[#ffc9e5] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <School className="mr-1.5 h-3.5 w-3.5" /> Faculty
          </Button>
        </div>
      </nav>

      {/* Main Content Area: Split layout matching landing page style */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 md:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          
          {/* Left Column: Playful Brand Showcase with Mascot & Layered Neo-Brutalist Cards */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#17213f] bg-white px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#17213f]">
              <Sparkles className="h-3.5 w-3.5 text-[#4938d4]" /> Academic Access Portal
            </div>

            <h1 className="font-montserrat text-[clamp(2.5rem,5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.05em] text-[#17213f]">
              Big ideas.<br />
              <span className="relative inline-block text-[#4938d4]">
                Instant pass.
                <span className="absolute -bottom-2 left-1 right-0 h-3 -rotate-2 rounded-full bg-[#c9ff4d]" />
              </span>
            </h1>

            <p className="max-w-md text-sm font-medium leading-6 text-[#48516b] md:text-base">
              Sign in to LearnVerse to explore AI-adaptive study decks, 9:16 curriculum reels, or manage faculty courses with interactive question banks.
            </p>

            {/* Playful Layered Mascot Card from Landing Page */}
            <div className="relative min-h-[340px] max-w-[460px] hidden md:block">
              {/* Back Pink Layer */}
              <div className="absolute inset-x-4 top-5 bottom-0 rotate-2 rounded-[2.5rem] border-2 border-[#17213f] bg-[#ffb7dc] shadow-[6px_6px_0_#17213f]" />
              {/* Mid Indigo Layer */}
              <div className="absolute inset-x-0 top-0 bottom-4 -rotate-3 rounded-[2.5rem] border-2 border-[#17213f] bg-[#4938d4] shadow-[6px_6px_0_#17213f]" />
              {/* Front Mint Card with Mascot Jack */}
              <div className="absolute inset-x-4 top-4 bottom-0 overflow-hidden rounded-[2.2rem] border-2 border-[#17213f] bg-[#c9ff4d]">
                <div className="absolute left-5 top-5 rounded-full border-2 border-[#17213f] bg-white px-3 py-1 text-xs font-black shadow-[2px_2px_0_#17213f]">
                  LEARNVERSE PASS
                </div>
                <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full border-2 border-[#17213f] bg-[#ffb7dc] px-3 py-1 text-xs font-black shadow-[2px_2px_0_#17213f]">
                  <Flame className="h-3.5 w-3.5 text-[#17213f]" /> 5 day streak
                </div>
                {/* Mascot Image */}
                <img
                  src="/jack-front.png"
                  alt="LearnVerse Buddy"
                  className="absolute bottom-[-10px] left-1/2 w-[75%] max-w-[360px] -translate-x-1/2"
                />
                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border-2 border-[#17213f] bg-white p-3.5 shadow-[4px_4px_0_#17213f]">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#17213f]">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-[#4938d4]" /> Adaptive Ready
                    </span>
                    <span className="text-[#4938d4]">100% Free</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="learn-pill mint text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Story notes
              </span>
              <span className="learn-pill sky text-xs">
                <Layers className="h-3.5 w-3.5" /> Flip cards
              </span>
              <span className="learn-pill lemon text-xs">
                <Gamepad2 className="h-3.5 w-3.5" /> Quizzes
              </span>
              <span className="learn-pill mint text-xs">
                <Film className="h-3.5 w-3.5" /> 9:16 Reels
              </span>
            </div>
          </div>

          {/* Right Column: Neo-Brutalist Login Card */}
          <div className="w-full max-w-[510px] mx-auto rounded-[2.5rem] border-2 border-[#17213f] bg-white p-6 sm:p-8 shadow-[8px_8px_0_#17213f] space-y-6">
            
            {/* Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#17213f] bg-[#c9ff4d] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] shadow-[2px_2px_0_#17213f]">
                <Sparkles className="h-3 w-3 text-[#4938d4]" /> 1-Click Fast Login
              </div>
              <h2 className="font-montserrat text-2xl sm:text-3xl font-black tracking-tight text-[#17213f]">
                {mode === 'signin' ? 'Sign in to LearnVerse' : 'Create an Account'}
              </h2>
              <p className="text-xs font-bold text-[#59627c]">
                Click a demo persona below for instant access, or enter your credentials.
              </p>
            </div>

            {/* ⚡ 1-Click Instant Login Cards (Landing Page Lemon Theme) */}
            <div className="rounded-2xl border-2 border-[#17213f] bg-[#fff4bd] p-4 shadow-[4px_4px_0_#17213f] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#17213f] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#4938d4] fill-[#4938d4]" /> Quick 1-Click Demo
                </span>
                <span className="text-[10px] font-extrabold text-[#59627c]">Instant · No password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student Quick Button */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  className="rounded-2xl border-2 border-[#17213f] bg-[#c9ff4d] hover:bg-[#d7ff78] p-3.5 text-left shadow-[3px_3px_0_#17213f] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full border-2 border-[#17213f] bg-white flex items-center justify-center shadow-[1px_1px_0_#17213f] group-hover:rotate-6 transition-transform">
                      <GraduationCap className="h-4 w-4 text-[#17213f]" />
                    </div>
                    <span className="rounded-full border border-[#17213f] bg-white px-2 py-0.5 text-[10px] font-black text-[#17213f]">
                      Grade 11
                    </span>
                  </div>
                  <div>
                    <div className="font-montserrat text-sm font-black text-[#17213f]">
                      Alex Rivera
                    </div>
                    <div className="text-[11px] font-extrabold text-[#384158] flex items-center gap-1 mt-0.5">
                      Student Portal <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Faculty Quick Button */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('faculty')}
                  className="rounded-2xl border-2 border-[#17213f] bg-[#ffb7dc] hover:bg-[#ffc9e5] p-3.5 text-left shadow-[3px_3px_0_#17213f] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full border-2 border-[#17213f] bg-white flex items-center justify-center shadow-[1px_1px_0_#17213f] group-hover:rotate-6 transition-transform">
                      <School className="h-4 w-4 text-[#17213f]" />
                    </div>
                    <span className="rounded-full border border-[#17213f] bg-white px-2 py-0.5 text-[10px] font-black text-[#17213f]">
                      Faculty
                    </span>
                  </div>
                  <div>
                    <div className="font-montserrat text-sm font-black text-[#17213f]">
                      Dr. Anita Sharma
                    </div>
                    <div className="text-[11px] font-extrabold text-[#384158] flex items-center gap-1 mt-0.5">
                      CMS Studio <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#17213f]" />
              </div>
              <span className="relative bg-white px-3 font-mono text-[11px] font-black uppercase text-[#59627c] tracking-wider">
                Or Sign In Manually
              </span>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-[#17213f] p-1.5 bg-[#f7f6f1]">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'border-2 border-[#17213f] bg-[#4938d4] text-white shadow-[2px_2px_0_#17213f]'
                    : 'text-[#17213f] hover:bg-white'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Student
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('faculty')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRole === 'faculty'
                    ? 'border-2 border-[#17213f] bg-[#4938d4] text-white shadow-[2px_2px_0_#17213f]'
                    : 'text-[#17213f] hover:bg-white'
                }`}
              >
                <School className="h-4 w-4" />
                Faculty
              </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-bold text-xs">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-[#17213f] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#4938d4]" /> Full Name
                  </Label>
                  <Input
                    required
                    placeholder={selectedRole === 'faculty' ? 'Dr. Anita Sharma' : 'Alex Rivera'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl border-2 border-[#17213f] bg-[#f7f6f1] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f] focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-[#17213f] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#4938d4]" /> Academic Email
                  </Label>
                  {mode === 'signin' && (
                    <span className="text-[10px] font-extrabold text-[#59627c]">(demo optional)</span>
                  )}
                </div>
                <Input
                  type="email"
                  placeholder={selectedRole === 'faculty' ? 'dr.sharma@learnverse.edu' : 'alex.student@learnverse.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-2 border-[#17213f] bg-[#f7f6f1] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-[#17213f] flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#4938d4]" /> Password
                  </Label>
                  {mode === 'signin' && (
                    <span className="text-[10px] font-extrabold text-[#59627c]">(demo optional)</span>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-2 border-[#17213f] bg-[#f7f6f1] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f] focus:outline-none"
                />
              </div>

              {/* Role Specific Field */}
              {selectedRole === 'student' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-[#17213f] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#4938d4]" /> Enrolled Grade Level
                  </Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#17213f] bg-[#f7f6f1] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f] focus:outline-none cursor-pointer"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-[#17213f] flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 text-[#4938d4]" /> Department / Institution
                  </Label>
                  <Input
                    placeholder="e.g. Department of Cellular Biology"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="rounded-xl border-2 border-[#17213f] bg-[#f7f6f1] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-[#17213f] shadow-[2px_2px_0_#17213f] focus:outline-none"
                  />
                </div>
              )}

              {/* Submit Button in Indigo with hard shadow */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full border-2 border-[#17213f] bg-[#4938d4] hover:bg-[#3727bd] text-white py-5 text-sm font-black shadow-[4px_4px_0_#17213f] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {submitting ? (
                  'Signing in…'
                ) : (
                  <>
                    {mode === 'signin'
                      ? `Continue as ${selectedRole === 'faculty' ? 'Faculty' : 'Student'}`
                      : 'Complete Registration'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center pt-3 border-t-2 border-[#17213f]">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs font-bold text-[#4938d4] hover:underline cursor-pointer"
              >
                {mode === 'signin'
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Lemon Playground Strip matching landing page */}
      <section className="border-y-2 border-[#17213f] bg-[#fff4bd]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-3 px-5 py-4 md:justify-between md:px-8">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#17213f]">
            ⚡ Your Learning Playground
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="learn-pill mint text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Story notes
            </span>
            <span className="learn-pill sky text-xs">
              <Layers className="h-3.5 w-3.5" /> Flip cards
            </span>
            <span className="learn-pill lemon text-xs">
              <Gamepad2 className="h-3.5 w-3.5" /> Quick quizzes
            </span>
            <span className="learn-pill mint text-xs">
              <Film className="h-3.5 w-3.5" /> 9:16 Reels
            </span>
          </div>
        </div>
      </section>

      {/* Footer matching landing page exactly */}
      <footer className="border-t-2 border-[#17213f] bg-[#c9ff4d] px-5 py-8 md:px-8 text-[#17213f]">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="font-montserrat text-lg font-black tracking-tight">LEARNVERSE</div>
            <p className="text-xs font-bold text-[#17213f]/80">Big ideas. Tiny steps.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-bold">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/study/bio-101" className="hover:underline">Sample study</Link>
            <Link href="/student/reels" className="hover:underline">Reels</Link>
          </div>
          <span className="text-xs font-bold">© 2026 LearnVerse</span>
        </div>
      </footer>
    </main>
  )
}
