import { create } from 'zustand';

const CART_KEY = 'addiseats_cart';
const THEME_KEY = 'addiseats_theme';
const FAVORITES_KEY = 'addiseats_favorites';

function readStoredCart() {
  if (typeof window === 'undefined') return [];

  try {
    const savedCart = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function readStoredTheme() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
}

function readStoredFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const savedFavorites = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(savedFavorites) ? savedFavorites : [];
  } catch {
    return [];
  }
}

export const useAppStore = create((set) => ({
  items: readStoredCart(),
  favorites: readStoredFavorites(),
  isCartOpen: false,
  isDark: readStoredTheme(),

  addToCart: (item) =>
    set((state) => {
      const nextItems = (() => {
        const existingItem = state.items.find((cartItem) => cartItem.name === item.name);

        if (existingItem) {
          return state.items.map((cartItem) =>
            cartItem.name === item.name
              ? { ...cartItem, quantity: Number(cartItem.quantity || 0) + 1 }
              : cartItem
          );
        }

        return [...state.items, { ...item, quantity: 1 }];
      })();

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
      }

      return { items: nextItems, isCartOpen: true };
    }),

  updateQuantity: (itemName, change) =>
    set((state) => {
      const nextItems = state.items.flatMap((item) => {
        if (item.name !== itemName) return [item];

        const nextQuantity = Number(item.quantity || 0) + Number(change);
        return nextQuantity <= 0 ? [] : [{ ...item, quantity: nextQuantity }];
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
      }

      return { items: nextItems };
    }),

  clearCart: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CART_KEY);
    }

    set({ items: [] });
  },

  setItems: (nextItems) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    }

    set({ items: nextItems });
  },

  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  toggleFavorite: (itemId) =>
    set((state) => {
      const nextFavorites = state.favorites.includes(itemId)
        ? state.favorites.filter((favoriteId) => favoriteId !== itemId)
        : [...state.favorites, itemId];

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
      }

      return { favorites: nextFavorites };
    }),

  toggleTheme: () =>
    set((state) => {
      const nextTheme = !state.isDark;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_KEY, nextTheme ? 'dark' : 'light');
      }

      return { isDark: nextTheme };
    }),
}));
