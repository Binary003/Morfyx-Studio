import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Box, ShoppingBag, Star, X } from "lucide-react";
import { SectionHead } from "./Collections";
import { formatPrice, type Product, type ProductType, useAllProducts, useProducts } from "@/lib/products";
import { useCart } from "@/lib/cart";

function normalizeCategory(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

type ProductsSectionProps = {
    eyebrow: string;
    title: string;
    desc?: string;
    limit?: number;
    activeCategory?: string | null;
    onClearCategory?: () => void;
    productType?: ProductType;
};

export function ProductsSection({
    eyebrow,
    title,
    desc,
    limit,
    activeCategory,
    onClearCategory,
    productType = "standard",
}: ProductsSectionProps) {
    const { data: catalogProducts } = useAllProducts();
    const { data: typedProducts } = useProducts(productType);
    const { addItem } = useCart();
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const normalizedActiveCategory = activeCategory ? normalizeCategory(activeCategory) : null;
    const sourceProducts = normalizedActiveCategory ? catalogProducts : typedProducts;

    const filtered = useMemo(() => {
        if (!normalizedActiveCategory) {
            return sourceProducts;
        }
        return sourceProducts.filter((product) => {
            const productCategory = normalizeCategory(product.category);
            return (
                productCategory === normalizedActiveCategory ||
                productCategory.includes(normalizedActiveCategory) ||
                normalizedActiveCategory.includes(productCategory)
            );
        });
    }, [sourceProducts, normalizedActiveCategory]);

    const visible = useMemo(() => {
        if (activeCategory || !limit) {
            return filtered;
        }
        return filtered.slice(0, limit);
    }, [filtered, limit, activeCategory]);

    return (
        <section id="products" className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHead eyebrow={eyebrow} title={title} desc={desc} />

                {activeCategory && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                            Showing: {activeCategory}
                        </span>
                        {onClearCategory && (
                            <button
                                type="button"
                                onClick={onClearCategory}
                                className="text-xs rounded-full border border-border px-3 py-1 hover:bg-secondary/60 transition"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visible.map((product, i) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={i}
                            onOpen={() => setActiveProduct(product)}
                            onAddToCart={() => addItem(product)}
                        />
                    ))}
                </div>
                {visible.length === 0 && (
                    <div className="mt-12 text-center text-sm text-muted-foreground">
                        No products available for this collection yet.
                    </div>
                )}
            </div>

            {activeProduct && (
                <div
                    className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm grid place-items-center p-4"
                    onClick={() => setActiveProduct(null)}
                >
                    <div
                        className="relative max-w-3xl w-full glass neon-border rounded-3xl overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveProduct(null)}
                            className="absolute right-4 top-4 h-9 w-9 rounded-full glass grid place-items-center hover:glow-pink transition z-10"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="grid md:grid-cols-2">
                            <div className="relative min-h-[320px]">
                                <img
                                    src={activeProduct.img}
                                    alt={activeProduct.name}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
                                {activeProduct.badge && (
                                    <span className="absolute top-4 left-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 glow-pink">
                                        {activeProduct.badge}
                                    </span>
                                )}
                            </div>
                            <div className="p-8 flex flex-col gap-4">
                                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">
                                    {activeProduct.category}
                                </div>
                                <h3 className="font-display text-3xl">
                                    {activeProduct.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                                    ))}
                                    <span className="text-muted-foreground ml-1">{activeProduct.rating}</span>
                                    <span className="mx-2 text-muted-foreground">&bull;</span>
                                    <span className={activeProduct.stock !== undefined && activeProduct.stock > 0 ? "text-green-400" : "text-destructive"}>
                                        {activeProduct.stock !== undefined && activeProduct.stock > 0 ? `In Stock (${activeProduct.stock})` : "Out of Stock"}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">
                                    {activeProduct.description}
                                </p>

                                <div className="flex items-end justify-between gap-4 pt-2">
                                    <div>
                                        <div className="font-display text-3xl font-bold text-gradient-neon">
                                            {formatPrice(activeProduct.price)}
                                        </div>
                                        {activeProduct.oldPrice && (
                                            <div className="text-xs text-muted-foreground line-through">
                                                {formatPrice(activeProduct.oldPrice)}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addItem(activeProduct)}
                                        disabled={activeProduct.stock !== undefined && activeProduct.stock <= 0}
                                        className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        Add to Cart
                                    </button>
                                </div>

                                <div className="mt-2 rounded-2xl border border-border/60 bg-secondary/30 p-4 text-xs text-muted-foreground">
                                    Ships in 4-6 days. Includes authenticity card, display stand, and protective foam.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}

function ProductCard({
    product,
    index,
    onOpen,
    onAddToCart,
}: {
    product: Product;
    index: number;
    onOpen: () => void;
    onAddToCart: () => void;
}) {
    return (
        <motion.div
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -8 }}
            className="group glass rounded-3xl overflow-hidden flex flex-col text-left cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden bg-secondary/50">
                <img
                    src={product.img}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {product.badge && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 glow-pink">
                        {product.badge}
                    </span>
                )}
                <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition">
                    <span className="h-9 w-9 rounded-full glass grid place-items-center">
                        <Box className="h-4 w-4" />
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                    <span className="text-muted-foreground ml-1">{product.rating}</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">
                    {product.category}
                </div>
                <h3 className="font-medium leading-snug">{product.name}</h3>
                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <div className="font-display text-2xl font-bold text-gradient-neon">
                            {formatPrice(product.price)}
                        </div>
                        {product.oldPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.oldPrice)}
                            </div>
                        )}
                        <div className={`mt-1 text-[10px] ${product.stock !== undefined && product.stock > 0 ? "text-green-400" : "text-destructive"}`}>
                            {product.stock !== undefined && product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onAddToCart();
                        }}
                        disabled={product.stock !== undefined && product.stock <= 0}
                        aria-label="Add to cart"
                        className="h-10 w-10 rounded-xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground hover:glow-pink transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
