import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { useCustomFigureModal } from "./CustomFigureModal";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "@/lib/cart";
import { formatPrice, useAllProducts } from "@/lib/products";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Imported Collection", to: "/imported" as const },
  { label: "Custom Figures", to: "/custom" as const, action: "custom" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

function isActivePath(pathname: string, target: string) {
  if (target === "/") {
    return pathname === "/";
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

function getCurrentPageLabel(pathname: string) {
  const matchedLink = links.find((link) => isActivePath(pathname, link.to));
  if (matchedLink) {
    return matchedLink.label;
  }

  if (pathname.startsWith("/orders")) return "My Orders";
  if (pathname.startsWith("/profile")) return "My Profile";
  if (pathname.startsWith("/login")) return "Log In";
  if (pathname.startsWith("/signup")) return "Sign Up";
  if (pathname.startsWith("/shop")) return "Shop";
  if (pathname.startsWith("/imported")) return "Imported Collection";
  if (pathname.startsWith("/custom")) return "Custom Figures";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/contact")) return "Contact";

  return "Home";
}

export function Navbar({ withOfferStrip = false }: { withOfferStrip?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { data: allProducts } = useAllProducts();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [];
    }

    const categories = allProducts.map((product) => product.category.toLowerCase());
    const categorySet = new Set(categories);
    if (categorySet.has(q)) {
      return allProducts.filter((product) => product.category.toLowerCase() === q);
    }

    const exactProduct = allProducts.find((product) => product.name.toLowerCase() === q);
    if (exactProduct) {
      return [exactProduct];
    }

    return allProducts
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [allProducts, query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed left-0 right-0 ${withOfferStrip ? "top-9" : "top-0"} z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"
        }`}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all ${scrolled ? "glass glow-cyan" : ""
            }`}
        >
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative h-9 w-9 rounded-xl bg-[var(--gradient-neon)] grid place-items-center font-bold text-primary-foreground glow-pink">
                <span className="font-display">M</span>
                <div className="absolute inset-0 rounded-xl bg-[var(--gradient-neon)] blur-lg opacity-50 group-hover:opacity-100 transition" />
              </div>
              <div className="leading-none">
                <div className="font-display text-lg font-bold tracking-tight">
                  Morfyx <span className="text-gradient-neon">Studio</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">India Studio</div>
              </div>
            </Link>
          </div>

          <NavLinks pathname={pathname} />


          <div className="flex items-center gap-1 sm:gap-2 relative">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  placeholder="Search figures…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      closeSearch();
                    }
                  }}
                  className="hidden sm:block bg-secondary/60 px-3 py-2 text-sm rounded-lg outline-none border border-border focus:border-accent"
                />
              )}
            </AnimatePresence>
            <IconBtn
              onClick={() => {
                setSearchOpen((s) => !s);
                setOpen(false);
              }}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </IconBtn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconBtn aria-label="Account" className="hidden sm:flex">
                  <User className="h-4 w-4" />
                </IconBtn>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass border-border/60">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">Signed in as</div>
                    <div className="px-2 pb-2 text-sm font-semibold">{user?.name}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login">Log In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <CartDrawer
              trigger={
                <IconBtn aria-label="Cart" badge={itemCount || undefined}>
                  <ShoppingBag className="h-4 w-4" />
                </IconBtn>
              }
            />
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden h-9 w-9 grid place-items-center rounded-lg glass"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && query && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="hidden sm:block absolute right-24 top-[72px] w-[360px] glass rounded-2xl p-3 border border-border/60"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-2 pb-2">
                Results
              </div>
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={product.type === "imported" ? "/imported" : "/shop"}
                    onClick={closeSearch}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/60 transition"
                  >
                    <img src={product.img} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </div>
                    <div className="text-sm font-display text-gradient-neon">
                      {formatPrice(product.price)}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 glass rounded-2xl p-4 flex flex-col gap-2"
            >
              <MobileLinks
                onNavigate={() => setOpen(false)}
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                pathname={pathname}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm sm:hidden"
            onClick={closeSearch}
          >
            <div
              className="mx-auto mt-24 w-[90%] glass rounded-2xl p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search figures…"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="h-8 w-8 rounded-lg glass grid place-items-center"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
                {query && results.length === 0 && (
                  <div className="text-xs text-muted-foreground">No matches found.</div>
                )}
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={product.type === "imported" ? "/imported" : "/shop"}
                    onClick={closeSearch}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/60 transition"
                  >
                    <img src={product.img} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </div>
                    <div className="text-sm font-display text-gradient-neon">
                      {formatPrice(product.price)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function IconBtn({
  children,
  onClick,
  badge,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-9 w-9 grid place-items-center rounded-lg glass hover:glow-cyan transition ${className}`}
      {...rest}
    >
      {children}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center glow-pink">
          {badge}
        </span>
      )}
    </button>
  );
}

function NavLinks({ pathname }: { pathname: string }) {
  const { open } = useCustomFigureModal();
  return (
    <nav className="hidden lg:flex items-center gap-2">
      {links.map((l) =>
        l.action === "custom" ? (
          <button
            key={l.label}
            onClick={open}
            className="relative group rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition"
          >
            {l.label}
            <span className="absolute -bottom-0.5 left-3 right-3 h-px scale-x-0 bg-[var(--gradient-neon)] transition-transform duration-300 group-hover:scale-x-100" />
          </button>
        ) : (
          <Link
            key={l.label}
            to={l.to}
            className="relative group rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition"
            activeProps={{ className: "text-foreground" }}
          >
            {isActivePath(pathname, l.to) && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full border border-white/10 bg-white/5 shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {l.label}
            <span className="absolute -bottom-0.5 left-3 right-3 h-px scale-x-0 bg-[var(--gradient-neon)] transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
        )
      )}
    </nav>
  );
}

function MobileLinks({
  onNavigate,
  isAuthenticated,
  onLogout,
  pathname,
}: {
  onNavigate: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  pathname: string;
}) {
  const { open } = useCustomFigureModal();
  return (
    <>
      {links.map((l) =>
        l.action === "custom" ? (
          <button
            key={l.label}
            onClick={() => { open(); onNavigate(); }}
            className={`text-left px-3 py-2 rounded-lg transition ${pathname.startsWith("/custom") ? "bg-secondary/80 text-foreground shadow-sm" : "hover:bg-secondary/60"}`}
          >
            <span className="flex items-center justify-between">
              <span>{l.label}</span>
              {pathname.startsWith("/custom") && <span className="h-2 w-2 rounded-full bg-[var(--gradient-neon)]" />}
            </span>
          </button>
        ) : (
          <Link
            key={l.label}
            to={l.to}
            onClick={onNavigate}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${isActivePath(pathname, l.to) ? "bg-secondary/80 text-foreground shadow-sm" : "hover:bg-secondary/60"}`}
          >
            <span>{l.label}</span>
            {isActivePath(pathname, l.to) && <span className="h-2 w-2 rounded-full bg-[var(--gradient-neon)]" />}
          </Link>
        )
      )}
      <div className="mt-2 border-t border-border/40 pt-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/orders"
              onClick={onNavigate}
              className="px-3 py-2 rounded-lg hover:bg-secondary/60"
            >
              My Orders
            </Link>
            <button
              onClick={() => { onLogout(); onNavigate(); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-secondary/60 text-destructive"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={onNavigate}
              className="px-3 py-2 rounded-lg hover:bg-secondary/60"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={onNavigate}
              className="px-3 py-2 rounded-lg hover:bg-secondary/60"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </>
  );
}
