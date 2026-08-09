import { createFileRoute } from "@tanstack/react-router";
import { Mapping } from "@/pages/Mapping";

export const Route = createFileRoute("/mapping/$templateId/$uploadId")({
  head: () => ({
    meta: [
      { title: "Map Columns | Veryon Excel Transformation Tool" },
      {
        name: "description",
        content:
          "Map uploaded source columns to template columns with transformations and formulas.",
      },
      { property: "og:title", content: "Map Columns | Veryon Excel Transformation Tool" },
      {
        property: "og:description",
        content: "Configure column transformations before generating the output workbook.",
      },
    ],
  }),
  component: Mapping,
});
