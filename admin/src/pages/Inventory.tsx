import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, LayoutGrid, Plus, Trash2, Upload, X } from "lucide-react";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/feedback/Skeleton";
import { adminApi } from "../lib/api";

type CollectionCard = {
    id: string;
    name: string;
    slug: string;
    description: string;
    featured: boolean;
    bannerImage?: {
        url: string;
        publicId: string;
    };
};

type ProductItem = {
    category?: string;
};

type CategoryForm = {
    name: string;
    slug: string;
    description: string;
    featured: boolean;
    bannerFile: File | null;
    bannerPreview: string;
};

const emptyForm: CategoryForm = {
    name: "",
    slug: "",
    description: "",
    featured: true,
    bannerFile: null,
    bannerPreview: "",
};

function normalizeCategory(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function toCollectionCard(item: any): CollectionCard {
    return {
        id: item._id || item.id,
        name: item.name,
        slug: item.slug || normalizeCategory(item.name),
        description: item.description || "",
        featured: Boolean(item.featured),
        bannerImage: item.bannerImage?.url
            ? {
                url: item.bannerImage.url,
                publicId: item.bannerImage.publicId || "",
            }
            : undefined,
    };
}

function getCollectionList(response: any): CollectionCard[] {
    if (Array.isArray(response?.data?.categories)) {
        return response.data.categories.map(toCollectionCard);
    }

    if (Array.isArray(response?.data?.items)) {
        return response.data.items.map(toCollectionCard);
    }

    if (Array.isArray(response?.data)) {
        return response.data.map(toCollectionCard);
    }

    return [];
}

function getProductList(response: any): ProductItem[] {
    if (Array.isArray(response?.data?.items)) {
        return response.data.items;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
}

function makeSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function InventoryPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [collections, setCollections] = useState<CollectionCard[]>([]);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CategoryForm>(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoryResponse, productResponse] = await Promise.all([
                adminApi.getCategories(),
                adminApi.getProducts({ limit: 500 }),
            ]);

            setCollections(getCollectionList(categoryResponse));
            setProducts(getProductList(productResponse));
        } catch (error) {
            console.error("Failed to fetch collections:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const countByCategory = useMemo(() => {
        const counts = new Map<string, number>();

        for (const product of products) {
            const key = normalizeCategory(product.category || "");
            if (!key) {
                continue;
            }

            counts.set(key, (counts.get(key) || 0) + 1);
        }

        return counts;
    }, [products]);

    const collectionCards = useMemo(() => {
        return collections.map((collection) => ({
            ...collection,
            productCount: countByCategory.get(normalizeCategory(collection.name)) || 0,
        }));
    }, [collections, countByCategory]);

    const featuredCount = collectionCards.filter((item) => item.featured).length;
    const totalProducts = products.length;

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setOpen(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEditForm = (collection: CollectionCard) => {
        setEditingId(collection.id);
        setForm({
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            featured: collection.featured,
            bannerFile: null,
            bannerPreview: collection.bannerImage?.url || "",
        });
        setOpen(true);
    };

    const handleBannerSelect = (file?: File) => {
        if (!file) {
            return;
        }

        setForm((current) => ({
            ...current,
            bannerFile: file,
            bannerPreview: URL.createObjectURL(file),
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            return;
        }

        const payload = new FormData();
        payload.append("name", form.name.trim());
        payload.append("slug", form.slug.trim() || makeSlug(form.name));
        payload.append("description", form.description.trim() || "Homepage collection card");
        payload.append("featured", String(form.featured));

        if (form.bannerFile) {
            payload.append("banner", form.bannerFile);
        }

        try {
            setSaving(true);
            if (editingId) {
                const response = (await adminApi.updateCategory(editingId, payload)) as any;
                const updated = response?.data?.category ? toCollectionCard(response.data.category) : null;
                if (updated) {
                    setCollections((current) => current.map((item) => (item.id === editingId ? updated : item)));
                }
            } else {
                const response = (await adminApi.createCategory(payload)) as any;
                const created = response?.data?.category ? toCollectionCard(response.data.category) : null;
                if (created) {
                    setCollections((current) => [created, ...current]);
                }
            }
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Failed to save collection:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (collection: CollectionCard) => {
        try {
            await adminApi.deleteCategory(collection.id);
            setCollections((current) => current.filter((item) => item.id !== collection.id));
        } catch (error) {
            console.error("Failed to delete collection:", error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Collections"
                subtitle="Build the featured category cards shown on the homepage, with banners and live product counts."
                action={
                    <Button onClick={openCreateForm}>
                        <Plus className="h-4 w-4" />
                        Add Collection
                    </Button>
                }
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Homepage cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{collectionCards.length}</div>
                        <div className="text-xs text-mutedForeground">Collections available for the homepage</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Featured cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{featuredCount}</div>
                        <div className="text-xs text-mutedForeground">Visible in the featured collections row</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Linked products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{totalProducts}</div>
                        <div className="text-xs text-mutedForeground">Products used to calculate collection counts</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    <>
                        <Skeleton className="h-72 w-full" />
                        <Skeleton className="h-72 w-full" />
                        <Skeleton className="h-72 w-full" />
                        <Skeleton className="h-72 w-full" />
                        <Skeleton className="h-72 w-full" />
                        <Skeleton className="h-72 w-full" />
                    </>
                ) : collectionCards.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center text-mutedForeground">
                        No collections yet. Add one to publish a homepage card.
                    </div>
                ) : (
                    collectionCards.map((collection) => (
                        <Card key={collection.id} className="overflow-hidden">
                            <div className="relative aspect-[16/10] bg-secondary/40">
                                {collection.bannerImage?.url ? (
                                    <img
                                        src={collection.bannerImage.url}
                                        alt={collection.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                                        <ImagePlus className="h-12 w-12 text-mutedForeground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                    <Badge variant="info">{collection.productCount} products</Badge>
                                    {collection.featured && <Badge variant="success">Featured</Badge>}
                                </div>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-xl">{collection.name}</CardTitle>
                                        <div className="text-xs uppercase tracking-[0.25em] text-mutedForeground">{collection.slug}</div>
                                    </div>
                                    <LayoutGrid className="h-5 w-5 text-mutedForeground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-mutedForeground">{collection.description || "Homepage collection card"}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditForm(collection)}>
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(collection)}>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4" onClick={resetForm}>
                    <div
                        className="w-full max-w-4xl rounded-3xl border border-border/60 bg-background/95 p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-lg font-semibold">
                                    {editingId ? "Update Collection" : "Add Collection"}
                                </div>
                                <div className="text-sm text-mutedForeground">
                                    Configure the homepage card, banner art, and featured visibility.
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-9 w-9 rounded-full border border-border/60 grid place-items-center"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                <Input
                                    placeholder="Collection name, e.g. Naruto"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                            slug: current.slug || makeSlug(event.target.value),
                                        }))
                                    }
                                />
                                <Input
                                    placeholder="Slug (optional)"
                                    value={form.slug}
                                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                                />
                                <Textarea
                                    placeholder="Short homepage description"
                                    value={form.description}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                />

                                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
                                    <div>
                                        <div className="text-sm font-medium">Featured on homepage</div>
                                        <div className="text-xs text-mutedForeground">
                                            Featured collections appear in the homepage card row.
                                        </div>
                                    </div>
                                    <Switch
                                        checked={form.featured}
                                        onClick={() => setForm({ ...form, featured: !form.featured })}
                                    />
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => handleBannerSelect(event.target.files?.[0])}
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full rounded-2xl border border-dashed border-border/70 bg-card/40 p-5 text-left transition hover:bg-card/60"
                                >
                                    <div className="flex items-center gap-3">
                                        <Upload className="h-5 w-5 text-mutedForeground" />
                                        <div>
                                            <div className="text-sm font-medium">Upload banner image</div>
                                            <div className="text-xs text-mutedForeground">
                                                This image will be shown on the homepage collection card.
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="rounded-3xl border border-border/60 bg-card/40 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-mutedForeground">Live preview</div>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-border/60">
                                    <div className="relative aspect-[4/5] bg-secondary/40">
                                        {form.bannerPreview ? (
                                            <img
                                                src={form.bannerPreview}
                                                alt={form.name || "Collection preview"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                                                <ImagePlus className="h-14 w-14 text-mutedForeground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute left-4 top-4 flex gap-2">
                                            <Badge variant="info">
                                                {countByCategory.get(normalizeCategory(form.name)) || 0} products
                                            </Badge>
                                            {form.featured && <Badge variant="success">Featured</Badge>}
                                        </div>
                                        <div className="absolute inset-x-4 bottom-4">
                                            <div className="text-2xl font-semibold text-white">
                                                {form.name || "Your collection"}
                                            </div>
                                            <div className="mt-1 text-sm text-white/80">
                                                {form.description || "Homepage card preview"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={resetForm} disabled={saving}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
                                {saving ? "Saving..." : editingId ? "Update Collection" : "Create Collection"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}