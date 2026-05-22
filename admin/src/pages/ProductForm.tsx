import { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { adminApi } from "../lib/api";

interface Category {
    _id: string;
    name: string;
    slug: string;
}

const emptyProduct = {
    name: "",
    categoryId: "",  // Changed: store ID not name
    price: 0,
    discountPrice: 0,
    rating: 4.8,
    badge: "",
    images: [] as { file?: File; url?: string }[],
    description: "",
    offerText: "",
    stock: 0,
    type: "standard",
    featured: false,
    origin: "local",
};

export function ProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState(emptyProduct);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(id ? true : false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch categories from backend on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await adminApi.getCategories();
                // Response structure: { success, message, data: { categories: [...] } }
                let cats: Category[] = [];
                if (Array.isArray(response.data?.categories)) {
                    cats = response.data.categories;
                } else if (Array.isArray(response.data?.items)) {
                    cats = response.data.items;
                } else if (Array.isArray(response.data)) {
                    cats = response.data;
                }
                setCategories(cats);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Fetch product data when in edit mode
    useEffect(() => {
        if (!id) {
            setLoadingData(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setLoadingData(true);
                const response = await adminApi.getProduct(id);

                if (response.data?.product) {
                    const p = response.data.product;
                    setForm({
                        name: p.name || "",
                        categoryId: p.categoryId || p.category || "",  // Use categoryId from API
                        price: p.price || 0,
                        discountPrice: p.discountPrice || 0,
                        rating: p.rating || 4.8,
                        badge: p.badge || "",
                        images: (p.images && Array.isArray(p.images)) ? p.images : (p.imageUrl ? [{ url: p.imageUrl }] : []),
                        description: p.description || "",
                        offerText: p.offerText || "",
                        stock: p.stock || 0,
                        type: p.type || "standard",
                        featured: p.featured || false,
                        origin: p.type === "imported" ? "imported" : "local",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Failed to load product data");
            } finally {
                setLoadingData(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({ file }));
        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...newImages].slice(0, 8) // Max 8 images
        }));
    };

    const removeImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate required fields
            if (!form.name) throw new Error("Product name is required");
            if (!form.categoryId) throw new Error("Category is required");
            if (!form.price) throw new Error("Price is required");
            if (form.images.length === 0) throw new Error("At least one image is required");

            // Create FormData
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("animeCategory", form.categoryId);  // Send category ID
            formData.append("price", String(form.price));
            formData.append("discountPrice", String(form.discountPrice || 0));
            formData.append("stock", String(form.stock));
            formData.append("description", form.description);
            formData.append("productType", form.type);
            formData.append("origin", form.origin);
            formData.append("featured", String(form.featured));
            formData.append("badge", form.badge);
            formData.append("offerStrip", form.offerText);

            // Add only file images (exclude existing URLs)
            form.images.forEach(img => {
                if (img.file) {
                    formData.append("images", img.file);
                }
            });

            // Send to backend
            if (id) {
                await adminApi.updateProduct(id, formData);
                // After update, navigate back to products list
                navigate("/products");
            } else {
                await adminApi.createProduct(formData);
                // After create, navigate back to products list
                navigate("/products");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title={id ? "Edit Product" : "Add Product"}
                subtitle={id ? "Update product details and save changes." : "Add a new product to the catalog."}
                action={
                    <>
                        <Button variant="outline" onClick={() => navigate(-1)} disabled={loading || loadingData}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading || loadingData}>
                            {loading ? "Saving..." : loadingData ? "Loading..." : "Save"}
                        </Button>
                    </>
                }
            />

            {loadingData && (
                <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-600">
                    Loading product data...
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {loadingData ? (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Product name</label>
                                <Input
                                    placeholder="Example: Luffy Gear Fifth Aura"
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Category</label>
                                <Select
                                    value={form.categoryId}
                                    onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                                >
                                    <option value="">Select a category</option>
                                    {Array.isArray(categories) && categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                                <div className="text-[11px] text-mutedForeground">
                                    Categories are managed on the Categories page. {categories.length === 0 && "No categories yet."}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Price (Rs.)</label>
                                <Input
                                    type="number"
                                    placeholder="12999"
                                    value={form.price}
                                    onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Old price (optional)</label>
                                <Input
                                    type="number"
                                    placeholder="14999"
                                    value={form.discountPrice}
                                    onChange={(event) => setForm({ ...form, discountPrice: Number(event.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Stock</label>
                                <Input
                                    type="number"
                                    placeholder="20"
                                    value={form.stock}
                                    onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Product type</label>
                                <Select
                                    value={form.type}
                                    onChange={(event) => {
                                        const newType = event.target.value;
                                        setForm({
                                            ...form,
                                            type: newType,
                                            origin: newType === "imported" ? "imported" : "local"
                                        });
                                    }}
                                >
                                    <option value="standard">Standard (Local)</option>
                                    <option value="imported">Imported</option>
                                </Select>
                                <div className="text-[11px] text-mutedForeground">
                                    Standard = Shows on Products page | Imported = Shows on Imported Collections
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-mutedForeground">Description</label>
                                <Textarea
                                    placeholder="Short description shown on the product card"
                                    value={form.description}
                                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-mutedForeground">Product images</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {form.images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {form.images.map((img, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-border/60">
                                                <img
                                                    src={img.file ? URL.createObjectURL(img.file) : img.url}
                                                    alt={`Preview ${idx}`}
                                                    className="w-full h-24 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                                >
                                                    <X className="h-5 w-5 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        {form.images.length < 8 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="rounded-lg border border-dashed border-border/80 bg-card/40 flex flex-col items-center justify-center gap-2 p-4 hover:bg-card/60 transition h-24"
                                            >
                                                <Upload className="h-5 w-5 text-mutedForeground" />
                                                <span className="text-xs text-mutedForeground">Add more</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-6 text-center hover:bg-card/60 transition cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-8 w-8 mx-auto text-mutedForeground mb-2" />
                                        <div className="text-sm font-semibold">Click to upload images</div>
                                        <div className="text-xs text-mutedForeground mt-1">
                                            Drag and drop or click to select (up to 8 images)
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Offer strip text (optional)</label>
                                <Input
                                    placeholder="Example: Festival offer 12% off"
                                    value={form.offerText}
                                    onChange={(event) => setForm({ ...form, offerText: event.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Badge (optional)</label>
                                <Input
                                    placeholder="Example: New, Limited, Hot"
                                    value={form.badge}
                                    onChange={(event) => setForm({ ...form, badge: event.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-mutedForeground">Rating (0-5)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="4.8"
                                    value={form.rating}
                                    onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                                />
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Switch
                                    checked={form.featured}
                                    onClick={() => setForm({ ...form, featured: !form.featured })}
                                />
                                Featured product
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card/40">
                            {form.images.length > 0 ? (
                                <img
                                    src={form.images[0].file ? URL.createObjectURL(form.images[0].file) : form.images[0].url}
                                    alt={form.name || "Preview"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-mutedForeground text-sm">
                                    Upload images to see preview
                                </div>
                            )}
                            {form.badge && (
                                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] uppercase tracking-wider text-primaryForeground">
                                    {form.badge}
                                </span>
                            )}
                        </div>
                        <div className="text-xs uppercase tracking-[0.3em] text-mutedForeground">
                            {categories.find(c => c._id === form.categoryId)?.name || "Category"}
                        </div>
                        <div className="text-lg font-semibold">{form.name || "Product title"}</div>
                        <div className="text-sm text-mutedForeground">{form.description || "Short description"}</div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-xl font-semibold">Rs. {form.price || 0}</div>
                                {form.discountPrice > 0 && (
                                    <div className="text-xs text-mutedForeground line-through">Rs. {form.discountPrice}</div>
                                )}
                            </div>
                            <div className="text-xs text-neonCyan">{form.offerText || "Offer strip text"}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
