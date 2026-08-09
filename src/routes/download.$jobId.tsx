import { createFileRoute } from "@tanstack/react-router";
import { DownloadPage } from "@/pages/DownloadPage";

export const Route = createFileRoute("/download/$jobId")({
  head: () => ({
    meta: [
      { title: "Download Output | Veryon Excel Transformation Tool" },
      {
        name: "description",
        content: "Download the generated Excel workbook produced by your mapping configuration.",
      },
      { property: "og:title", content: "Download Output | Veryon Excel Transformation Tool" },
      {
        property: "og:description",
        content: "Your transformed Excel workbook is ready to download.",
      },
    ],
  }),
  component: DownloadPage,
});
