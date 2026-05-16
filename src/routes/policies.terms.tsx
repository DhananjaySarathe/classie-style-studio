import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/policies/terms")({
  component: () => (
    <PolicyPage
      eyebrow="POLICY"
      title="Terms of service"
      body={[
        {
          heading: "Use of site",
          text: "By using classie.co.in you agree to these terms. Don't misuse the platform, attempt to circumvent security measures, or use it for unlawful purposes.",
        },
        {
          heading: "Pricing & taxes",
          text: "All prices are in INR and include applicable GST. Prices and availability may change without notice.",
        },
        {
          heading: "Order acceptance",
          text: "We reserve the right to refuse or cancel any order at our discretion (e.g., suspected fraud, stock errors).",
        },
        {
          heading: "Liability",
          text: "To the maximum extent permitted by law, Classie is not liable for indirect or consequential damages arising from use of the site or products.",
        },
      ]}
    />
  ),
});
