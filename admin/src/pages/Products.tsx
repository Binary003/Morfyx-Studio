import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Pagination } from "../components/ui/pagination";
import { products } from "../data/mock";

export function ProductsPage() {
    const navigate = useNavigate();
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
                        <Input placeholder="Search products" />
                        <Select>
                            <option>All Categories</option>
                            <option>Naruto</option>
                            <option>One Piece</option>
                            <option>Tokyo Ghoul</option>
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
                                <TableHeaderCell>Featured</TableHeaderCell>
                                <TableHeaderCell>Imported</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="font-semibold">{product.name}</div>
                                        <div className="text-xs text-mutedForeground">{product.offerText}</div>
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>
                                        Rs. {product.discountPrice ?? product.price}
                                        {product.discountPrice && (
                                            <span className="text-xs text-mutedForeground line-through ml-2">Rs. {product.price}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === "active" ? "success" : "warning"}>{product.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={product.featured} />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.imported ? "info" : "default"}>{product.imported ? "Imported" : "Local"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/products/${product.id}`)}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="mt-4 flex justify-between">
                <div className="text-xs text-mutedForeground">Showing 1-3 of 24 products</div>
                <Pagination page={1} totalPages={8} />
            </div>
        </motion.div>
    );
}
