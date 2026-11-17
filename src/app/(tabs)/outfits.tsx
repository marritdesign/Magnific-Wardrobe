import { Link, router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { Button, Chip, Empty, OutfitBoard, s } from '../../components/ui'
import { useStore } from '../../lib/store'
import { C } from '../../lib/theme'
import type { Item } from '../../lib/types'

export default function Outfits() {
  const { outfits, items } = useStore()
  const { width } = useWindowDimensions()
  const [favOnly, setFavOnly] = useState(false)
  const byId = new Map(items.map((i) => [i.id, i]))
  const list = outfits.filter((o) => !favOnly || o.favorite)
  const cols = width > 600 ? 3 : 2
  const w = (Math.min(width, 900) - 32 - (cols - 1) * 12) / cols

  return (
    <View style={s.screen}>
      {outfits.length === 0 ? (
        <Empty emoji="✨" title="No outfits yet" text="Mix and match your items, or swipe through suggestions.">
          <Button kind="primary" title="Build an outfit" onPress={() => router.push('/outfit/new')} />
          <Button title="Get suggestions" onPress={() => router.navigate('/swipe')} />
        </Empty>
      ) : (
        <FlatList
          data={list}
          key={cols}
          numColumns={cols}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          columnWrapperStyle={{ gap: 12 }}
          ListHeaderComponent={
            <View style={{ gap: 12 }}>
              <Button kind="primary" title="＋  New outfit" onPress={() => router.push('/outfit/new')} />
              <ScrollView horizontal contentContainerStyle={{ gap: 8 }} showsHorizontalScrollIndicator={false}>
                <Chip active={!favOnly} onPress={() => setFavOnly(false)}>All {outfits.length}</Chip>
                <Chip active={favOnly} onPress={() => setFavOnly(true)}>❤️ Favourites</Chip>
              </ScrollView>
            </View>
          }
          ListEmptyComponent={<Text style={[s.muted, { textAlign: 'center', padding: 24 }]}>No favourite outfits yet.</Text>}
          renderItem={({ item: o }) => (
            <Link href={`/outfit/${o.id}`} asChild>
              <Pressable style={{ width: w }}>
                <View style={{ height: w * 1.25 }}>
                  <OutfitBoard compact items={o.itemIds.map((id) => byId.get(id)).filter(Boolean) as Item[]} />
                </View>
                <View style={[s.row, { justifyContent: 'space-between', marginTop: 6 }]}>
                  <Text numberOfLines={1} style={{ color: o.name ? C.ink : C.muted, fontWeight: '500', flex: 1 }}>{o.name || 'Untitled outfit'}</Text>
                  {o.favorite && <Text>❤️</Text>}
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  )
}
