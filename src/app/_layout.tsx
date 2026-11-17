import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StoreProvider } from '../lib/store'
import { C } from '../lib/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerShadowVisible: false,
            headerTintColor: C.ink,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: C.bg },
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ title: 'Add item', presentation: 'modal' }} />
          <Stack.Screen name="item/[id]" options={{ title: '' }} />
          <Stack.Screen name="outfit/[id]" options={{ title: 'Outfit' }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  )
}
