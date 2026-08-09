import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { WizardLayout } from "@/components/AppHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import { useWizardStore } from "@/store/wizard";
import type { TemplateSummary } from "@/types";

export function ChooseTemplate() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useTemplates();
  const selectTemplate = useWizardStore((s) => s.selectTemplate);

  function onSelect(template: TemplateSummary) {
    selectTemplate(template);
    navigate({ to: "/upload/$templateId", params: { templateId: template.id } });
  }

  return (
    <WizardLayout step={1}>
      <h1 className="text-3xl font-extrabold tracking-tight">Choose a template</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Pick the output template your customer workbook should be transformed into.
      </p>

      {isPending && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="size-4" /> Couldn't load templates: {error.message}
          </p>
          <Button variant="outlineDark" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No templates available yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={onSelect} />
          ))}
        </div>
      )}
    </WizardLayout>
  );
}
