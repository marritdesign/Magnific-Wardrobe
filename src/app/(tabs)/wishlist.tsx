import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Chip, Empty, Title, s } from '../../components/ui'
import { confirmDelete } from '../../lib/confirm'
import { persistImage, pickPhoto } from '../../lib/images'
import { useStore } from '../../lib/store'
import { C, R } from '../../lib/theme'
import { CATEGORIES, type Category, type WishItem } from '../../lib/types'

type Draft = { name: string; price: string; link: string; notes: string; category?: Category; imageUri?: string }
const blank: Draft = { name: '', price: '', link: '', notes: '' }

export default function Wishlist() {
  const { wishlist, addWish, updateWish, deleteWish } = useStore()
  const [editing, setEditing] = useState<WishItem | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [showBought, setShowBought] = useState(false)
  const open = wishlist.filter((w) => !w.bought)
  const bought = wishlist.filter((w) => w.bought)
  const list = showBought ? bought : open

  function startEdit(w: WishItem | 'new') {
    setEditing(w)
    setDraft(w === 'new' ? blank : { name: w.name, price: w.price ?? '', link: w.link ?? '', notes: w.notes ?? '', category: w.category, imageUri: w.imageUri })
  }

  async function addPhoto() {
    const uri = await pickPhoto('library')
    if (uri) setDraft((d) => ({ ...d, imageUri: uri }))
  }

  function save() {
    if (!draft.name.trim()) return
    const imageUri = draft.imageUri && editing !== 'new' && editing?.imageUri === draft.imageUri ? draft.imageUri : draft.imageUri ? persistImage(draft.imageUri) : undefined
    const data = { ...draft, name: draft.name.trim(), imageUri }
    if (editing === 'new') addWish(data)
    else if (editing) updateWish(editing.id, data)
    setEditing(null)
  }

  function boughtIt(w: WishItem) {
    router.push({ pathname: '/add', params: { wishId: w.id, name: w.name, ...(w.category ? { category: w.category } : {}) } })
  }

  return (
    <SafeAreaView edges={['top']} style={s.screen}>
      <ScrollView contentContainerStyle={s.content}>
        <Title
          title="Wishlist"
          sub={`${open.length} wanted`}
          right={
            <Pressable accessibilityLabel="Add to wishlist" onPress={() => startEdit('new')} style={st.add}>
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          }
        />
        {wishlist.length > 0 && (
          <View style={s.row}>
            <Chip active={!showBought} onPress={() => setShowBought(false)}>Wanted</Chip>
            <Chip active={showBought} onPress={() => setShowBought(true)}>Bought</Chip>
          </View>
        )}
        {wishlist.length === 0 && (
          <Empty icon="bag-handle-outline" title="Nothing on your wishlist" text="Save pieces you'd like to buy, with a link and price.">
            <Button kind="primary" title="Add a wish" onPress={() => startEdit('new')} />
          </Empty>
        )}
        {list.map((w) => (
          <Pressable key={w.id} onPress={() => startEdit(w)} style={st.row}>
            <View style={st.thumb}>
              {w.imageUri ? <Image source={{ uri: w.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="bag-handle-outline" size={24} color={C.faint} />}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[s.h3, w.bought && { textDecorationLine: 'line-through', color: C.muted }]} numberOfLines={1}>{w.name}</Text>
              {!!w.price && <Text style={s.muted}>{w.price}</Text>}
              {!!w.link && (
                <Pressable onPress={() => Linking.openURL(/^https?:/.test(w.link!) ? w.link! : `https://${w.link}`)} hitSlop={6}>
                  <Text style={{ color: C.ink, textDecorationLine: 'underline', fontSize: 14 }} numberOfLines={1}>View in shop</Text>
                </Pressable>
              )}
            </View>
            {!w.bought && (
              <Pressable onPress={() => boughtIt(w)} style={st.buy} accessibilityLabel="I bought it">
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Bought it</Text>
              </Pressable>
            )}
          </Pressable>
        ))}
        {!showBought && open.length > 0 && <Text style={[s.muted, { textAlign: 'center' }]}>Tap “Bought it” to photograph it and add it to your closet.</Text>}
      </ScrollView>

      <Modal visible={!!editing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(null)}>
        <SafeAreaView style={s.screen}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <Text style={s.h1}>{editing === 'new' ? 'Add wish' : 'Edit wish'}</Text>
                <Pressable hitSlop={10} onPress={() => setEditing(null)} accessibilityLabel="Close"><Ionicons name="close" size={28} color={C.ink} /></Pressable>
              </View>
              <Pressable onPress={addPhoto} style={st.photo}>
                {draft.imageUri ? <Image source={{ uri: draft.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Text style={s.muted}>＋ Add a photo or screenshot</Text>}
              </Pressable>
              <View><Text style={s.label}>What is it?</Text><TextInput style={s.input} value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} placeholder="e.g. Brown suede boots" placeholderTextColor={C.muted} /></View>
              <View>
                <Text style={s.label}>Type</Text>
                <View style={s.wrap}>{CATEGORIES.map((c) => <Chip key={c.id} active={draft.category === c.id} onPress={() => setDraft({ ...draft, category: draft.category === c.id ? undefined : c.id })}>{c.single}</Chip>)}</View>
              </View>
              <View><Text style={s.label}>Price</Text><TextInput style={s.input} value={draft.price} onChangeText={(price) => setDraft({ ...draft, price })} placeholder="e.g. €89" placeholderTextColor={C.muted} /></View>
              <View><Text style={s.label}>Shop link</Text><TextInput style={s.input} value={draft.link} autoCapitalize="none" keyboardType="url" onChangeText={(link) => setDraft({ ...draft, link })} placeholder="https://" placeholderTextColor={C.muted} /></View>
              <View><Text style={s.label}>Notes</Text><TextInput style={[s.input, { minHeight: 70 }]} multiline value={draft.notes} onChangeText={(notes) => setDraft({ ...draft, notes })} placeholder="Size, colour, goes well with…" placeholderTextColor={C.muted} /></View>
              <Button kind="primary" title="Save" disabled={!draft.name.trim()} onPress={save} />
              {editing && editing !== 'new' && (
                <>
                  {editing.bought && <Button title="Move back to wanted" onPress={() => { updateWish(editing.id, { bought: false }); setEditing(null) }} />}
                  <Button kind="danger" title="Remove from wishlist" onPress={() => confirmDelete('Remove this wish?', '', () => { deleteWish(editing.id); setEditing(null) })} />
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 76, height: 92, borderRadius: R.md, backgroundColor: C.stage, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  buy: { backgroundColor: C.ink, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  photo: { height: 220, borderRadius: R.lg, backgroundColor: C.stage, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  add: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
})
