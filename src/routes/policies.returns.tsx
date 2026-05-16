import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/policies/returns")({
  component: () => (
    <PolicyPage
      eyebrow="POLICY"
      title="Returns & exchanges"
      body={[
        {
          heading: "7-day return window",
          text: "We accept returns within 7 days of delivery, provided items are unworn, in original packaging, and accompanied by the invoice.",
        },
        {
          heading: "Doorstep pickup",
          text: "We arrange a doorstep pickup at no extra cost via our shipping partner once your return is approved.",
        },
        {
          heading: "Refund timeline",
          text: "Refunds are processed to the original payment method within 5–7 business days after the returned item is inspected.",
        },
        {
          heading: "Non-returnable items",
          text: "Clip-on charms are non-returnable for hygiene reasons unless defective.",
        },
      ]}
    />
  ),
});
