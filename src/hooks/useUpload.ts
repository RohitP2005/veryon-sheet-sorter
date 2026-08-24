import { useMutation } from "@tanstack/react-query";
import { uploadExcel } from "@/api/client";

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
