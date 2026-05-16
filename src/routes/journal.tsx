import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/journal")({ component: () => <ComingSoon eyebrow="EDITORIAL" title="The Journal" /> });
