import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SearchModal } from "@/components/SearchModal";
import { useCart, selectCartCount } from "@/stores/cart";
import { useAuth } from "@/lib/auth";

type NavLink = { label: string; href: string; hasDropdown?: boolean };
const links: NavLink[] = [
  { label: "Heels", href: "/collections/heels" },
  { label: "Clip-ons", href: "/collections/clip-ons", hasDropdown: true },
  { label: "Style Ideas", href: "/style-studio" },
  { label: "Hot Deals", href: "/collections/sale" },
  { label: "About", href: "/about" },
];

export function MainNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCart(selectCartCount);
  const { user } = useAuth();

  return (
    <header className="bg-cream-bg border-b border-soft-border sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-7 flex items-center justify-between py-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-display text-[22px] tracking-[0.32em] text-ink leading-none">
            CLASSIE
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {links.map((link) => {
              const active = path === link.href || path.startsWith(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-[12px] text-ink py-1 flex items-center gap-1"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={11} />}
                  {active && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-[1.5px] bg-burgundy" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-5 text-ink">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="hover:opacity-60 transition-opacity"
          >
            <Search size={14} strokeWidth={1.25} />
          </button>
          <a
            href={user ? "/account" : "/auth/login"}
            aria-label="Account"
            className="hover:opacity-60 transition-opacity"
          >
            <User size={14} strokeWidth={1.25} />
          </a>
          <Link
            to="/account/wishlist"
            aria-label="Wishlist"
            className="hover:opacity-60 transition-opacity"
          >
            <Heart size={14} strokeWidth={1.25} />
          </Link>
          <Link to="/cart" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
            <ShoppingBag size={14} strokeWidth={1.25} />
            <span className="text-[12px]">Bag ({count})</span>
          </Link>
        </div>
      </div>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
