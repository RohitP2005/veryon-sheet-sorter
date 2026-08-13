import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createSavedFormula, deleteSavedFormula, listSavedFormulas } from "@/api/client";

const FORMULAS_QUERY_KEY = ["formulas"] as const;

export function useSavedFormulas() {
  return useQuery({ queryKey: FORMULAS_QUERY_KEY, queryFn: listSavedFormulas });
}

export function useCreateSavedFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSavedFormula,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FORMULAS_QUERY_KEY }),
  });
}

export function useDeleteSavedFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedFormula,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FORMULAS_QUERY_KEY }),
  });
}
