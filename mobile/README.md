# LearnVerse Mobile App 📱

AI-powered adaptive microlearning platform for iOS and Android, built with **React Native**, **Expo SDK 52**, and **Expo Router**.

---

## 🌟 Key Features

1. **Dashboard Command Center**: Real-time study streak, active decks, mastered recall statistics, and adaptive knowledge index.
2. **5-in-1 Microlearning Study Hub**:
   - **Summary Notes**: High-yield key takeaways and essential glossary terms.
   - **3D Flashcards**: Tap-to-flip active recall with self-assessment mastery ratings (*Review*, *Almost*, *Mastered*).
   - **Verification Quiz**: Step-by-step interactive questions with immediate rationale and score tallying.
   - **45s Micro-Reels**: Vertical audiovisual concept player with animated audio visualizer waveform and synchronized subtitles.
   - **Knowledge Gap Radar**: Diagnostic mastery meter with prescriptive revision sequencing.
3. **Document Synthesizer**: Upload modal supporting PDFs, scanned handwritten notes, and educational links with simulated OCR decomposition.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
pnpm install
# or
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Run on Device / Simulator
- **iOS Simulator**: Press `i` in the terminal or run `npx expo start --ios`
- **Android Emulator**: Press `a` in the terminal or run `npx expo start --android`
- **Physical Device**: Scan the QR code using the **Expo Go** app (iOS/Android).

---

## 📂 Architecture

```
mobile/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout with StudyProvider
│   ├── (tabs)/                 # Bottom Tab Navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Dashboard
│   │   ├── explore.tsx         # Course discovery & search
│   │   └── profile.tsx         # Student profile & settings
│   └── study/
│       └── [id].tsx            # 5-modalities study hub
├── src/
│   ├── components/             # Reusable mobile UI components
│   ├── constants/              # Theme tokens & mock study datasets
│   ├── context/                # StudyContext (React Context for mobile)
│   ├── screens/                # Standalone screens
│   └── types/                  # TypeScript definitions
├── app.json                    # Expo app configuration
└── package.json
```
