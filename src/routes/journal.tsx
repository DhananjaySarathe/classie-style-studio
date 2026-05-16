import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ARTICLES } from "@/data/journal";

export const Route = createFileRoute("/journal")({ component: JournalPage });

function JournalPage() {
  return (
    <SiteLayout>
      <section className="max-w-[1100px] mx-auto px-4 md:px-7 py-16">
        <div className="caps mb-4 text-center">JOURNAL</div>
        <h1 className="display-page text-center mb-14">Quiet notes on style, design, and craft.</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to="/journal/$slug"
              params={{ slug: a.slug }}
              className="block group"
            >
              <div className="aspect-[4/3] bg-card-tint overflow-hidden">
                <img
                  src={a.hero}
                  alt={a.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="caps mt-4 mb-2">{a.readMinutes} MIN READ</div>
              <h2 className="font-display text-[22px] leading-tight">{a.title}</h2>
              <p className="text-[13px] text-stone mt-2">{a.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
