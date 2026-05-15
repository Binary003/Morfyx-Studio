import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomFigureModal } from "./CustomFigureModal";

const links = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Imported Collection", to: "/imported" as const },
  { label: "Custom Figures", to: "/custom" as const, action: "custom" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}>
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all ${
            scrolled ? "glass glow-cyan" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative h-9 w-9 rounded-xl bg-[var(--gradient-neon)] grid place-items-center font-bold text-primary-foreground glow-pink">
              <span className="font-display">O</span>
              <div className="absolute inset-0 rounded-xl bg-[var(--gradient-neon)] blur-lg opacity-50 group-hover:opacity-100 transition" />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">
                Otaku<span className="text-gradient-neon">Forge</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">3D Studio</div>
            </div>
          </Link>

          <NavLinks />


          <div className="flex items-center gap-1 sm:gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  placeholder="Search figures…"
                  className="hidden sm:block bg-secondary/60 px-3 py-2 text-sm rounded-lg outline-none border border-border focus:border-accent"
                />
              )}
            </AnimatePresence>
            <IconBtn onClick={() => setSearchOpen((s) => !s)} aria-label="Search">
              <Search className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Account" className="hidden sm:flex">
              <User className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Cart" badge={3}>
              <ShoppingBag className="h-4 w-4" />
            </IconBtn>
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
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 glass rounded-2xl p-4 flex flex-col gap-2"
            >
              <MobileLinks onNavigate={() => setOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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

function NavLinks() {
  const { open } = useCustomFigureModal();
  return (
    <nav className="hidden lg:flex items-center gap-7">
      {links.map((l) =>
        l.action === "custom" ? (
          <button
            key={l.label}
            onClick={open}
            className="relative text-sm font-medium text-foreground/80 hover:text-foreground transition group"
          >
            {l.label}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--gradient-neon)] transition-all duration-300 group-hover:w-full" />
          </button>
        ) : (
          <Link
            key={l.label}
            to={l.to}
            className="relative text-sm font-medium text-foreground/80 hover:text-foreground transition group"
            activeProps={{ className: "text-foreground" }}
          >
            {l.label}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--gradient-neon)] transition-all duration-300 group-hover:w-full" />
          </Link>
        )
      )}
    </nav>
  );
}

function MobileLinks({ onNavigate }: { onNavigate: () => void }) {
  const { open } = useCustomFigureModal();
  return (
    <>
      {links.map((l) =>
        l.action === "custom" ? (
          <button
            key={l.label}
            onClick={() => { open(); onNavigate(); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-secondary/60"
          >
            {l.label}
          </button>
        ) : (
          <Link
            key={l.label}
            to={l.to}
            onClick={onNavigate}
            className="px-3 py-2 rounded-lg hover:bg-secondary/60"
          >
            {l.label}
          </Link>
        )
      )}
    </>
  );
}
