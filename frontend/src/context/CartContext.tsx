import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Book } from '../types/Book';

const CART_STORAGE_KEY = 'bookstore-cart-m12';
const RETURN_PATH_KEY = 'bookstore-return-path-m12';

export type CartLine = {
  bookId: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  grandTotal: number;
  addToCart: (book: Book, qty?: number) => void;
  setLineQuantity: (bookId: number, quantity: number) => void;
  removeLine: (bookId: number) => void;
  saveContinueShoppingPath: (path: string) => void;
  getContinueShoppingPath: () => string;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCartFromStorage(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartLine =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as CartLine).bookId === 'number' &&
        typeof (row as CartLine).quantity === 'number' &&
        typeof (row as CartLine).price === 'number' &&
        typeof (row as CartLine).title === 'string'
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readCartFromStorage());

  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addToCart = useCallback((book: Book, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.bookId === book.bookId);
      if (i === -1) {
        return [
          ...prev,
          {
            bookId: book.bookId,
            title: book.title,
            author: book.author,
            price: book.price,
            quantity: qty,
          },
        ];
      }
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });
  }, []);

  const setLineQuantity = useCallback((bookId: number, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.bookId !== bookId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.bookId === bookId ? { ...l, quantity } : l))
    );
  }, []);

  const removeLine = useCallback((bookId: number) => {
    setLines((prev) => prev.filter((l) => l.bookId !== bookId));
  }, []);

  const saveContinueShoppingPath = useCallback((path: string) => {
    sessionStorage.setItem(RETURN_PATH_KEY, path);
  }, []);

  const getContinueShoppingPath = useCallback(() => {
    return sessionStorage.getItem(RETURN_PATH_KEY) || '/';
  }, []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const grandTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      grandTotal,
      addToCart,
      setLineQuantity,
      removeLine,
      saveContinueShoppingPath,
      getContinueShoppingPath,
    }),
    [
      lines,
      itemCount,
      grandTotal,
      addToCart,
      setLineQuantity,
      removeLine,
      saveContinueShoppingPath,
      getContinueShoppingPath,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with CartProvider
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
