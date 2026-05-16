import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";

type NavItem = { label: string; href: string; match: (p: string) => boolean };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/account", match: (p) => p === "/account" },
  { label: "Wishlist", href: "/account/wishlist", match: (p) => p === "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses", match: (p) => p === "/account/addresses" },
  { label: "Returns", href: "/account/returns/new", match: (p) => p.startsWith("/account/returns") },
];

export function AccountLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut, profile } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login", search: { redirect: path } as never });
  }, [user, loading, navigate, path]);

  if (!user) {
    return (
      <SiteLayout>
        <div className="max-w-[1200px] mx-auto px-4 py-16 text-stone text-[13px]">
          Checking session…
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="max-w-[1200px] mx-auto px-4 md:px-7 py-14 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <div className="caps mb-1">Account</div>
          <div className="font-display text-[20px] mb-6">{profile?.first_name ?? "Hi"}</div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const active = n.match(path);
              return (
                <a
                  key={n.href}
                  href={n.href}
                  className={
                    "block py-2 pl-3 text-[13px] border-l-[1.5px] " +
                    (active
                      ? "border-burgundy text-ink"
                      : "border-transparent text-stone hover:text-ink")
                  }
                >
                  {n.label}
                </a>
              );
            })}
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="block w-full text-left py-2 pl-3 text-[13px] border-l-[1.5px] border-transparent text-stone hover:text-ink"
            >
              Sign out
            </button>
          </nav>
        </aside>
        <div>
          <h1 className="font-display text-[28px] mb-8">{title}</h1>
          {children}
        </div>
      </section>
    </SiteLayout>
  );
}
