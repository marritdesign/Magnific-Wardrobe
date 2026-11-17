import { Tabs } from 'expo-router'
import { TabBar } from '../../components/TabBar'
import { C } from '../../lib/theme'

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Closet' }} />
      <Tabs.Screen name="swipe" options={{ title: 'Style me' }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan outfit' }} />
      <Tabs.Screen name="explore" options={{ title: 'Discover' }} />
    </Tabs>
  )
}
