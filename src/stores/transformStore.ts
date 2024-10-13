import { defineStore } from "pinia";
import { Units } from "@turf/turf";

export type BufferOptions = {
  radius: number;
  units?: Units;
  steps?: number;
};

export type SimplifyOptions = {
  tolerance?: number;
};

export type TransformationOperation =
  | {
      transform: "buffer";
      options: BufferOptions;
    }
  | { transform: "boundingBox"; options: {} }
  | { transform: "convexHull"; options: {} }
  | { transform: "simplify"; options: SimplifyOptions }
  | { transform: "smooth"; options: {} };

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
