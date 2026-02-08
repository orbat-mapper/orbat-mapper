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
    const sheet = workbook.Sheets[activeSheet.value];
    if (!sheet || !sheet["!ref"]) return [];
    const rows = xlsxUtils.sheet_to_json(sheet, { header: 1 }) as string[][];
    return (rows[0] || []).filter((h) => typeof h === "string" && h.trim().length > 0);
  });

  return {
    sheetNames,
    activeSheet,
    data,
    headers,
  };
}
