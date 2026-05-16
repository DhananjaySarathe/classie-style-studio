import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/cart")({ component: () => <ComingSoon title="Your bag" /> });
