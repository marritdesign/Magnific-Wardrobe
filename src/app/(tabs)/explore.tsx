import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Explore } from '../../components/Home'
import { Title, s } from '../../components/ui'

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content}>
        <Title title="Explore" sub="Ideas for your closet" />
        <Explore />
      </ScrollView>
    </SafeAreaView>
  )
}
