import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Explore } from '../../components/Home'
import { Title, s } from '../../components/ui'
import { Wishlist } from '../../components/Wishlist'
import { useStore } from '../../lib/store'
import { C } from '../../lib/theme'

export default function ExploreScreen() {
  const { wishlist } = useStore()
  const params = useLocalSearchParams<{ wish?: string }>()
  const [tab, setTab] = useState<'ideas' | 'wishlist'>('ideas')
  const [seenWish, setSeenWish] = useState<string>()
  // The central + opens a new wish here with ?wish=<timestamp>
  if (params.wish && params.wish !== seenWish) {
    setSeenWish(params.wish)
    setTab('wishlist')
  }
  const wanted = wishlist.filter((w) => !w.bought).length

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Title title="Explore" />
        <View style={st.seg}>
          {(['ideas', 'wishlist'] as const).map((k) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[st.segBtn, tab === k && st.segOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={[st.segText, tab === k && { color: C.ink }]}>
                {k === 'ideas' ? 'Ideas' : 'Wishlist'}
                {k === 'wishlist' && <Text style={{ color: C.muted, fontWeight: '500' }}> {wanted}</Text>}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === 'ideas' ? <Explore /> : <Wishlist newRequest={params.wish} />}
      </ScrollView>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: C.pill, borderRadius: 999, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  segOn: { backgroundColor: C.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  segText: { fontSize: 15, fontWeight: '600', color: C.muted, letterSpacing: -0.2 },
})
