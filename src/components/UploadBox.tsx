import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UploadBox({
  onFile,
  isUploading,
  disabled,
}: {
  onFile: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card px-6 py-12 text-center transition-colors",
        dragging ? "border-brand-yellow bg-brand-yellow/5" : "border-brand-black/40",
      )}
    >
      {isUploading ? (
        <Loader2 className="size-8 animate-spin text-brand-black" />
      ) : (
        <UploadCloud className="size-8 text-brand-black" />
      )}
      <h3 className="mt-4 text-base font-bold">
        {isUploading ? "Uploading your workbook…" : "Drop your .xlsx file here"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Max size 10MB · .xlsx only</p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="cta"
        className="mt-5"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}