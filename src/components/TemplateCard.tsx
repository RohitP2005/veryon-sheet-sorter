<<<<<<< keep
import { FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TemplateSummary } from "@/types";

export function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateSummary;
  selected?: boolean;
  onSelect: (template: TemplateSummary) => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(template)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(template);
        }
      }}
      className={cn(
        "cursor-pointer border-2 p-5 outline-none transition-all hover:-translate-y-0.5 hover:border-brand-yellow hover:shadow-md focus-visible:border-brand-yellow focus-visible:ring-2 focus-visible:ring-brand-yellow",
        selected ? "border-brand-yellow ring-2 ring-brand-yellow" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-black">
          <FileSpreadsheet className="size-4 text-brand-yellow" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-foreground">{template.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sheet: <span className="text-foreground">{template.sheet_name}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}