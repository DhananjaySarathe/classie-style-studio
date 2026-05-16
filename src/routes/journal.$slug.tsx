import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ARTICLES } from "@/data/journal";

export const Route = createFileRoute("/journal/$slug")({ component: ArticlePage });

function ArticlePage() {
  const { slug } = Route.useParams();
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <SiteLayout>
        <div className="max-w-[720px] mx-auto px-4 py-20 text-center">
          <h1 className="display-page mb-3">Not found</h1>
          <Link to="/journal" className="btn-secondary inline-block">
            Back to journal
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="max-w-[720px] mx-auto px-4 py-16">
        <div className="caps text-center mb-3">JOURNAL · {article.readMinutes} MIN READ</div>
        <h1 className="font-display text-[40px] text-center mb-3 leading-tight">{article.title}</h1>
        <p className="text-[14px] text-stone text-center mb-10">{article.subtitle}</p>
        <div className="aspect-[16/9] bg-card-tint mb-10 overflow-hidden">
          <img src={article.hero} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="space-y-6 text-[15px] leading-[1.9]">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link to="/journal" className="btn-secondary">
            More notes
          </Link>
        </div>
      </article>
    </SiteLayout>
  );
}
