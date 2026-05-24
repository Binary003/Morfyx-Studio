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
  paymentInfo?: {
    status?: "pending" | "paid" | "failed";
  };
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
  const search = useSearch({ from: "/orders" }) as { success?: boolean; message?: string };
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, pages: 0 });
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
        const response = await api.getOrders({ page: pagination.page, limit: pagination.limit });
        if (response?.data?.items || response?.data?.orders) {
          setOrders(response.data.items || response.data.orders);
          setPagination((prev) => ({
            ...prev,
            ...(response.data.pagination || {}),
          }));
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

    // Keep order status/tracking in sync with admin updates.
    const intervalId = window.setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, navigate, successMessage, pagination.page, pagination.limit]);

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

  const getPaymentStatusLabel = (status?: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "failed":
        return "Failed";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getPaymentBadgeClass = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 border border-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/10 border border-red-500/20 text-red-400";
      case "pending":
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
            <div className="glass neon-border rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Signed in as</div>
                  <div className="text-lg font-semibold mt-1 break-words">{user?.name}</div>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  Showing {orders.length} of {pagination.total} orders
                </div>
              </div>

              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order._id || order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-white/20 transition">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order</div>
                          <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </div>
                        </div>
                        <div className="mt-1 font-mono text-xs sm:text-sm font-semibold leading-5 break-all text-white/90">
                          {order.orderNumber || order._id}
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
                          <span>{order.orderedProducts?.length || 0} item{(order.orderedProducts?.length || 0) === 1 ? "" : "s"}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[260px]">
                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment</div>
                          <div className={`mt-1 inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getPaymentBadgeClass(order.paymentInfo?.status)}`}>
                            {getPaymentStatusLabel(order.paymentInfo?.status)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Shipping</div>
                          <div className={`mt-1 inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getShipmentBadgeClass(order.shipmentStatus)}`}>
                            {getShipmentStatusLabel(order.shipmentStatus)}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-right">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total</div>
                          <div className="text-base sm:text-lg font-bold mt-1 text-gradient-neon">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>

                    {order.orderedProducts && order.orderedProducts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Items</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {order.orderedProducts.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm gap-3 min-w-0">
                              <span className="min-w-0 flex-1 truncate text-muted-foreground">{item?.name || `Product (${item?.quantity || 1}x)`}</span>
                              <span className="shrink-0 text-white/90">x{item?.quantity || 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.trackingId && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-sm text-muted-foreground">
                        <span className="uppercase tracking-[0.2em] text-xs">Tracking</span>
                        <div className="mt-1 font-mono text-xs sm:text-sm break-all">{order.trackingId}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page <= 1}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page >= pagination.pages}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
