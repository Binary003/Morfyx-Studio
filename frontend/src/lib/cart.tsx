import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
    product: Product;
    qty: number;
};

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (product: Product) => void;
    updateQty: (productId: string, qty: number) => void;
    removeItem: (productId: string) => void;
    clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (product: Product) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (!existing) {
                return [...prev, { product, qty: 1 }];
            }
            return prev.map((item) =>
                item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item,
            );
        });
    };

    const updateQty = (productId: string, qty: number) => {
        setItems((prev) => {
            if (qty <= 0) {
                return prev.filter((item) => item.product.id !== productId);
            }
            return prev.map((item) =>
                item.product.id === productId ? { ...item, qty } : item,
            );
        });
    };

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clear = () => setItems([]);

    const itemCount = useMemo(
        () => items.reduce((total, item) => total + item.qty, 0),
        [items],
    );

    const subtotal = useMemo(
        () => items.reduce((total, item) => total + item.qty * item.product.price, 0),
        [items],
    );

    const value = useMemo(
        () => ({ items, itemCount, subtotal, addItem, updateQty, removeItem, clear }),
        [items, itemCount, subtotal],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
}
