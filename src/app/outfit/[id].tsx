import { Ionicons } from '@expo/vector-icons'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button, Empty, ItemThumb, OutfitBoard, s } from '../../components/ui'
import { confirmDelete } from '../../lib/confirm'
import { useStore } from '../../lib/store'
import { C, R } from '../../lib/theme'
import { catInfo, isBottom, type Category, type Item } from '../../lib/types'

const SLOTS: { cat: Category; optional?: boolean }[] = [
  { cat: 'top' }, { cat: 'trousers' }, { cat: 'skirt', optional: true }, { cat: 'dress', optional: true }, { cat: 'jacket', optional: true }, { cat: 'shoes' }, { cat: 'accessory', optional: true },
]

export default function OutfitEditor() {
  const { id, item: preItem } = useLocalSearchParams<{ id: string; item?: string }>()
  const isNew = id === 'new'
  const { items, outfits, addOutfit, updateOutfit, deleteOutfit } = useStore()
  const existing = outfits.find((o) => o.id === id)
  const [selected, setSelected] = useState<string[]>(existing?.itemIds ?? (preItem ? [preItem] : []))
  const [name, setName] = useState(existing?.name ?? '')
  const [favorite, setFavorite] = useState(existing?.favorite ?? false)
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
    setSaved(false)
  }

  function save() {
    const data = { name: name.trim(), itemIds: selected, favorite }
    if (existing) updateOutfit(existing.id, data)
    else {
      const newId = addOutfit({ ...data, source: 'builder' })
      router.replace(`/outfit/${newId}`)
    }
    setSaved(true)
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: isNew ? 'New outfit' : 'Edit outfit',
          headerRight: () => (
            <Pressable hitSlop={10} accessibilityLabel="Favourite" onPress={() => { setFavorite(!favorite); setSaved(false) }}>
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={24} color={C.ink} />
            </Pressable>
          ),
        }}
      />
      <View style={st.preview}>
        {chosen.length ? <OutfitBoard items={chosen} /> : <View style={st.hint}><Text style={s.muted}>Tap items below to build your look</Text></View>}
        <Pressable style={st.shuffle} onPress={shuffle} accessibilityLabel="Shuffle"><Text style={{ fontSize: 22 }}>🎲</Text></Pressable>
      </View>
      {SLOTS.map(({ cat, optional }) => {
        const pool = items.filter((i) => i.category === cat)
        if (!pool.length && optional) return null
        const info = catInfo(cat)
        return (
          <View key={cat} style={{ gap: 8 }}>
            <Text style={s.label}>{info.label}</Text>
            {pool.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {pool.map((i) => {
                  const on = selected.includes(i.id)
                  return (
                    <Pressable key={i.id} onPress={() => pick(i)} style={[st.mini, on && st.miniOn]}>
                      <ItemThumb item={i} style={{ flex: 1, backgroundColor: 'transparent' }} />
                    </Pressable>
                  )
                })}
              </ScrollView>
            ) : (
              <Pressable onPress={() => router.push('/add')}><Text style={s.muted}>No {info.label.toLowerCase()} yet. Add one ›</Text></Pressable>
            )}
          </View>
        )
      })}
      <View>
        <Text style={s.label}>Outfit name</Text>
        <TextInput style={s.input} value={name} onChangeText={(t) => { setName(t); setSaved(false) }} placeholder="e.g. Friday office" placeholderTextColor={C.muted} />
      </View>
      <Button kind="primary" title={saved ? 'Saved ✓' : existing ? 'Save changes' : 'Save outfit'} disabled={!selected.length} onPress={save} />
      {existing && <Button kind="danger" title="Delete outfit" onPress={() => confirmDelete('Delete this outfit?', 'It will also be removed from your week plan.', () => { router.back(); deleteOutfit(existing.id) })} />}
    </ScrollView>
  )
}

const st = StyleSheet.create({
  preview: { height: 380 },
  hint: { flex: 1, backgroundColor: C.stage, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  shuffle: { position: 'absolute', right: 12, bottom: 12, width: 46, height: 46, borderRadius: 23, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  mini: { width: 84, height: 100, borderRadius: R.md, backgroundColor: C.stage, borderWidth: 2, borderColor: 'transparent', padding: 6 },
  miniOn: { borderColor: C.ink },
})
