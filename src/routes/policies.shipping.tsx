import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/policies/shipping")({
  component: () => (
    <PolicyPage
      eyebrow="POLICY"
      title="Shipping policy"
      body={[
        {
          heading: "Free shipping above ₹999",
          text: "Orders above ₹999 ship free across India. For orders below the threshold, a ₹99 shipping fee is applied at checkout.",
        },
        {
          heading: "Express delivery",
          text: "Express delivery available for ₹149 — delivered in 1–2 business days for serviceable pincodes.",
        },
        {
          heading: "Standard delivery",
          text: "Standard delivery is delivered in 3–5 business days for most pincodes in India.",
        },
        {
          heading: "Order tracking",
          text: "Once dispatched, you'll receive a tracking link by email and SMS. You can also visit /track-order to look up your shipment.",
        },
      ]}
    />
  ),
});
