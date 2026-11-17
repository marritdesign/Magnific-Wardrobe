import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { currentSeason, isoDate } from '../lib/dates'
import { missingPieces, styleProfile } from '../lib/insights'
import { useStore } from '../lib/store'
import { C, R, SERIF } from '../lib/theme'
import { catInfo, colorHex, type Item } from '../lib/types'
import { OutfitBoard, s } from './ui'

/** A thin reminder of today's outfit, shown only when you planned it yourself. */
export function TodayLine() {
  const { items, outfits, plans } = useStore()
  const planned = outfits.find((o) => o.id === plans[isoDate(new Date())])
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  if (!planned) return null
  const shown = planned.itemIds.map((id) => byId.get(id)).filter(Boolean) as Item[]
  return (
    <Pressable onPress={() => router.navigate('/plan')} style={({ pressed }) => [st.todayLine, pressed && { opacity: 0.8 }]}>
      <View style={{ width: 34, height: 42 }}><OutfitBoard compact items={shown} /></View>
      <Text style={{ flex: 1, fontSize: 14, color: C.ink }} numberOfLines={1}>
        <Text style={{ color: C.muted }}>Today · </Text>{planned.name || 'Your planned outfit'}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={C.faint} />
    </Pressable>
  )
}

export function Explore() {
  const { items, wishlist, addWish } = useStore()
  const gaps = useMemo(() => missingPieces(items, currentSeason()), [items])
  const profile = useMemo(() => styleProfile(items), [items])
  const wished = new Set(wishlist.map((w) => w.name.toLowerCase()))

  return (
    <View style={{ gap: 28 }}>
      <Section title="Missing pieces" sub="Basics that would unlock the most new outfits">
        {items.length < 3 ? (
          <Text style={s.muted}>Add a few more items and suggestions appear here.</Text>
        ) : gaps.length === 0 ? (
          <Text style={s.muted}>Your basics are covered. Nice!</Text>
        ) : (
          gaps.map((g) => {
            const added = wished.has(g.name.toLowerCase())
            return (
              <View key={g.key} style={st.gap}>
                <View style={[st.gapSwatch, { backgroundColor: colorHex(g.color) }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.h3}>{g.name}</Text>
                  <Text style={[s.muted, { fontSize: 13 }]}>{g.reason}</Text>
                </View>
                <Pressable
                  disabled={added}
                  onPress={() => addWish({ name: g.name, category: g.category, notes: g.reason })}
                  style={[st.wishBtn, added && { backgroundColor: C.pill }]}
                  accessibilityLabel={added ? 'On wishlist' : 'Add to wishlist'}
                >
                  <Ionicons name={added ? 'checkmark' : 'bag-add-outline'} size={18} color={added ? C.ink : '#fff'} />
                </Pressable>
              </View>
            )
          })
        )}
      </Section>


      {items.length > 0 && (
        <Section title="Your style" sub={`${Math.round(profile.neutralShare * 100)}% neutrals · ${profile.favorites} favourite${profile.favorites === 1 ? '' : 's'}`}>
          <View style={st.colorBar}>
            {profile.colors.map((c) => (
              <View key={c.key} style={{ flex: c.share, backgroundColor: colorHex(c.key) }} />
            ))}
          </View>
          <View style={s.wrap}>
            {profile.colors.slice(0, 5).map((c) => (
              <View key={c.key} style={[s.row, { gap: 6, marginRight: 8 }]}>
                <View style={[st.dot, { backgroundColor: colorHex(c.key) }]} />
                <Text style={[s.muted, { textTransform: 'capitalize' }]}>{c.key} {Math.round(c.share * 100)}%</Text>
              </View>
            ))}
          </View>
          <View style={{ gap: 8, marginTop: 4 }}>
            {profile.categories.map((c) => (
              <View key={c.key} style={[s.row, { gap: 10 }]}>
                <Text style={[s.muted, { width: 86 }]}>{catInfo(c.key).label}</Text>
                <View style={st.track}><View style={[st.fill, { width: `${Math.max(6, c.share * 100)}%` }]} /></View>
                <Text style={[s.muted, { width: 24, textAlign: 'right' }]}>{c.count}</Text>
              </View>
            ))}
          </View>
        </Section>
      )}

    </View>
  )
}

// Example friends for the "coming soon" preview. Nothing here is real data.
const FRIENDS = [
  { name: 'Sophie', initial: 'S', tone: '#D9C3A5', pieces: 48, items: [['shirt', '#F2EEE8'], ['shirt', '#3D6BC4'], ['footsteps', '#1D1D1F'], ['bag-handle', '#7A5134']] },
  { name: 'Lina', initial: 'L', tone: '#B9B4AE', pieces: 73, items: [['shirt', '#C8323B'], ['shirt', '#1F2F56'], ['bag-handle', '#D9C3A5'], ['footsteps', '#F2EEE8']] },
  { name: 'Noor', initial: 'N', tone: '#7A5134', pieces: 31, items: [['shirt', '#4F8A55'], ['shirt', '#F0A6C0'], ['footsteps', '#7A5134'], ['bag-handle', '#1D1D1F']] },
] as const

export function FriendsPreview() {
  return (
    <View style={{ gap: 12 }}>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1 }}>
          <Text style={st.sectionTitle}>Friends</Text>
          <Text style={s.muted}>See friends’ closets and borrow each other’s pieces</Text>
        </View>
        <View style={st.soon}><Text style={st.soonText}>Coming soon</Text></View>
      </View>

      <View style={{ opacity: 0.55 }} pointerEvents="none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {FRIENDS.map((f) => (
            <View key={f.name} style={st.friendCard}>
              <View style={st.friendGrid}>
                {f.items.map(([icon, color], i) => (
                  <View key={i} style={st.friendTile}>
                    <Ionicons name={`${icon}-outline` as keyof typeof Ionicons.glyphMap} size={24} color={color === '#F2EEE8' ? C.faint : color} />
                  </View>
                ))}
              </View>
              <View style={[s.row, { gap: 8 }]}>
                <View style={[st.avatar, { backgroundColor: f.tone }]}><Text style={st.avatarText}>{f.initial}</Text></View>
                <View>
                  <Text style={[s.h3, { fontSize: 14 }]}>{f.name}</Text>
                  <Text style={[s.muted, { fontSize: 12 }]}>{f.pieces} pieces</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={st.request}>
          <View style={[st.avatar, { backgroundColor: '#B9B4AE' }]}><Text style={st.avatarText}>L</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={[s.h3, { fontSize: 14 }]}>Lina wants to borrow your coat</Text>
            <Text style={[s.muted, { fontSize: 12 }]}>Saturday – Sunday</Text>
          </View>
          <View style={st.primary}><Text style={st.primaryText}>Lend</Text></View>
        </View>
      </View>

      <View style={st.soonCard}>
        <Ionicons name="people-outline" size={22} color={C.ink} />
        <Text style={[s.muted, { flex: 1, color: C.ink }]}>Soon you can invite friends with a link, browse what they share, and ask to borrow a piece for the weekend.</Text>
      </View>
    </View>
  )
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={st.sectionTitle}>{title}</Text>
        {sub && <Text style={s.muted}>{sub}</Text>}
      </View>
      {children}
    </View>
  )
}

const st = StyleSheet.create({
  todayLine: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 999, paddingVertical: 6, paddingLeft: 10, paddingRight: 16 },
  today: { flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: R.lg, padding: 10 },
  eyebrow: { fontSize: 12, color: C.muted, fontWeight: '500' },
  todayTitle: { fontSize: 19, fontWeight: '600', letterSpacing: -0.5, color: C.ink },
  primary: { backgroundColor: C.ink, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ghost: { alignSelf: 'flex-start', backgroundColor: C.pill, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  ghostText: { color: C.ink, fontWeight: '600', fontSize: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.pill, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 24, fontFamily: SERIF, letterSpacing: -0.4, color: C.ink },
  gap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: R.lg, padding: 10 },
  gapSwatch: { width: 56, height: 56, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  wishBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  colorBar: { flexDirection: 'row', height: 36, borderRadius: R.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.pill, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: C.ink },
  soon: { backgroundColor: C.ink, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  soonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  friendCard: { width: 150, gap: 10, backgroundColor: C.card, borderRadius: R.lg, padding: 8 },
  friendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  friendTile: { width: 65, height: 72, borderRadius: R.sm, backgroundColor: C.stage, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  request: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: R.lg, padding: 10, marginTop: 10 },
  soonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: C.faint },
})
