import { AlertCircle, Sigma } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourceMultiSelect } from "./SourceMultiSelect";
import { FormulaEditor } from "./FormulaEditor";
import { SaveFormulaDialog } from "./SaveFormulaDialog";
import { CellPickerDialog } from "./CellPickerDialog";
import {
  OPERATIONS,
  type ConcatenateFormat,
  type MappingRule,
  type Operation,
  type SavedFormula,
} from "@/types";

const SAVED_FORMULA_PREFIX = "saved:";

export function MappingRow({
  rule,
  uploadColumns,
  gridColumns,
  gridRows,
  required,
  errors,
  savedFormulas,
  onSaveFormula,
  isSavingFormula,
  onChange,
}: {
  rule: MappingRule;
  uploadColumns: string[];
  gridColumns: string[];
  gridRows: unknown[][];
  required: boolean;
  errors: string[];
  savedFormulas: SavedFormula[];
  onSaveFormula: (name: string, description: string) => void;
  isSavingFormula?: boolean;
  onChange: (next: MappingRule) => void;
}) {
  const options = rule.options ?? {};
  const setOption = (key: string, value: string) =>
    onChange({ ...rule, options: { ...options, [key]: value } });
  const formats = ((options["formats"] as ConcatenateFormat[] | undefined) ?? []).slice();
  const setFormatAt = (index: number, patch: Partial<ConcatenateFormat>) => {
    const next = rule.sources.map((_, i) => ({
      ...(formats[i] ?? {}),
      ...(i === index ? patch : {}),
    }));
    onChange({ ...rule, options: { ...options, formats: next } });
  };

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
              onValueChange={(value) => {
                if (value.startsWith(SAVED_FORMULA_PREFIX)) {
                  const saved = savedFormulas.find(
                    (f) => f.id === value.slice(SAVED_FORMULA_PREFIX.length),
                  );
                  if (saved) {
                    onChange({
                      ...rule,
                      operation: "formula",
                      formula: saved.formula,
                      options: {},
                    });
                  }
                  return;
                }
                const operation = value as Operation;
                onChange({
                  ...rule,
                  operation,
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
                            : operation === "append_text"
                              ? {
                                  prefix: (options["prefix"] as string) ?? "",
                                  suffix: (options["suffix"] as string) ?? "",
                                  separator: (options["separator"] as string) ?? "",
                                }
                              : operation === "duration_pair_merge"
                                ? {
                                    separator: (options["separator"] as string) ?? ", ",
                                    first_suffix: (options["first_suffix"] as string) ?? " FH",
                                    second_suffix: (options["second_suffix"] as string) ?? " FC",
                                  }
                                : operation === "slice"
                                  ? {
                                      length: (options["length"] as number) ?? 0,
                                      trim: (options["trim"] as boolean) ?? true,
                                      retain: (options["retain"] as boolean) ?? true,
                                    }
                                  : {},
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Operations</SelectLabel>
                  {OPERATIONS.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {savedFormulas.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Saved Formulas</SelectLabel>
                    {savedFormulas.map((saved) => (
                      <SelectItem key={saved.id} value={`${SAVED_FORMULA_PREFIX}${saved.id}`}>
                        <Sigma className="mr-1 inline size-3.5 text-brand-yellow" />
                        {saved.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {rule.operation === "concatenate" && (
        <div className="mt-4 space-y-3">
          <div className="max-w-xs">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Separator
            </Label>
            <Input
              className="mt-1.5"
              value={(options["separator"] as string) ?? " "}
              onChange={(e) => setOption("separator", e.target.value)}
            />
          </div>
          {rule.sources.length > 0 && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Per-source formatting (optional)
              </Label>
              {rule.sources.map((source, i) => (
                <div
                  key={source}
                  className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {source}
                  </span>
                  <Input
                    placeholder="Prefix"
                    value={formats[i]?.prefix ?? ""}
                    onChange={(e) => setFormatAt(i, { prefix: e.target.value })}
                  />
                  <Input
                    placeholder="Suffix"
                    value={formats[i]?.suffix ?? ""}
                    onChange={(e) => setFormatAt(i, { suffix: e.target.value })}
                  />
                  <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <Checkbox
                      checked={Boolean(formats[i]?.duration_format)}
                      onCheckedChange={(checked) =>
                        setFormatAt(i, { duration_format: Boolean(checked) })
                      }
                    />
                    HH:MM
                  </label>
                </div>
              ))}
            </div>
          )}
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

      {rule.operation === "date_standardize" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Parses the date regardless of its original format (<code>dd/mm/yyyy</code>,{" "}
          <code>yyyy-mm-dd</code>, an Excel date, etc.) and always outputs <code>dd-Mon-yyyy</code>{" "}
          — e.g. <code>13/04/2005</code> → <code>13-Apr-2005</code>. No options needed.
        </p>
      )}

      {isConstant && (
        <div className="mt-4 max-w-md space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Value</Label>
          <div className="flex items-center gap-2">
            <Input
              value={(options["value"] as string) ?? ""}
              onChange={(e) => setOption("value", e.target.value)}
            />
            <CellPickerDialog
              columns={gridColumns}
              rows={gridRows}
              onPick={(value) => setOption("value", value)}
            />
          </div>
        </div>
      )}

      {rule.operation === "append_text" && (
        <div className="mt-4 space-y-3">
          <div className="grid max-w-xl gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Prefix
              </Label>
              <Input
                className="mt-1.5"
                value={(options["prefix"] as string) ?? ""}
                onChange={(e) => setOption("prefix", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Suffix
              </Label>
              <Input
                className="mt-1.5"
                placeholder='e.g. " FH" or " FC"'
                value={(options["suffix"] as string) ?? ""}
                onChange={(e) => setOption("suffix", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Separator
              </Label>
              <Input
                className="mt-1.5"
                placeholder="Used when multiple source columns are selected"
                value={(options["separator"] as string) ?? ""}
                onChange={(e) => setOption("separator", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {rule.operation === "duration_format" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Converts a numeric hours value (e.g. 12530) into H:MM format (e.g. 12530:00).
        </p>
      )}

      {rule.operation === "duration_pair_merge" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Select 2 source columns above: 1st = TSN/hours value (formatted to H:MM), 2nd = CSN/
            cycles value. Example: TSN 12530 + CSN 4321 → <code>12530:00 FH, 4321 FC</code>
          </p>
          <div className="grid max-w-xl gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                1st value suffix
              </Label>
              <Input
                className="mt-1.5"
                value={(options["first_suffix"] as string) ?? " FH"}
                onChange={(e) => setOption("first_suffix", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                2nd value suffix
              </Label>
              <Input
                className="mt-1.5"
                value={(options["second_suffix"] as string) ?? " FC"}
                onChange={(e) => setOption("second_suffix", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Separator
              </Label>
              <Input
                className="mt-1.5"
                value={(options["separator"] as string) ?? ", "}
                onChange={(e) => setOption("separator", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {rule.operation === "slice" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Trims whitespace, then slices the value: a positive length counts from the start, a
            negative length counts from the end. With "Retain" checked, that many characters are{" "}
            <strong>kept</strong> (length 3 on <code>"ABC12345"</code> → <code>"ABC"</code>; length
            -4 → <code>"2345"</code>). With it unchecked, that many are{" "}
            <strong>removed instead</strong>, keeping the rest (length 4 → <code>"2345"</code>;
            length -4 → <code>"ABC1"</code>).
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="max-w-[10rem]">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Length
              </Label>
              <Input
                className="mt-1.5"
                type="number"
                placeholder="e.g. 3 or -4"
                value={(options["length"] as number | string) ?? 0}
                onChange={(e) =>
                  onChange({
                    ...rule,
                    options: { ...options, length: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <label className="flex items-center gap-1.5 pb-2 text-xs whitespace-nowrap">
              <Checkbox
                checked={(options["trim"] as boolean) ?? true}
                onCheckedChange={(checked) =>
                  onChange({ ...rule, options: { ...options, trim: Boolean(checked) } })
                }
              />
              Trim whitespace before slicing
            </label>
            <label className="flex items-center gap-1.5 pb-2 text-xs whitespace-nowrap">
              <Checkbox
                checked={(options["retain"] as boolean) ?? true}
                onCheckedChange={(checked) =>
                  onChange({ ...rule, options: { ...options, retain: Boolean(checked) } })
                }
              />
              Retain (keep, instead of remove)
            </label>
          </div>
        </div>
      )}

      {rule.operation === "formula" && (
        <div className="mt-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Formula — use {"{{"}ColumnName{"}}"} placeholders
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Arithmetic (+ − × ÷ %, and ^ for power) plus Excel-style functions: IF, IFERROR, AND,
            OR, NOT, ROUND/ROUNDUP/ROUNDDOWN, ABS, MIN, MAX, SUM, AVERAGE, MOD, SQRT, POWER,
            CONCATENATE, LEFT, RIGHT, MID, LEN, UPPER, LOWER, TRIM, SUBSTITUTE. E.g.{" "}
            <code>
              IF({"{{"}Qty{"}}"}=0, 0, {"{{"}Total{"}}"}/{"{{"}Qty{"}}"})
            </code>
            .
          </p>
          <div className="mt-1.5">
            <FormulaEditor
              value={rule.formula ?? ""}
              columns={uploadColumns}
              onChange={(formula) => onChange({ ...rule, formula })}
            />
          </div>
          <div className="mt-2">
            <SaveFormulaDialog
              formula={rule.formula ?? ""}
              isSaving={Boolean(isSavingFormula)}
              onSave={onSaveFormula}
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
