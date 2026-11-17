import { Ionicons } from '@expo/vector-icons'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Moodboard, type Layout } from '../../components/Moodboard'
import { Button, Chip, Empty, s } from '../../components/ui'
import { confirmDelete } from '../../lib/confirm'
import { useStore } from '../../lib/store'
import { C, R, SERIF } from '../../lib/theme'
import { OCCASIONS, catInfo, isBottom, itemLabel, type Category, type Item } from '../../lib/types'

const SLOTS: { cat: Category; optional?: boolean }[] = [
  { cat: 'top' }, { cat: 'trousers' }, { cat: 'skirt', optional: true }, { cat: 'dress', optional: true }, { cat: 'jacket', optional: true }, { cat: 'shoes' }, { cat: 'necklace', optional: true }, { cat: 'earrings', optional: true }, { cat: 'belt', optional: true }, { cat: 'accessory', optional: true },
]

export default function OutfitEditor() {
  const { id, item: preItem } = useLocalSearchParams<{ id: string; item?: string }>()
  const isNew = id === 'new'
  const { items, outfits, addOutfit, updateOutfit, deleteOutfit } = useStore()
  const existing = outfits.find((o) => o.id === id)
  const [selected, setSelected] = useState<string[]>(existing?.itemIds ?? (preItem ? [preItem] : []))
  const [name, setName] = useState(existing?.name ?? '')
  const [favorite, setFavorite] = useState(existing?.favorite ?? false)
  const [occasion, setOccasion] = useState(existing?.occasion)
  const [layout, setLayout] = useState<Layout>(existing?.layout ?? {})
  const [dragging, setDragging] = useState(false)
  const [saved, setSaved] = useState(false)
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const chosen = selected.map((x) => byId.get(x)).filter(Boolean) as Item[]

  if (!isNew && !existing) return <Empty icon="help-outline" title="Outfit not found" />
  if (items.length === 0)
    return (
      <Empty icon="shirt-outline" title="Add some items first">
        <Button kind="primary" title="Add item" onPress={() => router.push('/add')} />
      </Empty>
    )

  function pick(item: Item) {
    setSaved(false)
    setSelected((sel) => {
      if (sel.includes(item.id)) return sel.filter((x) => x !== item.id)
      const cat = (x: string) => byId.get(x)?.category ?? ''
      let next = sel
      if (item.category !== 'accessory') next = next.filter((x) => cat(x) !== item.category)
      if (isBottom(item.category)) next = next.filter((x) => !isBottom(cat(x)))
      if (item.category === 'dress') next = next.filter((x) => cat(x) !== 'top' && !isBottom(cat(x)))
      if (item.category === 'top' || isBottom(item.category)) next = next.filter((x) => cat(x) !== 'dress')
      return [...next, item.id]
    })
  }

  function shuffle() {
    const rnd = (c: Category) => {
      const pool = items.filter((i) => i.category === c)
      return pool.length ? pool[Math.floor(Math.random() * pool.length)].id : undefined
    }
    const dress = items.some((i) => i.category === 'dress') && Math.random() < 0.3
    const skirts = items.some((i) => i.category === 'skirt') && Math.random() < 0.35
    const ids = [...(dress ? [rnd('dress')] : [rnd('top'), skirts ? rnd('skirt') : rnd('trousers') ?? rnd('skirt')]), rnd('shoes'), Math.random() < 0.5 ? rnd('jacket') : undefined]
    setSelected(ids.filter(Boolean) as string[])
    setLayout({})
    setSaved(false)
  }

  function save() {
    const keep = Object.fromEntries(Object.entries(layout).filter(([k]) => selected.includes(k)))
    const data = { name: name.trim(), itemIds: selected, favorite, occasion, layout: keep }
    if (existing) updateOutfit(existing.id, data)
    else {
      const newId = addOutfit({ ...data, source: 'builder' })
      router.replace(`/outfit/${newId}`)
    }
    setSaved(true)
  }

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={st.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={st.circle} accessibilityLabel="Back" hitSlop={6}>
          <Ionicons name="chevron-back" size={20} color={C.ink} />
        </Pressable>
        <Text style={st.headerTitle}>{isNew ? 'New outfit' : 'Edit outfit'}</Text>
        <Pressable onPress={() => { setFavorite(!favorite); setSaved(false) }} style={st.circle} accessibilityLabel="Favourite" hitSlop={6}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={C.ink} />
        </Pressable>
      </View>
      <ScrollView scrollEnabled={!dragging} contentContainerStyle={[s.content, { gap: 26 }]} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 12 }}>
          <TextInput style={st.nameInput} value={name} onChangeText={(t) => { setName(t); setSaved(false) }} placeholder="Name your look" placeholderTextColor={C.faint} accessibilityLabel="Outfit name" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {OCCASIONS.map((o) => (
              <Chip key={o} active={occasion === o} onPress={() => { setOccasion(occasion === o ? undefined : o); setSaved(false) }}>{o[0].toUpperCase() + o.slice(1)}</Chip>
            ))}
          </ScrollView>
        </View>
        <View style={st.preview}>
          {chosen.length ? (
            <Moodboard
              items={chosen}
              layout={layout}
              onDrag={setDragging}
              onMove={(id, x, y) => { setLayout((l) => ({ ...l, [id]: { x, y } })); setSaved(false) }}
              onRemove={(it) => pick(it)}
            />
          ) : (
            <View style={st.hint}>
              <Ionicons name="sparkles-outline" size={22} color={C.muted} />
              <Text style={st.hintTitle}>Your moodboard</Text>
              <Text style={[s.muted, { textAlign: 'center' }]}>Tap pieces below, then drag them around to style your look</Text>
            </View>
          )}
        </View>
        <View style={st.tools}>
            {chosen.length > 0 && (
              <Pressable style={st.tool} onPress={() => { setSelected([]); setLayout({}); setSaved(false) }} accessibilityLabel="Clear">
                <Ionicons name="refresh" size={18} color={C.ink} />
              </Pressable>
            )}
            <Pressable style={st.tool} onPress={shuffle} accessibilityLabel="Shuffle">
              <Ionicons name="shuffle" size={20} color={C.ink} />
            </Pressable>
          </View>

        {SLOTS.map(({ cat, optional }) => {
          const pool = items.filter((i) => i.category === cat)
          if (!pool.length && optional) return null
          const info = catInfo(cat)
          return (
            <View key={cat} style={{ gap: 10 }}>
              <View style={s.row}>
                <Text style={st.section}>{info.label}</Text>
                <View style={st.countPill}><Text style={st.count}>{pool.length}</Text></View>
              </View>
              {pool.length ? (
                <View>
                  <View style={st.rail} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                    {pool.map((i) => {
                      const on = selected.includes(i.id)
                      return (
                        <Pressable key={i.id} onPress={() => pick(i)} style={{ width: 104 }} accessibilityLabel={itemLabel(i)} accessibilityState={{ selected: on }}>
                          <View style={st.hanger}><View style={st.dot} /><View style={st.stem} /></View>
                          <View style={[st.card, on && st.cardOn]}>
                            <View style={st.tile}>
                              <Image source={{ uri: i.imageUri }} style={st.img} contentFit="contain" />
                              {on && <View style={st.check}><Ionicons name="checkmark" size={13} color="#fff" /></View>}
                            </View>
                            <Text style={st.name} numberOfLines={1}>{i.name || info.single}</Text>
                          </View>
                        </Pressable>
                      )
                    })}
                  </ScrollView>
                </View>
              ) : (
                <Pressable onPress={() => router.push('/add')} style={st.empty}><Text style={s.muted}>No {info.label.toLowerCase()} yet. Add one ›</Text></Pressable>
              )}
            </View>
          )
        })}

        <View style={{ gap: 10 }}>
          <Pressable onPress={save} disabled={!selected.length} style={({ pressed }) => [st.save, (!selected.length || pressed) && { opacity: selected.length ? 0.85 : 0.35 }]}>
            <Text style={st.saveText}>{saved ? 'Saved ✓' : existing ? 'Save changes' : 'Save outfit'}</Text>
          </Pressable>
          {existing && (
            <Pressable onPress={() => confirmDelete('Delete this outfit?', 'It will also be removed from your week plan.', () => { router.back(); deleteOutfit(existing.id) })} style={{ alignSelf: 'center', padding: 10 }}>
              <Text style={{ color: C.danger, fontSize: 15, fontWeight: '500' }}>Delete outfit</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  headerTitle: { fontFamily: SERIF, fontSize: 24, color: C.ink, letterSpacing: -0.4 },
  circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  preview: { height: 380, backgroundColor: C.card, borderRadius: 24, padding: 8, overflow: 'hidden' },
  hint: { flex: 1, backgroundColor: '#F2F0ED', borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  hintTitle: { fontFamily: SERIF, fontSize: 24, color: C.ink },
  tools: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: -14 },
  tool: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  section: { fontFamily: SERIF, fontSize: 24, color: C.ink, letterSpacing: -0.4 },
  countPill: { backgroundColor: C.pill, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  count: { fontSize: 12, fontWeight: '600', color: C.muted },
  rail: { position: 'absolute', top: 4, left: -16, right: -16, height: 1, backgroundColor: '#CFC9C2' },
  hanger: { height: 18, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B3ACA4', marginTop: 0.5 },
  stem: { width: 1, height: 10, backgroundColor: '#CFC9C2' },
  card: { backgroundColor: C.card, borderRadius: R.md, padding: 5, gap: 5, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: C.ink },
  tile: { height: 104, backgroundColor: '#F2F0ED', borderRadius: R.sm, overflow: 'hidden' },
  img: { position: 'absolute', top: '8%', bottom: '8%', left: '8%', right: '8%' },
  check: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 11.5, color: C.ink, paddingHorizontal: 2, paddingBottom: 2 },
  empty: { backgroundColor: C.card, borderRadius: R.md, padding: 16 },
  nameInput: { fontFamily: SERIF, fontSize: 30, color: C.ink, letterSpacing: -0.5, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.line },
  save: { backgroundColor: '#2B2B2B', borderRadius: 999, paddingVertical: 17, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '500', letterSpacing: -0.2 },
})
