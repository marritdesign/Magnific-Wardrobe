import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { C, R } from '../lib/theme'
import { catInfo, itemLabel, type Category, type Item } from '../lib/types'
import { s } from './ui'

// Clothes hang from a rail; shoes and accessories stand on a shelf.
const ON_SHELF = new Set<string>(['shoes', 'accessory'])
const HEIGHT: Record<string, number> = { top: 150, trousers: 180, skirt: 150, dress: 200, jacket: 180, shoes: 100, accessory: 110 }
const W = 120

export function Rack({ category, items, onSeeAll }: { category: Category; items: Item[]; onSeeAll: () => void }) {
  const info = catInfo(category)
  const shelf = ON_SHELF.has(category)
  const h = HEIGHT[category] ?? 150

  return (
    <View style={{ gap: 10 }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Text style={st.title}>
          {info.label} <Text style={st.count}>{items.length}</Text>
        </Text>
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
              <View style={[st.tile, { height: h }]}>
                <Image source={{ uri: it.imageUri }} style={st.img} contentFit="contain" transition={150} />
                {it.favorite && <Ionicons name="heart" size={12} color={C.ink} style={st.fav} />}
              </View>
            </Pressable>
          ))}
          <Pressable onPress={() => router.push({ pathname: '/add', params: { category } })} style={{ width: items.length ? 84 : 200 }} accessibilityLabel={`Add ${info.single.toLowerCase()}`}>
            {!shelf && <View style={{ height: 22 }} />}
            <View style={[st.add, { height: items.length ? h : Math.min(h, 120) }]}>
              <Ionicons name="add" size={22} color={C.muted} />
              {items.length === 0 && <Text style={[s.muted, { fontSize: 13 }]}>Add your first {info.single.toLowerCase()}</Text>}
            </View>
          </Pressable>
        </ScrollView>
        {shelf && <View style={st.shelf} />}
      </View>
    </View>
  )
}

/** A small hanger: hook and shoulders, hanging from the rail above. */
function Hanger() {
  return (
    <View style={st.hanger}>
      <View style={st.hook} />
      <View style={st.shoulders}>
        <View style={[st.arm, { transform: [{ rotate: '-22deg' }], right: '48%' }]} />
        <View style={[st.arm, { transform: [{ rotate: '22deg' }], left: '48%' }]} />
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '600', letterSpacing: -0.5, color: C.ink },
  count: { fontSize: 15, fontWeight: '500', color: C.muted },
  seeAll: { color: C.muted, fontSize: 14, fontWeight: '500' },
  rail: { position: 'absolute', top: 2, left: -16, right: -16, height: 3, borderRadius: 2, backgroundColor: '#C9C3BC' },
  hanger: { height: 22, alignItems: 'center' },
  hook: { width: 2, height: 10, backgroundColor: '#A39C94', marginTop: 2 },
  shoulders: { width: 60, height: 10 },
  arm: { position: 'absolute', top: 4, width: 32, height: 2, borderRadius: 1, backgroundColor: '#A39C94' },
  tile: { backgroundColor: C.stage, borderRadius: R.md, overflow: 'hidden' },
  img: { position: 'absolute', top: '7%', bottom: '7%', left: '8%', right: '8%' },
  fav: { position: 'absolute', top: 8, right: 8 },
  add: { borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 },
  shelf: { height: 6, borderRadius: 3, backgroundColor: '#DCD6CF', marginTop: 6, marginHorizontal: -16 },
})
