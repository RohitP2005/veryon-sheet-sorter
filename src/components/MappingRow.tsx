import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourceMultiSelect } from "./SourceMultiSelect";
import { FormulaEditor } from "./FormulaEditor";
import { OPERATIONS, type MappingRule, type Operation } from "@/types";

export function MappingRow({
  rule,
  uploadColumns,
  required,
  errors,
  onChange,
}: {
  rule: MappingRule;
  uploadColumns: string[];
  required: boolean;
  errors: string[];
  onChange: (next: MappingRule) => void;
}) {
  const options = rule.options ?? {};
  const setOption = (key: string, value: string) =>
    onChange({ ...rule, options: { ...options, [key]: value } });

  const isConstant = rule.operation === "constant";

  return (
    <Card
      id={`mapping-${encodeURIComponent(rule.destination)}`}
      className="scroll-mt-28 border-l-4 border-l-brand-black p-4"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Destination
          </Label>
          <p className="mt-1.5 flex items-center gap-2 text-sm font-bold">
            {rule.destination}
            {required && (
              <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-brand-black">
                Required
              </span>
            )}
          </p>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Source columns
          </Label>
          <div className="mt-1.5">
            <SourceMultiSelect
              options={uploadColumns}
              value={rule.sources}
              disabled={isConstant}
              onChange={(sources) => onChange({ ...rule, sources })}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Operation</Label>
          <div className="mt-1.5">
            <Select
              value={rule.operation}
              onValueChange={(operation) =>
                onChange({
                  ...rule,
                  operation: operation as Operation,
                  sources: operation === "constant" ? [] : rule.sources,
                  formula: operation === "formula" ? (rule.formula ?? "") : null,
                  options:
                    operation === "concatenate"
                      ? { separator: (options["separator"] as string) ?? " " }
                      : operation === "date_format"
                        ? { format: (options["format"] as string) ?? "%Y-%m-%d" }
                        : operation === "replace"
                          ? {
                              find: (options["find"] as string) ?? "",
                              replace: (options["replace"] as string) ?? "",
                            }
                          : operation === "constant"
                            ? { value: (options["value"] as string) ?? "" }
                            : {},
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATIONS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {rule.operation === "concatenate" && (
        <div className="mt-4 max-w-xs">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Separator</Label>
          <Input
            className="mt-1.5"
            value={(options["separator"] as string) ?? " "}
            onChange={(e) => setOption("separator", e.target.value)}
          />
        </div>
      )}

      {rule.operation === "replace" && (
        <div className="mt-4 grid max-w-lg gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Find</Label>
            <Input
              className="mt-1.5"
              value={(options["find"] as string) ?? ""}
              onChange={(e) => setOption("find", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Replace</Label>
            <Input
              className="mt-1.5"
              value={(options["replace"] as string) ?? ""}
              onChange={(e) => setOption("replace", e.target.value)}
            />
          </div>
        </div>
      )}

      {rule.operation === "date_format" && (
        <div className="mt-4 max-w-xs">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Format (strftime)
          </Label>
          <Input
            className="mt-1.5"
            value={(options["format"] as string) ?? "%Y-%m-%d"}
            onChange={(e) => setOption("format", e.target.value)}
          />
        </div>
      )}

      {isConstant && (
        <div className="mt-4 max-w-xs">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Value</Label>
          <Input
            className="mt-1.5"
            value={(options["value"] as string) ?? ""}
            onChange={(e) => setOption("value", e.target.value)}
          />
        </div>
      )}

      {rule.operation === "formula" && (
        <div className="mt-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Formula — use {"{{"}ColumnName{"}}"} placeholders
          </Label>
          <div className="mt-1.5">
            <FormulaEditor
              value={rule.formula ?? ""}
              columns={uploadColumns}
              onChange={(formula) => onChange({ ...rule, formula })}
            />
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mt-4 space-y-1">
          {errors.map((error) => (
            <li key={error} className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="size-3.5" /> {error}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
