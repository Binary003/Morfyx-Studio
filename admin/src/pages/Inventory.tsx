import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { adminApi } from "../lib/api";
import { Skeleton } from "../components/feedback/Skeleton";

interface InventoryItem {
    productId: string;
    productName: string;
    currentStock: number;
    lowStockThreshold: number;
}

export function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getInventory({ limit: 100 });
            
            if (response.success && response.data) {
                // Parse inventory data and calculate stock percentages
                const items = Array.isArray(response.data) 
                    ? response.data 
                    : response.data.items || [];
                
                const inventoryItems: InventoryItem[] = items.map((item: any) => ({
                    productId: item.product?._id || item.productId,
                    productName: item.product?.name || item.productName || "Unknown",
                    currentStock: item.stock || 0,
                    lowStockThreshold: item.lowStockThreshold || 5,
                }));

                setInventory(inventoryItems);

                // Filter low stock items
                const lowStock = inventoryItems.filter(
                    item => item.currentStock <= item.lowStockThreshold
                );
                setLowStockItems(lowStock);
            }
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and set up periodic refresh
    useEffect(() => {
        fetchInventory();
        
        // Refetch every 30 seconds for real-time updates
        const interval = setInterval(fetchInventory, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Inventory"
                subtitle="Track stock levels, restocks, and alerts."
            />

            {/* Top categories by stock */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {loading ? (
                    <>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </>
                ) : inventory.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No inventory data available
                    </div>
                ) : (
                    inventory.slice(0, 4).map((item) => {
                        const maxStock = 100; // Assume max stock for percentage calculation
                        const stockPercentage = Math.min((item.currentStock / maxStock) * 100, 100);
                        const isLowStock = item.currentStock <= item.lowStockThreshold;

                        return (
                            <Card key={item.productId} className={isLowStock ? "border-yellow-500/50" : ""}>
                                <CardHeader>
                                    <CardTitle className="text-sm truncate">{item.productName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Stock Level</span>
                                        <span>{item.currentStock} units</span>
                                    </div>
                                    <Progress 
                                        value={stockPercentage} 
                                        className={isLowStock ? "bg-yellow-500/20" : ""}
                                    />
                                    {isLowStock && (
                                        <div className="mt-2 text-xs text-yellow-600">
                                            ⚠️ Low stock alert
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Low Stock Alerts */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>
                        Low Stock Alerts ({lowStockItems.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : lowStockItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-4">
                            ✅ All items are well-stocked
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.map((item) => (
                                <div 
                                    key={item.productId}
                                    className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm"
                                >
                                    <div className="font-semibold text-yellow-700">{item.productName}</div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                        {item.currentStock} units left (threshold: {item.lowStockThreshold})
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
