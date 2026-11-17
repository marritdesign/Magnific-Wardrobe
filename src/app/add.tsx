import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ItemForm, emptyDraft, type ItemDraft } from '../components/ItemForm'
import { Button, s } from '../components/ui'
import { cleanPhoto, isCleanupAvailable, persistImage, pickPhoto } from '../lib/images'
import { useStore } from '../lib/store'
import { C, R } from '../lib/theme'
import type { Category } from '../lib/types'

type Stage = 'pick' | 'working' | 'review'

export default function AddItem() {
  const params = useLocalSearchParams<{ wishId?: string; name?: string; category?: string }>()
  const { addItem, updateWish } = useStore()
  const [stage, setStage] = useState<Stage>('pick')
  const [original, setOriginal] = useState<string>()
  const [cleaned, setCleaned] = useState<string>()
  const [useCleaned, setUseCleaned] = useState(true)
  const [note, setNote] = useState<string>()
  const [draft, setDraft] = useState<ItemDraft>({
    ...emptyDraft(),
    ...(params.name ? { name: params.name } : {}),
    ...(params.category ? { category: params.category as Category } : {}),
  })

  async function process(uri: string) {
    setNote(undefined)
    setOriginal(uri)
    setCleaned(undefined)
    setStage('working')
    const out = await cleanPhoto(uri)
    if (out) {
      setCleaned(out)
      setUseCleaned(true)
    } else {
      setNote(
        isCleanupAvailable()
          ? "The background couldn't be removed from this photo (cut-out needs iOS 17 or newer). The original photo will be used."
          : 'Background removal runs in the installed app. In this preview the original photo is used.',
      )
    }
    setStage('review')
  }

  async function choose(src: 'camera' | 'library') {
    const uri = await pickPhoto(src)
    if (uri) process(uri)
  }


  function save() {
    if (!original) return
    const chosen = useCleaned && cleaned ? cleaned : original
    const id = addItem({
      ...draft,
      name: draft.name.trim(),
      imageUri: persistImage(chosen),
      originalUri: chosen !== original ? persistImage(original) : undefined,
      cleaned: chosen !== original,
    })
    if (params.wishId) updateWish(params.wishId, { bought: true })
    router.dismissTo('/')
    router.push(`/item/${id}`)
  }

  if (stage === 'pick')
    return (
      <View style={[s.screen, st.center]}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: C.pill, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Ionicons name="camera-outline" size={36} color={C.ink} /></View>
        <Text style={s.emptyTitle}>Photograph a clothing item</Text>
        <Text style={[s.muted, { textAlign: 'center', marginBottom: 12 }]}>
          Lay it flat or hang it against a plain wall in good light. The app cuts it out so it looks like a product photo.
        </Text>
        <Button kind="primary" title="Take photo" onPress={() => choose('camera')} style={{ alignSelf: 'stretch' }} />
        <Button title="Choose from photos" onPress={() => choose('library')} style={{ alignSelf: 'stretch' }} />
      </View>
    )

  if (stage === 'working')
    return (
      <View style={[s.screen, st.center]}>
        <ActivityIndicator size="large" color={C.ink} />
        <Text style={s.h3}>Cleaning up your photo…</Text>
        <Text style={s.muted}>This happens on your phone. Nothing is uploaded.</Text>
      </View>
    )

  const shown = useCleaned && cleaned ? cleaned : original
  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={st.stage}>{shown && <Image source={{ uri: shown }} style={StyleSheet.absoluteFill} contentFit="contain" />}</View>
        {note && <Text style={st.note}>{note}</Text>}
        {cleaned && (
          <View style={st.seg}>
            {(['Cleaned', 'Original'] as const).map((l) => {
              const on = (l === 'Cleaned') === useCleaned
              return (
                <Pressable key={l} onPress={() => setUseCleaned(l === 'Cleaned')} style={[st.segBtn, on && st.segOn]}>
                  <Text style={{ fontWeight: '600', color: on ? C.ink : C.muted }}>{l}</Text>
                </Pressable>
              )
            })}
          </View>
        )}
        <Pressable onPress={() => setStage('pick')}><Text style={st.link}>Retake photo</Text></Pressable>
        <ItemForm draft={draft} onChange={setDraft} />
        <Button kind="primary" title="Save to closet" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const st = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  stage: { aspectRatio: 0.85, backgroundColor: C.stage, borderRadius: R.lg, overflow: 'hidden' },
  note: { backgroundColor: C.accentSoft, color: C.ink, padding: 12, borderRadius: R.sm, fontSize: 14 },
  seg: { flexDirection: 'row', backgroundColor: C.pill, borderRadius: 999, padding: 3, alignSelf: 'center' },
  segBtn: { paddingVertical: 8, paddingHorizontal: 22, borderRadius: 999 },
  segOn: { backgroundColor: C.card },
  link: { color: C.muted, textAlign: 'center', fontWeight: '500', textDecorationLine: 'underline' },
})
