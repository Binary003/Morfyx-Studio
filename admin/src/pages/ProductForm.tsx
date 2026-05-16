import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { categories, products } from "../data/mock";

const emptyProduct = {
  name: "",
  category: "",
  price: 0,
  discountPrice: 0,
  rating: 4.8,
  badge: "",
  imageUrl: "https://placehold.co/600x600/png",
  description: "",
  offerText: "",
  stock: 0,
  type: "standard",
  featured: false,
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useMemo(() => products.find((item) => item.id === id), [id]);
  const [form, setForm] = useState(() => {
    if (!existing) {
      return emptyProduct;
    }
    return {
      name: existing.name,
      category: existing.category,
      price: existing.price,
      discountPrice: existing.discountPrice ?? 0,
      rating: existing.rating,
      badge: existing.badge ?? "",
      imageUrl: existing.imageUrl ?? "https://placehold.co/600x600/png",
      description: existing.description ?? "",
      offerText: existing.offerText ?? "",
      stock: existing.stock,
      type: existing.type,
      featured: existing.featured,
    };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title={id ? "Edit Product" : "Add Product"}
        subtitle="Update product details to match the storefront card layout."
        action={
          <>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button>Save</Button>
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <div className="text-[11px] text-mutedForeground">
                Categories are managed on the Categories page.
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
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                <option value="standard">Standard (Local)</option>
                <option value="imported">Imported</option>
              </Select>
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
              <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-6 text-center">
                <div className="text-sm font-semibold">Upload product images</div>
                <div className="text-xs text-mutedForeground mt-1">
                  Cloudinary upload will be connected after backend setup.
                </div>
                <Button type="button" variant="outline" className="mt-4">
                  Upload Image
                </Button>
              </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60">
              <img src={form.imageUrl} alt={form.name || "Preview"} className="h-full w-full object-cover" />
              {form.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] uppercase tracking-wider text-primaryForeground">
                  {form.badge}
                </span>
              )}
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-mutedForeground">
              {form.category || "Category"}
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
