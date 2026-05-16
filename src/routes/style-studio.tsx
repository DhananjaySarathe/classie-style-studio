import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/style-studio")({ component: () => <ComingSoon eyebrow="SIGNATURE" title="Style Studio" /> });
