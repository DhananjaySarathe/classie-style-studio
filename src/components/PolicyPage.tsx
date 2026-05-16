import { SiteLayout } from "@/components/SiteLayout";

export function PolicyPage({
  title,
  eyebrow,
  body,
}: {
  title: string;
  eyebrow: string;
  body: { heading: string; text: string }[];
}) {
  return (
    <SiteLayout>
      <section className="max-w-[760px] mx-auto px-4 py-20">
        <div className="caps mb-4 text-center">{eyebrow}</div>
        <h1 className="display-page text-center mb-12">{title}</h1>
        <div className="space-y-10">
          {body.map((b, i) => (
            <div key={i}>
              <h2 className="font-display text-[20px] mb-3">{b.heading}</h2>
              <p className="text-[14px] leading-[1.85] text-ink/80">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
