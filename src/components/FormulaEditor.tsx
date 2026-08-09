import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoFormulaEditor = lazy(() => import("./MonacoFormulaEditor"));

export function FormulaEditor(props: {
  value: string;
  columns: string[];
  onChange: (value: string) => void;
}) {
  return (
    <ClientOnly fallback={<Skeleton className="h-24 w-full" />}>
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <MonacoFormulaEditor {...props} />
      </Suspense>
    </ClientOnly>
  );
}