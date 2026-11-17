import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useStore } from '../lib/store'
import { C } from '../lib/theme'
import type { Item } from '../lib/types'
import { Button, Chip, Empty, OutfitBoard, s } from './ui'

/** Saved outfits as a two-column grid, with a favourites filter. */
export function OutfitGrid({ width }: { width: number }) {
  const { outfits, items } = useStore()
  const [favOnly, setFavOnly] = useState(false)
  const byId = new Map(items.map((i) => [i.id, i]))
  const list = outfits.filter((o) => !favOnly || o.favorite)
  const cols = width > 600 ? 3 : 2
  const gap = 12
  const w = Math.max(0, (width - (cols - 1) * gap) / cols)

  if (outfits.length === 0)
    return (
      <Empty icon="layers-outline" title="No outfits yet" text="Mix and match your items, or swipe through suggestions.">
        <Button kind="primary" title="Build an outfit" onPress={() => router.push('/outfit/new')} />
        <Button title="Get suggestions" onPress={() => router.navigate('/swipe')} />
      </Empty>
    )

  return (
    <View style={{ gap: 16 }}>
      <View style={s.row}>
        <Chip active={!favOnly} onPress={() => setFavOnly(false)}>All</Chip>
        <Chip active={favOnly} onPress={() => setFavOnly(true)}>Favourites</Chip>
      </View>
      {list.length === 0 ? (
        <Text style={[s.muted, { textAlign: 'center', padding: 24 }]}>No favourite outfits yet.</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {list.map((o) => (
            <Pressable key={o.id} onPress={() => router.push(`/outfit/${o.id}`)} style={{ width: w }}>
              <View style={{ height: w * 1.25 }}>
                <OutfitBoard compact items={o.itemIds.map((id) => byId.get(id)).filter(Boolean) as Item[]} />
              </View>
              <View style={[s.row, { justifyContent: 'space-between', marginTop: 8 }]}>
                <Text numberOfLines={1} style={{ color: o.name ? C.ink : C.muted, fontSize: 14, fontWeight: '500', letterSpacing: -0.2, flex: 1 }}>{o.name || 'Untitled'}</Text>
                {o.favorite && <Ionicons name="heart" size={13} color={C.ink} />}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
