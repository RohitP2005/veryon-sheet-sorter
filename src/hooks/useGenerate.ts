import { useMutation } from "@tanstack/react-query";
import { generateWorkbook, type GenerateBody } from "@/api/client";

export function useGenerate() {
  return useMutation({
    mutationFn: (body: GenerateBody) => generateWorkbook(body),
    retry: false,
  });
}