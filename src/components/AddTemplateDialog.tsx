import { useRef, useState } from "react";
import { FilePlus2, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Lets a user add a brand-new template by uploading a sample workbook - its header row
 * becomes the template's columns, everything else is typed in by hand. */
export function AddTemplateDialog({
  isSaving,
  onCreate,
}: {
  isSaving: boolean;
  onCreate: (input: {
    file: File;
    name: string;
    description: string;
    sheetName: string;
    headerRow: number;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [headerRow, setHeaderRow] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setName("");
    setDescription("");
    setSheetName("");
    setHeaderRow(1);
    setError(null);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!file) {
      setError("Choose a sample .xlsx file to read the columns from.");
      return;
    }
    setError(null);
    onCreate({
      file,
      name: name.trim(),
      description: description.trim(),
      sheetName: sheetName.trim(),
      headerRow,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="cta">
          <FilePlus2 /> Add Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a new template</DialogTitle>
          <DialogDescription>
            Upload a sample workbook — its header row becomes the template's columns. Fill in the
            rest by hand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Sample workbook
            </Label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-1.5 flex w-full items-center gap-2 rounded-md border border-dashed border-brand-black/40 px-3 py-2 text-left text-sm hover:border-brand-yellow"
            >
              <UploadCloud className="size-4 shrink-0 text-brand-black" />
              <span className="truncate">{file ? file.name : "Choose a .xlsx file…"}</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Name</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Supplier Invoice"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              className="mt-1.5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template used for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Sheet name (optional)
              </Label>
              <Input
                className="mt-1.5"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Defaults to the template name"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Header row
              </Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={headerRow}
                onChange={(e) => setHeaderRow(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="cta" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <FilePlus2 />}
            {isSaving ? "Adding…" : "Add Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
