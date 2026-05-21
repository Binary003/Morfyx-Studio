import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "My Orders — Morfyx Studio" }],
  }),
  component: OrdersPage,
});

interface Order {
  _id: string;
  id?: string;
  orderNumber?: string;
  orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  shipmentStatus?: "not_created" | "pending" | "picked" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  totalAmount: number;
  orderedProducts: Array<{ name: string; quantity: number; price: number; image?: string }>;
  createdAt: string;
  updatedAt?: string;
}

function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const search = useSearch({ from: "/orders" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    search?.success ? search?.message || "Payment verified and order placed. Your order is being processed." : ""
  );

  useEffect(() => {
    if (search?.success) {
      toast.success(search?.message || "Payment verified and order placed. Your order is being processed.");
    }
  }, [search?.message, search?.success]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.getOrders({ page: 1, limit: 50 });
        if (response?.data?.orders || response?.data?.items) {
          setOrders(response.data.orders || response.data.items);
        } else if (Array.isArray(response?.data)) {
          setOrders(response.data);
        }
      } catch (err: any) {
        // Handle case where user has no orders yet
        if (err.response?.status === 404) {
          setOrders([]);
        } else {
          setError(err.message || "Failed to load orders");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, successMessage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-400";
      case "shipped":
        return "text-blue-400";
      case "processing":
        return "text-yellow-400";
      case "paid":
      case "pending":
        return "text-orange-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 border border-green-500/20";
      case "shipped":
        return "bg-blue-500/10 border border-blue-500/20";
      case "processing":
        return "bg-yellow-500/10 border border-yellow-500/20";
      case "paid":
      case "pending":
        return "bg-orange-500/10 border border-orange-500/20";
      case "cancelled":
        return "bg-red-500/10 border border-red-500/20";
      default:
        return "bg-white/5 border border-white/10";
    }
  };

  const getShipmentStatusLabel = (status?: string) => {
    switch (status) {
      case "picked":
        return "Picked";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      case "not_created":
      default:
        return "Pending";
    }
  };

  const getShipmentBadgeClass = (status?: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 border border-green-500/20 text-green-400";
      case "shipped":
      case "picked":
        return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
      case "cancelled":
        return "bg-red-500/10 border border-red-500/20 text-red-400";
      case "pending":
      case "not_created":
      default:
        return "bg-orange-500/10 border border-orange-500/20 text-orange-400";
    }
  };

  if (!isAuthenticated) return null;

  return (
    <PageShell>
      <PageHero eyebrow="Account" title="My Orders" desc="Track current orders and revisit past collectibles." />

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {successMessage && (
            <div className="glass neon-border rounded-3xl p-4 mb-6 border-green-500/20 bg-green-500/5">
              <div className="text-sm text-green-400">✅ {successMessage}</div>
            </div>
          )}

          {error && (
            <div className="glass neon-border rounded-3xl p-4 mb-6 border-red-500/20 bg-red-500/5">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="glass neon-border rounded-3xl p-8 text-center">
              <div className="text-lg text-muted-foreground">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass neon-border rounded-3xl p-8 text-center">
              <div className="text-lg font-semibold">No orders yet</div>
              <div className="text-sm text-muted-foreground mt-2">Start shopping to see your orders here</div>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center mt-6 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="glass neon-border rounded-3xl p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Signed in as</div>
              <div className="text-lg font-semibold mb-6">{user?.name}</div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id || order.id} className="border border-white/10 rounded-lg p-6 hover:border-white/20 hover:bg-white/5 transition">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order ID</div>
                        <div className="text-sm font-semibold mt-1 font-mono">{order.orderNumber || order._id}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Items</div>
                        <div className="text-sm font-semibold mt-1">{order.orderedProducts?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</div>
                        <div className={`text-sm font-semibold mt-1 capitalize ${getStatusColor(order.orderStatus || "pending")}`}>{order.orderStatus || "pending"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Shipping</div>
                        <div className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getShipmentBadgeClass(order.shipmentStatus)}`}>
                          {getShipmentStatusLabel(order.shipmentStatus)}
                        </div>
                        {order.trackingId && (
                          <div className="text-xs text-muted-foreground mt-2 font-mono">
                            Tracking: {order.trackingId}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</div>
                        <div className="text-lg font-bold mt-1 text-gradient-neon">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {order.orderedProducts && order.orderedProducts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Items</div>
                        <div className="space-y-2">
                          {order.orderedProducts.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item?.name || `Product (${item?.quantity || 1}x)`}</span>
                              <span>₹{((item?.price || 0) * (item?.quantity || 1)).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 px-6 py-3 font-semibold transition"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
