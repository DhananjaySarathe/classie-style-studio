import { Link } from "@tanstack/react-router";
import { useProducts } from "@/lib/queries";

export function ModularStoryStrip() {
  const { data: heels = [] } = useProducts({ category: "heel" });
  const { data: charms = [] } = useProducts({ category: "clip-on" });

  // Pick one heel as the constant, three different charms as the variants.
  const heel = heels[0];
  const variants = charms.slice(0, 3);

  if (!heel || variants.length < 3) {
    return null;
  }

  const labels = ["Day", "Evening", "Festive"];

  return (
    <section className="bg-bg-soft">
      <div className="max-w-[1440px] mx-auto px-4 md:px-7 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-6">
          <div>
            <div className="caps mb-4 flex items-center gap-2">
              <span className="rule" />
              ONE HEEL · THREE LOOKS
            </div>
            <h2 className="display-section text-ink max-w-[520px]">
              Snap a charm. <span className="italic-burgundy">Switch</span> the mood.
            </h2>
          </div>
          <p className="text-[14px] text-stone max-w-[360px] leading-[1.85]">
            The {heel.name} stays the same — the charm changes everything. One pair, restyled three
            ways without changing your closet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {variants.map((charm, i) => (
            <div key={charm.id} className="group">
              <div className="relative aspect-[4/5] bg-card-tint overflow-hidden">
                {heel.images?.[0]?.url && (
                  <img
                    src={heel.images[0].url}
                    alt={heel.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {charm.images?.[0]?.url && (
                  <img
                    src={charm.images[0].url}
                    alt={charm.name}
                    className="absolute bottom-[18%] right-[16%] w-[26%] aspect-square object-cover rounded-full border-[3px] border-bg transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-4 left-4 caps caps-ink bg-bg/95 px-2 py-1">
                  {String(i + 1).padStart(2, "0")} · {labels[i]?.toUpperCase()}
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="font-display text-[18px] text-ink">{labels[i]}</div>
                <div className="text-[11px] text-stone">
                  {heel.name} + {charm.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/style-studio" className="btn-primary">
            Try the combinations
          </Link>
        </div>
      </div>
    </section>
  );
}
