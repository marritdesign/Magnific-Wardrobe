import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { Fragment, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { C, R } from '../lib/theme'

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index: ['shirt-outline', 'shirt'],
  explore: ['compass-outline', 'compass'],
  swipe: ['heart-outline', 'heart'],
  plan: ['calendar-clear-outline', 'calendar-clear'],
}

const ACTIONS: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; go: () => void }[] = [
  { icon: 'camera-outline', title: 'Add clothing item', sub: 'Take or choose a photo', go: () => router.push('/add') },
  { icon: 'layers-outline', title: 'New outfit', sub: 'Mix and match your items', go: () => router.push('/outfit/new') },
  { icon: 'bag-add-outline', title: 'Add to wishlist', sub: 'Something you’d like to buy', go: () => router.navigate({ pathname: '/explore', params: { wish: String(Date.now()) } }) },
]

/** Floating dark pill with icon-only tabs and one central + for adding anything. */
export function TabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const [open, setOpen] = useState(false)
  const middle = Math.floor(state.routes.length / 2)
  const bottom = Math.max(insets.bottom, 12) + 8

  return (
    <>
      <View pointerEvents="box-none" style={[st.wrap, { bottom }]}>
        <View style={st.bar}>
          {state.routes.map((route, i) => {
            const focused = state.index === i
            const [off, on] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse']
            const { options } = descriptors[route.key]
            return (
              <Fragment key={route.key}>
                {i === middle && (
                  <Pressable accessibilityLabel="Add" onPress={() => setOpen(true)} style={st.plusWrap}>
                    <View style={st.plus}><Ionicons name="add" size={26} color={C.ink} /></View>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={options.title ?? route.name}
                  onPress={() => { if (!focused) navigateToTab(route.key) }}
                  style={st.tab}
                >
                  <Ionicons name={focused ? on : off} size={22} color={focused ? '#fff' : '#7C7873'} />
                  <View style={[st.dot, { opacity: focused ? 1 : 0 }]} />
                </Pressable>
              </Fragment>
            )
          })}
        </View>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={st.backdrop} onPress={() => setOpen(false)}>
          <View style={[st.sheet, { marginBottom: bottom }]}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.title}
                onPress={() => { setOpen(false); a.go() }}
                style={({ pressed }) => [st.action, pressed && { backgroundColor: C.pill }]}
              >
                <View style={st.actionIcon}><Ionicons name={a.icon} size={22} color={C.ink} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.actionTitle}>{a.title}</Text>
                  <Text style={st.actionSub}>{a.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', backgroundColor: C.ink, borderRadius: 999, paddingHorizontal: 8, height: 60, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  tab: { width: 50, height: 60, alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  plusWrap: { width: 58, height: 60, alignItems: 'center', justifyContent: 'center' },
  plus: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(17,17,17,0.35)', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: C.card, borderRadius: R.lg, padding: 8, gap: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: R.md },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.pill, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '600', color: C.ink, letterSpacing: -0.2 },
  actionSub: { fontSize: 13, color: C.muted },
})
