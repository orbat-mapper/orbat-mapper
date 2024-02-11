import { type WorkBook } from "xlsx";

export type SpreadsheetDialect = "ODIN_DRAGON" | "unknown";

export function detectSpreadsheetDialect(wb: WorkBook): SpreadsheetDialect {
  const sheetNames = wb.SheetNames;
  if (sheetNames[0] === "UNIT INFO") {
    return "ODIN_DRAGON";
  }

  return "unknown";
}
