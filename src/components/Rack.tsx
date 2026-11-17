import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { C, R, SERIF } from '../lib/theme'
import { catInfo, itemLabel, type Category, type Item } from '../lib/types'
import { s } from './ui'

// Clothes hang from a rail; shoes and accessories stand on a shelf.
const ON_SHELF = new Set<string>(['shoes', 'necklace', 'earrings', 'belt', 'accessory'])
const HEIGHT: Record<string, number> = { top: 150, trousers: 180, skirt: 150, dress: 200, jacket: 180, shoes: 100, necklace: 110, earrings: 100, belt: 100, accessory: 110 }
const W = 132

export function Rack({ category, items, onSeeAll }: { category: Category; items: Item[]; onSeeAll: () => void }) {
  const info = catInfo(category)
  const shelf = ON_SHELF.has(category)
  const h = HEIGHT[category] ?? 150

  return (
    <View style={{ gap: 10 }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <View style={s.row}>
          <Text style={st.title}>{info.label}</Text>
          <View style={st.countPill}><Text style={st.count}>{items.length}</Text></View>
        </View>
        {items.length > 0 && (
          <Pressable onPress={onSeeAll} hitSlop={8} style={s.row}>
            <Text style={st.seeAll}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={C.muted} />
          </Pressable>
        )}
      </View>
      <View>
        {!shelf && <View style={st.rail} />}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, alignItems: shelf ? 'flex-end' : 'flex-start' }}>
          {items.map((it) => (
            <Pressable key={it.id} onPress={() => router.push(`/item/${it.id}`)} style={({ pressed }) => ({ width: W, opacity: pressed ? 0.8 : 1 })} accessibilityLabel={itemLabel(it)}>
              {!shelf && <Hanger />}
              <View style={st.card}>
                <View style={[st.tile, { height: h }]}>
                  <Image source={{ uri: it.imageUri }} style={st.img} contentFit="contain" transition={150} />
                  <Ionicons name={it.favorite ? 'heart' : 'heart-outline'} size={14} color={it.favorite ? C.ink : C.faint} style={st.fav} />
                </View>
                <Text style={st.name} numberOfLines={1}>{it.name || info.single}</Text>
              </View>
            </Pressable>
          ))}
          {items.length === 0 && (
            <View style={{ width: 220 }}>
              {!shelf && <View style={{ height: 18 }} />}
              <View style={[st.add, { height: 90 }]}>
                <Text style={[s.muted, { fontSize: 13, textAlign: 'center' }]}>No {info.label.toLowerCase()} yet.{'\n'}Tap + below to add one.</Text>
              </View>
            </View>
          )}
        </ScrollView>
        {shelf && <View style={st.shelf} />}
      </View>
    </View>
  )
}

/** A small dot on the rail with a thin stem down to the card. */
function Hanger() {
  return (
    <View style={st.hanger}>
      <View style={st.dot} />
      <View style={st.stem} />
    </View>
  )
}

const st = StyleSheet.create({
  title: { fontFamily: SERIF, fontSize: 24, letterSpacing: -0.4, color: C.ink },
  countPill: { backgroundColor: C.pill, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  count: { fontSize: 12, fontWeight: '600', color: C.muted },
  seeAll: { color: C.muted, fontSize: 14, fontWeight: '500' },
  rail: { position: 'absolute', top: 4, left: -16, right: -16, height: 1, backgroundColor: '#CFC9C2' },
  hanger: { height: 18, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B3ACA4', marginTop: 0.5 },
  stem: { width: 1, height: 10, backgroundColor: '#CFC9C2' },
  card: { backgroundColor: C.card, borderRadius: R.md, padding: 6, gap: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  tile: { backgroundColor: '#F2F0ED', borderRadius: R.sm, overflow: 'hidden' },
  name: { fontSize: 12, color: C.ink, paddingHorizontal: 2, paddingBottom: 2, letterSpacing: -0.1 },
  img: { position: 'absolute', top: '7%', bottom: '7%', left: '8%', right: '8%' },
  fav: { position: 'absolute', top: 8, right: 8 },
  add: { borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 },
  shelf: { height: 6, borderRadius: 3, backgroundColor: '#DCD6CF', marginTop: 6, marginHorizontal: -16 },
})
