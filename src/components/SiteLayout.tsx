import { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { MainNav } from "./MainNav";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-bg">
      <AnnouncementBar />
      <MainNav />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
    </div>
  );
}
