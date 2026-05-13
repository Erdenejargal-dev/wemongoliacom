import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'wm_wishlist';

export type WishlistItem = {
  id: string;
  listingId: string;
  listingType: string;
  listingName: string;
  listingSlug: string;
  listingImage?: string;
};

type WishlistState = {
  items: WishlistItem[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  has: (listingId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ items: JSON.parse(raw) });
    } catch {
      // corrupt storage — start fresh
    } finally {
      set({ isHydrated: true });
    }
  },

  add: (item) => {
    const next = [...get().items, item];
    set({ items: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  },

  remove: (id) => {
    const next = get().items.filter((i) => i.id !== id);
    set({ items: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  },

  has: (listingId) => get().items.some((i) => i.listingId === listingId),
}));
