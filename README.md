# LearnVerse 🧠✨

**LearnVerse** is an AI-powered adaptive microlearning platform for school and college students. It turns heavy study materials (PDFs, scanned handwritten notes, textbooks, and URLs) into bite-sized, high-retention microlearning modules:

- 📑 **High-Yield Summary Notes & Glossary**
- 🎴 **3D Active Recall Flashcards**
- ❓ **Verification Quizzes with Instant Rationale**
- 🎬 **45-Second Narrated Video Reels**
- 🎯 **Adaptive Knowledge-Gap Diagnostics & Revision Sequencing**

---

## 🏗️ Repository Architecture

```
Learnverse/                         ← Root Repository
│
├── app/                            ← Next.js 14 Web Application (App Router)
│   ├── page.tsx                    ← 3D Interactive Hero Landing Page
│   ├── dashboard/                  ← Student Command Center & Decks
│   └── study/[id]/                 ← 5-Modalities Interactive Study Hub
├── components/                     ← Web UI Components (50+ shadcn/ui & custom)
├── hooks/                          ← Web Hooks
├── lib/                            ← State, Context, Mock Engine, & Types
├── public/                         ← Web Static Assets & 3D Spline Canvas
├── package.json                    ← Web Dependencies (Next.js, Tailwind v4, Radix)
├── next.config.mjs
│
├── mobile/                         ← React Native / Expo Mobile App
│   ├── app/                        ← Expo Router Navigation
│   │   ├── _layout.tsx             ← Root Layout with StudyProvider
│   │   ├── (tabs)/                 ← Bottom Tab Navigation (Dashboard, Explore, Profile)
│   │   └── study/[id].tsx          ← Mobile Microlearning Study Hub
│   ├── src/
│   │   ├── components/             ← Mobile UI (Cards, Deck, Quiz, Reel, Radar)
│   │   ├── screens/                ← Standalone Screens
│   │   ├── context/                ← Mobile StudyContext
│   │   ├── constants/              ← Theme & Mock Datasets
│   │   └── types/                  ← Shared Types
│   ├── app.json                    ← Expo Configuration
│   └── package.json                ← React Native Dependencies
│
└── README.md
```

---

## 🚀 Quickstart

### 1. Web Application (Next.js)
```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Mobile Application (React Native / Expo)
```bash
# Navigate to mobile app
cd mobile

# Install mobile dependencies
pnpm install

# Start Expo dev server
npx expo start
```
Scan the QR code in **Expo Go** or press `a` for Android / `i` for iOS simulator.

---

## 🎨 Design System
- **Theme**: Pure Dark (`#000000`) with Neon Green Primary (`#1DED83`).
- **Typography**: Montserrat headlines with Monospace precision accents (`IBM Plex Mono`).
- **Aesthetics**: Glassmorphism, 3D interactive physics, and subtle glowing borders.
