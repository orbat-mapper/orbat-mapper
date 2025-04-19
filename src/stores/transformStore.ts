import { defineStore } from "pinia";
import type { BufferOptions, SimplifyOptions } from "@/geo/transformations.ts";

export const useTransformSettingsStore = defineStore("transformSettings", {
  state: () => ({
    showPreview: true,
    transformation: "buffer",
    bufferOptions: {
      radius: 2,
      units: "kilometers",
      steps: 8,
    } as BufferOptions,
    simplifyOptions: {
      tolerance: 0.01,
    } as SimplifyOptions,
  }),
});
