import { defineStore } from "pinia";
import { ImportFormat } from "@/types/convert";

export interface ImportState {
  inputSource: "file" | "string";
  format: ImportFormat;
}
export const useImportStore = defineStore("import", {
  state: (): ImportState => ({
    inputSource: "file",
    format: "milx",
  }),
});
