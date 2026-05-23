import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";

const cartToastId = "cart-feedback";
const cartStorageKey = "morfyx-cart";

export type CartItem = {
    product: Product;
    qty: number;
};

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (product: Product) => boolean;
    updateQty: (productId: string, qty: number) => void;
    removeItem: (productId: string) => void;
    clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const stored = window.localStorage.getItem(cartStorageKey);
            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored) as CartItem[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
        } catch {
            // Ignore storage failures and keep the cart functional in memory.
        }
    }, [items]);

    const addItem = (product: Product) => {
        const stockLimit = typeof product.stock === "number" ? product.stock : Number.POSITIVE_INFINITY;

        if (stockLimit <= 0) {
            toast.error(`${product.name} is currently out of stock.`, { id: cartToastId });
            return false;
        }

        const existing = items.find((item) => item.product.id === product.id);
        if (existing && existing.qty >= stockLimit) {
            toast.error(`Only ${stockLimit} unit${stockLimit === 1 ? "" : "s"} of ${product.name} available.`, { id: cartToastId });
            return false;
        }

        setItems((prev) => {
            const current = prev.find((item) => item.product.id === product.id);
            if (!current) {
                return [...prev, { product, qty: 1 }];
            }

            return prev.map((item) =>
                item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item,
            );
        });

        return true;
    };

    const updateQty = (productId: string, qty: number) => {
        setItems((prev) => {
            if (qty <= 0) {
                return prev.filter((item) => item.product.id !== productId);
            }

            const target = prev.find((item) => item.product.id === productId);
            if (!target) {
                return prev;
            }

            const stockLimit = typeof target.product.stock === "number" ? target.product.stock : Number.POSITIVE_INFINITY;
            if (stockLimit <= 0) {
                toast.error(`${target.product.name} is currently out of stock.`, { id: cartToastId });
                return prev.filter((item) => item.product.id !== productId);
            }

            if (qty > stockLimit) {
                toast.error(`Only ${stockLimit} unit${stockLimit === 1 ? "" : "s"} of ${target.product.name} available.`, { id: cartToastId });
                qty = stockLimit;
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
