import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Choose Template", "Upload Excel", "Map Columns", "Download"] as const;

export function ProgressStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Wizard progress" className="w-full">
      <ol className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div
                tabIndex={0}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-yellow",
                  isActive
                    ? "bg-brand-yellow text-brand-black"
                    : isDone
                      ? "text-brand-yellow"
                      : "text-white/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[11px] font-bold",
                    isActive
                      ? "border-brand-black bg-brand-black text-brand-yellow"
                      : isDone
                        ? "border-brand-yellow bg-brand-yellow text-brand-black"
                        : "border-white/30",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : step}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {step < STEPS.length && (
                <span
                  aria-hidden
                  className={cn("h-px flex-1", isDone ? "bg-brand-yellow" : "bg-white/20")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}