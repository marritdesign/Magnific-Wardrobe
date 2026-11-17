import { Tabs } from 'expo-router'
import { TabBar } from '../../components/TabBar'
import { C } from '../../lib/theme'

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Closet' }} />
      <Tabs.Screen name="swipe" options={{ title: 'Discover' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="plan" options={{ title: 'Week plan' }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist' }} />
    </Tabs>
  )
}
