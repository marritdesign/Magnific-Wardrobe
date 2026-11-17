import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Banners } from '../../components/Banners'
import { TodayLine } from '../../components/Home'
import { OutfitGrid } from '../../components/OutfitGrid'
import { Rack } from '../../components/Rack'
import { Button, Chip, Empty, Title, TopTabs, s } from '../../components/ui'
import { useStore } from '../../lib/store'
import { C, R, SERIF } from '../../lib/theme'
import { CATEGORIES, COLORS, SEASONS, catInfo, itemLabel, type Item } from '../../lib/types'

// Taller tiles for long garments, shorter for small things: gives the grid a natural, board-like rhythm.
const RATIO: Record<string, number> = { dress: 1.4, trousers: 1.3, skirt: 1.15, jacket: 1.25, top: 1.05, shoes: 0.78, necklace: 0.85, earrings: 0.75, belt: 0.75, accessory: 0.88 }

function Masonry({ items, width }: { items: Item[]; width: number }) {
  const cols = width > 700 ? 3 : 2
  const gap = 8
  const colW = (width - gap * (cols - 1)) / cols
  const columns: Item[][] = Array.from({ length: cols }, () => [])
  const heights = new Array(cols).fill(0)
  for (const it of items) {
    const k = heights.indexOf(Math.min(...heights))
    columns[k].push(it)
    heights[k] += colW * (RATIO[it.category] ?? 1.1) + gap
  }
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {columns.map((col, i) => (
        <View key={i} style={{ width: colW, gap }}>
          {col.map((it) => (
            <Pressable key={it.id} onPress={() => router.push(`/item/${it.id}`)} style={({ pressed }) => [st.tile, { height: colW * (RATIO[it.category] ?? 1.1), opacity: pressed ? 0.85 : 1 }]}>
              <Image source={{ uri: it.imageUri }} style={st.tileImg} contentFit="contain" transition={150} accessibilityLabel={itemLabel(it)} />
              {it.favorite && <Ionicons name="heart" size={14} color={C.ink} style={st.fav} />}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  )
}

export default function Closet() {
  const { items, outfits, ready } = useStore()
  const [width, setWidth] = useState(0)
  const [cat, setCat] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const [color, setColor] = useState<string>()
  const [season, setSeason] = useState<string>()
  const [q, setQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [tab, setTab] = useState<'items' | 'outfits'>('items')

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
  const nFilters = (color ? 1 : 0) + (season ? 1 : 0)
  const searching = !!q || favOnly || nFilters > 0

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {items.length === 0 ? (
          <>
          <Title title="Closet" />
          <Empty icon="shirt-outline" title="Start your closet" text="Photograph something you own. It appears here, cut out and clean.">
            <Button kind="primary" title="Add first piece" onPress={() => router.push('/add')} />
          </Empty>
          </>
        ) : (
          <>
            <TopTabs
              value={tab}
              onChange={setTab}
              tabs={[{ key: 'items', label: 'My items', count: items.length }, { key: 'outfits', label: 'My outfits', count: outfits.length }]}
            />
            {tab === 'outfits' ? <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>{width > 0 && <OutfitGrid width={width} />}</View> : <>
            <View style={s.row}>
              <View style={[st.search]}>
                <TextInput style={{ flex: 1, fontSize: 15, color: C.ink, paddingVertical: 13 }} placeholder="Search your wardrobe" placeholderTextColor={C.muted} value={q} onChangeText={setQ} />
                <Ionicons name="search" size={18} color={C.ink} />
              </View>
              <Pressable accessibilityLabel="Favourites only" onPress={() => setFavOnly(!favOnly)} style={[st.round, favOnly && st.roundOn]}>
                <Ionicons name={favOnly ? 'heart' : 'heart-outline'} size={19} color={favOnly ? '#fff' : C.ink} />
              </Pressable>
              <Pressable accessibilityLabel="Filters" onPress={() => setShowFilters(!showFilters)} style={[st.round, nFilters > 0 && st.roundOn]}>
                <Ionicons name="funnel-outline" size={18} color={nFilters > 0 ? '#fff' : C.ink} />
              </Pressable>
            </View>
            {showFilters && (
              <View style={{ gap: 14, paddingVertical: 4 }}>
                <View style={s.wrap}>
                  {COLORS.map((c) => (
                    <Pressable key={c.id} accessibilityLabel={c.id} onPress={() => setColor(color === c.id ? undefined : c.id)} style={[st.swatch, { backgroundColor: c.hex }, color === c.id && st.swatchOn]} />
                  ))}
                </View>
                <View style={s.wrap}>
                  {SEASONS.map((x) => <Chip key={x} active={season === x} onPress={() => setSeason(season === x ? undefined : x)}>{x}</Chip>)}
                  {nFilters > 0 && <Pressable onPress={() => { setColor(undefined); setSeason(undefined) }} style={{ justifyContent: 'center', paddingHorizontal: 8 }}><Text style={s.muted}>Clear</Text></Pressable>}
                </View>
              </View>
            )}
            {cat !== 'all' && (
              <Pressable onPress={() => setCat('all')} style={[s.row, { gap: 4 }]} hitSlop={8}>
                <Ionicons name="chevron-back" size={18} color={C.ink} />
                <Text style={{ fontFamily: SERIF, fontSize: 24, color: C.ink }}>{catInfo(cat).label}</Text>
                <View style={st.countPill}><Text style={st.countText}>{filtered.length}</Text></View>
              </Pressable>
            )}
            {cat === 'all' && !searching ? (
              <View style={{ gap: 28 }}>
                <TodayLine />
                <Banners />
                {CATEGORIES.map((c) => (
                  <Rack key={c.id} category={c.id} items={filtered.filter((i) => i.category === c.id)} onSeeAll={() => setCat(c.id)} />
                ))}
              </View>
            ) : filtered.length === 0 ? (
              <Text style={[s.muted, { textAlign: 'center', padding: 24 }]}>Nothing matches these filters.</Text>
            ) : (
              <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>{width > 0 && <Masonry items={filtered} width={width} />}</View>
            )}
            </>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  tile: { backgroundColor: C.card, borderRadius: R.md, overflow: 'hidden' },
  tileImg: { position: 'absolute', top: '8%', bottom: '8%', left: '8%', right: '8%' },
  fav: { position: 'absolute', top: 10, right: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 18 },
  round: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  roundOn: { backgroundColor: C.ink },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  countPill: { backgroundColor: C.pill, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  countText: { fontSize: 12, fontWeight: '600', color: C.muted },
  swatchOn: { borderWidth: 2, borderColor: C.ink, transform: [{ scale: 1.1 }] },
})
