import type { Category, Item } from './types'

const NEUTRAL = new Set(['black', 'white', 'grey', 'beige', 'navy', 'brown'])

export interface Gap {
  key: string
  name: string
  category: Category
  color: string
  reason: string
  impact: number
}

// Versatile basics the app can suggest when they are missing.
const BASICS: { name: string; category: Category; color: string }[] = [
  { name: 'White sneakers', category: 'shoes', color: 'white' },
  { name: 'Black ankle boots', category: 'shoes', color: 'black' },
  { name: 'Straight blue jeans', category: 'trousers', color: 'blue' },
  { name: 'Black trousers', category: 'trousers', color: 'black' },
  { name: 'Beige chinos', category: 'trousers', color: 'beige' },
  { name: 'Black midi skirt', category: 'skirt', color: 'black' },
  { name: 'White T-shirt', category: 'top', color: 'white' },
  { name: 'Black knit', category: 'top', color: 'black' },
  { name: 'Grey sweater', category: 'top', color: 'grey' },
  { name: 'Beige trench coat', category: 'jacket', color: 'beige' },
  { name: 'Black blazer', category: 'jacket', color: 'black' },
  { name: 'Black leather bag', category: 'accessory', color: 'black' },
  { name: 'Little black dress', category: 'dress', color: 'black' },
]

/** Find versatile pieces that are missing, ranked by how many new outfits they would unlock. */
export function missingPieces(items: Item[], season: string): Gap[] {
  const n = (c: Category) => items.filter((i) => i.category === c).length
  const tops = n('top'), bottoms = n('trousers') + n('skirt'), dresses = n('dress'), shoes = n('shoes'), outer = n('jacket')
  const has = (c: Category, color: string) => items.some((i) => i.category === c && i.color === color)
  const cold = season === 'autumn' || season === 'winter'
  const out: Gap[] = []

  for (const b of BASICS) {
    if (has(b.category, b.color)) continue
    let unlocks = 0
    let reason = ''
    switch (b.category) {
      case 'shoes':
        unlocks = tops * bottoms + dresses
        reason = shoes === 0 ? `You have no shoes yet. These go with all ${unlocks} of your outfit combinations.` : `Goes with ${unlocks} outfit combinations, since ${b.color} works with everything.`
        break
      case 'trousers':
      case 'skirt':
        unlocks = tops
        reason = bottoms < tops / 2 ? `You have ${tops} tops but only ${bottoms} bottom${bottoms === 1 ? '' : 's'}. This pairs with all of them.` : `Pairs with all ${tops} of your tops.`
        break
      case 'top':
        unlocks = bottoms
        reason = tops < bottoms / 2 ? `You have ${bottoms} bottoms but only ${tops} top${tops === 1 ? '' : 's'}.` : `Pairs with all ${bottoms} of your bottoms.`
        break
      case 'jacket':
        unlocks = (tops * bottoms + dresses) * (cold ? 1.5 : 0.6)
        reason = outer === 0 ? (cold ? `It's ${season} and you have no jacket or coat yet.` : 'You have no jacket or coat yet.') : `Layers over ${tops * bottoms + dresses} of your combinations.`
        break
      case 'accessory':
        unlocks = (tops * bottoms + dresses) * 0.4
        reason = 'A neutral bag finishes almost any outfit.'
        break
      case 'dress':
        unlocks = shoes * 1.2
        reason = dresses === 0 ? 'A one-piece outfit for when you don’t want to think.' : 'An easy extra for evenings out.'
        break
    }
    // Pieces in a category you barely own matter more
    const scarcity = 1 / (n(b.category) + 1)
    const impact = unlocks * (0.5 + scarcity) + (NEUTRAL.has(b.color) ? 0.5 : 0)
    if (unlocks > 0 || n(b.category) === 0) out.push({ key: `${b.category}-${b.color}`, ...b, reason, impact })
  }
  // One suggestion per category keeps the list varied
  // One suggestion per category and per colour keeps the list varied
  const ranked = out.sort((a, b) => b.impact - a.impact)
  const seenCat = new Set<string>(), seenColor = new Set<string>()
  const picked: Gap[] = []
  for (const strict of [true, false]) {
    for (const g of ranked) {
      if (picked.length >= 4 || picked.includes(g) || seenCat.has(g.category)) continue
      if (strict && seenColor.has(g.color)) continue
      picked.push(g); seenCat.add(g.category); seenColor.add(g.color)
    }
  }
  return picked
}

export function styleProfile(items: Item[]) {
  const total = items.length || 1
  const tally = (key: (i: Item) => string) => {
    const m = new Map<string, number>()
    items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, count: v, share: v / total }))
  }
  const colors = tally((i) => i.color)
  const neutralShare = items.filter((i) => NEUTRAL.has(i.color)).length / total
  return { colors, categories: tally((i) => i.category), neutralShare, favorites: items.filter((i) => i.favorite).length }
}
