import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

function CollectionPage() {
  const { slug } = Route.useParams();
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  return <ComingSoon eyebrow="COLLECTION" title={title} />;
}

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionPage,
});
