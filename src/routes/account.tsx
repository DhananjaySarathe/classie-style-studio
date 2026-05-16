import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/account")({ component: () => <ComingSoon eyebrow="ACCOUNT" title="Welcome back" /> });
