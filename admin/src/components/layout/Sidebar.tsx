import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    CalendarClock,
    ClipboardList,
    Cog,
    Grid3X3,
    Home,
    LayoutGrid,
    Megaphone,
    Package,
    ShoppingBag,
    Star,
    UserCircle,
    Users,
} from "lucide-react";
import { useMedia } from "../../hooks/use-media";
import { useUiStore } from "../../store/uiStore";
import { cn } from "../../utils/cn";

const navItems = [
    { label: "Dashboard", to: "/", icon: Home },
    { label: "Products", to: "/products", icon: Package },
    { label: "Categories", to: "/categories", icon: Grid3X3 },
    { label: "Orders", to: "/orders", icon: ShoppingBag },
    { label: "Customers", to: "/customers", icon: Users },
    { label: "Collections", to: "/collections", icon: LayoutGrid },
    { label: "Offers & Banners", to: "/offers", icon: Megaphone },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "Reviews", to: "/reviews", icon: Star },
    { label: "Settings", to: "/settings", icon: Cog },
    { label: "Admin Profile", to: "/profile", icon: UserCircle },
];

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const isDesktop = useMedia("(min-width: 1024px)");
    const { sidebarCollapsed, toggleCollapse } = useUiStore();

    const content = (
        <div
            className={cn(
                "glass h-full w-72 border-r border-border/60 px-4 py-6",
                "bg-background/70"
            )}
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/80 grid place-items-center font-bold text-foreground shadow-neon">
                        M
                    </div>
                    <div>
                        <div className="text-lg font-semibold">Morfyx Admin</div>
                        <div className="text-xs uppercase tracking-[0.25em] text-mutedForeground">Command Center</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60"
                >
                    <CalendarClock className="h-4 w-4" />
                </button>
            </div>
            <div className="mt-8 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                                isActive
                                    ? "bg-primary/20 text-foreground shadow-neon"
                                    : "text-mutedForeground hover:bg-card/50"
                            )
                        }
                        onClick={onClose}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
            <div className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-neonCyan/20 grid place-items-center">
                        <ClipboardList className="h-4 w-4 text-neonCyan" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold">Ops Status</div>
                        <div className="text-xs text-mutedForeground">All systems online</div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isDesktop) {
        return <aside className="fixed inset-y-0 left-0 hidden lg:block">{content}</aside>;
    }

    return (
        <AnimatePresence>
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60"
                    onClick={onClose}
                >
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-0 h-full w-72"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {content}
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
