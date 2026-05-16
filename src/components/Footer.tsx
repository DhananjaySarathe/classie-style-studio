import { Link } from "@tanstack/react-router";

const commitments = [
  { title: "FREE SHIPPING", body: "Complimentary across India above ₹999" },
  { title: "EASY RETURNS", body: "7-day window, doorstep pickup" },
  { title: "VERIFIED COD", body: "OTP confirmation on every cash order" },
  { title: "CONCIERGE", body: "WhatsApp us anytime, we'll style you" },
];

const cols = [
  {
    heading: "About Us",
    items: ["Our Story", "Made in India", "Sustainability", "Press"],
  },
  {
    heading: "Resource",
    items: ["The Journal", "Style Studio", "Style Quiz", "Size Guide"],
  },
  {
    heading: "Information",
    items: ["Shipping", "Returns & Exchanges", "Privacy Policy", "Terms"],
  },
  {
    heading: "Help",
    items: ["Track Order", "Contact", "FAQs", "WhatsApp Concierge"],
  },
];

export function Footer() {
  return (
    <footer>
      <section className="bg-cream-warm">
        <div className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          {commitments.map((c) => (
            <div key={c.title}>
              <div className="caps caps-ink mb-3">{c.title}</div>
              <p className="text-[12px] text-stone leading-[1.7] max-w-[200px]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-cream-warm">
        <div className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-14">
            <div className="md:col-span-2">
              <div className="font-display text-[26px] tracking-[0.32em] mb-5">CLASSIE</div>
              <p className="text-[12px] opacity-75 max-w-[280px] mb-6 leading-[1.7]">
                One heel. Endless looks. Modular footwear designed and made in India.
              </p>
              <div className="caps text-cream-warm/60 mb-3">JOIN THE LIST</div>
              <form className="flex items-end gap-3 max-w-[320px]">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border-b border-cream-warm/30 focus:border-cream-warm pb-2 text-[12px] outline-none placeholder:text-cream-warm/40"
                />
                <button className="text-[11px] tracking-[0.18em] uppercase pb-2 border-b border-cream-warm/40 hover:border-cream-warm">
                  Sign Up
                </button>
              </form>
            </div>
            {cols.map((col) => (
              <div key={col.heading}>
                <div className="caps text-cream-warm/60 mb-4">{col.heading}</div>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item}>
                      <Link to="/" className="text-[12px] opacity-80 hover:opacity-100 transition-opacity">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-warm/15 pt-6 text-center caps text-cream-warm/50">
            CLASSIE · MADE IN INDIA · © 2026
          </div>
        </div>
      </section>
    </footer>
  );
}
