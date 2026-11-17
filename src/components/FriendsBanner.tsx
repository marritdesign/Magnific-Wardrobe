import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { PINK, SERIF } from '../lib/theme'

/** Dusty-pink invitation to the upcoming friends feature: swap and share clothes. */
export function FriendsBanner() {
  return (
    <Pressable
      onPress={() => router.navigate({ pathname: '/explore', params: { friends: String(Date.now()) } })}
      style={({ pressed }) => [st.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel="Find your friends. Swap and share clothes with friends. Coming soon."
    >
      <HangersArt />
      <View style={st.heart}><Ionicons name="heart-outline" size={18} color={PINK.line} /></View>
      <View style={st.text}>
        <View style={st.soon}><Text style={st.soonText}>Coming soon</Text></View>
        <Text style={st.title}>Find your friends</Text>
        <Text style={st.sub}>Swap and share clothes with friends. Borrow that dress for Saturday.</Text>
        <View style={st.cta}>
          <Text style={st.ctaText}>Take a look</Text>
          <Ionicons name="arrow-forward" size={14} color={PINK.ink} />
        </View>
      </View>
    </Pressable>
  )
}

/** Two hangers with a ribbon, drawn as one continuous coral line. */
function HangersArt() {
  const stroke = { stroke: PINK.line, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150" style={st.art}>
      {/* rail */}
      <Path d="M8 22 H146" {...stroke} />
      {/* hanger 1 */}
      <Path d="M58 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M58 42 L22 66 c-3 2 -2 5 2 5 h68 c4 0 5 -3 2 -5 L58 42" {...stroke} />
      {/* hanger 2 */}
      <Path d="M112 22 c0 6 -6 6 -6 11 c0 4 6 5 6 9 M112 42 L82 62 c-3 2 -2 5 2 5 h56 c4 0 5 -3 2 -5 L112 42" {...stroke} />
      {/* ribbon on hanger 1 */}
      <Path d="M58 71 c-8 -10 -20 -4 -14 4 c5 5 14 -2 14 -4 c0 2 9 9 14 4 c6 -8 -6 -14 -14 -4 M56 74 c-6 14 -10 26 -18 38 M60 74 c4 16 2 30 8 44" {...stroke} />
      {/* little heart */}
      <Path d="M110 100 c-4 -6 -12 -2 -9 4 c2 4 9 8 9 8 c0 0 7 -4 9 -8 c3 -6 -5 -10 -9 -4 z" {...stroke} />
    </Svg>
  )
}

const st = StyleSheet.create({
  card: { backgroundColor: PINK.bg, borderRadius: 24, minHeight: 168, overflow: 'hidden', flexDirection: 'row' },
  art: { position: 'absolute', right: -6, bottom: -4 },
  heart: { position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  text: { padding: 20, paddingRight: 120, gap: 6, flex: 1 },
  soon: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 2 },
  soonText: { fontSize: 11, fontWeight: '600', color: PINK.ink, letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontFamily: SERIF, fontSize: 26, color: PINK.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 19, color: PINK.ink, opacity: 0.8 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ctaText: { fontSize: 14, fontWeight: '600', color: PINK.ink, textDecorationLine: 'underline' },
})
