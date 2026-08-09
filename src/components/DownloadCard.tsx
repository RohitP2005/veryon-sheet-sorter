import { Download, FileCheck2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DownloadCard({
  fileName,
  jobId,
  isDownloading,
  onDownloadAgain,
  onStartOver,
}: {
  fileName: string;
  jobId: string;
  isDownloading?: boolean;
  onDownloadAgain: () => void;
  onStartOver: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl overflow-hidden p-0">
      <div className="flex items-center gap-3 bg-brand-black px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-md bg-brand-yellow">
          <FileCheck2 className="size-5 text-brand-black" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-white">Your workbook is ready</h1>
          <p className="text-xs text-white/60">Job {jobId || "—"}</p>
        </div>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-muted-foreground">File name</p>
        <p className="mt-1 break-all font-semibold">{fileName}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="cta" onClick={onDownloadAgain} disabled={isDownloading}>
            <Download /> {isDownloading ? "Downloading…" : "Download again"}
          </Button>
          <Button variant="outlineDark" onClick={onStartOver}>
            <RotateCcw /> Start over
          </Button>
        </div>
      </div>
    </Card>
  );
}