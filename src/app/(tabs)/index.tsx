import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native'
import { Button, Chip, Empty, ItemThumb, s } from '../../components/ui'
import { useStore } from '../../lib/store'
import { C, R } from '../../lib/theme'
import { CATEGORIES, COLORS, SEASONS, catInfo, itemLabel } from '../../lib/types'

export default function Closet() {
  const { items, ready } = useStore()
  const { width } = useWindowDimensions()
  const [cat, setCat] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const [color, setColor] = useState<string>()
  const [season, setSeason] = useState<string>()
  const [q, setQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (cat === 'all' || i.category === cat) &&
          (!favOnly || i.favorite) &&
          (!color || i.color === color) &&
          (!season || i.seasons.includes(season)) &&
          (!q || `${i.name} ${i.brand ?? ''} ${catInfo(i.category).single}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [items, cat, favOnly, color, season, q],
  )

  if (!ready) return <View style={s.screen} />

  if (items.length === 0)
    return (
      <View style={s.screen}>
        <Empty emoji="🧺" title="Your closet is empty" text="Take a photo of something you own to get started.">
          <Button kind="primary" title="Add first item" onPress={() => router.push('/add')} />
        </Empty>
      </View>
    )

  const cols = width > 600 ? 4 : 3
  const tile = (Math.min(width, 900) - 32 - (cols - 1) * 10) / cols
  const nFilters = (color ? 1 : 0) + (season ? 1 : 0)

  return (
    <View style={s.screen}>
      <FlatList
        data={filtered}
        key={cols}
        numColumns={cols}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <View style={s.row}>
              <TextInput style={[s.input, { flex: 1, paddingVertical: 10 }]} placeholder={`Search ${items.length} items`} placeholderTextColor={C.muted} value={q} onChangeText={setQ} />
              <Pressable accessibilityLabel="Favourites only" onPress={() => setFavOnly(!favOnly)} style={[st.iconBtn, favOnly && st.iconOn]}>
                <Ionicons name={favOnly ? 'heart' : 'heart-outline'} size={20} color={favOnly ? C.accent : C.ink} />
              </Pressable>
              <Pressable accessibilityLabel="Filters" onPress={() => setShowFilters(!showFilters)} style={[st.iconBtn, nFilters > 0 && st.iconOn]}>
                <Ionicons name="options-outline" size={20} color={C.ink} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip active={cat === 'all'} onPress={() => setCat('all')}>All</Chip>
              {CATEGORIES.map((c) => (
                <Chip key={c.id} active={cat === c.id} onPress={() => setCat(c.id)}>
                  {c.label} {items.filter((i) => i.category === c.id).length}
                </Chip>
              ))}
            </ScrollView>
            {showFilters && (
              <View style={[s.card, { padding: 12, gap: 12 }]}>
                <View style={s.wrap}>
                  {COLORS.map((c) => (
                    <Pressable key={c.id} accessibilityLabel={c.id} onPress={() => setColor(color === c.id ? undefined : c.id)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.hex, borderWidth: color === c.id ? 3 : 1, borderColor: color === c.id ? C.accent : C.line }} />
                  ))}
                </View>
                <View style={s.wrap}>
                  {SEASONS.map((x) => <Chip key={x} active={season === x} onPress={() => setSeason(season === x ? undefined : x)}>{x}</Chip>)}
                  {nFilters > 0 && <Chip onPress={() => { setColor(undefined); setSeason(undefined) }}>✕ Clear</Chip>}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={<Text style={[s.muted, { textAlign: 'center', padding: 24 }]}>No items match these filters.</Text>}
        renderItem={({ item }) => (
          <Link href={`/item/${item.id}`} asChild>
            <Pressable style={{ width: tile }}>
              <ItemThumb item={item} style={{ width: tile, height: tile * 1.15, backgroundColor: C.card, borderRadius: R.md }} />
              {item.favorite && <Text style={st.fav}>❤️</Text>}
              <Text numberOfLines={1} style={st.tileLabel}>{itemLabel(item)}</Text>
            </Pressable>
          </Link>
        )}
      />
      <Pressable accessibilityLabel="Add item" onPress={() => router.push('/add')} style={st.fab}>
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  )
}

const st = StyleSheet.create({
  iconBtn: { width: 44, height: 44, borderRadius: R.sm, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: C.accentSoft, borderColor: C.accent },
  fav: { position: 'absolute', top: 6, right: 8, fontSize: 14 },
  tileLabel: { fontSize: 12, color: C.muted, marginTop: 4, paddingHorizontal: 2 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
})
