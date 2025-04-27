import { defineStore } from "pinia";
import {
  type BufferOptions,
  createDefaultTransformationOperation,
  type SimplifyOptions,
  type TransformationOperation,
} from "@/geo/transformations.ts";
import { ref } from "vue";
import type { FeatureId } from "@/types/scenarioGeoModels.ts";

export const useTransformSettingsStore = defineStore("transformSettings", () => {
  const showPreview = ref(true);
  const transformations = ref<TransformationOperation[]>([
    createDefaultTransformationOperation(),
  ]);
  const updateAtTime = ref(false);
  const updateActiveFeature = ref<FeatureId>();
  return {
    showPreview,
    transformations,
    updateAtTime,
    updateActiveFeature,
  };
});
