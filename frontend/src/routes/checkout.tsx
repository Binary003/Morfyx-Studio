import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { api } from "@/lib/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
    head: () => ({
        meta: [{ title: "Checkout — Morfyx Studio" }],
    }),
    component: CheckoutPage,
});

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

function CheckoutPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { items, subtotal, itemCount, clear } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderCreated, setOrderCreated] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/login" });
        }
        if (items.length === 0) {
            navigate({ to: "/shop" });
        }
    }, [isAuthenticated, items.length, navigate]);

    const tax = 0; // removed tax calculation
    const total = subtotal;

    // Payment breakdown: 30% advance now, 70% COD later
    const advanceAmount = Math.round(total * 0.30);
    const codAmount = total - advanceAmount;

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validate form
            if (!formData.addressLine1 || !formData.city || !formData.state || !formData.zip) {
                throw new Error("Please fill in all address fields");
            }

            if (!/^\+?[0-9]{10,15}$/.test(formData.phone.trim())) {
                throw new Error("Please enter a valid phone number");
            }

            if (!/^[A-Za-z\s.-]{2,50}$/.test(formData.city.trim()) || !/^[A-Za-z\s.-]{2,50}$/.test(formData.state.trim())) {
                throw new Error("City and state should only contain letters and spaces");
            }

            if (!/^[A-Za-z0-9\s-]{4,10}$/.test(formData.zip.trim())) {
                throw new Error("Please enter a valid postal code");
            }

            const fullAddress = [formData.addressLine1, formData.addressLine2, formData.landmark]
                .map((part) => part.trim())
                .filter(Boolean)
                .join(", ");

            // Create order first
            const orderResponse: any = await api.createOrder({
                customerEmail: formData.email.trim(),
                orderedProducts: items.map((item) => ({
                    product: item.product.id,
                    name: item.product.name,
                    quantity: item.qty,
                    price: item.product.price,
                    image: item.product.img,
                })),
                totalAmount: Math.round(total * 100) / 100, // Round to 2 decimals
                shippingInfo: {
                    name: formData.name,
                    phone: formData.phone.trim(),
                    address: fullAddress,
                    addressLine1: formData.addressLine1.trim(),
                    addressLine2: formData.addressLine2.trim(),
                    landmark: formData.landmark.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    postalCode: formData.zip.trim(),
                    country: formData.country,
                },
            });

            const orderId = orderResponse?.data?.order?._id || orderResponse?.data?.order?.id;
            if (!orderId) {
                throw new Error("Failed to create order");
            }

            // Create Razorpay order (for 30% advance only)
            const razorpayResponse: any = await api.createRazorpayOrder({
                orderId,
                amount: Math.round(advanceAmount * 100), // Convert to paise (30% only)
            });

            const razorpayOrderId = razorpayResponse?.data?.razorpayOrderId;
            if (!razorpayOrderId) {
                throw new Error("Failed to create Razorpay order");
            }

            // Open Razorpay checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_key",
                amount: Math.round(advanceAmount * 100), // 30% only in paise
                currency: "INR",
                name: "Morfyx Studio",
                description: `Order of ${items.length} figure(s) - 30% Advance Payment`,
                order_id: razorpayOrderId,
                handler: async (response: RazorpayResponse) => {
                    try {
                        // Verify payment
                        const verifyResponse: any = await api.verifyPayment({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId, // Send the order ID so backend can find the order
                        });

                        if (verifyResponse?.success || verifyResponse?.data?.success) {
                            // Show success toast, clear cart and redirect
                            toast.success(verifyResponse?.message || verifyResponse?.data?.message || "Payment verified and order placed.");
                            clear();
                            navigate({
                                to: "/orders",
                                search: {
                                    success: true,
                                    message: "Payment verified and order placed.",
                                } as any,
                            } as any);
                        } else {
                            throw new Error("Payment verification failed");
                        }
                    } catch (err: any) {
                        setError(err.message || "Payment verification failed. Please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    orderId,
                    userId: user?.id,
                },
                theme: {
                    color: "#c084fc",
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError("Payment cancelled");
                    },
                },
            };

            const razorpay = (window as any).Razorpay;
            if (!razorpay) {
                throw new Error("Razorpay SDK not loaded");
            }

            const checkout = new razorpay(options);
            checkout.open();
            setOrderCreated(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;
    if (items.length === 0) return null;

    return (
        <PageShell>
            <PageHero eyebrow="Order" title="Checkout" desc="Complete your purchase securely with Razorpay." />

            <section className="pb-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleCheckout} className="space-y-6">
                                {error && (
                                    <div className="glass border border-red-500/20 bg-red-500/5 rounded-3xl p-4 flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-500">{error}</div>
                                    </div>
                                )}

                                {/* Shipping Address */}
                                <div className="glass neon-border rounded-3xl p-8">
                                    <h2 className="text-lg font-semibold mb-6">Shipping Address</h2>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Address Line 1
                                            </label>
                                            <input
                                                type="text"
                                                name="addressLine1"
                                                value={formData.addressLine1}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="House no, building, street"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Address Line 2
                                            </label>
                                            <input
                                                type="text"
                                                name="addressLine2"
                                                value={formData.addressLine2}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="Area, colony (optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Landmark
                                            </label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={formData.landmark}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="Near metro, school, mall (optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="City"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="State"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                PIN / ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zip"
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                                placeholder="Postal code"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                                                Country
                                            </label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-blue/50"
                                            >
                                                <option>India</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="glass neon-border rounded-3xl p-8">
                                    <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-neon-blue/30">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue" />
                                        <div>
                                            <div className="font-semibold text-sm">Razorpay</div>
                                            <div className="text-xs text-muted-foreground">Secure online payment</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${Math.round(advanceAmount)} Now (30%)`
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="glass neon-border rounded-3xl p-8 h-fit">
                            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <div>
                                            <div className="font-medium">{item.product.name}</div>
                                            <div className="text-xs text-muted-foreground">Qty: {item.qty}</div>
                                        </div>
                                        <div className="font-semibold">{formatPrice(item.product.price * item.qty)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{Math.round(subtotal)}</span>
                                </div>
                                {/* Tax row removed per request */}
                                <div className="pt-3 border-t border-white/10 flex justify-between font-semibold text-base">
                                    <span>Total</span>
                                    <span className="text-gradient-neon">₹{Math.round(total)}</span>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Payment Breakdown</div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-green-400">Pay Now (30%)</span>
                                            <span className="text-xs text-muted-foreground">Online via Razorpay</span>
                                        </div>
                                        <span className="font-bold text-green-400">₹{Math.round(advanceAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-blue-400">COD (70%)</span>
                                            <span className="text-xs text-muted-foreground">Pay on delivery</span>
                                        </div>
                                        <span className="font-bold text-blue-400">₹{Math.round(codAmount)}</span>
                                    </div>
                                    <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <p className="text-xs text-yellow-600/80">💡 30% advance is non-refundable</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PageShell>
    );
}
