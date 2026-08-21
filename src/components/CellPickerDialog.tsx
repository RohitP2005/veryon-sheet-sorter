import { useState } from "react";
import { TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Lets the user pick a constant value by clicking a cell anywhere in the uploaded sheet
 * (spreadsheet-style "A"/"B"/"C" columns, every row from the top), instead of typing it by
 * hand - independent of the chosen header row, so title/logo rows above the header are
 * still reachable. */
export function CellPickerDialog({
  columns,
  rows,
  onPick,
}: {
  columns: string[];
  rows: unknown[][];
  onPick: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function handlePick(value: unknown) {
    onPick(value === null || value === undefined ? "" : String(value));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outlineDark" size="sm" onClick={() => setOpen(true)}>
        <TableProperties /> Choose value from sheet
      </Button>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a value from your sheet</DialogTitle>
          <DialogDescription>
            Click any cell below to use its value as the fixed value for this column.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-black hover:bg-brand-black">
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-white"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, columnIndex) => (
                    <TableCell
                      key={column}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePick(row[columnIndex])}
                      onKeyDown={(e) => e.key === "Enter" && handlePick(row[columnIndex])}
                      className="cursor-pointer whitespace-nowrap hover:bg-brand-yellow/20"
                    >
                      {row[columnIndex] === null || row[columnIndex] === undefined
                        ? ""
                        : String(row[columnIndex])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length || 1}
                    className="text-center text-muted-foreground"
                  >
                    No sample rows available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
