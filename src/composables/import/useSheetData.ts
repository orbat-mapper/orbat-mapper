import { computed, ref } from "vue";
import type { WorkBook } from "xlsx";
import { xlsxUtils } from "@/extlib/xlsx-lazy";

export function useSheetData(workbook: WorkBook) {
  const sheetNames = workbook.SheetNames;
  const activeSheet = ref(sheetNames[0]);

  const data = computed(() => {
    const sheet = workbook.Sheets[activeSheet.value];
    if (!sheet || !sheet["!ref"]) return [];
    return xlsxUtils.sheet_to_json(sheet);
  });

  const headers = computed<string[]>(() => {
    if (data.value.length === 0) return [];
    return Object.keys(data.value[0] as object);
  });

  return {
    sheetNames,
    activeSheet,
    data,
    headers,
  };
}
