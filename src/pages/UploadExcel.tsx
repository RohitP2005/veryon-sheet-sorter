import { useState } from "react";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Download } from "lucide-react";
import { WizardLayout } from "@/components/AppHeader";
import { UploadBox } from "@/components/UploadBox";
import { PreviewGrid } from "@/components/PreviewGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplate } from "@/hooks/useTemplates";
import { useUpload, validateExcelFile } from "@/hooks/useUpload";
import { useWizardStore } from "@/store/wizard";
import { getSampleFileUrl } from "@/lib/sampleFiles";
import type { UploadResponse } from "@/types";

export function UploadExcel() {
  const { templateId } = useParams({ from: "/upload/$templateId" });
  const navigate = useNavigate();
  const template = useTemplate(templateId);
  const upload = useUpload();
  const setUpload = useWizardStore((s) => s.setUpload);
  const [localError, setLocalError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [headerRow, setHeaderRow] = useState<number | "">(1);
  const [headerRowStart, setHeaderRowStart] = useState<number | undefined>(undefined);

  function handleFile(file: File) {
    if (headerRow === "") {
      setLocalError("Cannot select file: header row cannot be empty.");
      return;
    }
    setLocalError(null);
    upload.reset();
    const invalid = validateExcelFile(file);
    if (invalid) {
      setLocalError(invalid);
      return;
    }
    if (headerRowStart !== undefined && headerRowStart > headerRow) {
      setLocalError("Higher-order header start row must be less than or equal to the header row.");
      return;
    }
    upload.mutate(
      { file, headerRow, headerRowStart },
      {
        onSuccess: (data) => {
          setResult(data);
          setUpload(data);
        },
      },
    );
  }

  const apiError = upload.error?.message ?? null;
  const sampleUrl = getSampleFileUrl(templateId);

  return (
    <WizardLayout step={2}>
      <h1 className="text-3xl font-extrabold tracking-tight">Upload customer Excel</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Upload the customer workbook (.xlsx, max 10MB). We'll detect its columns for mapping.
      </p>
      {sampleUrl && (
        <a
          href={sampleUrl}
          download
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-black underline decoration-brand-yellow decoration-2 underline-offset-4 hover:text-brand-yellow"
        >
          <Download className="size-4" /> Don't have a file handy? Download a sample workbook
        </a>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid max-w-md gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Header row
              </Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={headerRow}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setHeaderRow("");
                    return;
                  }
                  const parsed = Number(raw);
                  setHeaderRow(Number.isFinite(parsed) ? Math.max(1, parsed) : headerRow);
                }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Which row has the real column headers? Use this if the file starts with a title or
                logo row before the headers.
              </p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Higher-order header start row (optional)
              </Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={headerRowStart ?? ""}
                onChange={(e) =>
                  setHeaderRowStart(
                    e.target.value ? Math.max(1, Number(e.target.value)) : undefined,
                  )
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                If grouping headers sit above the header row (e.g. "Engine 1" spanning "TSN"/
                "TSO"), enter the row they start on. Columns will show as "Engine 1 -&gt; TSN".
              </p>
            </div>
          </div>
          <UploadBox onFile={handleFile} isUploading={upload.isPending} />
          {(localError || apiError) && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{localError ?? apiError}</span>
            </div>
          )}
        </div>

        <Card className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide">Template expects</h2>
          {template.isPending && (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          )}
          {template.isError && (
            <p className="mt-3 text-sm text-destructive">{template.error.message}</p>
          )}
          {template.data && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {template.data.columns.map((column) => (
                <li key={column} className="flex items-center justify-between gap-2">
                  <span className="truncate">{column}</span>
                  {template.data.required_columns.includes(column) && (
                    <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-brand-black">
                      Required
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {result && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{result.file_name}</h2>
              <p className="text-sm text-muted-foreground">
                {result.row_count} rows · {result.columns.length} columns detected
              </p>
            </div>
            <Button
              variant="cta"
              onClick={() =>
                navigate({
                  to: "/mapping/$templateId/$uploadId",
                  params: { templateId, uploadId: result.upload_id },
                })
              }
            >
              Continue to mapping <ArrowRight />
            </Button>
          </div>
          <div className="mt-4">
            <PreviewGrid columns={result.columns} rows={result.sample_rows} />
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button asChild variant="ghost">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    </WizardLayout>
  );
}
