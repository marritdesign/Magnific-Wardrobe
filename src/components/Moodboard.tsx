import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { C } from '../lib/theme'
import { itemLabel, type Item } from '../lib/types'

export type Layout = Record<string, { x: number; y: number }>

/** Size of a piece as a fraction of the canvas width. */
const SIZE: Record<string, number> = { top: 0.42, trousers: 0.44, skirt: 0.4, dress: 0.52, jacket: 0.4, shoes: 0.28, necklace: 0.22, earrings: 0.18, belt: 0.3, accessory: 0.26 }
/** Where a piece lands when it is first added. */
const SPOT: Record<string, { x: number; y: number }> = {
  top: { x: 0.32, y: 0.26 }, trousers: { x: 0.32, y: 0.66 }, skirt: { x: 0.32, y: 0.64 }, dress: { x: 0.32, y: 0.45 },
  jacket: { x: 0.74, y: 0.26 }, shoes: { x: 0.74, y: 0.84 }, necklace: { x: 0.72, y: 0.55 }, earrings: { x: 0.9, y: 0.52 },
  belt: { x: 0.32, y: 0.46 }, accessory: { x: 0.8, y: 0.66 },
}

export function defaultSpot(item: Item, layout: Layout) {
  const base = SPOT[item.category] ?? { x: 0.5, y: 0.5 }
  // Nudge a little when the spot is already taken, so pieces don't hide each other.
  const taken = Object.values(layout).filter((p) => Math.abs(p.x - base.x) < 0.05 && Math.abs(p.y - base.y) < 0.05).length
  return { x: Math.min(0.9, base.x + taken * 0.08), y: Math.min(0.9, base.y + taken * 0.06) }
}

/** A free-form canvas: drag pieces around, tap × to remove them. */
export function Moodboard({ items, layout, onMove, onRemove, onDrag }: { items: Item[]; layout: Layout; onMove: (id: string, x: number, y: number) => void; onRemove: (item: Item) => void; onDrag?: (active: boolean) => void }) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [order, setOrder] = useState<string[]>([])
  const z = (id: string) => order.indexOf(id) + 1
  return (
    <View style={st.canvas} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 &&
        items.map((it) => (
          <Piece
            key={it.id}
            item={it}
            pos={layout[it.id] ?? defaultSpot(it, layout)}
            w={size.w}
            h={size.h}
            z={z(it.id)}
            onFront={(id) => { setOrder((o) => [...o.filter((x) => x !== id), id]); onDrag?.(true) }}
            onMove={(id, x, y) => { onDrag?.(false); onMove(id, x, y) }}
            onRemove={() => onRemove(it)}
          />
        ))}
    </View>
  )
}

function Piece({ item, pos, w, h, z, onFront, onMove, onRemove }: { item: Item; pos: { x: number; y: number }; w: number; h: number; z: number; onFront: (id: string) => void; onMove: (id: string, x: number, y: number) => void; onRemove: () => void }) {
  const box = (SIZE[item.category] ?? 0.3) * w
  const tx = useSharedValue(pos.x * w - box / 2)
  const ty = useSharedValue(pos.y * h - box / 2)
  const sx = useSharedValue(0)
  const sy = useSharedValue(0)
  const lift = useSharedValue(1)

  const id = item.id
  const pan = Gesture.Pan()
    .minDistance(2)
    .onBegin(() => {
      sx.value = tx.value
      sy.value = ty.value
      lift.value = 1.06
      runOnJS(onFront)(id)
    })
    .onUpdate((e) => {
      tx.value = Math.min(w - box / 2, Math.max(-box / 2, sx.value + e.translationX))
      ty.value = Math.min(h - box / 2, Math.max(-box / 2, sy.value + e.translationY))
    })
    .onFinalize(() => {
      lift.value = 1
      runOnJS(onMove)(id, (tx.value + box / 2) / w, (ty.value + box / 2) / h)
    })

  // Follow outside changes (shuffle, a reset) after the gesture is set up.
  useEffect(() => {
    tx.value = pos.x * w - box / 2
    ty.value = pos.y * h - box / 2
  }, [pos.x, pos.y, w, h, box, tx, ty])

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: lift.value }] }))

  return (
    <Animated.View style={[st.piece, { width: box, height: box, zIndex: z }, style]}>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill} accessibilityLabel={`Move ${itemLabel(item)}`}>
          <Image source={{ uri: item.imageUri }} style={{ flex: 1, pointerEvents: 'none' }} contentFit="contain" />
        </View>
      </GestureDetector>
      <Pressable onPress={onRemove} hitSlop={8} style={st.remove} accessibilityLabel={`Remove ${itemLabel(item)}`}>
        <Ionicons name="close" size={12} color={C.ink} />
      </Pressable>
    </Animated.View>
  )
}

const st = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: '#F2F0ED', borderRadius: 18, overflow: 'hidden' },
  piece: { position: 'absolute', left: 0, top: 0 },
  remove: { position: 'absolute', top: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
})

/** Read-only version of a saved moodboard, for outfit cards and the week plan. */
export function StaticMoodboard({ items, layout }: { items: Item[]; layout: Layout }) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  return (
    <View style={[st.canvas, { borderRadius: 12 }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 &&
        items.map((it) => {
          const p = layout[it.id] ?? defaultSpot(it, {})
          const box = (SIZE[it.category] ?? 0.3) * size.w
          return <Image key={it.id} source={{ uri: it.imageUri }} contentFit="contain" style={{ position: 'absolute', width: box, height: box, left: p.x * size.w - box / 2, top: p.y * size.h - box / 2 }} />
        })}
    </View>
  )
}
