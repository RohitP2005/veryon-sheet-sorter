export type Operation =
  | "copy"
  | "trim"
  | "uppercase"
  | "lowercase"
  | "concatenate"
  | "multiply"
  | "formula"
  | "replace"
  | "date_format"
  | "constant"
  | "append_text"
  | "duration_format"
  | "duration_pair_merge";

export const OPERATIONS: Operation[] = [
  "copy",
  "trim",
  "uppercase",
  "lowercase",
  "concatenate",
  "multiply",
  "formula",
  "replace",
  "date_format",
  "constant",
  "append_text",
  "duration_format",
  "duration_pair_merge",
];

export interface ConcatenateFormat {
  prefix?: string;
  suffix?: string;
  duration_format?: boolean;
}

export interface MappingRule {
  destination: string;
  sources: string[];
  operation: Operation;
  formula?: string | null | undefined;
  options?: Record<string, unknown> | undefined;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  sheet_name: string;
}

export interface TemplateDetail extends TemplateSummary {
  columns: string[];
  required_columns: string[];
  output_format: Record<string, unknown>;
}

export interface UploadResponse {
  upload_id: string;
  file_name: string;
  columns: string[];
  sample_rows: Record<string, unknown>[];
  row_count: number;
  header_row: number;
  grid_columns: string[];
  grid_rows: unknown[][];
}

export interface GenerateError {
  destination: string;
  message: string;
}

export interface SavedFormula {
  id: string;
  name: string;
  formula: string;
  description?: string | null | undefined;
}
