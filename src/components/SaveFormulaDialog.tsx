import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SaveFormulaDialog({
  formula,
  isSaving,
  onSave,
}: {
  formula: string;
  isSaving: boolean;
  onSave: (name: string, description: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSave() {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    setOpen(false);
    setName("");
    setDescription("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outlineDark" size="sm" disabled={!formula.trim()}>
          <Save /> Save as reusable operation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save formula as a reusable operation</DialogTitle>
          <DialogDescription>
            Give this formula a name so it shows up under "Saved Formulas" in the operation list for
            any mapping row, on any template.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Name</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Line Total"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Description (optional)
            </Label>
            <Input
              className="mt-1.5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this formula compute?"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Formula</Label>
            <p className="mt-1.5 rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs">
              {formula}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="cta"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
