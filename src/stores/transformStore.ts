import { defineStore } from "pinia";
import {
  type BufferOptions,
  createDefaultTransformationOperation,
  type SimplifyOptions,
  type TransformationOperation,
} from "@/geo/transformations.ts";
import { ref } from "vue";

export const useTransformSettingsStore = defineStore("transformSettings", () => {
  const showPreview = ref(true);
  const transformations = ref<TransformationOperation[]>([
    createDefaultTransformationOperation(),
  ]);
  return {
    showPreview,
    transformations,
  };
});
