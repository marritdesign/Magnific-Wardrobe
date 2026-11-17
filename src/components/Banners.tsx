import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useStore } from '../lib/store'
import { LAVENDER, PINK, SERIF } from '../lib/theme'

type Palette = { bg: string; line: string; ink: string }
type BannerData = { key: string; palette: Palette; badge?: string; title: string; sub: string; cta: string; art: ReactNode; go: () => void }

const stitchShoes = require('../../assets/stitch-shoes.png')
const newOutfit = () => router.push('/outfit/new')
const openFriends = () => router.navigate({ pathname: '/explore', params: { friends: String(Date.now()) } })

/** Swipeable row of soft-coloured banners at the top of the closet. Each can be closed with the X. */
export function Banners() {
  const { outfits, dismissed, dismiss } = useStore()
  const [w, setW] = useState(0)
  const [page, setPage] = useState(0)

  const all: (BannerData & { show: boolean })[] = [
    {
      key: 'first-outfit',
      // Only while you haven't made an outfit yourself yet.
      show: outfits.length === 0,
      palette: LAVENDER,
      title: 'Mix & match',
      sub: 'Create your first outfit: put pieces from your own closet together on a moodboard.',
      cta: 'Get started',
      art: <Image source={stitchShoes} style={st.photoArt} contentFit="cover" contentPosition="left" />,
      go: newOutfit,
    },
    {
      key: 'friends',
      show: true,
      palette: PINK,
      badge: 'Coming soon',
      title: 'Find your friends',
      sub: 'Swap and share clothes with friends. Borrow that dress for Saturday.',
      cta: 'Take a look',
      art: <HangersArt p={PINK} />,
      go: openFriends,
    },
  ]
  const banners = all.filter((b) => b.show && !dismissed.includes(b.key))
  if (!banners.length) return null
  const current = Math.min(page, banners.length - 1)

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
          contentContainerStyle={{ gap: 10, alignItems: 'stretch' }}
        >
          {banners.map((b) => <Banner key={b.key} b={b} width={w} onClose={() => dismiss(b.key)} />)}
        </ScrollView>
      )}
      {banners.length > 1 && (
        <View style={st.dots}>
          {banners.map((b, i) => <View key={b.key} style={[st.dot, i === current && st.dotOn]} />)}
        </View>
      )}
    </View>
  )
}

function Banner({ b, width, onClose }: { b: BannerData; width: number; onClose: () => void }) {
  const p = b.palette
  return (
    <View style={[st.card, { width, backgroundColor: p.bg }]}>
      <View style={st.art} pointerEvents="none">{b.art}</View>
      <View style={st.text}>
        {b.badge && <View style={st.badge}><Text style={[st.badgeText, { color: p.ink }]}>{b.badge}</Text></View>}
        <Text style={[st.title, { color: p.ink }]}>{b.title}</Text>
        <Text style={[st.sub, { color: p.ink }]}>{b.sub}</Text>
        <Pressable onPress={b.go} style={({ pressed }) => [st.cta, pressed && { opacity: 0.85 }]} accessibilityRole="button">
          <Text style={st.ctaText}>{b.cta}</Text>
        </Pressable>
      </View>
      <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityLabel={`Close ${b.title}`}>
        <Ionicons name="close" size={20} color="#111" />
      </Pressable>
    </View>
  )
}

/** Two hangers with a ribbon, drawn as a coral line. */
function HangersArt({ p }: { p: Palette }) {
  const l = { stroke: p.line, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" style={{ position: 'absolute', right: -6, bottom: -4 }}>
      <Path d="M8 22 H146" {...l} />
      <Path d="M58 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M58 42 L22 66 c-3 2 -2 5 2 5 h68 c4 0 5 -3 2 -5 L58 42" {...l} />
      <Path d="M112 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M112 42 L82 62 c-3 2 -2 5 2 5 h56 c4 0 5 -3 2 -5 L112 42" {...l} />
      <Path d="M58 71 c-8 -10 -20 -4 -14 4 c5 5 14 -2 14 -4 c0 2 9 9 14 4 c6 -8 -6 -14 -14 -4 M56 74 c-6 14 -10 26 -18 38 M60 74 c4 16 2 30 8 44" {...l} />
      <Path d="M110 100 c-4 -6 -12 -2 -9 4 c2 4 9 8 9 8 c0 0 7 -4 9 -8 c3 -6 -5 -10 -9 -4 z" {...l} />
    </Svg>
  )
}

const st = StyleSheet.create({
  card: { borderRadius: 24, minHeight: 240, overflow: 'hidden' },
  art: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '46%' },
  photoArt: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  text: { padding: 22, paddingRight: '34%', gap: 8, flex: 1 },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontFamily: SERIF, fontSize: 30, letterSpacing: -0.6 },
  sub: { fontSize: 15, lineHeight: 20 },
  cta: { alignSelf: 'flex-start', backgroundColor: '#2B2B2B', borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12, marginTop: 10 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '500', letterSpacing: -0.2 },
  close: { position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D6D1CB' },
  dotOn: { backgroundColor: '#111111', width: 16 },
})
