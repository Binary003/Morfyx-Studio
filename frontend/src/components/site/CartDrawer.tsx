import { LogIn, Minus, Plus, ShoppingBag, Ticket, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function CartDrawer({ trigger }: { trigger: React.ReactNode }) {
    const navigate = useNavigate();
    const { items, itemCount, subtotal, updateQty, removeItem, clear } = useCart();
    const { isAuthenticated } = useAuth();
    const [authPromptOpen, setAuthPromptOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const tax = 0; // tax removed per request
    const total = subtotal;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            setAuthPromptOpen(true);
            setCartOpen(false);
            return;
        }
        setCartOpen(false);
        navigate({ to: "/checkout" });
    };

    return (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg border-border/60 bg-background/95 glass flex flex-col">
                <SheetHeader>
                    <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-4 overflow-y-auto pr-2 max-h-[45vh]">
                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center">
                            <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground" />
                            <div className="mt-3 text-sm text-muted-foreground">
                                Your cart is empty. Add a figure to get started.
                            </div>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="flex gap-4 rounded-2xl border border-border/60 bg-secondary/30 p-4">
                                <img
                                    src={item.product.img}
                                    alt={item.product.name}
                                    className="h-20 w-20 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-semibold">{item.product.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.product.category}</div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="font-display text-lg text-gradient-neon">
                                            {formatPrice(item.product.price)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.product.id, item.qty - 1)}
                                                className="h-8 w-8 rounded-lg glass grid place-items-center"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="min-w-6 text-center text-sm">{item.qty}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.product.id, item.qty + 1)}
                                                className="h-8 w-8 rounded-lg glass grid place-items-center"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.product.id)}
                                                className="h-8 w-8 rounded-lg glass grid place-items-center text-destructive"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-6 space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {/* Tax removed from totals */}
                        <div className="mt-4 flex items-center justify-between text-base font-semibold">
                            <span>Total</span>
                            <span className="text-gradient-neon font-display text-xl">{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Ticket className="h-4 w-4" /> Offers
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Add a coupon at checkout or apply studio credits once you log in.
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleCheckout}
                            className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
                        >
                            {isAuthenticated ? "Proceed to Payment" : "Log In to Checkout"}
                        </button>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center">
                            Razorpay ready checkout
                        </div>
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clear}
                                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition"
                            >
                                Clear cart
                            </button>
                        )}
                    </div>
                </div>
            </SheetContent>

            {authPromptOpen && (
                <div
                    className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm grid place-items-center p-4"
                    onClick={() => setAuthPromptOpen(false)}
                >
                    <div
                        className="relative max-w-md w-full glass neon-border rounded-3xl p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setAuthPromptOpen(false)}
                            className="absolute right-4 top-4 h-9 w-9 rounded-full glass grid place-items-center hover:glow-pink transition"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account required</div>
                        <div className="font-display text-2xl font-bold mt-2">Log in to place an order</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            We need your account details so the admin can track your order and delivery updates.
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                            <Link
                                to="/login"
                                onClick={() => setAuthPromptOpen(false)}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
                            >
                                <LogIn className="h-4 w-4" /> Log In
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setAuthPromptOpen(false)}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary/60 transition"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </Sheet>
    );
}
