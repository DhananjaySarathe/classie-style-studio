import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/about")({ component: () => <ComingSoon eyebrow="OUR STORY" title="About Classie" /> });
