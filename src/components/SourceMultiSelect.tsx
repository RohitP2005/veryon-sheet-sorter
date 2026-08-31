import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function SourceMultiSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {value.length
                ? `${value.length} column${value.length > 1 ? "s" : ""}`
                : "Select source columns"}
            </span>
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-64 w-96 max-w-[90vw] overflow-y-auto p-1">
          {options.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">No columns detected</p>
          )}
          {options.map((option) => {
            const active = value.includes(option);
            return (
              <button
                type="button"
                key={option}
                onClick={() => toggle(option)}
                className={cn(
                  "flex w-full items-start justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-secondary",
                  active && "font-medium",
                )}
              >
                <span className="whitespace-normal break-words">{option}</span>
                {active && <Check className="mt-0.5 size-4 shrink-0 text-brand-yellow-dark" />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-brand-black px-2 py-0.5 text-[11px] font-medium text-white"
            >
              {v}
              <button type="button" onClick={() => toggle(v)} aria-label={`Remove ${v}`}>
                <X className="size-3 text-brand-yellow" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
