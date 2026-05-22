import { Bell, LogOut, Menu, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../store/authStore";

const titles: Record<string, string> = {
    "/": "Dashboard",
    "/products": "Products",
    "/categories": "Categories",
    "/orders": "Orders",
    "/customers": "Customers",
    "/collections": "Collections",
    "/inventory": "Collections",
    "/offers": "Offers & Banners",
    "/analytics": "Analytics",
    "/reviews": "Reviews",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/profile": "Admin Profile",
};

export function Topbar() {
    const { pathname } = useLocation();
    const { toggleSidebar } = useUiStore();
    const logout = useAuthStore((state) => state.logout);
    const title = pathname.startsWith("/products/")
        ? "Product Details"
        : titles[pathname] ?? "Dashboard";

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
            <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-mutedForeground">Command Center</div>
                        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                    </div>
                </div>
                <div className="flex flex-1 items-center gap-3 sm:justify-end">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedForeground" />
                        <Input className="pl-9" placeholder="Search products, orders..." />
                    </div>
                    <Button variant="secondary" className="hidden sm:inline-flex">
                        <Sparkles className="h-4 w-4" />
                        Quick Actions
                    </Button>
                    <Button variant="outline" className="hidden sm:inline-flex" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                    <button
                        type="button"
                        className={cn("relative h-10 w-10 rounded-xl border border-border/60 bg-card/60")}
                    >
                        <Bell className="h-4 w-4 mx-auto" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neonPink" />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hidden sm:flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-3 py-2"
                    >
                        <div className="h-9 w-9 rounded-xl bg-neonPurple/30 grid place-items-center text-sm font-semibold">
                            A
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Admin Akira</div>
                            <div className="text-xs text-mutedForeground">Super Admin</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </header>
    );
}
