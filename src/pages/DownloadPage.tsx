import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { WizardLayout } from "@/components/AppHeader";
import { DownloadCard } from "@/components/DownloadCard";
import { downloadJob, triggerBlobDownload } from "@/api/client";
import { useWizardStore } from "@/store/wizard";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";

export function DownloadPage() {
  const { jobId } = useParams({ from: "/download/$jobId" });
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const fileName = useWizardStore((s) => s.outputFileName);
  const reset = useWizardStore((s) => s.reset);

  const redownload = useMutation({
    mutationFn: () => downloadJob(jobId),
    retry: false,
    onSuccess: (result) => triggerBlobDownload(result.blob, result.fileName),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <WizardLayout step={4}>
      {!hydrated ? (
        <Skeleton className="mx-auto h-64 max-w-xl rounded-lg" />
      ) : (
        <DownloadCard
          jobId={jobId}
          fileName={fileName ?? `veryon-output-${jobId}.xlsx`}
          isDownloading={redownload.isPending}
          onDownloadAgain={() => redownload.mutate()}
          onStartOver={() => {
            reset();
            navigate({ to: "/templates" });
          }}
        />
      )}
    </WizardLayout>
  );
}