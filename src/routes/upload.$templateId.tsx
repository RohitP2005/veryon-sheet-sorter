import { createFileRoute } from "@tanstack/react-router";
import { UploadExcel } from "@/pages/UploadExcel";

export const Route = createFileRoute("/upload/$templateId")({
  head: () => ({
    meta: [
      { title: "Upload Excel | Veryon Excel Transformation Tool" },
      {
        name: "description",
        content: "Upload a customer .xlsx workbook and preview its detected columns and rows.",
      },
      { property: "og:title", content: "Upload Excel | Veryon Excel Transformation Tool" },
      {
        property: "og:description",
        content: "Upload a customer .xlsx workbook to begin column mapping.",
      },
    ],
  }),
  component: UploadExcel,
});
