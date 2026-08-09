import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veryon | Excel Transformation Tool" },
      {
        name: "description",
        content:
          "Transform customer Excel files into Veryon templates with a guided 4-step mapping wizard.",
      },
      { property: "og:title", content: "Veryon | Excel Transformation Tool" },
      {
        property: "og:description",
        content: "Map, transform, and generate Excel workbooks in four guided steps.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/templates" });
  },
});
