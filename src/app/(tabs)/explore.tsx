import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Explore, FriendsPreview } from '../../components/Home'
import { TopTabs, s } from '../../components/ui'
import { Wishlist } from '../../components/Wishlist'
import { useStore } from '../../lib/store'

type Tab = 'ideas' | 'friends' | 'wishlist'

export default function DiscoverScreen() {
  const { wishlist } = useStore()
  const params = useLocalSearchParams<{ wish?: string; friends?: string }>()
  const [tab, setTab] = useState<Tab>('ideas')
  const [seen, setSeen] = useState<string>()
  // The central + opens a new wish here with ?wish=<timestamp>; the friends banner uses ?friends=<timestamp>.
  const req = params.wish ?? params.friends
  if (req && req !== seen) {
    setSeen(req)
    setTab(params.wish ? 'wishlist' : 'friends')
  }
  const wanted = wishlist.filter((w) => !w.bought).length

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <TopTabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[{ key: 'ideas', label: 'Ideas' }, { key: 'friends', label: 'Friends' }, { key: 'wishlist', label: 'Wishlist', count: wanted }]}
        />
        {tab === 'ideas' ? <Explore /> : tab === 'friends' ? <FriendsPreview /> : <Wishlist newRequest={params.wish} />}
      </ScrollView>
    </SafeAreaView>
  )
}
