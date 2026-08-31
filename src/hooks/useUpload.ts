import { useMutation, useQuery } from "@tanstack/react-query";
import { checkUploadExists, uploadExcel } from "@/api/client";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateExcelFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return "Only .xlsx files are supported.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File is too large. Maximum size is 10MB.";
  }
  return null;
}

export function useUpload() {
  return useMutation({
    mutationFn: ({
      file,
      headerRow,
      headerRowStart,
    }: {
      file: File;
      headerRow: number;
      headerRowStart?: number | undefined;
    }) => uploadExcel(file, headerRow, headerRowStart),
    retry: false,
  });
}

/** Verifies a previously-uploaded file's upload_id is still known to the server. Uploads live
 * only in server memory (no persistence) - a session left open across a backend restart would
 * otherwise only discover its upload_id is stale after filling out the whole mapping form and
 * clicking Generate. */
export function useUploadExists(uploadId: string | undefined) {
  return useQuery({
    queryKey: ["upload-exists", uploadId],
    queryFn: () => checkUploadExists(uploadId as string),
    enabled: Boolean(uploadId),
    retry: false,
    staleTime: 0,
  });
}
