import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { PINK, SAGE, SERIF } from '../lib/theme'

type Palette = { bg: string; line: string; ink: string }
type BannerData = { key: string; palette: Palette; badge?: string; title: string; sub: string; cta: string; art: (p: Palette) => ReactNode; go: () => void }

const BANNERS: BannerData[] = [
  {
    key: 'style',
    palette: SAGE,
    title: 'Mix & match',
    sub: 'Get started with outfit ideas from your own closet. Spin the reels and save the ones you love.',
    cta: 'Style me',
    art: (p) => <OutfitArt p={p} />,
    go: () => router.navigate('/swipe'),
  },
  {
    key: 'friends',
    palette: PINK,
    badge: 'Coming soon',
    title: 'Find your friends',
    sub: 'Swap and share clothes with friends. Borrow that dress for Saturday.',
    cta: 'Take a look',
    art: (p) => <HangersArt p={p} />,
    go: () => router.navigate({ pathname: '/explore', params: { friends: String(Date.now()) } }),
  },
]

/** Swipeable row of soft-coloured banners at the top of the closet, with page dots. */
export function Banners() {
  const [w, setW] = useState(0)
  const [page, setPage] = useState(0)
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ gap: 10 }}>
      {w > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={w + 10}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (w + 10)))}
          contentContainerStyle={{ gap: 10 }}
        >
          {BANNERS.map((b) => <Banner key={b.key} b={b} width={w} />)}
        </ScrollView>
      )}
      <View style={st.dots}>
        {BANNERS.map((b, i) => <View key={b.key} style={[st.dot, i === page && st.dotOn]} />)}
      </View>
    </View>
  )
}

function Banner({ b, width }: { b: BannerData; width: number }) {
  const p = b.palette
  return (
    <Pressable onPress={b.go} style={({ pressed }) => [st.card, { width, backgroundColor: p.bg }, pressed && { opacity: 0.9 }]} accessibilityRole="button" accessibilityLabel={`${b.title}. ${b.sub}`}>
      {b.art(p)}
      <View style={st.text}>
        {b.badge && <View style={st.badge}><Text style={[st.badgeText, { color: p.ink }]}>{b.badge}</Text></View>}
        <Text style={[st.title, { color: p.ink }]}>{b.title}</Text>
        <Text style={[st.sub, { color: p.ink }]}>{b.sub}</Text>
        <View style={st.cta}>
          <Text style={[st.ctaText, { color: p.ink }]}>{b.cta}</Text>
          <Ionicons name="arrow-forward" size={14} color={p.ink} />
        </View>
      </View>
    </Pressable>
  )
}

const line = (p: Palette) => ({ stroke: p.line, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

/** Two hangers with a ribbon, drawn as a coral line. */
function HangersArt({ p }: { p: Palette }) {
  const l = line(p)
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" style={st.art}>
      <Path d="M8 22 H146" {...l} />
      <Path d="M58 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M58 42 L22 66 c-3 2 -2 5 2 5 h68 c4 0 5 -3 2 -5 L58 42" {...l} />
      <Path d="M112 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M112 42 L82 62 c-3 2 -2 5 2 5 h56 c4 0 5 -3 2 -5 L112 42" {...l} />
      <Path d="M58 71 c-8 -10 -20 -4 -14 4 c5 5 14 -2 14 -4 c0 2 9 9 14 4 c6 -8 -6 -14 -14 -4 M56 74 c-6 14 -10 26 -18 38 M60 74 c4 16 2 30 8 44" {...l} />
      <Path d="M110 100 c-4 -6 -12 -2 -9 4 c2 4 9 8 9 8 c0 0 7 -4 9 -8 c3 -6 -5 -10 -9 -4 z" {...l} />
    </Svg>
  )
}

/** A top and a skirt side by side with a few sparkles: "mix and match". */
function OutfitArt({ p }: { p: Palette }) {
  const l = line(p)
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" style={st.art}>
      {/* top */}
      <Path d="M40 30 l-22 12 l8 16 l10 -5 v40 h40 v-40 l10 5 l8 -16 l-22 -12 c-2 8 -8 12 -16 12 c-8 0 -14 -4 -16 -12 z" {...l} />
      {/* skirt */}
      <Path d="M92 78 h34 l14 54 c-20 6 -42 6 -62 0 z M96 78 v-6 h26 v6" {...l} />
      {/* swap arrows */}
      <Path d="M70 108 c6 8 14 10 22 6 M88 110 l4 4 l-5 2" {...l} />
      {/* sparkles */}
      <Path d="M118 26 v16 M110 34 h16 M132 52 v8 M128 56 h8 M22 110 v10 M17 115 h10" {...l} />
    </Svg>
  )
}

const st = StyleSheet.create({
  card: { borderRadius: 24, minHeight: 172, overflow: 'hidden', flexDirection: 'row' },
  art: { position: 'absolute', right: -6, bottom: -4 },
  text: { padding: 20, paddingRight: 120, gap: 6, flex: 1, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 2 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontFamily: SERIF, fontSize: 26, letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 19, opacity: 0.8 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ctaText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D6D1CB' },
  dotOn: { backgroundColor: '#111111', width: 16 },
})
