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

      if (seen.has(rule.destination)) {
        globalErrors.push(`Duplicate destination column "${rule.destination}".`);
      }
      seen.add(rule.destination);

      // A customer file not having a column for some destination (even a "required" one) must
      // not block generation - it's just left blank in the output. Only genuine configuration
      // mistakes (empty formula, unknown placeholder, etc.) are flagged here.
      switch (rule.operation) {
        case "constant":
          if (!String(opts["value"] ?? "").length) errors.push("Constant value is required.");
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
          if (!String(opts["find"] ?? "").length) errors.push('"Find" value is required.');
          break;
        case "date_format":
          if (!String(opts["format"] ?? "").length) errors.push("Date format is required.");
          break;
        default:
          break;
      }

      if (errors.length) rowErrors[rule.destination] = errors;
    }

    return {
      rowErrors,
      globalErrors,
      isValid: Object.keys(rowErrors).length === 0 && globalErrors.length === 0,
    };
  }, [mappings, uploadColumns]);
}
