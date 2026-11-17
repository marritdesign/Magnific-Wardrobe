import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { C, R } from '../lib/theme'
import type { Item } from '../lib/types'

export function ItemThumb({ item, style }: { item?: Item; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.thumb, style]}>
      {item && <Image source={{ uri: item.imageUri }} style={StyleSheet.absoluteFill} contentFit="contain" transition={120} />}
    </View>
  )
}

/** Flat-lay board: main column (top + bottom, or dress), side column (outerwear, accessories, shoes). */
export function OutfitBoard({ items, compact = false }: { items: Item[]; compact?: boolean }) {
  const by = (c: string) => items.filter((i) => i.category === c)
  const dress = by('dress')[0], top = by('top')[0], bottom = by('bottom')[0]
  const outer = by('outerwear')[0], shoes = by('shoes')[0], acc = by('accessory').slice(0, 2)
  const pad = compact ? 6 : 12
  return (
    <View style={[s.board, { padding: pad, gap: pad }]}>
      <View style={{ flex: 3, gap: pad }}>
        {dress ? (
          <ItemThumb item={dress} style={s.fill} />
        ) : (
          <>
            {top && <ItemThumb item={top} style={s.fill} />}
            {bottom && <ItemThumb item={bottom} style={[s.fill, { flex: 1.2 }]} />}
          </>
        )}
      </View>
      {(outer || shoes || acc.length > 0) && (
        <View style={{ flex: 2, gap: pad, justifyContent: 'space-between' }}>
          {outer && <ItemThumb item={outer} style={s.fill} />}
          {acc.map((a) => <ItemThumb key={a.id} item={a} style={{ flex: 0.6, backgroundColor: 'transparent' }} />)}
          {shoes && <ItemThumb item={shoes} style={{ flex: 0.7, backgroundColor: 'transparent' }} />}
        </View>
      )}
    </View>
  )
}

export function Chip({ active, onPress, children }: { active?: boolean; onPress?: () => void; children: ReactNode }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{children}</Text>
    </Pressable>
  )
}

export function Button({ title, onPress, kind = 'secondary', disabled, style }: { title: string; onPress?: () => void; kind?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, kind === 'primary' && s.btnPrimary, kind === 'danger' && s.btnDanger, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 }, style]}
    >
      <Text style={[s.btnText, kind === 'primary' && { color: '#fff' }, kind === 'danger' && { color: C.nope }]}>{title}</Text>
    </Pressable>
  )
}

export function Empty({ emoji, title, text, children }: { emoji: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {text && <Text style={[s.muted, { textAlign: 'center' }]}>{text}</Text>}
      <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 8 }}>{children}</View>
    </View>
  )
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 120 },
  h1: { fontSize: 28, fontWeight: '700', color: C.ink, letterSpacing: -0.5 },
  h3: { fontSize: 15, fontWeight: '600', color: C.ink },
  muted: { color: C.muted, fontSize: 14 },
  thumb: { backgroundColor: C.stage, borderRadius: R.sm, overflow: 'hidden' },
  fill: { flex: 1, backgroundColor: 'transparent' },
  board: { flex: 1, flexDirection: 'row', backgroundColor: C.stage, borderRadius: R.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { color: C.ink, fontSize: 14, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center' },
  btnPrimary: { backgroundColor: C.ink, borderColor: C.ink },
  btnDanger: { backgroundColor: 'transparent', borderColor: C.nope },
  btnText: { fontSize: 16, fontWeight: '600', color: C.ink },
  empty: { alignItems: 'center', padding: 32, gap: 8, marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.ink },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.sm, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink },
  label: { fontSize: 13, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.line },
})
