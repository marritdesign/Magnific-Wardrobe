import { isBottom, type Item } from './types'

const NEUTRAL = new Set(['black', 'white', 'grey', 'beige', 'navy', 'brown'])

export const comboKey = (ids: string[]) => [...ids].sort().join('-')

function pick<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedPick(arr: Item[]): Item | undefined {
  if (!arr.length) return undefined
  const w = arr.map((i) => (i.favorite ? 2.5 : 1))
  let r = Math.random() * w.reduce((a, b) => a + b, 0)
  for (let k = 0; k < arr.length; k++) if ((r -= w[k]) <= 0) return arr[k]
  return arr[arr.length - 1]
}

/** Simple colour harmony: neutrals go with everything, avoid more than two bold colours. */
export function score(items: Item[]) {
  const bold = new Set(items.map((i) => i.color).filter((c) => !NEUTRAL.has(c)))
  let s = 1
  if (bold.size === 1) s += 0.4
  if (bold.size > 2) s -= 0.6
  if (items.some((i) => i.color === 'multi') && bold.size > 1) s -= 0.4
  s += items.filter((i) => i.favorite).length * 0.15
  return s
}

export interface Filters { season?: string; occasion?: string }

/** Generate up to n fresh outfit combinations from the wardrobe. */
export function suggest(all: Item[], n: number, exclude: Set<string>, f: Filters = {}): Item[][] {
  const items = all.filter(
    (i) =>
      (!f.season || !i.seasons.length || i.seasons.includes(f.season)) &&
      (!f.occasion || !i.occasions.length || i.occasions.includes(f.occasion)),
  )
  const by = (c: string) => items.filter((i) => i.category === c)
  const tops = by('top'), bottoms = items.filter((i) => isBottom(i.category)), dresses = by('dress'), shoes = by('shoes'), outer = by('jacket'), acc = by('accessory')
  const canSeparates = tops.length > 0 && bottoms.length > 0
  if (!canSeparates && !dresses.length) return []

  const out: { items: Item[]; s: number }[] = []
  const seen = new Set(exclude)
  for (let tries = 0; tries < n * 30 && out.length < n * 3; tries++) {
    const useDress = dresses.length > 0 && (!canSeparates || Math.random() < dresses.length / (dresses.length + tops.length))
    const combo: (Item | undefined)[] = useDress ? [weightedPick(dresses)] : [weightedPick(tops), weightedPick(bottoms)]
    combo.push(weightedPick(shoes))
    if (outer.length && Math.random() < (f.season === 'winter' || f.season === 'autumn' ? 0.8 : 0.35)) combo.push(pick(outer))
    if (acc.length && Math.random() < 0.4) combo.push(pick(acc))
    const c = combo.filter(Boolean) as Item[]
    const key = comboKey(c.map((i) => i.id))
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ items: c, s: score(c) + Math.random() * 0.5 })
  }
  return out.sort((a, b) => b.s - a.s).slice(0, n).map((o) => o.items)
}
