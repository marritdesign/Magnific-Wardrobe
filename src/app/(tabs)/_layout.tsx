import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { C } from '../../lib/theme'

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  function TabIcon({ color, size }: { color: import("react-native").ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />
  }

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: C.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 20, color: C.ink },
        headerTitleAlign: 'left',
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line },
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'My closet', tabBarLabel: 'Closet', tabBarIcon: icon('shirt-outline') }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfits', tabBarIcon: icon('layers-outline') }} />
      <Tabs.Screen name="swipe" options={{ title: 'Swipe outfits', tabBarLabel: 'Swipe', tabBarIcon: icon('heart-outline') }} />
      <Tabs.Screen name="plan" options={{ title: 'Week plan', tabBarLabel: 'Plan', tabBarIcon: icon('calendar-outline') }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarIcon: icon('bag-handle-outline') }} />
    </Tabs>
  )
}
