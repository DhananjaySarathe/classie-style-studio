import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/policies/privacy")({
  component: () => (
    <PolicyPage
      eyebrow="POLICY"
      title="Privacy policy"
      body={[
        {
          heading: "What we collect",
          text: "Name, email, phone, shipping address, order history, and limited browsing data necessary to fulfil orders and improve your experience.",
        },
        {
          heading: "How we use it",
          text: "To process orders, communicate about shipments, send relevant updates, and protect against fraud.",
        },
        {
          heading: "Who we share with",
          text: "Service partners only — payment (Razorpay), shipping (Shiprocket), messaging (MSG91, Interakt, Resend). We never sell your data.",
        },
        {
          heading: "Your rights",
          text: "You may request deletion or export of your data at any time by emailing privacy@classie.co.in.",
        },
      ]}
    />
  ),
});
