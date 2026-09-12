export const Colors = {
  // Warm Soft Pastel Theme (matching the modern neo-learning UI design)
  background: '#F6F3EE',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: '#E8E4DD',
  borderSubtle: '#EFECE6',

  // Hero Card Accents
  heroPurple: '#706CFF',
  heroPurpleLight: '#8C88FF',
  heroOrange: '#FFA770',
  heroOrangeDark: '#FF9254',
  heroLavender: '#ABB4FE',
  heroDark: '#22262E',

  // Soft Metric Card Tints
  peachBg: '#FFF1E8',
  peachText: '#FF8A48',
  lavenderBg: '#EEF0FF',
  lavenderText: '#6C70EB',
  creamBg: '#FFF8F3',

  // Brand Neons & Primaries
  primary: '#706CFF',
  primaryDark: '#5651E8',
  primaryMuted: '#EEF0FF',

  // Secondary Accents
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#FFA770',
  rose: '#F43F5E',
  purple: '#8B5CF6',

  // Text
  text: '#1C1F26',
  textMuted: '#848792',
  textDim: '#B0B3BD',
  textWhite: '#FFFFFF',

  // Bottom Navigation
  navDark: '#1E2024',
  navIconInactive: '#696C75',
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
}

export const Typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bodyMuted: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.primary,
  },
}
