import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, OutfitBoard, Title, s } from '../../components/ui'
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
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content}>
        <Title
          title="This week"
          sub={`${fmt(weekStart)} – ${fmt(end)} · ${planned} of 7 planned`}
          right={
            <View style={[s.row, { marginBottom: 4 }]}>
              <Pressable accessibilityLabel="Previous week" onPress={() => setWeekStart(addDays(weekStart, -7))} style={st.nav}><Ionicons name="chevron-back" size={20} color={C.ink} /></Pressable>
              <Pressable accessibilityLabel="Next week" onPress={() => setWeekStart(addDays(weekStart, 7))} style={st.nav}><Ionicons name="chevron-forward" size={20} color={C.ink} /></Pressable>
            </View>
          }
        />
        {days.map((d, i) => {
          const key = isoDate(d)
          const oid = plans[key]
          const isToday = key === today
          return (
            <Pressable key={key} onPress={() => setPicking(key)} style={st.day}>
              <View style={st.dayLabel}>
                <Text style={[st.dayNum, isToday && st.today]}>{d.getDate()}</Text>
                <Text style={[s.muted, { fontSize: 13 }, isToday && { color: C.ink }]}>{isToday ? 'Today' : DAY[i]}</Text>
              </View>
              {oid ? (
                <View style={{ flex: 1, height: 130 }}><OutfitBoard compact items={outfitItems(oid)} /></View>
              ) : (
                <View style={st.emptyDay}><Ionicons name="add" size={18} color={C.muted} /><Text style={s.muted}>Plan an outfit</Text></View>
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
                  <Text numberOfLines={1} style={{ marginTop: 4, color: C.ink }}>{o.name || 'Untitled outfit'}</Text>
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  day: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  dayLabel: { width: 52, alignItems: 'center', gap: 2 },
  dayNum: { fontSize: 22, fontWeight: '600', letterSpacing: -0.8, color: C.ink, width: 40, height: 40, lineHeight: 40, textAlign: 'center', borderRadius: 20, overflow: 'hidden' },
  today: { backgroundColor: C.ink, color: '#fff' },
  emptyDay: { flex: 1, height: 64, borderRadius: R.lg, backgroundColor: C.pill, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  nav: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.pill, alignItems: 'center', justifyContent: 'center' },
})
