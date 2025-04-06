import { defineStore } from "pinia";
import type { ExportFormat, ImportFormat } from "@/types/convert";
import { useLocalStorage } from "@vueuse/core";

export interface ImportState {
  inputSource: "file" | "url" | "browser" | "string";
  format: ImportFormat;
  keepOpen: boolean;
}
export const useImportStore = defineStore("import", {
  state: (): ImportState =>
    ({
      inputSource: "file",
      format: "milx",
      keepOpen: useLocalStorage("importKeepOpen", false),
    }) as unknown as ImportState,
});

export interface ExportSettings {
  keepOpen: boolean;
  currentFormat: ExportFormat;
}
export const useExportStore = defineStore("exportStore", {
  state() {
    return {
      keepOpen: useLocalStorage("exportKeepOpen", false),
      currentFormat: useLocalStorage<ExportFormat>("exportCurrentFormat", "orbatmapper"),
    };
  },
});
