import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { Button, Chip, Empty, OutfitBoard, s } from '../../components/ui'
import { currentSeason } from '../../lib/dates'
import { useStore } from '../../lib/store'
import { comboKey, suggest } from '../../lib/suggest'
import { C, R } from '../../lib/theme'
import { OCCASIONS, SEASONS, type Item } from '../../lib/types'

export default function Swipe() {
  const { items, outfits, skipped, addOutfit, skip, clearSkipped, ready } = useStore()
  const { width } = useWindowDimensions()
  const [season, setSeason] = useState<string | undefined>(currentSeason())
  const [occasion, setOccasion] = useState<string>()
  const [toast, setToast] = useState<string>()
  const [seed, setSeed] = useState(0)

  const exclude = useMemo(() => new Set([...skipped, ...outfits.map((o) => comboKey(o.itemIds))]), [skipped, outfits])

  // A fresh deck when filters or items change (or the deck runs out). Saved/skipped combos are left out.
  const deck = useMemo<Item[][]>(
    () => (ready ? suggest(items, 10, exclude, { season, occasion }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, items, season, occasion, seed],
  )
  const [cursor, setCursor] = useState(0)
  const [seenDeck, setSeenDeck] = useState(deck)
  if (seenDeck !== deck) {
    setSeenDeck(deck)
    setCursor(0)
  }

  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const throwDist = width * 1.3

  function decide(dir: 1 | -1) {
    const current = deck[cursor]
    if (!current) return
    const ids = current.map((i) => i.id)
    if (dir === 1) {
      addOutfit({ name: '', itemIds: ids, favorite: false, source: 'swipe' })
      setToast('Saved to outfits ❤️')
      setTimeout(() => setToast(undefined), 1300)
    } else skip(comboKey(ids))
    x.value = 0
    y.value = 0
    if (cursor + 1 >= deck.length) setSeed((n) => n + 1)
    else setCursor(cursor + 1)
  }

  function fly(dir: 1 | -1) {
    x.value = withTiming(dir * throwDist, { duration: 220 }, () => runOnJS(decide)(dir))
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => { x.value = e.translationX; y.value = e.translationY * 0.3 })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 110 || Math.abs(e.velocityX) > 900) {
        const dir = e.translationX > 0 ? 1 : -1
        x.value = withTiming(dir * throwDist, { duration: 200 }, () => runOnJS(decide)(dir))
      } else {
        x.value = withSpring(0)
        y.value = withSpring(0)
      }
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${x.value / 20}deg` }],
  }))
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 110], [0, 1], 'clamp') }))
  const nopeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-110, 0], [1, 0], 'clamp') }))
  const behindStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(Math.abs(x.value), [0, 150], [0.94, 1], 'clamp') }] }))

  const current = deck[cursor]
  const next = deck[cursor + 1]
  const filters = (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip active={!season} onPress={() => setSeason(undefined)}>Any season</Chip>
        {SEASONS.map((x) => <Chip key={x} active={season === x} onPress={() => setSeason(x)}>{x}</Chip>)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip active={!occasion} onPress={() => setOccasion(undefined)}>Any occasion</Chip>
        {OCCASIONS.map((x) => <Chip key={x} active={occasion === x} onPress={() => setOccasion(x)}>{x}</Chip>)}
      </ScrollView>
    </View>
  )

  if (!current) {
    const few = items.length < 3
    return (
      <View style={[s.screen, { padding: 16 }]}>
        {filters}
        <Empty
          emoji="🃏"
          title={few ? 'Add a few more items' : 'No new combinations'}
          text={few ? 'Suggestions need at least a top and a bottom (or a dress), and ideally shoes.' : 'Try another season or occasion, or add more items to your closet.'}
        >
          {few ? <Button kind="primary" title="Add item" onPress={() => router.push('/add')} /> : <Button title="Show skipped ones again" onPress={() => { clearSkipped(); setSeed((n) => n + 1) }} />}
        </Empty>
      </View>
    )
  }

  return (
    <View style={[s.screen, { padding: 16, gap: 14 }]}>
      {filters}
      <View style={{ flex: 1 }}>
        {next && (
          <Animated.View style={[st.card, behindStyle]}>
            <OutfitBoard items={next} />
          </Animated.View>
        )}
        <GestureDetector gesture={pan}>
          <Animated.View key={comboKey(current.map((i) => i.id))} style={[st.card, cardStyle]}>
            <View style={{ flex: 1 }} pointerEvents="none"><OutfitBoard items={current} /></View>
            <Animated.Text style={[st.stamp, st.like, likeStyle]}>SAVE</Animated.Text>
            <Animated.Text style={[st.stamp, st.nope, nopeStyle]}>SKIP</Animated.Text>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={[s.row, { justifyContent: 'center', gap: 36 }]}>
        <Pressable accessibilityLabel="Skip" onPress={() => fly(-1)} style={[st.round, { borderColor: C.nope }]}><Text style={{ fontSize: 26, color: C.nope }}>✕</Text></Pressable>
        <Pressable accessibilityLabel="Save" onPress={() => fly(1)} style={[st.round, { borderColor: C.like }]}><Text style={{ fontSize: 28, color: C.like }}>♥</Text></Pressable>
      </View>
      <Text style={[s.muted, { textAlign: 'center' }]}>Swipe right to save, left to skip</Text>
      {toast && <View style={st.toast}><Text style={{ color: '#fff', fontWeight: '600' }}>{toast}</Text></View>}
    </View>
  )
}

const st = StyleSheet.create({
  card: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.card, borderRadius: R.lg, padding: 10, borderWidth: 1, borderColor: C.line, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  stamp: { position: 'absolute', top: 24, fontSize: 30, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 4, borderWidth: 4, borderRadius: 10, letterSpacing: 2 },
  like: { left: 20, color: C.like, borderColor: C.like, transform: [{ rotate: '-12deg' }] },
  nope: { right: 20, color: C.nope, borderColor: C.nope, transform: [{ rotate: '12deg' }] },
  round: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: C.ink, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
})
