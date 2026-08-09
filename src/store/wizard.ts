import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MappingRule, TemplateSummary, UploadResponse } from "@/types";

interface WizardState {
  step: number;
  template: TemplateSummary | null;
  templateId: string | null;
  upload: UploadResponse | null;
  mappings: MappingRule[];
  jobId: string | null;
  outputFileName: string | null;
  setStep: (step: number) => void;
  selectTemplate: (template: TemplateSummary) => void;
  setUpload: (upload: UploadResponse) => void;
  setMappings: (mappings: MappingRule[]) => void;
  setJob: (jobId: string, fileName: string) => void;
  reset: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      step: 1,
      template: null,
      templateId: null,
      upload: null,
      mappings: [],
      jobId: null,
      outputFileName: null,
      setStep: (step) => set({ step }),
      selectTemplate: (template) =>
        set({ template, templateId: template.id, upload: null, mappings: [], step: 2 }),
      setUpload: (upload) => set({ upload, mappings: [], step: 3 }),
      setMappings: (mappings) => set({ mappings }),
      setJob: (jobId, outputFileName) => set({ jobId, outputFileName, step: 4 }),
      reset: () =>
        set({
          step: 1,
          template: null,
          templateId: null,
          upload: null,
          mappings: [],
          jobId: null,
          outputFileName: null,
        }),
    }),
    {
      name: "veryon-wizard",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.sessionStorage,
      ),
    },
  ),
);
