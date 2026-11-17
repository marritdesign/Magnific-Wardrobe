import { Platform } from 'react-native'

// Calm, image-first palette: warm off-white canvas, near-black ink, quiet greys.
export const C = {
  bg: '#F7F5F3',
  card: '#FFFFFF',
  stage: '#EEEBE7',
  ink: '#111111',
  muted: '#8E8A85',
  faint: '#B9B4AE',
  line: '#E6E2DD',
  pill: '#EBE8E4',
  accent: '#111111',
  accentSoft: '#E4E0DB',
  like: '#111111',
  nope: '#8E8A85',
  danger: '#B4483A',
}
export const R = { sm: 10, md: 14, lg: 20 }
export const T = {
  title: { fontSize: 34, fontWeight: '600' as const, letterSpacing: -1.2, color: C.ink },
  small: { fontSize: 13, color: C.muted, letterSpacing: -0.1 },
}
/** Space kept free at the bottom of scrolling screens for the floating tab bar. */
export const TAB_SPACE = 120

/** Elegant serif for titles and section headers (system fonts, nothing to download). */
export const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' })
/** Dusty pink and coral used for the friends banner. */
export const PINK = { bg: '#E8C7C3', line: '#C4574B', ink: '#5A2620' }
/** Soft lavender used for the mix & match banner. */
export const LAVENDER = { bg: '#D7DAEB', line: '#A9524C', ink: '#111111' }
