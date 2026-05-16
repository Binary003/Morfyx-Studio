import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { categories } from "../data/mock";
import type { Category } from "../types";

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>(categories);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    featured: false,
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: form.description.trim() || "New category",
      featured: form.featured,
    };
    if (editingId) {
      setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
    } else {
      const next: Category = { id: `c-${Date.now()}`, ...payload };
      setItems((prev) => [next, ...prev]);
    }
    setForm({ name: "", slug: "", description: "", featured: false });
    setEditingId(null);
    setOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      featured: category.featured,
    });
    setOpen(true);
  };

  const handleDelete = (category: Category) => {
    setItems((prev) => prev.filter((item) => item.id !== category.id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Categories"
        subtitle="Curate anime universes, banners, and SEO metadata."
        action={
          <Button
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", slug: "", description: "", featured: false });
              setOpen(true);
            }}
          >
            Add Category
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <CardHeader>
              <div className="text-xs text-mutedForeground uppercase tracking-[0.3em]">{category.slug}</div>
              <div className="text-xl font-semibold">{category.name}</div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-mutedForeground">{category.description}</p>
              {category.featured && <Badge className="mt-3" variant="success">Featured</Badge>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(category)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-3xl border border-border/60 bg-background/90 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-semibold">
              {editingId ? "Update Category" : "Add Category"}
            </div>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Category name (e.g., One Piece)"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                placeholder="Slug (auto if empty)"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
              />
              <Textarea
                placeholder="Short description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
              <div className="flex items-center gap-3 text-sm">
                <Switch
                  checked={form.featured}
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                />
                Featured category
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Category</Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
