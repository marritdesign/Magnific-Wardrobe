import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { deleteImage } from './images'
import { newId, type Item, type Outfit, type Plans, type WishItem } from './types'

interface Data {
  items: Item[]
  outfits: Outfit[]
  plans: Plans
  wishlist: WishItem[]
  skipped: string[]
}

const KEY = 'closet.data.v1'
const empty: Data = { items: [], outfits: [], plans: {}, wishlist: [], skipped: [] }

function useStoreValue() {
  const [data, setData] = useState<Data>(empty)
  const [ready, setReady] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setData({ ...empty, ...JSON.parse(raw) }))
      .catch((e) => console.warn('load failed', e))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(console.warn), 150)
  }, [data, ready])

  const mut = useCallback((fn: (d: Data) => Data) => setData(fn), [])

  const actions = useMemo(
    () => ({
      addItem(i: Omit<Item, 'id' | 'createdAt'>) {
        const item: Item = { ...i, id: newId(), createdAt: Date.now() }
        mut((d) => ({ ...d, items: [item, ...d.items] }))
        return item.id
      },
      updateItem(id: string, p: Partial<Item>) {
        mut((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...p } : i)) }))
      },
      deleteItem(id: string) {
        mut((d) => {
          const item = d.items.find((i) => i.id === id)
          if (item) { deleteImage(item.imageUri); if (item.originalUri) deleteImage(item.originalUri) }
          const outfits = d.outfits
            .map((o) => ({ ...o, itemIds: o.itemIds.filter((x) => x !== id) }))
            .filter((o) => o.itemIds.length > 0)
          const alive = new Set(outfits.map((o) => o.id))
          const plans = Object.fromEntries(Object.entries(d.plans).filter(([, oid]) => alive.has(oid)))
          return { ...d, items: d.items.filter((i) => i.id !== id), outfits, plans }
        })
      },
      addOutfit(o: Omit<Outfit, 'id' | 'createdAt'>) {
        const outfit: Outfit = { ...o, id: newId(), createdAt: Date.now() }
        mut((d) => ({ ...d, outfits: [outfit, ...d.outfits] }))
        return outfit.id
      },
      updateOutfit(id: string, p: Partial<Outfit>) {
        mut((d) => ({ ...d, outfits: d.outfits.map((o) => (o.id === id ? { ...o, ...p } : o)) }))
      },
      deleteOutfit(id: string) {
        mut((d) => ({
          ...d,
          outfits: d.outfits.filter((o) => o.id !== id),
          plans: Object.fromEntries(Object.entries(d.plans).filter(([, oid]) => oid !== id)),
        }))
      },
      setPlan(date: string, outfitId: string | null) {
        mut((d) => {
          const plans = { ...d.plans }
          if (outfitId) plans[date] = outfitId
          else delete plans[date]
          return { ...d, plans }
        })
      },
      addWish(w: Omit<WishItem, 'id' | 'createdAt' | 'bought'>) {
        mut((d) => ({ ...d, wishlist: [{ ...w, id: newId(), bought: false, createdAt: Date.now() }, ...d.wishlist] }))
      },
      updateWish(id: string, p: Partial<WishItem>) {
        mut((d) => ({ ...d, wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, ...p } : w)) }))
      },
      deleteWish(id: string) {
        mut((d) => {
          const w = d.wishlist.find((x) => x.id === id)
          if (w?.imageUri) deleteImage(w.imageUri)
          return { ...d, wishlist: d.wishlist.filter((x) => x.id !== id) }
        })
      },
      skip(key: string) {
        mut((d) => ({ ...d, skipped: [...d.skipped, key].slice(-500) }))
      },
      clearSkipped() {
        mut((d) => ({ ...d, skipped: [] }))
      },
    }),
    [mut],
  )

  return { ...data, ready, ...actions }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
