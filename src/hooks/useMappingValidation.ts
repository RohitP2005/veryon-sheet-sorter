import { useMemo } from "react";
import type { MappingRule } from "@/types";

export interface MappingValidation {
  rowErrors: Record<string, string[]>;
  globalErrors: string[];
  isValid: boolean;
}

export function extractPlaceholders(formula: string): string[] {
  return [...formula.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((m) => m[1] as string);
}

export function useMappingValidation(
  mappings: MappingRule[],
  uploadColumns: string[],
  requiredColumns: string[],
): MappingValidation {
  return useMemo(() => {
    const rowErrors: Record<string, string[]> = {};
    const globalErrors: string[] = [];
    const seen = new Set<string>();

    for (const rule of mappings) {
      const errors: string[] = [];
      const opts = rule.options ?? {};
      const isRequired = requiredColumns.includes(rule.destination);

      if (seen.has(rule.destination)) {
        globalErrors.push(`Duplicate destination column "${rule.destination}".`);
      }
      seen.add(rule.destination);

      switch (rule.operation) {
        case "constant":
          if (!String(opts['value'] ?? "").length) errors.push("Constant value is required.");
          break;
        case "concatenate":
          if (rule.sources.length < 2)
            errors.push("Concatenate requires at least 2 source columns.");
          break;
        case "multiply":
          if (rule.sources.length < 1) errors.push("Multiply requires at least 1 source column.");
          break;
        case "formula": {
          const formula = (rule.formula ?? "").trim();
          if (!formula) {
            errors.push("Formula cannot be empty.");
          } else {
            const unknown = extractPlaceholders(formula).filter(
              (name) => !uploadColumns.includes(name),
            );
            if (unknown.length)
              errors.push(`Unknown column placeholder(s): ${[...new Set(unknown)].join(", ")}.`);
          }
          break;
        }
        case "replace":
          if (!String(opts['find'] ?? "").length) errors.push('"Find" value is required.');
          if (rule.sources.length < 1) errors.push("Select at least 1 source column.");
          break;
        case "date_format":
          if (!String(opts['format'] ?? "").length) errors.push("Date format is required.");
          if (rule.sources.length < 1) errors.push("Select at least 1 source column.");
          break;
        default:
          if (isRequired && rule.sources.length < 1)
            errors.push("Select at least 1 source column.");
          break;
      }

      if (isRequired && rule.operation !== "constant" && rule.sources.length < 1) {
        if (!errors.includes("Select at least 1 source column."))
          errors.push("This column is required — select at least 1 source column.");
      }

      if (errors.length) rowErrors[rule.destination] = errors;
    }

    for (const required of requiredColumns) {
      const rule = mappings.find((m) => m.destination === required);
      if (!rule) globalErrors.push(`Required column "${required}" has no mapping.`);
    }

    return {
      rowErrors,
      globalErrors,
      isValid: Object.keys(rowErrors).length === 0 && globalErrors.length === 0,
    };
  }, [mappings, uploadColumns, requiredColumns]);
}