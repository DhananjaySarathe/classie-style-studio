import { SiteLayout } from "./SiteLayout";

export function ComingSoon({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <SiteLayout>
      <section className="max-w-[1440px] mx-auto px-7 md:px-7 px-4 py-32 md:py-40 text-center">
        {eyebrow && <div className="caps mb-5">{eyebrow}</div>}
        <h1 className="display-page mb-5">{title}</h1>
        <p className="text-[13px] text-stone max-w-[420px] mx-auto leading-[1.85]">
          This part of the atelier is being prepared. We'll have it ready in the next chapter.
        </p>
      </section>
    </SiteLayout>
  );
}
