import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Pagination } from "../components/ui/pagination";
import { Skeleton } from "../components/feedback/Skeleton";
import { adminApi } from "../lib/api";
import type { Product } from "../types";

export function ProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState<string[]>([]);
    const pageRef = useRef(1);
    const categoryRef = useRef("All");

    // Update refs when state changes
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        categoryRef.current = selectedCategory;
    }, [selectedCategory]);

    const fetchData = async (pageNum?: number, category?: string) => {
        try {
            setLoading(true);

            // Fetch categories once
            const catResponse = await adminApi.getCategories();
            if (catResponse.success && catResponse.data?.categories) {
                setCategories(catResponse.data.categories.map((c: any) => c.name));
            }

            // Fetch products with current or provided page/category
            const prodResponse = await adminApi.getProducts({
                page: pageNum ?? pageRef.current,
                limit: 20,
                ...(category !== undefined
                    ? (category !== "All" && { category: category.toLowerCase() })
                    : (categoryRef.current !== "All" && { category: categoryRef.current.toLowerCase() })
                )
            });

            if (prodResponse.success && prodResponse.data?.items) {
                setProducts(prodResponse.data.items);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on initial mount and when page/category changes
    useEffect(() => {
        fetchData(page, selectedCategory);

        // Set up periodic refetch every 30 seconds to catch stock changes
        const interval = setInterval(() => {
            fetchData(pageRef.current, categoryRef.current);
        }, 30000);

        return () => clearInterval(interval);
    }, [page, selectedCategory]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await adminApi.deleteProduct(id);
            // Refresh the list after deletion
            await fetchData(pageRef.current, categoryRef.current);
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Failed to delete product");
        }
    };

    const filteredProducts = searchTerm
        ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : products;

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Products"
                subtitle="Manage core catalog, stock, pricing, and feature flags."
                action={
                    <>
                        <Button variant="outline">Bulk Actions</Button>
                        <Button onClick={() => navigate("/products/new")}>Add Product</Button>
                    </>
                }
            />

            <Card className="mt-6">
                <CardContent className="py-5">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="Search products"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option>All Categories</option>
                            {categories.map(cat => <option key={cat}>{cat}</option>)}
                        </Select>
                        <Select>
                            <option>Sort by latest</option>
                            <option>Sort by stock</option>
                            <option>Sort by rating</option>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardContent className="overflow-hidden">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Product</TableHeaderCell>
                                <TableHeaderCell>Category</TableHeaderCell>
                                <TableHeaderCell>Price</TableHeaderCell>
                                <TableHeaderCell>Stock</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Rating</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="font-semibold">{product.name}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                                                {product.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            Rs. {product.price}
                                            {product.discountPrice && (
                                                <span className="text-xs text-muted-foreground line-through ml-2">
                                                    Rs. {product.discountPrice}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{product.stock ?? "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === "active" ? "success" : "warning"}>
                                                {product.status || "active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {product.rating ? product.rating.toFixed(1) : "—"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {!loading && (
                <div className="mt-4 flex justify-between">
                    <div className="text-xs text-muted-foreground">Showing {filteredProducts.length} products</div>
                    <Pagination page={page} totalPages={10} />
                </div>
            )}
        </motion.div>
    );
}
