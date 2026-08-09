import { createFileRoute } from "@tanstack/react-router";
import { ChooseTemplate } from "@/pages/ChooseTemplate";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Choose Template | Veryon Excel Transformation Tool" },
      {
        name: "description",
        content: "Select an output template to transform your customer Excel workbook with Veryon.",
      },
      { property: "og:title", content: "Choose Template | Veryon Excel Transformation Tool" },
      {
        property: "og:description",
        content: "Select an output template to start an Excel transformation job.",
      },
    ],
  }),
  component: ChooseTemplate,
});
