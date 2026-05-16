import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

function ProductPage() {
  const { slug } = Route.useParams();
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return <ComingSoon eyebrow="PRODUCT" title={title} />;
}

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});
