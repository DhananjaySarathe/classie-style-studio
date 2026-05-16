import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { callEdge } from "@/routes/auth.login";

export const Route = createFileRoute("/style-quiz")({ component: QuizPage });

const QUESTIONS = [
  {
    key: "occasion",
    title: "Where are you headed?",
    sub: null,
    options: [
      { value: "day", label: "Day", desc: "Brunches, errands, work" },
      { value: "night", label: "Night", desc: "Dinners, drinks, dates" },
      { value: "both", label: "Both", desc: "I move between them" },
      { value: "special", label: "Special occasion", desc: "A celebration is coming" },
    ],
  },
  {
    key: "color",
    title: "Your colour mood?",
    sub: null,
    options: [
      { value: "soft", label: "Soft & neutral", desc: "Beige, blush, ivory" },
      { value: "warm", label: "Warm & rich", desc: "Burgundy, terracotta" },
      { value: "bold", label: "Bold & dark", desc: "Onyx, deep noir" },
      { value: "all", label: "All of the above", desc: "I can't decide" },
    ],
  },
  {
    key: "comfort",
    title: "Heel comfort?",
    sub: null,
    options: [
      { value: "low", label: "Low and easy", desc: "Kitten heels, flats" },
      { value: "balanced", label: "Balanced", desc: "2 to 2.5 inches" },
      { value: "tall", label: "Tall and statement", desc: "3 inches and up" },
    ],
  },
  {
    key: "vibe",
    title: "Pick a vibe.",
    sub: null,
    options: [
      { value: "minimal", label: "Minimal & polished", desc: "Quiet, intentional" },
      { value: "romantic", label: "Romantic & dreamy", desc: "Soft florals, satin" },
      { value: "playful", label: "Playful & sparkly", desc: "Rhinestones, shimmer" },
      { value: "classic", label: "Confident & classic", desc: "Lines that last" },
    ],
  },
] as const;

type Answers = Record<string, string>;

function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<"questions" | "loading" | "result">("questions");
  const [match, setMatch] = useState<{ product_id?: string; clip_on_id?: string } | null>(null);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(async () => {
      const key = `${answers.occasion}|${answers.color}|${answers.comfort}|${answers.vibe}`;
      if (!hasSupabaseEnv()) {
        setMatch({});
        setPhase("result");
        return;
      }
      const { data } = await supabase
        .from("quiz_matrix")
        .select("product_id, clip_on_id")
        .eq("combination_key", key)
        .maybeSingle();
      if (data) setMatch(data as { product_id?: string; clip_on_id?: string });
      else {
        const { data: fb } = await supabase
          .from("quiz_matrix")
          .select("product_id, clip_on_id")
          .limit(1)
          .maybeSingle();
        setMatch((fb as { product_id?: string; clip_on_id?: string } | null) ?? {});
      }
      setPhase("result");
    }, 1500);
    return () => clearTimeout(t);
  }, [phase, answers]);

  if (phase === "loading") {
    return (
      <SiteLayout>
        <section className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="caps mb-3">CURATING</div>
            <div className="display-page">Curating your match…</div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (phase === "result") {
    return (
      <ResultView
        match={match}
        answers={answers}
        onRestart={() => {
          setAnswers({});
          setStep(0);
          setPhase("questions");
        }}
      />
    );
  }

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <SiteLayout>
      <div className="h-[1px] bg-soft-border">
        <div className="h-full bg-burgundy transition-all" style={{ width: `${progress}%` }} />
      </div>

      <section className="max-w-[560px] mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col justify-center">
        <div className="caps mb-4">
          QUESTION {step + 1} OF {QUESTIONS.length}
        </div>
        <h1 className="font-display text-[32px] leading-tight mb-3">{q.title}</h1>
        {q.sub && <p className="text-[13px] text-stone mb-8">{q.sub}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {q.options.map((o) => {
            const active = answers[q.key] === o.value;
            return (
              <button
                key={o.value}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [q.key]: o.value }));
                  setTimeout(() => {
                    if (step + 1 < QUESTIONS.length) setStep((s) => s + 1);
                    else setPhase("loading");
                  }, 200);
                }}
                className={
                  "text-left p-5 border-[0.5px] transition-colors " +
                  (active ? "border-ink bg-cream-warm" : "border-soft-border hover:border-ink")
                }
              >
                <div className="font-display text-[20px] mb-1">{o.label}</div>
                <div className="text-[11px] text-stone">{o.desc}</div>
              </button>
            );
          })}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-[11px] text-stone mt-10 uppercase tracking-[0.18em]"
          >
            ← Back
          </button>
        )}
      </section>
    </SiteLayout>
  );
}

function ResultView({
  match,
  answers,
  onRestart,
}: {
  match: { product_id?: string; clip_on_id?: string } | null;
  answers: Answers;
  onRestart: () => void;
}) {
  const [heel, setHeel] = useState<{
    name: string;
    slug: string;
    image: string;
    price: number;
  } | null>(null);
  const [charm, setCharm] = useState<{
    name: string;
    slug: string;
    image: string;
    price: number;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!match?.product_id) return;
    let cancelled = false;
    (async () => {
      const ids = [match.product_id, match.clip_on_id].filter(Boolean) as string[];
      if (ids.length === 0) return;
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, product_images(url, display_order)")
        .in("id", ids);
      if (cancelled || !data) return;
      type Row = {
        id: string;
        name: string;
        slug: string;
        price: number;
        product_images?: { url: string; display_order: number }[];
      };
      const rows = data as unknown as Row[];
      const hydrate = (id?: string) => {
        if (!id) return null;
        const p = rows.find((x) => x.id === id);
        if (!p) return null;
        const img =
          (p.product_images ?? []).sort((a, b) => a.display_order - b.display_order)[0]?.url ?? "";
        return { name: p.name, slug: p.slug, image: img, price: p.price };
      };
      setHeel(hydrate(match.product_id));
      setCharm(hydrate(match.clip_on_id));
    })();
    return () => {
      cancelled = true;
    };
  }, [match]);

  async function captureEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    if (hasSupabaseEnv()) {
      await supabase.from("newsletter_subscribers").insert({ email, source: "quiz" });
      await callEdge("send-email", { template: "quiz_discount_code", email, code: "FIRST10" });
    }
    setBusy(false);
    toast.success("Code on the way: FIRST10");
  }

  const heelSearchSlug = heel?.slug ?? undefined;
  const charmSearchSlug = charm?.slug ?? undefined;

  return (
    <SiteLayout>
      <section className="max-w-[800px] mx-auto px-4 py-20 text-center">
        <div className="caps mb-4">YOUR STARTER PAIR</div>
        <h1 className="font-display text-[32px] leading-tight mb-3">
          You're a <span className="italic-burgundy">{heel ? heel.name : "Classie"}</span> soul.
        </h1>
        <p className="text-[13px] text-stone max-w-[460px] mx-auto mb-10">
          Based on your <em>{answers.vibe}</em> vibe and <em>{answers.color}</em> palette, this pair
          was made for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {heel && (
            <Link to="/products/$slug" params={{ slug: heel.slug }} className="block">
              <div className="aspect-[4/5] bg-card-tint overflow-hidden">
                {heel.image && (
                  <img src={heel.image} alt={heel.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="mt-3 display-product">{heel.name}</div>
            </Link>
          )}
          {charm && (
            <Link to="/products/$slug" params={{ slug: charm.slug }} className="block">
              <div className="aspect-[4/5] bg-card-tint overflow-hidden">
                {charm.image && (
                  <img src={charm.image} alt={charm.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="mt-3 display-product">{charm.name}</div>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {heel && (
            <Link
              to="/style-studio"
              search={{ heel: heelSearchSlug, charm: charmSearchSlug } as never}
              className="btn-primary"
            >
              Shop the pair
            </Link>
          )}
          <button onClick={onRestart} className="btn-secondary">
            Try another quiz
          </button>
        </div>

        <form
          onSubmit={captureEmail}
          className="max-w-[420px] mx-auto border-t border-soft-border pt-8"
        >
          <div className="caps caps-ink mb-3">Want 10% off your starter pair?</div>
          <div className="flex items-end gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="text-[11px] uppercase tracking-[0.18em] border-b-[0.5px] border-ink py-2"
            >
              {busy ? "…" : "Get my code"}
            </button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
