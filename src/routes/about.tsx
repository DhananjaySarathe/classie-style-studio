import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <SiteLayout>
      <section className="max-w-[760px] mx-auto px-4 py-20">
        <div className="caps mb-4 text-center">ABOUT</div>
        <h1 className="display-page text-center mb-10">One heel. Endless looks.</h1>
        <div className="space-y-6 text-[14px] leading-[1.85] text-ink/80">
          <p>
            Classie is built around a single, quiet idea: that one well-made pair of heels should be
            able to dress up, dress down, and dress for every occasion in between.
          </p>
          <p>
            We design modular heels in India, with hand-finished detailing and a small range of
            interchangeable clip-on charms. Snap one on for an evening. Swap to another for the
            office. Switch again for a wedding. One pair. A wardrobe of looks.
          </p>
          <p>
            We make our pieces in small batches with workshops we visit and people we know — because
            we believe quiet detail is louder than fast trends.
          </p>
        </div>
        <div className="text-center mt-12">
          <Link
            to="/collections/$slug"
            params={{ slug: "heels" }}
            className="btn-primary inline-block"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
