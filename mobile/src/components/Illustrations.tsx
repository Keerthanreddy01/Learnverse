import React from 'react'
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg'

/**
 * Rich 3D Olympiad Trophy Illustration matching the reference design.
 * Features a golden cup with purple/pink gradients, handles, glowing star emblem,
 * and a warm wooden/golden base.
 */
export function OlympiadTrophy({ width = 110, height = 110 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 140 140" fill="none">
      <Defs>
        {/* Glow behind trophy */}
        <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
          <Stop offset="70%" stopColor="#FFFFFF" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>

        {/* Trophy Cup Body Gradient (Gold to Pink/Purple) */}
        <LinearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="35%" stopColor="#FFB74D" />
          <Stop offset="70%" stopColor="#FF8A65" />
          <Stop offset="100%" stopColor="#F06292" />
        </LinearGradient>

        {/* Cup Inner Rim Gradient */}
        <LinearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="50%" stopColor="#FFE082" />
          <Stop offset="100%" stopColor="#FFB74D" />
        </LinearGradient>

        {/* Handle Gradient */}
        <LinearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="100%" stopColor="#FF7043" />
        </LinearGradient>

        {/* Stem & Pedestal Gradient */}
        <LinearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFB74D" />
          <Stop offset="50%" stopColor="#FF9800" />
          <Stop offset="100%" stopColor="#F57C00" />
        </LinearGradient>

        {/* Base Ring Gradient */}
        <LinearGradient id="baseRing" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFA726" />
          <Stop offset="50%" stopColor="#FFD54F" />
          <Stop offset="100%" stopColor="#FB8C00" />
        </LinearGradient>
      </Defs>

      {/* Subtle Ambient Glow Disc */}
      <Circle cx="70" cy="70" r="62" fill="url(#glowGrad)" />

      {/* Left Handle */}
      <Path
        d="M 45 42 C 22 42, 20 72, 46 76"
        stroke="url(#handleGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right Handle */}
      <Path
        d="M 95 42 C 118 42, 120 72, 94 76"
        stroke="url(#handleGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Trophy Stem */}
      <Path d="M 64 78 L 76 78 L 74 100 L 66 100 Z" fill="url(#pedestalGrad)" />
      <Ellipse cx="70" cy="92" rx="9" ry="4" fill="#FFE082" />

      {/* Trophy Base Rings */}
      <Ellipse cx="70" cy="106" rx="20" ry="7" fill="url(#baseRing)" />
      <Path
        d="M 50 106 C 50 114, 90 114, 90 106 L 90 115 C 90 123, 50 123, 50 115 Z"
        fill="#E65100"
      />
      <Ellipse cx="70" cy="115" rx="23" ry="8" fill="url(#baseRing)" />
      <Ellipse cx="70" cy="115" rx="20" ry="6" fill="#FFE082" />

      {/* Main Cup Body */}
      <Path
        d="M 42 32 C 42 74, 52 82, 70 82 C 88 82, 98 74, 98 32 Z"
        fill="url(#cupGrad)"
      />

      {/* Top Rim Ellipse */}
      <Ellipse cx="70" cy="32" rx="28" ry="8" fill="url(#rimGrad)" />
      <Ellipse cx="70" cy="32" rx="23" ry="5.5" fill="#4A148C" opacity={0.25} />

      {/* Cup Highlight Sheen */}
      <Path
        d="M 48 38 C 47 56, 52 70, 60 74 C 55 70, 50 56, 51 38 Z"
        fill="#FFFFFF"
        opacity={0.45}
      />

      {/* Glowing Star Crest on Cup Front */}
      <Circle cx="70" cy="56" r="14" fill="#FFFFFF" opacity={0.9} />
      <Path
        d="M 70 45 L 72.8 52.5 L 80.5 53.2 L 74.6 58.2 L 76.4 65.8 L 70 61.8 L 63.6 65.8 L 65.4 58.2 L 59.5 53.2 L 67.2 52.5 Z"
        fill="#FF7043"
      />
      <Path
        d="M 70 48 L 71.8 53.5 L 77.5 54 L 73 57.8 L 74.4 63.5 L 70 60.5 L 65.6 63.5 L 67 57.8 L 62.5 54 L 68.2 53.5 Z"
        fill="#FFD54F"
      />

      {/* Little Sparkle Stars near the cup */}
      <Path
        d="M 108 26 L 110 32 L 116 34 L 110 36 L 108 42 L 106 36 L 100 34 L 106 32 Z"
        fill="#FFD54F"
      />
      <Path
        d="M 28 58 L 29.5 62.5 L 34 63.5 L 29.5 64.5 L 28 69 L 26.5 64.5 L 22 63.5 L 26.5 62.5 Z"
        fill="#FFF9C4"
      />
    </Svg>
  )
}

/**
 * Rich 3D Graduation Cap Illustration for "My courses" screen.
 */
export function GraduationCapIllustration({ width = 110, height = 110 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 140 140" fill="none">
      <Defs>
        <LinearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#9C98FF" />
          <Stop offset="50%" stopColor="#706CFF" />
          <Stop offset="100%" stopColor="#534DE8" />
        </LinearGradient>
        <LinearGradient id="capUnderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#534DE8" />
          <Stop offset="100%" stopColor="#3E38BF" />
        </LinearGradient>
        <LinearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFA770" />
          <Stop offset="100%" stopColor="#FF5252" />
        </LinearGradient>
      </Defs>

      {/* Skull Cap Base (underneath) */}
      <Path
        d="M 46 68 C 46 88, 94 88, 94 68 Z"
        fill="url(#capUnderGrad)"
      />
      <Path
        d="M 52 74 C 52 90, 88 90, 88 74 Z"
        fill="#2A2496"
        opacity={0.3}
      />

      {/* Diamond Cap Board */}
      <Path
        d="M 70 32 L 122 56 L 70 76 L 18 56 Z"
        fill="url(#capTopGrad)"
      />

      {/* Board Edge 3D Thickness */}
      <Path
        d="M 18 56 L 70 76 L 70 82 L 18 62 Z"
        fill="#534DE8"
      />
      <Path
        d="M 122 56 L 70 76 L 70 82 L 122 62 Z"
        fill="#3E38BF"
      />

      {/* Top Button */}
      <Ellipse cx="70" cy="54" rx="6" ry="3" fill="#FFE082" />

      {/* Tassel String & Bob */}
      <Path
        d="M 70 54 C 88 56, 114 62, 115 82"
        stroke="url(#tasselGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="115" cy="84" r="5.5" fill="#FF5252" />
      <Path
        d="M 112 87 L 118 87 L 120 102 L 110 102 Z"
        fill="url(#tasselGrad)"
      />

      {/* Sparkles */}
      <Path
        d="M 26 28 L 28 34 L 34 36 L 28 38 L 26 44 L 24 38 L 18 36 L 24 34 Z"
        fill="#FFD54F"
      />
      <Path
        d="M 124 36 L 125.5 40 L 130 41 L 125.5 42 L 124 46 L 122.5 42 L 118 41 L 122.5 40 Z"
        fill="#FFFFFF"
      />
    </Svg>
  )
}

/**
 * 3D-styled Memoji Avatar representing "Jacob".
 */
export function MemojiAvatar({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Defs>
        <LinearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F0EDFF" />
          <Stop offset="100%" stopColor="#D8D2FF" />
        </LinearGradient>
        <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFDFBA" />
          <Stop offset="100%" stopColor="#F1C27D" />
        </LinearGradient>
        <LinearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#8D5B4C" />
          <Stop offset="100%" stopColor="#5D3A1A" />
        </LinearGradient>
        <LinearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#706CFF" />
          <Stop offset="100%" stopColor="#534DE8" />
        </LinearGradient>
      </Defs>

      {/* Background Circle */}
      <Circle cx="30" cy="30" r="29" fill="url(#avatarBg)" stroke="#FFFFFF" strokeWidth="2" />

      {/* Shirt / Shoulders */}
      <Path
        d="M 12 56 C 12 44, 48 44, 48 56 Z"
        fill="url(#shirtGrad)"
      />

      {/* Neck */}
      <Rect x="26" y="36" width="8" height="9" rx="3" fill="#E0AC69" />

      {/* Head / Face */}
      <Ellipse cx="30" cy="27" rx="14" ry="15" fill="url(#skinGrad)" />

      {/* Cheeks Blush */}
      <Circle cx="20" cy="31" r="3" fill="#FF8A80" opacity={0.4} />
      <Circle cx="40" cy="31" r="3" fill="#FF8A80" opacity={0.4} />

      {/* Hair (Trendy styled pompadour / side part) */}
      <Path
        d="M 17 24 C 15 16, 20 10, 32 9 C 42 8, 46 14, 44 24 C 41 18, 36 17, 30 17 C 22 17, 19 20, 17 24 Z"
        fill="url(#hairGrad)"
      />
      <Path
        d="M 16 22 C 14 26, 16 32, 17 33 C 17 28, 17 24, 16 22 Z"
        fill="url(#hairGrad)"
      />
      <Path
        d="M 44 22 C 46 26, 44 32, 43 33 C 43 28, 43 24, 44 22 Z"
        fill="url(#hairGrad)"
      />

      {/* Eyebrows */}
      <Path d="M 21 21 C 23 19.5, 26 20, 27 21" stroke="#4E342E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Path d="M 33 21 C 34 20, 37 19.5, 39 21" stroke="#4E342E" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <Circle cx="24" cy="25" r="2.2" fill="#2E1C14" />
      <Circle cx="36" cy="25" r="2.2" fill="#2E1C14" />
      <Circle cx="24.8" cy="24.4" r="0.8" fill="#FFFFFF" />
      <Circle cx="36.8" cy="24.4" r="0.8" fill="#FFFFFF" />

      {/* Friendly Smile */}
      <Path
        d="M 26 31 C 28 34, 32 34, 34 31"
        stroke="#8D4320"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}
