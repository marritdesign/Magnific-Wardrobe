import { Link, router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button, Chip, Empty, OutfitBoard, Title, s } from '../../components/ui'
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
    <SafeAreaView edges={['top']} style={s.screen}>
      {outfits.length === 0 ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Title title="Outfits" />
        <Empty icon="layers-outline" title="No outfits yet" text="Mix and match your items, or swipe through suggestions.">
          <Button kind="primary" title="Build an outfit" onPress={() => router.push('/outfit/new')} />
          <Button title="Get suggestions" onPress={() => router.navigate('/swipe')} />
        </Empty>
        </View>
      ) : (
        <FlatList
          data={list}
          key={cols}
          numColumns={cols}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 16, paddingBottom: 140 }}
          columnWrapperStyle={{ gap: 12 }}
          ListHeaderComponent={
            <View style={{ gap: 16 }}>
              <Title
                title="Outfits"
                sub={`${outfits.length} saved`}
                right={
                  <Pressable accessibilityLabel="New outfit" onPress={() => router.push('/outfit/new')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <Ionicons name="add" size={26} color="#fff" />
                  </Pressable>
                }
              />
              <ScrollView horizontal contentContainerStyle={{ gap: 8 }} showsHorizontalScrollIndicator={false}>
                <Chip active={!favOnly} onPress={() => setFavOnly(false)}>All</Chip>
                <Chip active={favOnly} onPress={() => setFavOnly(true)}>Favourites</Chip>
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
                <View style={[s.row, { justifyContent: 'space-between', marginTop: 8 }]}>
                  <Text numberOfLines={1} style={{ color: o.name ? C.ink : C.muted, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, flex: 1 }}>{o.name || 'Untitled'}</Text>
                  {o.favorite && <Ionicons name="heart" size={13} color={C.ink} />}
                </View>
              </Pressable>
            </Link>
          )}
        />
      )}
    </SafeAreaView>
  )
}
