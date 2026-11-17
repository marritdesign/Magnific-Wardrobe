import { Ionicons } from '@expo/vector-icons'
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
      <Text style={[s.btnText, kind === 'primary' && { color: '#fff' }, kind === 'danger' && { color: C.danger }]}>{title}</Text>
    </Pressable>
  )
}

export function Empty({ icon, title, text, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; text?: string; children?: ReactNode }) {
  return (
    <View style={s.empty}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.pill, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Ionicons name={icon} size={32} color={C.ink} /></View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text && <Text style={[s.muted, { textAlign: 'center' }]}>{text}</Text>}
      <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 8 }}>{children}</View>
    </View>
  )
}

/** Large, quiet page title used at the top of each tab. */
export function Title({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
      <View style={{ flexShrink: 1 }}>
        <Text style={s.h1}>{title}</Text>
        {sub ? <Text style={[s.muted, { marginTop: 2 }]}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  )
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16, paddingBottom: 140 },
  h1: { fontSize: 34, fontWeight: '600', color: C.ink, letterSpacing: -1.2 },
  h3: { fontSize: 15, fontWeight: '600', color: C.ink, letterSpacing: -0.2 },
  muted: { color: C.muted, fontSize: 14, letterSpacing: -0.1 },
  thumb: { backgroundColor: C.stage, borderRadius: R.md, overflow: 'hidden' },
  fill: { flex: 1, backgroundColor: 'transparent' },
  board: { flex: 1, flexDirection: 'row', backgroundColor: C.stage, borderRadius: R.lg },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.pill },
  chipActive: { backgroundColor: C.ink },
  chipText: { color: C.ink, fontSize: 14, fontWeight: '500', letterSpacing: -0.1, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  btn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 999, backgroundColor: C.pill, alignItems: 'center' },
  btnPrimary: { backgroundColor: C.ink },
  btnDanger: { backgroundColor: 'transparent' },
  btnText: { fontSize: 16, fontWeight: '600', color: C.ink, letterSpacing: -0.2 },
  empty: { alignItems: 'center', padding: 32, gap: 8, marginTop: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: C.ink, letterSpacing: -0.6, textAlign: 'center' },
  input: { backgroundColor: C.pill, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 13, fontSize: 16, color: C.ink },
  label: { fontSize: 13, fontWeight: '500', color: C.muted, marginBottom: 8, letterSpacing: -0.1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: C.card, borderRadius: R.lg },
})
