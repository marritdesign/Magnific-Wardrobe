import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, OutfitBoard, s } from '../../components/ui'
import { addDays, isoDate, startOfWeek } from '../../lib/dates'
import { useStore } from '../../lib/store'
import { C, R } from '../../lib/theme'
import type { Item } from '../../lib/types'

const DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Plan() {
  const { plans, outfits, items, setPlan } = useStore()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [picking, setPicking] = useState<string | null>(null)
  const byId = new Map(items.map((i) => [i.id, i]))
  const outfitItems = (oid: string) => (outfits.find((o) => o.id === oid)?.itemIds ?? []).map((id) => byId.get(id)).filter(Boolean) as Item[]
  const today = isoDate(new Date())
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const end = days[6]
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  const planned = days.filter((d) => plans[isoDate(d)]).length

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Pressable hitSlop={10} accessibilityLabel="Previous week" onPress={() => setWeekStart(addDays(weekStart, -7))}><Ionicons name="chevron-back" size={24} color={C.ink} /></Pressable>
          <Pressable onPress={() => setWeekStart(startOfWeek(new Date()))} style={{ alignItems: 'center' }}>
            <Text style={s.h3}>{fmt(weekStart)} – {fmt(end)}</Text>
            <Text style={s.muted}>{planned}/7 days planned</Text>
          </Pressable>
          <Pressable hitSlop={10} accessibilityLabel="Next week" onPress={() => setWeekStart(addDays(weekStart, 7))}><Ionicons name="chevron-forward" size={24} color={C.ink} /></Pressable>
        </View>
        {days.map((d, i) => {
          const key = isoDate(d)
          const oid = plans[key]
          const isToday = key === today
          return (
            <Pressable key={key} onPress={() => setPicking(key)} style={[st.day, isToday && { borderColor: C.accent, borderWidth: 2 }]}>
              <View style={st.dayLabel}>
                <Text style={[s.h3, isToday && { color: C.accent }]}>{DAY[i]}</Text>
                <Text style={s.muted}>{d.getDate()}</Text>
              </View>
              {oid ? (
                <View style={{ flex: 1, height: 120 }}><OutfitBoard compact items={outfitItems(oid)} /></View>
              ) : (
                <View style={st.emptyDay}><Text style={s.muted}>＋ Plan an outfit</Text></View>
              )}
            </Pressable>
          )
        })}
      </ScrollView>

      <Modal visible={!!picking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPicking(null)}>
        <SafeAreaView style={[s.screen, { padding: 16 }]}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={s.h1}>Pick an outfit</Text>
            <Pressable hitSlop={10} onPress={() => setPicking(null)} accessibilityLabel="Close"><Ionicons name="close" size={28} color={C.ink} /></Pressable>
          </View>
          {picking && plans[picking] && <Button kind="danger" title="Clear this day" style={{ marginBottom: 12 }} onPress={() => { setPlan(picking, null); setPicking(null) }} />}
          {outfits.length === 0 ? (
            <View style={{ gap: 12 }}>
              <Text style={s.muted}>You have no saved outfits yet.</Text>
              <Button kind="primary" title="Build an outfit" onPress={() => { setPicking(null); router.push('/outfit/new') }} />
            </View>
          ) : (
            <FlatList
              data={outfits}
              numColumns={2}
              keyExtractor={(o) => o.id}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
              renderItem={({ item: o }) => (
                <Pressable style={[{ flex: 1 / 2 }, picking && plans[picking] === o.id && { opacity: 0.5 }]} onPress={() => { setPlan(picking!, o.id); setPicking(null) }}>
                  <View style={{ height: 190 }}><OutfitBoard compact items={outfitItems(o.id)} /></View>
                  <Text numberOfLines={1} style={{ marginTop: 4, color: C.ink }}>{o.name || 'Untitled outfit'}{o.favorite ? ' ❤️' : ''}</Text>
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const st = StyleSheet.create({
  day: { flexDirection: 'row', gap: 12, backgroundColor: C.card, borderRadius: R.md, padding: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center' },
  dayLabel: { width: 44, alignItems: 'center' },
  emptyDay: { flex: 1, height: 70, borderRadius: R.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
})
