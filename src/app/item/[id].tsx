import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ItemForm, type ItemDraft } from '../../components/ItemForm'
import { Button, Empty, s } from '../../components/ui'
import { confirmDelete } from '../../lib/confirm'
import { useStore } from '../../lib/store'
import { C, R } from '../../lib/theme'
import { itemLabel } from '../../lib/types'

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { items, outfits, updateItem, deleteItem } = useStore()
  const item = items.find((i) => i.id === id)
  if (!item) return <Empty emoji="🤷" title="Item not found" />

  const inOutfits = outfits.filter((o) => o.itemIds.includes(item.id)).length
  const draft: ItemDraft = { name: item.name, category: item.category, color: item.color, seasons: item.seasons, occasions: item.occasions, brand: item.brand, favorite: item.favorite }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Stack.Screen
        options={{
          title: itemLabel(item),
          headerRight: () => (
            <Pressable accessibilityLabel="Favourite" onPress={() => updateItem(item.id, { favorite: !item.favorite })} hitSlop={10}>
              <Ionicons name={item.favorite ? 'heart' : 'heart-outline'} size={24} color={item.favorite ? C.accent : C.ink} />
            </Pressable>
          ),
        }}
      />
      <View style={st.stage}><Image source={{ uri: item.imageUri }} style={StyleSheet.absoluteFill} contentFit="contain" /></View>
      <View style={s.row}>
        <Button kind="primary" title="Style this item" style={{ flex: 1 }} onPress={() => router.push(`/outfit/new?item=${item.id}`)} />
        <Button title="Add another" style={{ flex: 1 }} onPress={() => router.push('/add')} />
      </View>
      <Text style={[s.muted, { textAlign: 'center' }]}>In {inOutfits} saved outfit{inOutfits === 1 ? '' : 's'} · changes save automatically</Text>
      <ItemForm draft={draft} onChange={(d) => updateItem(item.id, d)} />
      <Button
        kind="danger"
        title="Delete item"
        onPress={() => confirmDelete('Delete this item?', 'It will also be removed from your outfits.', () => { router.back(); deleteItem(item.id) })}
      />
    </ScrollView>
  )
}

const st = StyleSheet.create({
  stage: { aspectRatio: 1, backgroundColor: C.card, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
})
