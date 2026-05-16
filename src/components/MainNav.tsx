import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, ChevronDown } from "lucide-react";

const links = [
  { label: "Heels", to: "/collections/heels" },
  { label: "Clip-ons", to: "/collections/clip-ons", hasDropdown: true },
  { label: "Style Ideas", to: "/style-studio" },
  { label: "Hot Deals", to: "/collections/sale" },
  { label: "About", to: "/about" },
];

export function MainNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="bg-cream-bg border-b border-soft-border sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-display text-[22px] tracking-[0.32em] text-ink leading-none">
            CLASSIE
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {links.map((link) => {
              const active = path === link.to || (link.to !== "/" && path.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative text-[12px] text-ink py-1 flex items-center gap-1"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={11} />}
                  {active && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-[1.5px] bg-burgundy" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-5 text-ink">
          <button aria-label="Search" className="hover:opacity-60 transition-opacity">
            <Search size={14} strokeWidth={1.25} />
          </button>
          <Link to="/account" aria-label="Account" className="hover:opacity-60 transition-opacity">
            <User size={14} strokeWidth={1.25} />
          </Link>
          <Link to="/account/wishlist" aria-label="Wishlist" className="hover:opacity-60 transition-opacity">
            <Heart size={14} strokeWidth={1.25} />
          </Link>
          <Link to="/cart" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
            <ShoppingBag size={14} strokeWidth={1.25} />
            <span className="text-[12px]">Bag (0)</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
