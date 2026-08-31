import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, Wand2 } from "lucide-react";
import { WizardLayout } from "@/components/AppHeader";
import { MappingRow } from "@/components/MappingRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTemplate } from "@/hooks/useTemplates";
import { useGenerate } from "@/hooks/useGenerate";
import { useMappingValidation } from "@/hooks/useMappingValidation";
import { useHydrated } from "@/hooks/useHydrated";
import { useUploadExists } from "@/hooks/useUpload";
import { useSavedFormulas, useCreateSavedFormula } from "@/hooks/useFormulas";
import { useWizardStore } from "@/store/wizard";
import { ApiError, triggerBlobDownload } from "@/api/client";
import type { GenerateError, MappingRule } from "@/types";

export function Mapping() {
  const { templateId, uploadId } = useParams({ from: "/mapping/$templateId/$uploadId" });
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const template = useTemplate(templateId);
  const generate = useGenerate();
  const savedFormulas = useSavedFormulas();
  const createSavedFormula = useCreateSavedFormula();
  const upload = useWizardStore((s) => s.upload);
  const uploadExists = useUploadExists(upload?.upload_id);
  const mappings = useWizardStore((s) => s.mappings);
  const setMappings = useWizardStore((s) => s.setMappings);
  const setJob = useWizardStore((s) => s.setJob);
  const [serverErrors, setServerErrors] = useState<GenerateError[] | null>(null);

  const uploadColumns = useMemo(() => upload?.columns ?? [], [upload]);
  const requiredColumns = useMemo(() => template.data?.required_columns ?? [], [template.data]);

  useEffect(() => {
    if (!template.data) return;
    const destinations = template.data.columns;
    const needsInit =
      mappings.length !== destinations.length ||
      mappings.some((m, i) => m.destination !== destinations[i]);
    if (needsInit) {
      setMappings(
        destinations.map<MappingRule>((destination) => {
          const existing = mappings.find((m) => m.destination === destination);
          return (
            existing ?? {
              destination,
              sources: uploadColumns.includes(destination) ? [destination] : [],
              operation: "copy",
              formula: null,
              options: {},
            }
          );
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.data]);

  const validation = useMappingValidation(mappings, uploadColumns, requiredColumns);

  function handleGenerate() {
    setServerErrors(null);
    generate.mutate(
      {
        template_id: templateId,
        upload_id: uploadId,
        mappings: mappings.map((m) => ({
          destination: m.destination,
          sources: m.sources,
          operation: m.operation,
          formula: m.operation === "formula" ? (m.formula ?? "") : null,
          options: m.options ?? {},
        })),
      },
      {
        onSuccess: (result) => {
          triggerBlobDownload(result.blob, result.fileName);
          setJob(result.jobId, result.fileName);
          navigate({ to: "/download/$jobId", params: { jobId: result.jobId } });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 400 && error.errors?.length) {
            setServerErrors(error.errors);
            return;
          }
          if (error instanceof ApiError && error.status === 404) {
            toast.error(error.message, {
              description: "The template or upload no longer exists.",
              action: { label: "Start over", onClick: () => navigate({ to: "/templates" }) },
            });
            return;
          }
          toast.error(error.message);
        },
      },
    );
  }

  if (!hydrated || template.isPending || (upload && uploadExists.isPending)) {
    return (
      <WizardLayout step={3}>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </WizardLayout>
    );
  }

  if (!upload || uploadExists.data === false) {
    return (
      <WizardLayout step={3}>
        <Card className="p-6">
          <h1 className="text-lg font-bold">Upload data missing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {upload
              ? "This upload is no longer available on the server (uploads aren't kept between server restarts). Please upload the file again."
              : "We couldn't find your uploaded workbook in this session. Please upload it again."}
          </p>
          <Button asChild variant="cta" className="mt-4">
            <Link to="/upload/$templateId" params={{ templateId }}>
              Back to upload
            </Link>
          </Button>
        </Card>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout step={3}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Map your columns</h1>
          <p className="mt-2 text-muted-foreground">
            {template.data?.name} · source file{" "}
            <span className="font-medium">{upload.file_name}</span>
          </p>
        </div>
        <Button
          variant="cta"
          size="lg"
          disabled={!validation.isValid || generate.isPending}
          onClick={handleGenerate}
        >
          <Wand2 /> {generate.isPending ? "Generating…" : "Generate"}
        </Button>
      </div>

      {validation.globalErrors.length > 0 && (
        <ul className="mt-6 space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          {validation.globalErrors.map((error) => (
            <li key={error} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-4">
        {mappings.map((rule) => (
          <MappingRow
            key={rule.destination}
            rule={rule}
            uploadColumns={uploadColumns}
            gridColumns={upload.grid_columns}
            gridRows={upload.grid_rows}
            required={requiredColumns.includes(rule.destination)}
            errors={validation.rowErrors[rule.destination] ?? []}
            savedFormulas={savedFormulas.data ?? []}
            isSavingFormula={createSavedFormula.isPending}
            onSaveFormula={(name, description) =>
              createSavedFormula.mutate(
                { name, formula: rule.formula ?? "", description: description || undefined },
                {
                  onSuccess: () => toast.success(`Saved "${name}" to your formula library`),
                  onError: (error) => toast.error(error.message),
                },
              )
            }
            onChange={(next) =>
              setMappings(mappings.map((m) => (m.destination === next.destination ? next : m)))
            }
          />
        ))}
      </div>

      <div className="mt-10 flex justify-between">
        <Button asChild variant="outlineDark">
          <Link to="/upload/$templateId" params={{ templateId }}>
            Back
          </Link>
        </Button>
      </div>

      <Dialog open={Boolean(serverErrors)} onOpenChange={(open) => !open && setServerErrors(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mapping validation failed</DialogTitle>
            <DialogDescription>
              Fix the issues below and generate again. Click an item to jump to the row.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {serverErrors?.map((error, i) => (
              <li key={`${error.destination}-${i}`}>
                <button
                  type="button"
                  className="w-full rounded-md border border-border p-3 text-left text-sm hover:border-brand-yellow"
                  onClick={() => {
                    setServerErrors(null);
                    document
                      .getElementById(`mapping-${encodeURIComponent(error.destination)}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  <span className="font-bold">{error.destination}</span>
                  <span className="mt-1 block text-muted-foreground">{error.message}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </WizardLayout>
  );
}
