import { useEffect, useMemo, useState } from "react";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";
import { api } from "./api";

export type ProductType = "standard" | "imported";

export type Product = {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    rating: number;
    badge?: string;
    img: string;
    category: string;
    description: string;
    type: ProductType;
    stock?: number;
}; // Added stock

export type ApiProduct = {
    id: string;
    name: string;
    price: number;
    stock: number;
    rating?: number;
    images?: string[];
    category: string;
    description: string;
};

const standardProducts: Product[] = [
    {
        id: "naruto-1",
        name: "Kurogane Samurai - 1/6 Scale",
        price: 289,
        oldPrice: 349,
        rating: 4.9,
        badge: "-18%",
        img: p1,
        category: "Naruto",
        description: "Hand-painted resin statue with forged katana, weathered armor, and magnetic base.",
        type: "standard",
    },
    {
        id: "naruto-2",
        name: "Leaf Shadow ANBU - Elite Edition",
        price: 219,
        rating: 4.7,
        badge: "Hot",
        img: p3,
        category: "Naruto",
        description: "Stealth finish, matte blacks, and premium sashimono banners for the ANBU elite.",
        type: "standard",
    },
    {
        id: "onepiece-1",
        name: "Grand Line Captain - 1/7 Scale",
        price: 459,
        rating: 5.0,
        badge: "New",
        img: p2,
        category: "One Piece",
        description: "Dynamic pose with wind-swept cape, metallic accents, and collector plaque.",
        type: "standard",
    },
    {
        id: "onepiece-2",
        name: "Sea Emperor - Limited",
        price: 379,
        rating: 4.8,
        badge: "Limited",
        img: p4,
        category: "One Piece",
        description: "Heavy resin build, pearl coat highlights, and a premium diorama base.",
        type: "standard",
    },
    {
        id: "dragonball-1",
        name: "Mecha Ascension Mk.II",
        price: 499,
        rating: 5.0,
        badge: "Bestseller",
        img: p2,
        category: "Dragon Ball",
        description: "Alloy frame with energy core, light-reactive paint, and magnetic flame aura.",
        type: "standard",
    },
    {
        id: "dragonball-2",
        name: "Saiyan Fury - Battle Mode",
        price: 329,
        rating: 4.9,
        img: p1,
        category: "Dragon Ball",
        description: "Cracked ground base, translucent aura spikes, and extreme motion sculpting.",
        type: "standard",
    },
    {
        id: "demonslayer-1",
        name: "Crimson Blade - 1/8 Scale",
        price: 249,
        rating: 4.8,
        badge: "-12%",
        img: p3,
        category: "Demon Slayer",
        description: "Layered kimono textures, glow-tinted blade, and engraved nameplate.",
        type: "standard",
    },
    {
        id: "demonslayer-2",
        name: "Moonlit Hashira - Deluxe",
        price: 389,
        rating: 4.9,
        img: p4,
        category: "Demon Slayer",
        description: "Wind-swept haori, metallic ink details, and premium display stand.",
        type: "standard",
    },
    {
        id: "aot-1",
        name: "Wall Guardian - Scout Edition",
        price: 299,
        rating: 4.7,
        badge: "New",
        img: p1,
        category: "Attack on Titan",
        description: "ODM gear, cloak textures, and basalt base inspired by the inner walls.",
        type: "standard",
    },
    {
        id: "aot-2",
        name: "Titan Breaker - Limited",
        price: 449,
        rating: 4.9,
        img: p2,
        category: "Attack on Titan",
        description: "Massive scale presence, cracked stone base, and collector-grade finish.",
        type: "standard",
    },
    {
        id: "jjk-1",
        name: "Cursed Technique - Collector",
        price: 319,
        rating: 4.8,
        badge: "Hot",
        img: p4,
        category: "Jujutsu Kaisen",
        description: "Translucent cursed energy effects and layered lacquer for deep reds.",
        type: "standard",
    },
    {
        id: "jjk-2",
        name: "Domain Expansion - Diorama",
        price: 529,
        rating: 5.0,
        img: p3,
        category: "Jujutsu Kaisen",
        description: "Full diorama base with aura rings, etched sigils, and premium lighting cuts.",
        type: "standard",
    },
];

const importedProducts: Product[] = [
    {
        id: "import-1",
        name: "Rem - Wedding Ver. 1/7 Scale",
        price: 429,
        rating: 4.9,
        badge: "Imported",
        img: p2,
        category: "Tokyo Imports",
        description: "Officially licensed Good Smile release, sealed and certified from Japan.",
        type: "imported",
    },
    {
        id: "import-2",
        name: "Shibuya Neon Idol - Limited",
        price: 379,
        rating: 4.8,
        badge: "Osaka",
        img: p4,
        category: "Osaka Exclusives",
        description: "Exclusive Japan-only release with holo baseplate and COA card.",
        type: "imported",
    },
    {
        id: "import-3",
        name: "Kyoto Shrine Guardian - Deluxe",
        price: 489,
        rating: 5.0,
        badge: "Collector",
        img: p1,
        category: "Kyoto Exclusives",
        description: "Hand-finished lacquer, ceremonial base, and artisan paintwork.",
        type: "imported",
    },
    {
        id: "import-4",
        name: "Akihabara Night Run - 1/8",
        price: 319,
        rating: 4.7,
        badge: "Tokyo",
        img: p3,
        category: "Tokyo Imports",
        description: "Limited run from Akihabara collectors market with serialized plaque.",
        type: "imported",
    },
];

export const productCategories = [
    "Naruto",
    "One Piece",
    "Dragon Ball",
    "Demon Slayer",
    "Attack on Titan",
    "Jujutsu Kaisen",
];

export const importedProductCategories = [
    "Tokyo Imports",
    "Osaka Exclusives",
    "Kyoto Exclusives",
];

export function useProducts(type: ProductType = "standard") {
    const [data, setData] = useState<Product[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setStatus("loading");
                const response = await api.getProducts({ limit: 100 });

                // Backend returns: { items, total, page, limit, success: true }
                if (response.data?.items && Array.isArray(response.data.items)) {
                    // Map API response to local Product format
                    const filterOrigin = type === "imported" ? "imported" : "local";
                    const mappedProducts = response.data.items
                        .filter((p: any) => {
                            // Treat undefined origin as "local"
                            const productOrigin = p.origin || "local";
                            return productOrigin === filterOrigin;
                        })
                        .map((p: any) => ({
                            id: p._id || p.id,
                            name: p.name,
                            price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
                            oldPrice: p.discountPrice && p.discountPrice > 0 ? p.price : undefined,
                            rating: p.rating || 4.5,
                            badge: p.badge || (p.featured ? "Featured" : undefined),
                            img: p.images?.[0]?.url || p.images?.[0] || p1,
                            category: p.animeCategory?.name || p.category || "General",
                            description: p.description,
                            type: type,
                            stock: p.stock ?? 0,
                        }));

                    setData(mappedProducts);
                    setStatus("success");
                } else {
                    throw new Error("Invalid API response format");
                }
            } catch (err) {
                console.error("Failed to fetch products from API:", err);
                // Use mock data as fallback only in development
                if (import.meta.env.DEV) {
                    console.warn("Falling back to mock data");
                    setData(type === "imported" ? importedProducts : standardProducts);
                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(err instanceof Error ? err.message : "Failed to fetch products");
                }
            }
        };

        // Fetch immediately
        fetchProducts();

        // Refetch every 10 seconds for real-time updates from admin
        const interval = setInterval(fetchProducts, 10000);

        return () => clearInterval(interval);
    }, [type]);

    return { data, status, error };
}

export function useImportedProducts() {
    const [data, setData] = useState<Product[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setStatus("loading");
                const response = await api.getProducts({ limit: 100 });

                if (response.data?.items && Array.isArray(response.data.items)) {
                    const mappedProducts = response.data.items
                        .filter((p: any) => p.origin === "imported")
                        .map((p: any) => ({
                            id: p._id || p.id,
                            name: p.name,
                            price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
                            oldPrice: p.discountPrice && p.discountPrice > 0 ? p.price : undefined,
                            rating: p.rating || 4.5,
                            badge: p.badge || (p.featured ? "Featured" : undefined),
                            img: p.images?.[0]?.url || p.images?.[0] || p1,
                            category: p.animeCategory?.name || p.category || "Imported",
                            description: p.description,
                            type: "imported" as ProductType,
                            stock: p.stock ?? 0,
                        }));
                    setData(mappedProducts);
                    setStatus("success");
                } else {
                    throw new Error("Invalid API response format");
                }
            } catch (err) {
                console.error("Failed to fetch imported products:", err);
                if (import.meta.env.DEV) {
                    console.warn("Falling back to mock data");
                    setData(importedProducts);
                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(err instanceof Error ? err.message : "Failed to fetch products");
                }
            }
        };

        fetchProducts();

        // Refetch every 10 seconds for real-time updates
        const interval = setInterval(fetchProducts, 10000);
        return () => clearInterval(interval);
    }, []);

    return { data, status, error };
}

export function useAllProducts() {
    const [data, setData] = useState<Product[]>([]);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setStatus("loading");
                const response = await api.getProducts({ limit: 200 });

                if (response.data?.items && Array.isArray(response.data.items)) {
                    const mappedProducts = response.data.items.map((p: any) => ({
                        id: p._id || p.id,
                        name: p.name,
                        price: p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price,
                        oldPrice: p.discountPrice && p.discountPrice > 0 ? p.price : undefined,
                        rating: p.rating || 4.5,
                        badge: p.badge || (p.featured ? "Featured" : undefined),
                        img: p.images?.[0]?.url || p.images?.[0] || p1,
                        category: p.animeCategory?.name || p.category || "General",
                        description: p.description,
                        type: (p.origin === "imported" ? "imported" : "standard") as ProductType,
                        stock: p.stock ?? 0,
                    }));
                    setData(mappedProducts);
                    setStatus("success");
                } else {
                    throw new Error("Invalid API response format");
                }
            } catch (err) {
                console.error("Failed to fetch all products:", err);
                if (import.meta.env.DEV) {
                    console.warn("Falling back to mock data");
                    setData([...standardProducts, ...importedProducts]);
                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(err instanceof Error ? err.message : "Failed to fetch products");
                }
            }
        };

        fetchProducts();

        // Refetch every 10 seconds for real-time updates
        const interval = setInterval(fetchProducts, 10000);
        return () => clearInterval(interval);
    }, []);

    return { data, status, error };
}

export function formatPrice(value: number) {
    return `$${value.toFixed(0)}`;
}
