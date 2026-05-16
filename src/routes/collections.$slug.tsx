import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/collections/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return <ComingSoon eyebrow="COLLECTION" title={title} />;
  },
});
