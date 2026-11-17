import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Chip, Empty, Title, s } from '../../components/ui'
import { currentSeason } from '../../lib/dates'
import { useStore } from '../../lib/store'
import { comboKey, score, suggest } from '../../lib/suggest'
import { C, R, SERIF } from '../../lib/theme'
import { OCCASIONS, SEASONS, isBottom, itemLabel, type Item } from '../../lib/types'

type Cell = Item | null
// Three big reels for the outfit, then three small ones for the finishing touches.
const SLOTS: { label: string; empty: string; cats: string[]; small?: boolean }[] = [
  { label: 'Top or dress', empty: 'No tops yet', cats: ['top', 'dress'] },
  { label: 'Bottom', empty: 'Dress', cats: ['trousers', 'skirt'] },
  { label: 'Shoes', empty: 'No shoes yet', cats: ['shoes'] },
  { label: 'Necklace', empty: 'None', cats: ['necklace'], small: true },
  { label: 'Earrings', empty: 'None', cats: ['earrings'], small: true },
  { label: 'Belt', empty: 'None', cats: ['belt'], small: true },
]
const DURATION = [900, 1250, 1600, 1100, 1400, 1700]
const MAIN = [0, 1, 2]
const SPIN_CELLS = 14
const SMALL = 84

const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

/** "Style me" as a fruit machine: three reels (top, bottom, shoes) that spin and stop on an outfit. Lock a reel to keep it. */
export default function StyleMe() {
  const { items, outfits, addOutfit, ready } = useStore()
  const [season, setSeason] = useState<string | undefined>(currentSeason())
  const [occasion, setOccasion] = useState<string>()
  const [locked, setLocked] = useState<boolean[]>(SLOTS.map(() => false))
  const [strips, setStrips] = useState<Cell[][]>()
  const [spinning, setSpinning] = useState(false)
  const [spins, setSpins] = useState(0)
  const [toast, setToast] = useState<string>()
  const [avail, setAvail] = useState(0)

  const pool = useMemo(() => {
    const ok = (i: Item) => (!season || !i.seasons.length || i.seasons.includes(season)) && (!occasion || !i.occasions.length || i.occasions.includes(occasion))
    const f = items.filter(ok)
    return SLOTS.map((sl) => f.filter((i) => sl.cats.includes(i.category)))
  }, [items, season, occasion])

  const result: Cell[] = strips ? strips.map((st) => st[st.length - 1]) : SLOTS.map(() => null)
  const extras = [3, 4, 5].filter((k) => pool[k].length > 0)
  const h = avail > 0 ? Math.max(60, Math.min(190, (avail - 16 - (extras.length ? SMALL + 8 : 0)) / 3)) : 0
  const outfit = result.filter(Boolean) as Item[]
  const savedKeys = useMemo(() => new Set(outfits.map((o) => comboKey(o.itemIds))), [outfits])
  const saved = outfit.length > 0 && savedKeys.has(comboKey(outfit.map((i) => i.id)))
  const canPlay = pool[0].length > 0 && (pool[1].length > 0 || pool[0].some((i) => i.category === 'dress'))

  function spin() {
    if (!canPlay || spinning) return
    // Pick a target that fits the locked reels, preferring good colour matches.
    const lockedItems = result.filter((c, k) => locked[k] && c) as Item[]
    const cands = suggest(items, 40, new Set(), { season, occasion }).filter((c) => lockedItems.every((l) => c.some((i) => i.id === l.id)))
    const best = cands[0]
    let target: Cell[] = [
      best?.find((i) => i.category === 'top' || i.category === 'dress') ?? rnd(pool[0]) ?? null,
      best?.find((i) => isBottom(i.category)) ?? rnd(pool[1]) ?? null,
      best?.find((i) => i.category === 'shoes') ?? rnd(pool[2]) ?? null,
      // Finishing touches: usually one, sometimes none.
      ...[3, 4, 5].map((k) => (Math.random() < 0.7 ? rnd(pool[k]) ?? null : null)),
    ]
    target = target.map((t, k) => (locked[k] ? result[k] : t))
    if (target[0]?.category === 'dress') target[1] = null
    else if (!target[1]) target[1] = rnd(pool[1]) ?? null
    setStrips(
      target.map((t, k) => {
        if (locked[k] && strips) return [t]
        const from = result[k]
        const n = SLOTS[k].small ? 8 + (k - 3) * 3 : SPIN_CELLS + k * 4
        const filler = Array.from({ length: n }, () => (SLOTS[k].small && Math.random() < 0.25 ? null : rnd(pool[k]) ?? null))
        return [from, ...filler, t]
      }),
    )
    setSpinning(true)
    setSpins((n) => n + 1)
    setTimeout(() => setSpinning(false), Math.max(...DURATION) + 50)
  }

  function toggle(k: number) {
    setLocked(locked.map((l, i) => (i === k ? !l : l)))
  }

  function lockBtn(k: number) {
    return (
      <Pressable
        onPress={() => toggle(k)}
        disabled={!strips || (k === 1 && result[0]?.category === 'dress')}
        accessibilityLabel={`${locked[k] ? 'Unlock' : 'Lock'} ${SLOTS[k].label}`}
        style={[st.lock, locked[k] && st.lockOn, !strips && { opacity: 0.35 }]}
      >
        <Ionicons name={locked[k] ? 'lock-closed' : 'lock-open-outline'} size={17} color={locked[k] ? '#fff' : C.ink} />
      </Pressable>
    )
  }

  function save() {
    if (!outfit.length || saved) return
    addOutfit({ name: '', itemIds: outfit.map((i) => i.id), favorite: false, source: 'swipe' })
    setToast('Saved to your outfits')
    setTimeout(() => setToast(undefined), 1400)
  }

  const verdict = !strips || spinning ? undefined : score(outfit) >= 1.35 ? 'Jackpot! These go great together ✨' : 'Nice combo. Lock what you like and spin again.'

  const filters = (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip active={!season} onPress={() => setSeason(undefined)}>Any season</Chip>
        {SEASONS.map((x) => <Chip key={x} active={season === x} onPress={() => setSeason(x)}>{x}</Chip>)}
        <View style={{ width: 1, backgroundColor: C.line, marginHorizontal: 4 }} />
        <Chip active={!occasion} onPress={() => setOccasion(undefined)}>Any occasion</Chip>
        {OCCASIONS.map((x) => <Chip key={x} active={occasion === x} onPress={() => setOccasion(x)}>{x}</Chip>)}
      </ScrollView>
    </View>
  )

  if (ready && !canPlay) {
    return (
      <SafeAreaView edges={['top']} style={[s.screen, { paddingHorizontal: 16, paddingTop: 8, gap: 16 }]}>
        <Title title="Style me" sub="Spin the reels for an outfit from your own closet" />
        {filters}
        <Empty icon="sparkles-outline" title={items.length < 3 ? 'Add a few more items' : 'Nothing fits these filters'} text="The reels need at least a top and a bottom (or a dress), and ideally shoes.">
          <Button kind="primary" title="Add item" onPress={() => router.push('/add')} />
        </Empty>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { paddingHorizontal: 16, paddingTop: 8, gap: 14, paddingBottom: 104 }]}>
      <Title title="Style me" sub="Spin the reels for an outfit from your own closet" />
      {filters}
      <View style={st.machine}>
        <View style={{ flex: 1, minHeight: 0, gap: 8 }} onLayout={(e) => setAvail(e.nativeEvent.layout.height)}>
          {h > 0 && MAIN.map((k) => (
            <View key={k} style={[s.row, { gap: 8 }]}>
              <View style={[st.window, { height: h }]}>
                <Reel strip={strips?.[k] ?? [null]} h={h} duration={DURATION[k]} spinKey={spins} placeholder={strips ? SLOTS[k].empty : SLOTS[k].label} />
                <View pointerEvents="none" style={[st.pay, { left: 0 }]} />
                <View pointerEvents="none" style={[st.pay, { right: 0, transform: [{ rotate: '180deg' }] }]} />
              </View>
              {lockBtn(k)}
            </View>
          ))}
          {h > 0 && extras.length > 0 && (
            <View style={[s.row, { gap: 8 }]}>
              {extras.map((k) => (
                <View key={k} style={{ flex: 1 }}>
                  <View style={[st.smallWindow, { height: SMALL }]}>
                    <Reel strip={strips?.[k] ?? [null]} h={SMALL} duration={DURATION[k]} spinKey={spins} placeholder={strips ? SLOTS[k].empty : SLOTS[k].label} small />
                    <Pressable onPress={() => toggle(k)} disabled={!strips} accessibilityLabel={`${locked[k] ? 'Unlock' : 'Lock'} ${SLOTS[k].label}`} style={[st.miniLock, locked[k] && st.lockOn, !strips && { opacity: 0.35 }]}>
                      <Ionicons name={locked[k] ? 'lock-closed' : 'lock-open-outline'} size={12} color={locked[k] ? '#fff' : C.ink} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <Text style={st.verdict}>{verdict ?? (strips ? ' ' : 'Tap Spin to start. Lock a reel to keep that piece.')}</Text>
      <View style={[s.row, { gap: 12 }]}>
        <Pressable onPress={spin} disabled={spinning} style={({ pressed }) => [st.spin, (pressed || spinning) && { opacity: 0.85 }]} accessibilityLabel="Spin">
          <Ionicons name="sync" size={20} color="#fff" />
          <Text style={st.spinText}>{spinning ? 'Spinning…' : strips ? 'Spin again' : 'Spin'}</Text>
        </Pressable>
        <Pressable onPress={save} disabled={!strips || spinning || saved} accessibilityLabel="Save outfit" style={[st.save, (!strips || spinning) && { opacity: 0.4 }]}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={C.ink} />
        </Pressable>
      </View>
      {toast && <View style={st.toast}><Text style={{ color: '#fff', fontWeight: '600' }}>{toast}</Text></View>}
    </SafeAreaView>
  )
}

/** One reel: a vertical strip of items that scrolls down and lands on the last one. */
function Reel({ strip, h, duration, spinKey, placeholder, small }: { strip: Cell[]; h: number; duration: number; spinKey: number; placeholder: string; small?: boolean }) {
  const y = useSharedValue(-(strip.length - 1) * h)
  useEffect(() => {
    if (strip.length > 1) {
      y.value = 0
      y.value = withTiming(-(strip.length - 1) * h, { duration, easing: Easing.bezier(0.15, 0.6, 0.25, 1.06) })
    } else y.value = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, h])
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))
  return (
    <Animated.View style={style} pointerEvents="none">
      {strip.map((it, i) => (
        <View key={i} style={{ height: h, alignItems: 'center', justifyContent: 'center' }}>
          {it ? (
            <>
              <Image source={{ uri: it.imageUri }} style={small ? { width: '70%', height: '70%' } : { width: '62%', height: '78%' }} contentFit="contain" accessibilityLabel={itemLabel(it)} />
              {i === strip.length - 1 && !small && <Text style={st.name} numberOfLines={1}>{it.name}</Text>}
            </>
          ) : (
            <Text style={[st.placeholder, small && { fontSize: 14 }]}>{placeholder}</Text>
          )}
        </View>
      ))}
    </Animated.View>
  )
}

const st = StyleSheet.create({
  smallWindow: { backgroundColor: '#F2F0ED', borderRadius: R.md, overflow: 'hidden' },
  machine: { flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: C.card, borderRadius: 28, padding: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  window: { flex: 1, backgroundColor: '#F2F0ED', borderRadius: R.lg, overflow: 'hidden' },
  pay: { position: 'absolute', top: '50%', marginTop: -7, width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 9, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#C4574B' },
  lock: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F0ED', alignItems: 'center', justifyContent: 'center' },
  miniLock: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  lockOn: { backgroundColor: C.ink },
  name: { position: 'absolute', bottom: 8, fontSize: 12, color: C.muted },
  placeholder: { fontFamily: SERIF, fontSize: 20, color: C.faint },
  verdict: { textAlign: 'center', color: C.muted, fontSize: 14, minHeight: 18 },
  spin: { flex: 1, height: 56, borderRadius: 28, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinText: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  save: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', top: 70, alignSelf: 'center', backgroundColor: C.ink, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
})
