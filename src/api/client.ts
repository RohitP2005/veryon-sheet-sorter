import type {
  GenerateError,
  MappingRule,
  TemplateDetail,
  TemplateSummary,
  UploadResponse,
} from "@/types";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  errors?: GenerateError[] | undefined;
  constructor(status: number, message: string, errors?: GenerateError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function toApiError(res: Response) {
  let detail = `Request failed with status ${res.status}`;
  let errors: GenerateError[] | undefined;
  try {
    const body = (await res.json()) as { detail?: string; errors?: GenerateError[] };
    if (body?.detail) detail = body.detail;
    if (Array.isArray(body?.errors)) errors = body.errors;
  } catch {
    /* non-JSON body */
  }
  return new ApiError(res.status, detail, errors);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

export function listTemplates() {
  return getJson<TemplateSummary[]>("/api/templates");
}

export function getTemplate(templateId: string) {
  return getJson<TemplateDetail>(`/api/templates/${encodeURIComponent(templateId)}`);
}

export async function uploadExcel(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/upload`, { method: "POST", body: form });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as UploadResponse;
}

export interface GenerateBody {
  template_id: string;
  upload_id: string;
  mappings: Array<{
    destination: string;
    sources: string[];
    operation: MappingRule["operation"];
    formula: string | null;
    options: Record<string, unknown>;
  }>;
}

export interface GenerateResult {
  jobId: string;
  fileName: string;
  blob: Blob;
}

function fileNameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

export async function generateWorkbook(body: GenerateBody): Promise<GenerateResult> {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await toApiError(res);
  const blob = await res.blob();
  const jobId = res.headers.get("X-Job-Id") ?? "";
  return {
    jobId,
    fileName: fileNameFromDisposition(res.headers.get("Content-Disposition"), "veryon-output.xlsx"),
    blob,
  };
}

export async function downloadJob(jobId: string): Promise<GenerateResult> {
  const res = await fetch(`${API_BASE_URL}/api/download/${encodeURIComponent(jobId)}`);
  if (!res.ok) throw await toApiError(res);
  const blob = await res.blob();
  return {
    jobId,
    fileName: fileNameFromDisposition(
      res.headers.get("Content-Disposition"),
      `veryon-output-${jobId}.xlsx`,
    ),
    blob,
  };
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
