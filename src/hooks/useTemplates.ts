import { queryOptions, useQuery } from "@tanstack/react-query";
import { getTemplate, listTemplates } from "@/api/client";

export const templatesQueryOptions = () =>
  queryOptions({ queryKey: ["templates"], queryFn: listTemplates });

export const templateQueryOptions = (templateId: string) =>
  queryOptions({
    queryKey: ["templates", templateId],
    queryFn: () => getTemplate(templateId),
    enabled: Boolean(templateId),
  });

export function useTemplates() {
  return useQuery(templatesQueryOptions());
}

export function useTemplate(templateId: string) {
  return useQuery(templateQueryOptions(templateId));
}
