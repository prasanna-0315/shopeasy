import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cart-context";
const STORAGE_KEY = "shopeasy-cart";

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item?.id && item?.quantity > 0) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    if (product.stock <= 0) return "This product is out of stock.";
    const currentQuantity = items.find((item) => item.id === product.id)?.quantity || 0;
    if (currentQuantity >= product.stock) return "You have added all available stock.";
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id
          ? { ...item, ...product, quantity: item.quantity + 1 }
          : item)
        : [...current, { ...product, quantity: 1 }];
    });
    return "";
  }, [items]);

  const setQuantity = useCallback((id, quantity) => {
    setItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      if (quantity <= 0) return [];
      return [{ ...item, quantity: Math.min(quantity, item.stock) }];
    }));
  }, []);

  const removeItem = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const value = useMemo(() => ({
    items, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart,
  }), [items, itemCount, subtotal, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
