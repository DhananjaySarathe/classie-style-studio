import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/style-quiz")({ component: () => <ComingSoon eyebrow="FIND YOUR PAIR" title="The Style Quiz" /> });
