import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { Pressable, StyleSheet, View } from 'react-native'
import { C } from '../lib/theme'

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index: ['shirt-outline', 'shirt'],
  outfits: ['layers-outline', 'layers'],
  swipe: ['heart-outline', 'heart'],
  plan: ['calendar-clear-outline', 'calendar-clear'],
  wishlist: ['bag-handle-outline', 'bag-handle'],
}

/** Floating dark pill with icon-only tabs. */
export function TabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View pointerEvents="box-none" style={[st.wrap, { bottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View style={st.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i
          const [off, on] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse']
          const { options } = descriptors[route.key]
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.title ?? route.name}
              onPress={() => { if (!focused) navigateToTab(route.key) }}
              style={st.tab}
            >
              <Ionicons name={focused ? on : off} size={22} color={focused ? '#fff' : '#7C7873'} />
              <View style={[st.dot, { opacity: focused ? 1 : 0 }]} />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', backgroundColor: C.ink, borderRadius: 999, paddingHorizontal: 10, height: 60, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  tab: { width: 56, height: 60, alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
})
