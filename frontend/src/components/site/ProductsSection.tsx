import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, ShoppingBag, Star, X } from "lucide-react";
import { toast } from "sonner";
import { SectionHead } from "./Collections";
import { formatPrice, type Product, type ProductType, useAllProducts, useProducts } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useProductDetail } from "@/lib/productDetailContext";

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
    const { setIsProductDetailOpen } = useProductDetail();
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const normalizedActiveCategory = activeCategory ? normalizeCategory(activeCategory) : null;
    const sourceProducts = normalizedActiveCategory ? catalogProducts : typedProducts;

    useEffect(() => {
        setIsProductDetailOpen(!!activeProduct);
    }, [activeProduct, setIsProductDetailOpen]);

    const activeImages = useMemo(() => {
        if (!activeProduct) {
            return [];
        }

        if (activeProduct.images && activeProduct.images.length > 0) {
            return activeProduct.images.slice(0, 3).filter(Boolean);
        }

        return [activeProduct.img];
    }, [activeProduct]);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [activeProduct]);

    useEffect(() => {
        if (!activeProduct || activeImages.length <= 1) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveImageIndex((current) => (current + 1) % activeImages.length);
        }, 3500);

        return () => window.clearInterval(timer);
    }, [activeProduct, activeImages.length]);

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

    const handleAddToCart = (product: Product) => {
        const added = addItem(product);
        if (added) {
            toast.success(`${product.name} added to cart.`, { duration: 1400 });
        }
    };

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
                            onAddToCart={() => handleAddToCart(product)}
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
                    className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm grid items-start justify-center overflow-y-auto px-2 pt-16 sm:items-center sm:px-4 sm:pt-24"
                    onClick={() => {
                        setActiveProduct(null);
                        setActiveImageIndex(0);
                    }}
                >
                    <div
                        className="relative mt-2 max-w-4xl w-full max-h-[calc(100dvh-5rem)] sm:mt-0 sm:max-h-[calc(100dvh-6rem)] glass neon-border rounded-2xl sm:rounded-3xl overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setActiveProduct(null);
                                setActiveImageIndex(0);
                            }}
                            className="absolute right-3 top-4 h-9 w-9 rounded-full glass grid place-items-center hover:glow-pink transition z-10 sm:right-4 sm:h-10 sm:w-10"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6 font-bold" />
                        </button>
                        <div className="grid min-h-0 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] max-h-[calc(100dvh-5rem)] sm:max-h-[calc(100dvh-6rem)] overflow-y-auto">
                            <div className="relative aspect-[4/5] min-h-[200px] sm:aspect-[3/4] md:min-h-[360px] overflow-hidden bg-secondary/40">
                                <div className="absolute inset-0 p-3 sm:p-4">
                                    {activeImages.map((image, index) => (
                                        <motion.img
                                            key={`${activeProduct.id}-${index}-${image}`}
                                            src={image}
                                            alt={`${activeProduct.name} image ${index + 1}`}
                                            initial={{ opacity: 0, scale: 1.04 }}
                                            animate={{
                                                opacity: index === activeImageIndex ? 1 : 0,
                                                scale: index === activeImageIndex ? 1 : 1.04,
                                            }}
                                            transition={{ duration: 0.35 }}
                                            className="absolute inset-0 h-full w-full object-contain object-center"
                                            aria-hidden={index !== activeImageIndex}
                                        />
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
                                {activeProduct.badge && (
                                    <span className="absolute top-4 left-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 glow-pink">
                                        {activeProduct.badge}
                                    </span>
                                )}
                                {activeImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Previous image"
                                            onClick={() => setActiveImageIndex((current) => (current - 1 + activeImages.length) % activeImages.length)}
                                            className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full glass hover:glow-pink transition sm:left-4 sm:h-11 sm:w-11"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m15 18-6-6 6-6" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Next image"
                                            onClick={() => setActiveImageIndex((current) => (current + 1) % activeImages.length)}
                                            className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full glass hover:glow-pink transition sm:right-4 sm:h-11 sm:w-11"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                            {activeImages.map((_, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    aria-label={`Go to image ${index + 1}`}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`h-2 rounded-full transition-all ${index === activeImageIndex ? "w-8 bg-[var(--gradient-neon)]" : "w-2 bg-white/40"}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="min-h-0 p-4 sm:p-8 flex flex-col gap-3 sm:gap-4 pb-8 sm:pb-8">
                                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">
                                    {activeProduct.category}
                                </div>
                                <h3 className="font-display text-2xl sm:text-3xl leading-tight">
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
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {activeProduct.description}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-2">
                                    <div>
                                        <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-neon">
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
                                        onClick={() => handleAddToCart(activeProduct)}
                                        disabled={activeProduct.stock !== undefined && activeProduct.stock <= 0}
                                        className="w-full sm:w-auto rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 glow-pink max-sm:text-[9px] max-sm:px-2 max-sm:py-0.5">
                        {product.badge}
                    </span>
                )}
                <div className="absolute right-3 top-3 hidden flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition sm:flex">
                    <span className="h-9 w-9 rounded-full glass grid place-items-center">
                        <Box className="h-4 w-4" />
                    </span>
                </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-1">
                <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                    <span className="text-muted-foreground ml-1">{product.rating}</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">
                    {product.category}
                </div>
                <h3 className="font-medium leading-snug text-sm sm:text-base">{product.name}</h3>
                <div className="mt-auto flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <div>
                        <div className="font-display text-xl sm:text-2xl font-bold text-gradient-neon">
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
