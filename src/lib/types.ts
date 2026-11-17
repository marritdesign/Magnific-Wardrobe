export const CATEGORIES = [
  { id: 'top', label: 'Tops', single: 'Top', emoji: '👚' },
  { id: 'bottom', label: 'Bottoms', single: 'Bottom', emoji: '👖' },
  { id: 'dress', label: 'Dresses', single: 'Dress', emoji: '👗' },
  { id: 'outerwear', label: 'Outerwear', single: 'Outerwear', emoji: '🧥' },
  { id: 'shoes', label: 'Shoes', single: 'Shoes', emoji: '👟' },
  { id: 'accessory', label: 'Accessories', single: 'Accessory', emoji: '👜' },
] as const

export type Category = (typeof CATEGORIES)[number]['id']

export const COLORS = [
  { id: 'black', hex: '#1d1d1f' },
  { id: 'white', hex: '#ffffff' },
  { id: 'grey', hex: '#9a9a9a' },
  { id: 'beige', hex: '#d9c3a5' },
  { id: 'brown', hex: '#7a5134' },
  { id: 'red', hex: '#c8323b' },
  { id: 'pink', hex: '#f0a6c0' },
  { id: 'orange', hex: '#ee8a3a' },
  { id: 'yellow', hex: '#f3d34a' },
  { id: 'green', hex: '#4f8a55' },
  { id: 'blue', hex: '#3d6bc4' },
  { id: 'navy', hex: '#1f2f56' },
  { id: 'purple', hex: '#7d58b5' },
  { id: 'multi', hex: '#c9a0dc' },
] as const

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const
export const OCCASIONS = ['casual', 'work', 'going out', 'sport', 'formal'] as const

export interface Item {
  id: string
  name: string
  category: Category
  imageUri: string
  originalUri?: string
  cleaned: boolean
  color: string
  seasons: string[]
  occasions: string[]
  brand?: string
  favorite: boolean
  createdAt: number
}

export interface Outfit {
  id: string
  name: string
  itemIds: string[]
  favorite: boolean
  source: 'builder' | 'swipe'
  createdAt: number
}

export interface WishItem {
  id: string
  name: string
  category?: Category
  imageUri?: string
  link?: string
  price?: string
  notes?: string
  bought: boolean
  createdAt: number
}

/** date (YYYY-MM-DD) -> outfit id */
export type Plans = Record<string, string>

export const catInfo = (c: string) => CATEGORIES.find((x) => x.id === c) ?? CATEGORIES[0]
export const colorHex = (c: string) => COLORS.find((x) => x.id === c)?.hex ?? '#ccc'
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
export const itemLabel = (i: Pick<Item, 'name' | 'category'>) => i.name || catInfo(i.category).single
