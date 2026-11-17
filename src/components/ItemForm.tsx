import { Pressable, Switch, Text, TextInput, View } from 'react-native'
import { C } from '../lib/theme'
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, type Item } from '../lib/types'
import { Chip, s } from './ui'

export type ItemDraft = Pick<Item, 'name' | 'category' | 'color' | 'seasons' | 'occasions' | 'brand' | 'favorite'>

export const emptyDraft = (): ItemDraft => ({ name: '', category: 'top', color: 'black', seasons: [], occasions: [], brand: '', favorite: false })

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  )
}

export function ItemForm({ draft, onChange }: { draft: ItemDraft; onChange: (d: ItemDraft) => void }) {
  const set = (p: Partial<ItemDraft>) => onChange({ ...draft, ...p })
  return (
    <View style={{ gap: 18 }}>
      <Field label="Name">
        <TextInput style={s.input} value={draft.name} placeholder="e.g. White linen shirt" placeholderTextColor={C.muted} onChangeText={(name) => set({ name })} />
      </Field>
      <Field label="Type">
        <View style={s.wrap}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={draft.category === c.id} onPress={() => set({ category: c.id })}>{c.emoji} {c.single}</Chip>
          ))}
        </View>
      </Field>
      <Field label="Colour">
        <View style={s.wrap}>
          {COLORS.map((c) => (
            <Pressable
              key={c.id}
              accessibilityLabel={c.id}
              onPress={() => set({ color: c.id })}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.hex, borderWidth: draft.color === c.id ? 3 : 1, borderColor: draft.color === c.id ? C.accent : C.line }}
            />
          ))}
        </View>
      </Field>
      <Field label="Season">
        <View style={s.wrap}>
          {SEASONS.map((x) => <Chip key={x} active={draft.seasons.includes(x)} onPress={() => set({ seasons: toggle(draft.seasons, x) })}>{x}</Chip>)}
        </View>
      </Field>
      <Field label="Occasion">
        <View style={s.wrap}>
          {OCCASIONS.map((x) => <Chip key={x} active={draft.occasions.includes(x)} onPress={() => set({ occasions: toggle(draft.occasions, x) })}>{x}</Chip>)}
        </View>
      </Field>
      <Field label="Brand (optional)">
        <TextInput style={s.input} value={draft.brand ?? ''} placeholder="e.g. COS" placeholderTextColor={C.muted} onChangeText={(brand) => set({ brand })} />
      </Field>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Text style={[s.h3, { fontSize: 16 }]}>❤️ Favourite</Text>
        <Switch value={draft.favorite} onValueChange={(favorite) => set({ favorite })} trackColor={{ true: C.accent }} />
      </View>
    </View>
  )
}
